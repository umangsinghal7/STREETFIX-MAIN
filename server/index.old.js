const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const { users, wards, reports } = require('./data/demoData');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'streetfix_dev_secret_key';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype.split('/')[1]);
    cb(valid ? null : new Error('Only image files allowed'), valid);
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// ============ AUTH MIDDLEWARE ============
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ============ HELPERS ============
const getUserSafe = (userId) => {
  const user = users.find(u => u._id === userId);
  if (!user) return null;
  return { _id: user._id, name: user.name, role: user.role };
};

const getReportWithDetails = (report) => {
  const daysSinceReport = Math.floor((Date.now() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
  const isOverdue = report.status !== 'resolved' && daysSinceReport >= 7;
  return {
    ...report,
    reportedBy: getUserSafe(report.reportedBy),
    resolvedBy: report.resolvedBy ? getUserSafe(report.resolvedBy) : null,
    daysSinceReport,
    isOverdue,
    timeline: report.timeline.map(t => ({
      ...t,
      performedBy: t.performedBy ? getUserSafe(t.performedBy) : null,
    })),
  };
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, ward } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: role || 'citizen',
      ward: ward || '',
      createdAt: new Date(),
    };
    users.push(newUser);
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ user: userSafe, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const { password, ...userSafe } = req.user;
  res.json(userSafe);
});

// ============ REPORT ROUTES ============
app.get('/api/reports', (req, res) => {
  const { status, category, ward, page = 1, limit = 20 } = req.query;
  let filtered = [...reports];

  if (status) filtered = filtered.filter(r => r.status === status);
  if (category) filtered = filtered.filter(r => r.category === category);
  if (ward) filtered = filtered.filter(r => r.ward === ward);

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginated = filtered.slice(skip, skip + parseInt(limit));

  res.json({
    reports: paginated.map(getReportWithDetails),
    totalPages: Math.ceil(filtered.length / parseInt(limit)),
    currentPage: parseInt(page),
    total: filtered.length,
  });
});

app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(getReportWithDetails(report));
});

app.post('/api/reports', auth, (req, res) => {
  const { title, description, category, ward, latitude, longitude, address } = req.body;
  const newReport = {
    _id: `report_${Date.now()}`,
    title,
    description,
    category,
    status: 'open',
    ward,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      address,
    },
    beforeImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    afterImage: null,
    reportedBy: req.user._id,
    resolvedBy: null,
    resolvedAt: null,
    escalatedAt: null,
    escalationEmailSent: false,
    upvotes: [],
    createdAt: new Date(),
    timeline: [{ action: 'created', description: 'Report submitted by citizen', performedBy: req.user._id, timestamp: new Date() }],
  };
  reports.push(newReport);
  res.status(201).json(getReportWithDetails(newReport));
});

app.patch('/api/reports/:id/status', auth, (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = req.body.status;
  report.timeline.push({
    action: 'status_change',
    description: `Status changed to ${req.body.status}`,
    performedBy: req.user._id,
    timestamp: new Date(),
  });
  res.json(getReportWithDetails(report));
});

app.patch('/api/reports/:id/resolve', auth, (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = 'resolved';
  report.afterImage = 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop';
  report.resolvedBy = req.user._id;
  report.resolvedAt = new Date();
  report.timeline.push({
    action: 'resolved',
    description: 'Issue resolved with verification photo',
    performedBy: req.user._id,
    timestamp: new Date(),
  });
  res.json(getReportWithDetails(report));
});

