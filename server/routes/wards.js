const express = require('express');
const Ward = require('../models/Ward');
const Report = require('../models/Report');

const router = express.Router();

// Get all wards with response scores
router.get('/', async (req, res) => {
  try {
    const wards = await Ward.find().sort({ responseScore: 1 });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ward leaderboard (response scores)
router.get('/leaderboard', async (req, res) => {
  try {
    const wards = await Ward.find()
      .select('name city responseScore totalReports resolvedReports avgResolutionDays')
      .sort({ responseScore: -1 });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stats for a specific ward
router.get('/:name/stats', async (req, res) => {
  try {
    const ward = await Ward.findOne({ name: req.params.name });
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }

    const openReports = await Report.countDocuments({ ward: req.params.name, status: 'open' });
    const escalatedReports = await Report.countDocuments({ ward: req.params.name, status: 'escalated' });

    res.json({
      ...ward.toObject(),
      openReports,
      escalatedReports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
