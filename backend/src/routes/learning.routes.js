const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const Planner = require("../models/planner.model");

const router = express.Router();
router.use(protect);

const today = () => new Date().toISOString().slice(0, 10);

function recordWeeklyActivity(user, type, xpEarned) {
  const date = today();
  let row = user.weeklyActivity.find((item) => item.date === date);
  if (!row) {
    user.weeklyActivity.push({ date, questions: 0, notes: 0, quizzes: 0, xpEarned: 0 });
    row = user.weeklyActivity[user.weeklyActivity.length - 1];
  }
  if (type === "quiz") row.quizzes += 1;
  row.xpEarned += xpEarned;
  user.weeklyActivity = user.weeklyActivity.slice(-28);
}

function touchStreak(user) {
  const date = today();
  if (user.lastActiveDate !== date) {
    const previous = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const difference = previous
      ? Math.round((new Date(`${date}T00:00:00Z`) - previous) / 86400000)
      : null;
    user.streak = difference === 1 ? user.streak + 1 : 1;
    user.lastActiveDate = date;
  }
}

router.post("/quiz-results", async (req, res, next) => {
  try {
    const { subject = "General", mode = "", score, total } = req.body;
    const numericScore = Number(score);
    const numericTotal = Number(total);
    if (!Number.isFinite(numericScore) || !Number.isFinite(numericTotal) || numericTotal <= 0 || numericScore < 0 || numericScore > numericTotal) {
      return res.status(400).json({ success: false, message: "A valid quiz score and total are required" });
    }

    const user = await User.findById(req.user.id);
    const accuracy = Math.round((numericScore / numericTotal) * 100);
    const xpEarned = Math.max(5, numericScore * 10);
    const previousAttempts = user.totalQuizzes || 0;
    user.accuracy = Math.round(((user.accuracy || 0) * previousAttempts + accuracy) / (previousAttempts + 1));
    user.totalQuizzes = previousAttempts + 1;
    user.xp += xpEarned;
    recordWeeklyActivity(user, "quiz", xpEarned);
    touchStreak(user);
    await user.save();

    await Activity.create({
      user: user.id,
      type: "quiz",
      subject,
      mode,
      score: numericScore,
      total: numericTotal,
      accuracy,
      xpEarned
    });

    const planner = await Planner.findOne({ user: user.id });
    if (planner) {
      planner.lastMockAccuracy = accuracy;
      planner.accuracyHistory.push({ date: new Date().toISOString(), accuracy });
      planner.accuracyHistory = planner.accuracyHistory.slice(-30);
      await planner.save();
    }

    res.status(201).json({ success: true, accuracy, xpEarned, xp: user.xp, level: user.level });
  } catch (error) {
    next(error);
  }
});

router.post("/focus-sessions", async (req, res, next) => {
  try {
    const durationSeconds = Math.round(Number(req.body.durationSeconds));
    if (!Number.isFinite(durationSeconds) || durationSeconds < 60 || durationSeconds > 24 * 3600) {
      return res.status(400).json({ success: false, message: "Focus duration must be between 1 minute and 24 hours" });
    }
    const user = await User.findById(req.user.id);
    const xpEarned = Math.max(1, Math.floor(durationSeconds / 300));
    user.xp += xpEarned;
    recordWeeklyActivity(user, "focus", xpEarned);
    touchStreak(user);
    await user.save();
    const activity = await Activity.create({
      user: user.id,
      type: "focus",
      subject: req.body.subject || "General",
      mode: req.body.mode || "work",
      durationSeconds,
      xpEarned
    });
    res.status(201).json({ success: true, activity, xpEarned });
  } catch (error) {
    next(error);
  }
});

router.post("/critical-results", async (req, res, next) => {
  try {
    const score = Math.max(0, Math.round(Number(req.body.score) || 0));
    const xpEarned = Math.min(100, Math.max(2, Math.floor(score / 10)));
    const user = await User.findById(req.user.id);
    user.xp += xpEarned;
    recordWeeklyActivity(user, "critical", xpEarned);
    touchStreak(user);
    await user.save();
    const activity = await Activity.create({
      user: user.id,
      type: "critical",
      mode: req.body.mode || "game",
      score,
      xpEarned
    });
    res.status(201).json({ success: true, activity, xpEarned });
  } catch (error) {
    next(error);
  }
});

router.get("/activity", async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
