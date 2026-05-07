const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEscalationEmail = async (report, wardRep) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"StreetFix Alert" <${process.env.SMTP_USER}>`,
    to: wardRep.email,
    subject: `⚠️ ESCALATION: Unresolved Issue #${report._id} in ${report.ward}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>⚠️ Issue Escalated</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <h2>${report.title}</h2>
          <p><strong>Category:</strong> ${report.category}</p>
          <p><strong>Ward:</strong> ${report.ward}</p>
          <p><strong>Reported:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
          <p><strong>Days Unresolved:</strong> ${report.daysSinceReport}</p>
          <p><strong>Description:</strong> ${report.description}</p>
          <hr/>
          <p style="color: #dc2626; font-weight: bold;">
            This issue has exceeded the ${process.env.ESCALATION_DAYS}-day resolution window. 
            Immediate attention is required.
          </p>
          <p>Dear ${wardRep.name},</p>
          <p>A citizen-reported infrastructure issue in your ward has not been addressed within 
          the expected timeframe. This report is now publicly flagged as escalated.</p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px;">
          <p>StreetFix - Public Accountability Platform</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Escalation email sent for report ${report._id} to ${wardRep.email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send escalation email: ${error.message}`);
    return false;
  }
};

const sendStatusUpdateEmail = async (report, userEmail) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"StreetFix" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Update: Your report "${report.title}" status changed to ${report.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>Report Status Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <h2>${report.title}</h2>
          <p><strong>New Status:</strong> <span style="text-transform: uppercase;">${report.status}</span></p>
          <p><strong>Ward:</strong> ${report.ward}</p>
          <p>Thank you for using StreetFix to improve your community!</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Failed to send status update email: ${error.message}`);
    return false;
  }
};

module.exports = { sendEscalationEmail, sendStatusUpdateEmail };
