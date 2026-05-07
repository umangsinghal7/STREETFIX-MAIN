require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("./config/passport");

const connectDB = require("./config/db");
const { upload } = require("./config/cloudinary");

const User = require("./models/User");
const Report = require("./models/Report");
const Ward = require("./models/Ward");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "streetfix_dev_secret_key";

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ================= AUTH MIDDLEWARE ================= */

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

/* ================= AUTH ================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, ward } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "citizen",
      ward: ward || "",
    });

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Please login using Google",
      });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json(req.user);
});

/* ================= GOOGLE AUTH ================= */

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/auth",
  }),
  async (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `http://localhost:5173/auth-success?token=${token}`
    );
  }
);

/* ================= CHATBOT ================= */

/* ================= CHATBOT ================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const text = message.toLowerCase();

    let reply = "I can help with reporting issues, tracking complaints, leaderboard info, and platform navigation.";

    if (text.includes("help")) {
      reply =
        "You can report potholes, garbage, water leakage, streetlight faults and more using StreetFix.";
    } else if (text.includes("report")) {
      reply =
        "Go to Dashboard → Create Report → Upload image → Add location → Submit.";
    } else if (text.includes("track")) {
      reply =
        "Open Dashboard → My Complaints → check current complaint status.";
    } else if (text.includes("leaderboard")) {
      reply =
        "Leaderboard shows top wards ranked by complaint resolution speed.";
    } else if (text.includes("hello") || text.includes("hi")) {
      reply = "Hello 👋 How can I help you today?";
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ================= REPORTS ================= */

app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({
      createdAt: -1,
    });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


app.post("/api/reports", auth, async (req, res) => {
  try {
    let priority = "medium";

    const category = req.body.category;

    if (
      category === "pothole" ||
      category === "road_damage" ||
      category === "water_leak"
    ) {
      priority = "high";
    } else if (
      category === "streetlight" ||
      category === "drainage"
    ) {
      priority = "medium";
    } else {
      priority = "low";
    }

    const report = await Report.create({
      ...req.body,
      priority,
      reportedBy: req.user._id,
      timeline: [
        {
          action: "created",
          description: "Issue reported",
          performedBy: req.user._id,
        },
      ],
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
// app.post("/api/reports", auth, async (req, res) => {
//   try {
//     const report = await Report.create({
//       ...req.body,
//       reportedBy: req.user._id,
//     });

//     res.status(201).json(report);
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// });

/* ================= STATS ================= */

// app.get("/api/stats", async (req, res) => {
//   try {
//     const total = await Report.countDocuments();
//     const resolved = await Report.countDocuments({
//       status: "resolved",
//     });
//     const open = await Report.countDocuments({
//       status: "open",
//     });

//     const avgResolution = "2.4 days"
//     res.json({
//       total,
//       open,
//       resolved,
//       escalated,
//       avgResolutionDays,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// });

/* ================= STATS ================= */

/* ================= STATS ================= */

/* ================= STATS ================= */

app.get("/api/stats", async (req, res) => {
  try {
    const total = await Report.countDocuments();

    const open = await Report.countDocuments({
      status: "open",
    });

    const resolved = await Report.countDocuments({
      status: "resolved",
    });

    const escalated = await Report.countDocuments({
      status: "escalated",
    });

    // resolved reports only
    const resolvedReports = await Report.find({
      status: "resolved",
      resolvedAt: { $ne: null },
    });

    let avgResolutionDays = 0;

    if (resolvedReports.length > 0) {
      const totalDays = resolvedReports.reduce((sum, report) => {
        const days =
          (new Date(report.resolvedAt) - new Date(report.createdAt)) /
          (1000 * 60 * 60 * 24);

        return sum + days;
      }, 0);

      avgResolutionDays = Math.round(totalDays / resolvedReports.length);
    }

    // estimate based on average
    let estimated = "No estimate available";

    if (avgResolutionDays > 0) {
      estimated = `${avgResolutionDays} days`;
    } else if (open > 0) {
      estimated = "Pending first resolution";
    } else {
      estimated = "0 days";
    }

    res.json({
      total,
      open,
      resolved,
      escalated,
      avgResolutionDays,
      estimated,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
});
/* ================= WARDS ================= */

app.get("/api/wards/leaderboard/live", async (req, res) => {
  try {
    const wards = await Ward.find().sort({
      responseScore: -1,
    });

    res.json(wards);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ================= AI ================= */

app.post("/api/ai/detect", (req, res) => {
  upload.single("image")(req, res, () => {
    res.json({
      detected: true,
      category: "pothole",
      severity: "high",
      confidence: 95,
    });
  });
});

/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

/* ================= START ================= */

const PORT = 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
});