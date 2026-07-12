const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const brainController = require("../controllers/brain.controller");

/*
=====================================================
🧠 SMART AI LMS - BRAIN ROUTES (AI Enhanced Version)
Base Route: /api/brain
All routes are JWT Protected
=====================================================
*/


// =====================================================
// 🧠 CORE PROFILE ROUTES
// =====================================================

// 1️⃣ GET FULL BRAIN PROFILE
// GET /api/brain
router.get(
  "/",
  protect,
  brainController.getBrainData
);


// 2️⃣ GET BRAIN SUMMARY (Lightweight Stats)
// GET /api/brain/summary
router.get(
  "/summary",
  protect,
  brainController.getBrainSummary
);


// =====================================================
// 🎯 GAME & XP ROUTES
// =====================================================

// 3️⃣ UPDATE BRAIN XP (Game Result)
// POST /api/brain/update
// Body: { correct: boolean, difficulty: "easy|normal|hard" }
router.post(
  "/update",
  protect,
  brainController.updateBrainXP
);


// 4️⃣ ADAPTIVE AI QUESTION GENERATOR (GROQ Powered)
// GET /api/brain/question
router.get(
  "/question",
  protect,
  brainController.getAIQuestion
);


// =====================================================
// 🎮 STRATEGY GAME (AI Powered Risk Engine)
// =====================================================

// 5️⃣ RUN STRATEGY GAME
// POST /api/brain/strategy
// Body: { choice: string }
router.post(
  "/strategy",
  protect,
  brainController.runStrategyGame
);


// =====================================================
// ⚖ DECISION SIMULATOR (AI Real-World Outcome)
// =====================================================

// 6️⃣ RUN DECISION SIMULATOR
// POST /api/brain/decision
// Body: { decision: string }
router.post(
  "/decision",
  protect,
  brainController.runDecisionSimulator
);


// =====================================================
// 💻 AI CODE LAB (Code Analysis & Optimization)
// =====================================================

// 7️⃣ ANALYZE CODE
// POST /api/brain/code-lab
// Body: { code: string }
router.post(
  "/code-lab",
  protect,
  brainController.runCodeLab
);


// =====================================================
// 🌅 DAILY CHALLENGE ROUTES
// =====================================================

// 8️⃣ GET DAILY CHALLENGE
// GET /api/brain/daily
router.get(
  "/daily",
  protect,
  brainController.getDailyChallenge
);


// 9️⃣ COMPLETE DAILY CHALLENGE
// POST /api/brain/daily/complete
// Body: { correct: boolean }
router.post(
  "/daily/complete",
  protect,
  brainController.completeDailyChallenge
);


// =====================================================
// 🏆 LEADERBOARD
// =====================================================

// 🔟 GLOBAL LEADERBOARD (Top 10 Players)
// GET /api/brain/leaderboard
router.get(
  "/leaderboard",
  protect,
  brainController.getLeaderboard
);


// =====================================================
// 🚀 FUTURE EXPANSION (Reserved)
// =====================================================

// router.get("/rank", protect, brainController.getBrainRank);
// router.get("/weekly-report", protect, brainController.getWeeklyReport);
// router.get("/tier", protect, brainController.getBrainTier);
// router.post("/multiplayer", protect, brainController.startBrainBattle);
// router.get("/analytics", protect, brainController.getBrainAnalytics);


module.exports = router;