app.post('/api/reports/:id/upvote', auth, (req, res) => {
  const report = reports.find(r => r._id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  const idx = report.upvotes.indexOf(req.user._id);
  if (idx > -1) {
    report.upvotes.splice(idx, 1);
  } else {
    report.upvotes.push(req.user._id);
  }
  res.json({ upvotes: report.upvotes.length, hasUpvoted: idx === -1 });
});

// ============ WARD ROUTES ============
app.get('/api/wards', (req, res) => {
  res.json([...wards].sort((a, b) => a.responseScore - b.responseScore));
});

app.get('/api/wards/leaderboard', (req, res) => {
  res.json([...wards].sort((a, b) => b.responseScore - a.responseScore));
});

app.get('/api/wards/:name/stats', (req, res) => {
  const ward = wards.find(w => w.name === req.params.name);
  if (!ward) return res.status(404).json({ message: 'Ward not found' });

  const openReports = reports.filter(r => r.ward === req.params.name && r.status === 'open').length;
  const escalatedReports = reports.filter(r => r.ward === req.params.name && r.status === 'escalated').length;
  res.json({ ...ward, openReports, escalatedReports });
});

// ============ STATS ROUTE (dashboard) ============
app.get('/api/stats', (req, res) => {
  const total = reports.length;
  const open = reports.filter(r => r.status === 'open').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const escalated = reports.filter(r => r.status === 'escalated').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  const resolvedReports = reports.filter(r => r.resolvedAt);
  const avgResolutionDays = resolvedReports.length > 0
    ? resolvedReports.reduce((sum, r) => sum + Math.floor((new Date(r.resolvedAt) - new Date(r.createdAt)) / (1000*60*60*24)), 0) / resolvedReports.length
    : 0;

  const categoryBreakdown = {};
  reports.forEach(r => { categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1; });

  const wardPerformance = wards.map(w => ({
    name: w.name,
    score: w.responseScore,
    total: w.totalReports,
    resolved: w.resolvedReports,
  }));

  const recentActivity = reports
    .flatMap(r => r.timeline.map(t => ({ ...t, reportTitle: r.title, reportId: r._id })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  res.json({
    total, open, inProgress, escalated, resolved,
    avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    categoryBreakdown,
    wardPerformance,
    recentActivity,
    citizenCount: users.filter(u => u.role === 'citizen').length,
    wardsCount: wards.length,
  });
});

// ============ IMAGE UPLOAD ============
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// ============ AI ISSUE DETECTION ============
// Simulates AI image classification by analyzing filename keywords and returning realistic detection
const AI_CATEGORIES = {
  pothole: { keywords: ['pothole', 'hole', 'road', 'crack', 'asphalt'], severity: ['medium', 'high', 'critical'] },
  streetlight: { keywords: ['light', 'lamp', 'pole', 'dark', 'street'], severity: ['low', 'medium'] },
  garbage: { keywords: ['garbage', 'trash', 'waste', 'dump', 'bin'], severity: ['medium', 'high'] },
  water_leak: { keywords: ['water', 'leak', 'pipe', 'flood', 'drain'], severity: ['high', 'critical'] },
  road_damage: { keywords: ['road', 'damage', 'broken', 'crack', 'collapse'], severity: ['medium', 'high', 'critical'] },
  drainage: { keywords: ['drain', 'sewer', 'blockage', 'overflow'], severity: ['medium', 'high'] },
};

app.post('/api/ai/detect', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // AI detection simulation - analyzes image and returns classification
    const categories = Object.keys(AI_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const severityOptions = AI_CATEGORIES[randomCategory].severity;
    const randomSeverity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
    const confidence = Math.floor(Math.random() * 15) + 82; // 82-96% confidence

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = {
      detected: true,
      category: randomCategory,
      severity: randomSeverity,
      confidence,
      description: getAIDescription(randomCategory, randomSeverity),
      imageUrl,
      processingTime: Math.floor(Math.random() * 800) + 400,
    };

    res.json(result);
  });
});

function getAIDescription(category, severity) {
  const descriptions = {
    pothole: `Detected road surface damage consistent with a ${severity} severity pothole. Estimated diameter suggests immediate attention required for vehicle safety.`,
    streetlight: `Identified non-functional or damaged street lighting infrastructure. Area may pose safety risks during nighttime hours.`,
    garbage: `Detected waste accumulation exceeding normal levels. ${severity === 'high' ? 'Health hazard risk identified.' : 'Scheduled cleanup recommended.'}`,
    water_leak: `Water pipe damage or leakage detected. ${severity === 'critical' ? 'Immediate repair needed to prevent road damage.' : 'Monitoring recommended.'}`,
    road_damage: `Structural road damage identified. Surface integrity compromised - ${severity} risk level for traffic safety.`,
    drainage: `Drainage system blockage or overflow detected. ${severity === 'high' ? 'Flood risk during rainfall.' : 'Maintenance scheduling advised.'}`,
  };
  return descriptions[category] || 'Infrastructure issue detected requiring municipal attention.';
}

// ============ AUTO ESCALATION ENGINE ============
const ESCALATION_DEADLINE_DAYS = 7;
let escalationInterval = null;

function runEscalationEngine() {
  const now = Date.now();
  let escalatedCount = 0;

  reports.forEach(report => {
    if (report.status === 'resolved' || report.status === 'escalated') return;

    const daysSinceReport = Math.floor((now - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceReport >= ESCALATION_DEADLINE_DAYS) {
      report.status = 'escalated';
      report.escalatedAt = new Date();
      report.escalationEmailSent = true;

      // Find ward representative
      const ward = wards.find(w => w.name === report.ward);
      const repName = ward?.representative?.name || 'Ward Authority';
      const repEmail = ward?.representative?.email || 'authority@bbmp.gov.in';

      report.timeline.push({
        action: 'escalated',
        description: `Auto-escalated after ${ESCALATION_DEADLINE_DAYS} days without resolution. Escalation email sent to ${repName} (${repEmail}). Priority raised.`,
        performedBy: null,
        timestamp: new Date(),
      });

      escalatedCount++;
      console.log(`⚠️  Escalated: "${report.title}" (${report.ward}) - ${daysSinceReport} days overdue`);
    }
  });

  if (escalatedCount > 0) {
    console.log(`🚨 Escalation Engine: ${escalatedCount} report(s) escalated`);
  }
}

// Run escalation check every 60 seconds
escalationInterval = setInterval(runEscalationEngine, 60 * 1000);
// Also run immediately on startup
runEscalationEngine();

// Escalation status endpoint
app.get('/api/escalation/status', (req, res) => {
  const escalated = reports.filter(r => r.status === 'escalated');
  const overdue = reports.filter(r => {
    if (r.status === 'resolved' || r.status === 'escalated') return false;
    const days = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 5; // Warning at 5 days
  });

  res.json({
    totalEscalated: escalated.length,
    atRisk: overdue.length,
    deadlineDays: ESCALATION_DEADLINE_DAYS,
    escalatedReports: escalated.map(r => ({
      _id: r._id,
      title: r.title,
      ward: r.ward,
      escalatedAt: r.escalatedAt,
      daysSinceReport: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    })),
    atRiskReports: overdue.map(r => ({
      _id: r._id,
      title: r.title,
      ward: r.ward,
      daysRemaining: ESCALATION_DEADLINE_DAYS - Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    })),
  });
});

// ============ DYNAMIC WARD LEADERBOARD ============
app.get('/api/wards/leaderboard/live', (req, res) => {
  // Calculate live scores from actual report data
  const wardStats = wards.map(ward => {
    const wardReports = reports.filter(r => r.ward === ward.name);
    const total = wardReports.length;
    const resolved = wardReports.filter(r => r.status === 'resolved').length;
    const escalated = wardReports.filter(r => r.status === 'escalated').length;
    const open = wardReports.filter(r => r.status === 'open').length;
    const inProgress = wardReports.filter(r => r.status === 'in_progress').length;

    // Calculate average resolution time
    const resolvedReports = wardReports.filter(r => r.resolvedAt);
    const avgResolutionHours = resolvedReports.length > 0
      ? resolvedReports.reduce((sum, r) => {
          return sum + (new Date(r.resolvedAt) - new Date(r.createdAt)) / (1000 * 60 * 60);
        }, 0) / resolvedReports.length
      : null;

    // Calculate live score (0-100)
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
    const escalationPenalty = total > 0 ? (escalated / total) * 30 : 0;
    const speedBonus = avgResolutionHours !== null && avgResolutionHours < 72 ? 15 : 0;

    const liveScore = Math.min(100, Math.max(0,
      Math.round(resolutionRate - escalationPenalty + speedBonus)
    ));

    // Citizen satisfaction (simulated based on resolution rate)
    const satisfaction = Math.round(resolutionRate * 0.9 + (speedBonus ? 10 : 0));

    return {
      _id: ward._id,
      name: ward.name,
      representative: ward.representative.name,
      liveScore,
      total,
      resolved,
      escalated,
      open,
      inProgress,
      avgResolutionHours: avgResolutionHours ? Math.round(avgResolutionHours) : null,
      satisfaction: Math.min(100, satisfaction),
      trend: liveScore >= ward.responseScore ? 'up' : 'down',
    };
  });

  wardStats.sort((a, b) => b.liveScore - a.liveScore);
  res.json(wardStats);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'in-memory-demo', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StreetFix API running on port ${PORT} (in-memory demo mode)`);
  console.log(`📊 ${reports.length} reports | ${wards.length} wards | ${users.length} users loaded`);
});
