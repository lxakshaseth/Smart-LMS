const mongoose = require("mongoose");

// =====================================================
// 🧠 BRAIN SCHEMA
// =====================================================

const brainSchema = new mongoose.Schema({

  // =================================
  // USER LINK
  // =================================
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },

  // =================================
  // CORE PROGRESSION
  // =================================
  xp: {
    type: Number,
    default: 0,
    min: 0
  },

  level: {
    type: Number,
    default: 1,
    min: 1
  },

  intelligenceScore: {
    type: Number,
    default: 100
  },

  // =================================
  // GAME PERFORMANCE
  // =================================
  gamesPlayed: {
    type: Number,
    default: 0
  },

  correctAnswers: {
    type: Number,
    default: 0
  },

  wrongAnswers: {
    type: Number,
    default: 0
  },

  currentStreak: {
    type: Number,
    default: 0
  },

  bestStreak: {
    type: Number,
    default: 0
  },

  // =================================
  // BADGE SYSTEM
  // =================================
  badges: {
    type: [String],
    default: []
  },

  // =================================
  // DAILY CHALLENGE TRACKING
  // =================================
  dailyChallenge: {
    lastPlayedDate: {
      type: String,
      default: null
    },
    completed: {
      type: Boolean,
      default: false
    }
  },

  // =================================
  // ANALYTICS
  // =================================
  lastPlayed: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// =====================================================
// 📈 LEVEL + INTELLIGENCE ENGINE
// =====================================================

brainSchema.methods.updateLevel = function () {

  // Level increases every 100 XP
  this.level = Math.floor(this.xp / 100) + 1;

  // Intelligence scaling formula
  this.intelligenceScore = 100 + Math.floor(this.xp * 0.8);
};


// =====================================================
// 🏅 BADGE ENGINE
// =====================================================

brainSchema.methods.checkBadges = function () {

  const addBadge = (badge) => {
    if (!this.badges.includes(badge)) {
      this.badges.push(badge);
    }
  };

  // XP Based Badges
  if (this.xp >= 100) addBadge("🥉 Beginner Brain");
  if (this.xp >= 300) addBadge("🥈 Smart Thinker");
  if (this.xp >= 600) addBadge("🥇 Master Strategist");
  if (this.xp >= 1000) addBadge("👑 Brain Legend");

  // Accuracy Badge
  if (this.accuracy >= 80) addBadge("🎯 Precision Mind");

  // Streak Badges
  if (this.bestStreak >= 10) addBadge("🔥 Focus Beast");
  if (this.bestStreak >= 25) addBadge("⚡ Streak Monster");
};


// =====================================================
// 🎯 RECORD GAME RESULT (CORE ENGINE)
// =====================================================

brainSchema.methods.recordGame = function (isCorrect, xpEarned = 10) {

  this.gamesPlayed += 1;
  this.lastPlayed = new Date();

  if (isCorrect) {

    this.correctAnswers += 1;
    this.currentStreak += 1;

    // Safe XP handling
    this.xp += Math.max(0, xpEarned);

    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

  } else {

    this.wrongAnswers += 1;
    this.currentStreak = 0;
  }

  this.updateLevel();
  this.checkBadges();
};


// =====================================================
// 📊 VIRTUAL FIELD: ACCURACY %
// =====================================================

brainSchema.virtual("accuracy").get(function () {

  if (this.gamesPlayed === 0) return 0;

  return Math.round(
    (this.correctAnswers / this.gamesPlayed) * 100
  );
});


// =====================================================
// 📊 LEADERBOARD INDEXES (Performance Optimized)
// =====================================================

brainSchema.index({ xp: -1 });
brainSchema.index({ intelligenceScore: -1 });
brainSchema.index({ bestStreak: -1 });
brainSchema.index({ level: -1 });


// =====================================================
// INCLUDE VIRTUALS IN JSON RESPONSE
// =====================================================

brainSchema.set("toJSON", { virtuals: true });
brainSchema.set("toObject", { virtuals: true });


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = mongoose.model("Brain", brainSchema);
