const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  representative: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  // Calculated metrics
  totalReports: { type: Number, default: 0 },
  resolvedReports: { type: Number, default: 0 },
  avgResolutionDays: { type: Number, default: 0 },
  responseScore: { type: Number, default: 100 }, // 0-100 score
}, { timestamps: true });

// Method to recalculate response score
wardSchema.methods.recalculateScore = function () {
  if (this.totalReports === 0) {
    this.responseScore = 100;
    return;
  }
  const resolutionRate = this.resolvedReports / this.totalReports;
  const avgDaysPenalty = Math.min(this.avgResolutionDays / 14, 1); // Penalty maxes at 14 days
  this.responseScore = Math.round((resolutionRate * 70) + ((1 - avgDaysPenalty) * 30));
};

module.exports = mongoose.model('Ward', wardSchema);
