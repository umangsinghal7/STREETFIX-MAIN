const cron = require('node-cron');
const Report = require('../models/Report');
const Ward = require('../models/Ward');
const { sendEscalationEmail } = require('./emailService');

// Run every hour to check for overdue reports
const startEscalationCron = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for overdue reports...');

    try {
      const escalationDays = parseInt(process.env.ESCALATION_DAYS) || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - escalationDays);

      // Find reports that are open/in_progress and older than escalation threshold
      const overdueReports = await Report.find({
        status: { $in: ['open', 'in_progress'] },
        createdAt: { $lte: cutoffDate },
        escalationEmailSent: false,
      }).populate('reportedBy', 'name email');

      console.log(`[CRON] Found ${overdueReports.length} overdue reports`);

      for (const report of overdueReports) {
        // Get ward representative info
        const ward = await Ward.findOne({ name: report.ward });
        const repEmail = ward?.representative?.email || process.env.REP_EMAIL;
        const repName = ward?.representative?.name || 'Ward Representative';

        // Send escalation email
        const sent = await sendEscalationEmail(report, { email: repEmail, name: repName });

        // Update report status
        report.status = 'escalated';
        report.escalatedAt = new Date();
        report.escalationEmailSent = sent;
        report.timeline.push({
          action: 'escalated',
          description: `Auto-escalated after ${escalationDays} days without resolution`,
          timestamp: new Date(),
        });

        await report.save();

        // Update ward metrics
        if (ward) {
          ward.recalculateScore();
          await ward.save();
        }
      }
    } catch (error) {
      console.error('[CRON] Escalation check failed:', error.message);
    }
  });

  console.log('[CRON] Escalation checker scheduled (runs hourly)');
};

module.exports = { startEscalationCron };
