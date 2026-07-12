const mongoose = require("mongoose");

const plannerSchema = new mongoose.Schema(
  {
    // ============================
    // USER LINK (One planner per user)
    // ============================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ============================
    // BASIC SETTINGS
    // ============================
    dailyHours: {
      type: Number,
      default: 3,
      min: 1
    },

    // ============================
    // WEEKLY PLAN (Adaptive Structure)
    // ============================
    weeklyPlan: [
      {
        day: {
          type: String,
          trim: true
        },

        // 🔥 Weighted Task System
        tasks: [
          {
            type: {
              type: String,
              required: true
            },
            topic: {
              type: String,
              required: true
            },
            weight: {
              type: Number,
              default: 1
            },
            completed: {
              type: Boolean,
              default: false
            }
          }
        ],

        // Legacy support
        subjects: { type: String, default: "" },
        core: { type: String, default: "" },
        weak: { type: String, default: "" },
        revision: { type: String, default: "" },
        practice: { type: String, default: "" }
      }
    ],

    // ============================
    // EXAMS
    // ============================
    exams: [
      {
        name: { type: String },
        date: { type: String }
      }
    ],

    // ============================
    // DEADLINES
    // ============================
    deadlines: [
      {
        name: { type: String },
        date: { type: String }
      }
    ],

    // ============================
    // ANALYTICS FIELDS
    // ============================

    lastMockAccuracy: {
      type: Number,
      default: 0
    },

    weakSubject: {
      type: String,
      default: ""
    },

    weeklyCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // 🔥 Dynamic Risk Score (0–100)
    riskScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },

    performanceTrend: {
      type: String,
      enum: ["Improving", "Stable", "Declining"],
      default: "Stable"
    },

    studyStreak: {
      type: Number,
      default: 0
    },

    lastActiveDate: {
      type: String,
      default: ""
    },

    // ====================================
    // 🔥 SUBJECT-WISE MASTERY SYSTEM
    // ====================================
    subjectStats: [
      {
        subject: {
          type: String,
          required: true
        },
        totalAttempts: {
          type: Number,
          default: 0
        },
        totalAccuracy: {
          type: Number,
          default: 0
        },
        mastery: {
          type: Number,
          default: 0
        }
      }
    ],

    // Accuracy history (for trend detection)
    accuracyHistory: [
      {
        date: String,
        accuracy: Number
      }
    ],

    // Weekly AI review
    lastWeeklyReview: {
      summary: { type: String, default: "" },
      strengths: { type: String, default: "" },
      weaknesses: { type: String, default: "" },
      nextStrategy: { type: String, default: "" },
      motivation: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Planner", plannerSchema);
