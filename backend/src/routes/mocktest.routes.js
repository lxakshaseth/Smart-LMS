const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const mocktestController = require("../controllers/mocktest.controller");

// =====================================================
// GENERATE AI MOCK TEST
// =====================================================
router.post("/generate", protect, mocktestController.generateTest);

// =====================================================
// SUBMIT MOCK TEST RESULT (XP + DB SAVE)
// =====================================================
router.post("/submit", protect, mocktestController.submitTest);

module.exports = router;
