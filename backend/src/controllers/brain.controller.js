const Brain = require("../models/brain.model");

const {
  generateLogicQuestion,
  generateMathQuestion,
  generateStrategyOutcome,
  generateDecisionOutcome,
  analyzeCodeWithAI
} = require("../services/brainAI.service");


// =======================================================
// 🧠 1️⃣ GET FULL BRAIN DATA
// =======================================================

exports.getBrainData = async (req, res) => {
  try {

    let brain = await Brain.findOne({ user: req.user.id });

    if (!brain) {
      brain = await Brain.create({ user: req.user.id });
    }

    return res.status(200).json({
      success: true,
      brain
    });

  } catch (error) {
    console.error("Brain Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brain data"
    });
  }
};


// =======================================================
// 🎯 2️⃣ UPDATE BRAIN XP
// =======================================================

exports.updateBrainXP = async (req, res) => {
  try {

    const { correct, difficulty = "normal" } = req.body;

    if (typeof correct !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid 'correct' value. Must be boolean."
      });
    }

    let brain = await Brain.findOne({ user: req.user.id });
    if (!brain) brain = await Brain.create({ user: req.user.id });

    const xpMap = {
      easy: 10,
      normal: 20,
      hard: 35
    };

    const xpEarned = correct ? (xpMap[difficulty] || 20) : 0;

    brain.recordGame(correct, xpEarned);
    await brain.save();

    return res.status(200).json({
      success: true,
      message: correct ? "Correct Answer!" : "Wrong Answer!",
      stats: {
        xp: brain.xp,
        level: brain.level,
        intelligenceScore: brain.intelligenceScore,
        accuracy: brain.accuracy,
        gamesPlayed: brain.gamesPlayed,
        currentStreak: brain.currentStreak,
        bestStreak: brain.bestStreak,
        badges: brain.badges
      }
    });

  } catch (error) {
    console.error("Brain XP Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update brain XP"
    });
  }
};


// =======================================================
// 🧠 3️⃣ ADAPTIVE AI QUESTION
// =======================================================

exports.getAIQuestion = async (req, res) => {
  try {

    let brain = await Brain.findOne({ user: req.user.id });
    if (!brain) brain = await Brain.create({ user: req.user.id });

    let difficulty = "easy";
    if (brain.accuracy >= 80) difficulty = "hard";
    else if (brain.accuracy >= 50) difficulty = "normal";

    const logic = await generateLogicQuestion(difficulty);
    const math = await generateMathQuestion(difficulty);

    return res.status(200).json({
      success: true,
      difficulty,
      questions: { logic, math }
    });

  } catch (error) {
    console.error("AI Question Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI question"
    });
  }
};


// =======================================================
// 🎮 4️⃣ STRATEGY GAME
// =======================================================

exports.runStrategyGame = async (req, res) => {
  try {

    const { choice } = req.body;

    if (!choice || typeof choice !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid choice is required"
      });
    }

    let brain = await Brain.findOne({ user: req.user.id });
    if (!brain) brain = await Brain.create({ user: req.user.id });

    const result = await generateStrategyOutcome(choice);

    const xpEarned = typeof result.xpChange === "number"
      ? result.xpChange
      : 0;

    brain.recordGame(xpEarned > 0, xpEarned);
    await brain.save();

    return res.status(200).json({
      success: true,
      scenario: result.scenario,
      xpEarned,
      updatedXP: brain.xp
    });

  } catch (error) {
    console.error("Strategy Game Error:", error);
    return res.status(500).json({
      success: false,
      message: "Strategy game failed"
    });
  }
};


// =======================================================
// ⚖ 5️⃣ DECISION SIMULATOR
// =======================================================

exports.runDecisionSimulator = async (req, res) => {
  try {

    const { decision } = req.body;

    if (!decision || typeof decision !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid decision is required"
      });
    }

    const result = await generateDecisionOutcome(decision);

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error("Decision Simulator Error:", error);
    return res.status(500).json({
      success: false,
      message: "Decision simulator failed"
    });
  }
};


