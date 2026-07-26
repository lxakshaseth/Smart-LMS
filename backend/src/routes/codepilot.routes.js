const express = require("express");
const router = express.Router();
const { protectOptional } = require("../middleware/auth.middleware");

const {
  runCompiler,
  askCodeAssistant,
  getProblems,
  getProblemById,
  aiCodeReview,
  getRoadmaps,
  analyzeResume,
  mockInterview,
  getPlacementsData,
  getSPPUData
} = require("../controllers/codepilot.controller");

// Health check
router.get("/test", (req, res) => {
  res.json({ success: true, message: "CodePilot AI API operational 🚀" });
});

// Compiler execution
router.post("/compiler", protectOptional, runCompiler);

// AI Chatbot Assistant
router.post("/chat", protectOptional, askCodeAssistant);

// Problem Management
router.get("/problems", protectOptional, getProblems);
router.get("/problems/:id", protectOptional, getProblemById);

// AI Code Review
router.post("/review", protectOptional, aiCodeReview);

// Learning Roadmaps
router.get("/roadmaps", protectOptional, getRoadmaps);

// Resume ATS Analyzer
router.post("/resume", protectOptional, analyzeResume);

// AI Mock Interviewer
router.post("/interview", protectOptional, mockInterview);

// Placement Prep & Engineering Target Exam
router.get("/placements", protectOptional, getPlacementsData);
router.get("/sppu", protectOptional, getSPPUData);

module.exports = router;
