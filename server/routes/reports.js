const express = require('express');
const Report = require('../models/Report');
const Ward = require('../models/Ward');
const { auth, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendStatusUpdateEmail } = require('../services/emailService');

const router = express.Router();

// Get all reports (public) with filters
router.get('/', async (req, res) => {
  try {
    const { status, category, ward, page = 1, limit = 20, lat, lng, radius } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (ward) filter.ward = ward;

    // Geospatial query - find reports near a location
    if (lat && lng) {
      const radiusInMeters = (radius || 5) * 1000; // default 5km
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single report (public)
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name')
      .populate('resolvedBy', 'name')
      .populate('timeline.performedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create report (authenticated citizens)
router.post('/', auth, upload.single('beforeImage'), async (req, res) => {
  try {
    const { title, description, category, ward, latitude, longitude, address } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Photo of the issue is required' });
    }

    const report = new Report({
      title,
      description,
      category,
      ward,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
      },
      beforeImage: `/uploads/${req.file.filename}`,
      reportedBy: req.user._id,
      timeline: [{
        action: 'created',
        description: 'Report submitted by citizen',
        performedBy: req.user._id,
        timestamp: new Date(),
      }],
    });

    await report.save();

    // Update ward metrics
    let wardDoc = await Ward.findOne({ name: ward });
    if (wardDoc) {
      wardDoc.totalReports += 1;
      wardDoc.recalculateScore();
      await wardDoc.save();
    }

    await report.populate('reportedBy', 'name');
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update report status (authority/admin)
router.patch('/:id/status', auth, authorizeRoles('authority', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.timeline.push({
      action: 'status_change',
      description: `Status changed to ${status}`,
      performedBy: req.user._id,
      timestamp: new Date(),
    });

    await report.save();

    // Notify reporter
    const reporter = await require('../models/User').findById(report.reportedBy);
    if (reporter) {
      sendStatusUpdateEmail(report, reporter.email);
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resolve report with after-photo (authority/admin)
router.patch('/:id/resolve', auth, authorizeRoles('authority', 'admin'), upload.single('afterImage'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Photo of the fix is required to close a ticket' });
    }

    report.status = 'resolved';
    report.afterImage = `/uploads/${req.file.filename}`;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    report.timeline.push({
      action: 'resolved',
      description: 'Issue resolved with verification photo',
      performedBy: req.user._id,
      timestamp: new Date(),
    });

    await report.save();

    // Update ward metrics
    const wardDoc = await Ward.findOne({ name: report.ward });
    if (wardDoc) {
      wardDoc.resolvedReports += 1;
      const resolutionDays = Math.floor((report.resolvedAt - report.createdAt) / (1000 * 60 * 60 * 24));
      wardDoc.avgResolutionDays = wardDoc.resolvedReports === 1
        ? resolutionDays
        : Math.round((wardDoc.avgResolutionDays * (wardDoc.resolvedReports - 1) + resolutionDays) / wardDoc.resolvedReports);
      wardDoc.recalculateScore();
      await wardDoc.save();
    }

    // Notify reporter
    const reporter = await require('../models/User').findById(report.reportedBy);
    if (reporter) {
      sendStatusUpdateEmail(report, reporter.email);
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upvote a report
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = report.upvotes.includes(userId);

    if (hasUpvoted) {
      report.upvotes = report.upvotes.filter(id => !id.equals(userId));
    } else {
      report.upvotes.push(userId);
    }

    await report.save();
    res.json({ upvotes: report.upvotes.length, hasUpvoted: !hasUpvoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