// =======================================================
// 💻 6️⃣ AI CODE LAB (ERROR DETECTOR VERSION)
// =======================================================

exports.runCodeLab = async (req, res) => {
  try {

    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid code is required"
      });
    }

    const result = await analyzeCodeWithAI(code);

    return res.status(200).json({
      success: true,
      hasError: result.hasError,
      errors: result.errors,
      explanation: result.explanation,
      optimizedVersion: result.optimizedVersion,
      qualityScore: result.qualityScore
    });

  } catch (error) {
    console.error("Code Lab Error:", error);
    return res.status(500).json({
      success: false,
      message: "Code analysis failed"
    });
  }
};


// =======================================================
// 🌅 7️⃣ DAILY CHALLENGE
// =======================================================

exports.getDailyChallenge = async (req, res) => {
  try {

    let brain = await Brain.findOne({ user: req.user.id });
    if (!brain) brain = await Brain.create({ user: req.user.id });

    const today = new Date().toISOString().split("T")[0];

    if (
      brain.dailyChallenge?.lastPlayedDate === today &&
      brain.dailyChallenge?.completed
    ) {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true
      });
    }

    const challenge = await generateLogicQuestion("hard");

    return res.status(200).json({
      success: true,
      alreadyCompleted: false,
      challenge
    });

  } catch (error) {
    console.error("Daily Challenge Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load daily challenge"
    });
  }
};


// =======================================================
// 🌅 8️⃣ COMPLETE DAILY CHALLENGE
// =======================================================

exports.completeDailyChallenge = async (req, res) => {
  try {

    const { correct } = req.body;

    if (typeof correct !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid correct value"
      });
    }

    let brain = await Brain.findOne({ user: req.user.id });
    if (!brain) brain = await Brain.create({ user: req.user.id });

    const today = new Date().toISOString().split("T")[0];

    if (
      brain.dailyChallenge?.lastPlayedDate === today &&
      brain.dailyChallenge?.completed
    ) {
      return res.status(400).json({
        success: false,
        message: "Daily challenge already completed"
      });
    }

    brain.dailyChallenge.lastPlayedDate = today;
    brain.dailyChallenge.completed = true;

    if (correct) brain.recordGame(true, 50);
    else brain.recordGame(false, 0);

    await brain.save();

    return res.status(200).json({
      success: true,
      xp: brain.xp,
      level: brain.level,
      accuracy: brain.accuracy
    });

  } catch (error) {
    console.error("Daily Complete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete daily challenge"
    });
  }
};


// =======================================================
// 🏆 9️⃣ LEADERBOARD
// =======================================================

exports.getLeaderboard = async (req, res) => {
  try {

    const leaderboard = await Brain.find()
      .populate("user", "name")
      .sort({ xp: -1 })
      .limit(10)
      .select("xp level intelligenceScore bestStreak user")
      .lean();

    return res.status(200).json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard"
    });
  }
};


// =======================================================
// 📊 🔟 BRAIN SUMMARY
// =======================================================

exports.getBrainSummary = async (req, res) => {
  try {

    const brain = await Brain.findOne({ user: req.user.id });

    if (!brain) {
      return res.status(200).json({
        success: true,
        summary: {
          xp: 0,
          level: 1,
          intelligenceScore: 100,
          accuracy: 0,
          gamesPlayed: 0,
          currentStreak: 0,
          bestStreak: 0,
          badges: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      summary: {
        xp: brain.xp,
        level: brain.level,
        intelligenceScore: brain.intelligenceScore,
        accuracy: brain.accuracy,
        gamesPlayed: brain.gamesPlayed,
        currentStreak: brain.currentStreak,
        bestStreak: brain.bestStreak,
        badges: brain.badges
      }
    });

  } catch (error) {
    console.error("Brain Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brain summary"
    });
  }
};
