const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    // category: {
    //   type: String,
    //   required: true,
    //   enum: [
    //     "pothole",
    //     "streetlight",
    //     "trash",
    //     "garbage",
    //     "drainage",
    //     "road_damage",
    //     "water_leak",
    //     "graffiti",
    //     "other",
    //   ],
    // },

    category: {
  type: String,
  required: true,
  enum: [
    "pothole",
    "streetlight",
    "trash",
    "garbage",
    "drainage",
    "road_damage",
    "water_leak",
    "graffiti",
    "other",
  ],
},

severity: {
  type: String,
  enum: ["low", "medium", "high"],
  default: "medium",
},

status: {
  type: String,
  enum: ["open", "in_progress", "resolved", "escalated"],
  default: "open",
},

    // priority: {
    //   type: String,
    //   enum: ["low", "medium", "high"],
    //   default: "medium",
    // },

    // status: {
    //   type: String,
    //   enum: ["open", "in_progress", "resolved", "escalated"],
    //   default: "open",
    // },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [77.5946, 12.9716],
      },

      address: {
        type: String,
        trim: true,
      },
    },

    ward: {
      type: String,
      required: [true, "Ward is required"],
      trim: true,
    },

    beforeImage: {
      type: String,
      default: "",
    },

    afterImage: {
      type: String,
      default: null,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    escalatedAt: {
      type: Date,
      default: null,
    },

    escalationEmailSent: {
      type: Boolean,
      default: false,
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    timeline: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "status_change",
            "escalated",
            "resolved",
            "comment",
          ],
        },

        description: String,

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });
reportSchema.index({ ward: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.virtual("daysSinceReport").get(function () {
  return Math.floor(
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
});

reportSchema.virtual("isOverdue").get(function () {
  if (this.status === "resolved") return false;
  return this.daysSinceReport >= 7;
});

reportSchema.set("toJSON", { virtuals: true });
reportSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Report", reportSchema);