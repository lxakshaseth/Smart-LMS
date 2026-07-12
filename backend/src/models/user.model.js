const mongoose = require("mongoose");

/* =====================================================
   WEEKLY ACTIVITY SCHEMA
===================================================== */

const weeklyActivitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  questions: { type: Number, default: 0 },
  notes: { type: Number, default: 0 },
  quizzes: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 }
}, { _id: false });

/* =====================================================
   SUBJECT STATS SCHEMA
===================================================== */

const subjectStatsSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  questions: { type: Number, default: 0 },
  notes: { type: Number, default: 0 },
  quizzes: { type: Number, default: 0 },
  mastery: { type: Number, default: 0 }
}, { _id: false });

/* =====================================================
   DAILY MISSION SCHEMA
===================================================== */

const dailyMissionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  questionsTarget: { type: Number, default: 20 },
  notesTarget: { type: Number, default: 5 },
  quizTarget: { type: Number, default: 1 },
  questionsDone: { type: Number, default: 0 },
  notesDone: { type: Number, default: 0 },
  quizDone: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { _id: false });

/* =====================================================
   USER SCHEMA
===================================================== */

const userSchema = new mongoose.Schema({

  /* ================= BASIC INFO ================= */

  username: {
    type: String,
    trim: true
  },

  name: {
    type: String,
    trim: true
  },

  phone: {
    type: String,
    trim: true,
    default: ""
  },

  exam: {
    type: String,
    trim: true,
    default: ""
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  lastLogin: {
    type: Date,
    default: null
  },

  darkMode: {
    type: Boolean,
    default: false
  },

  /* ================= ANALYTICS ================= */

  totalQuestions: { type: Number, default: 0 },
  totalNotes: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },

  accuracy: { type: Number, default: 0 },
  readiness: { type: Number, default: 0 },
  risk: { type: String, default: "Low" },

  weakSubject: { type: String, default: "Not Available" },
  strongSubject: { type: String, default: "Not Available" },
  trend: { type: String, default: "Stable" },

  /* ================= GAMIFICATION ================= */

  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rank: { type: String, default: "Beginner" },

  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null },

  /* ================= DAILY MISSION ================= */

  dailyMission: {
    type: dailyMissionSchema,
    default: null
  },

  weeklyActivity: {
    type: [weeklyActivitySchema],
    default: []
  },

  subjectStats: {
    type: [subjectStatsSchema],
    default: []
  },

  achievements: {
    type: [String],
    default: []
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* =====================================================
   LEVEL SYSTEM METHOD
===================================================== */

userSchema.methods.updateLevelAndRank = function () {

  this.level = Math.floor(this.xp / 100) + 1;

  if (this.xp >= 2000) this.rank = "Grandmaster";
  else if (this.xp >= 1000) this.rank = "Master";
  else if (this.xp >= 500) this.rank = "Advanced";
  else if (this.xp >= 200) this.rank = "Intermediate";
  else this.rank = "Beginner";
};

/* =====================================================
   VIRTUAL: LEVEL PROGRESS
===================================================== */

userSchema.virtual("levelProgress").get(function () {
  return this.xp % 100;
});

/* =====================================================
   SAFE PRE-SAVE HOOK
===================================================== */

userSchema.pre("save", function () {

  // 🔥 If username missing → generate from name
  if (!this.username && this.name) {
    this.username = this.name.toLowerCase().replace(/\s+/g, "");
  }

  // 🔥 If still missing → fallback from email
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  }

  this.updateLevelAndRank();
});

/* =====================================================
   PERFORMANCE INDEX
===================================================== */

userSchema.index({ xp: -1 });

/* =====================================================
   EXPORT
===================================================== */

module.exports = mongoose.model("User", userSchema);
