const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  generateMockSchema,
  submitMockSchema
} = require("../validations/mock.validation");

const Planner = require("../models/planner.model");

const {
  calculateWeeklyCompletion,
  updatePlannerAnalytics,
  rebalancePlannerByMastery,
  calculateConfidence,
  predictNextScore,
  calculateExamReadiness
} = require("../services/analytics.service");

const {
  generateStructuredResponse
} = require("../services/ai.service");


// =====================================================
// 1️⃣ GENERATE HYBRID ADAPTIVE MOCK
// POST /api/mock/generate
// =====================================================
router.post(
  "/generate",
  protect,
  validate(generateMockSchema),
  async (req, res) => {
    try {
      const { subject } = req.body;

      const planner = await Planner.findOne({ user: req.user.id });

      if (!planner) {
        return res.status(404).json({ message: "Planner not found" });
      }

      // ============================
      // HYBRID DIFFICULTY ENGINE
      // ============================

      let adaptiveReason = "";

      const subjectRecord = planner.subjectStats?.find(
        s => s.subject === subject
      );

      let baseLevel = "Medium";

      if (subjectRecord) {
        if (subjectRecord.mastery >= 75) baseLevel = "Hard";
        else if (subjectRecord.mastery >= 50) baseLevel = "Medium";
        else baseLevel = "Easy";
      }

      const levels = ["Easy", "Medium", "Hard"];
      let index = levels.indexOf(baseLevel);

      if (planner.riskScore >= 70 && index > 0) {
        index -= 1;
        adaptiveReason += "High risk → Difficulty reduced. ";
      }

      if (
        planner.riskScore <= 30 &&
        planner.performanceTrend === "Improving" &&
        index < 2
      ) {
        index += 1;
        adaptiveReason += "Low risk + Improving trend → Difficulty increased. ";
      }

      const difficulty = levels[index];

      if (!adaptiveReason) {
        adaptiveReason = "Difficulty balanced using mastery and risk.";
      }

      const prompt = `
You are an adaptive exam mock generator.

Subject: ${subject}
Difficulty Level: ${difficulty}

Generate exactly 5 MCQs.

Return STRICT JSON:
{
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": ""
    }
  ]
}

Only valid JSON. No explanation.
`;

      const aiResponse = await generateStructuredResponse(prompt);

      res.json({
        ...aiResponse,
        adaptiveReason
      });

    } catch (error) {
      console.error("Adaptive Mock Generate Error:", error);
      res.status(500).json({ message: "Mock generation failed" });
    }
  }
);


// =====================================================
// 2️⃣ SUBMIT MOCK TEST
// POST /api/mock/submit
// =====================================================
router.post(
  "/submit",
  protect,
  validate(submitMockSchema),
  async (req, res) => {
    try {
      const { subject, questions, userAnswers } = req.body;

      let correctAnswers = 0;

      questions.forEach((q, index) => {
        if (q.correctAnswer === userAnswers[index]) {
          correctAnswers++;
        }
      });

      const accuracy = Math.round(
        (correctAnswers / questions.length) * 100
      );

      const planner = await Planner.findOne({ user: req.user.id });

      if (!planner) {
        return res.status(404).json({ message: "Planner not found" });
      }

      // ============================
      // GLOBAL ANALYTICS UPDATE
      // ============================
      planner.lastMockAccuracy = accuracy;

      planner.accuracyHistory.push({
        date: new Date().toISOString(),
        accuracy
      });

      if (planner.accuracyHistory.length > 10) {
        planner.accuracyHistory.shift();
      }

      planner.weakSubject = subject;

      planner.weeklyCompletion = calculateWeeklyCompletion(
        planner.weeklyPlan
      );

      // ============================
      // SUBJECT MASTERY UPDATE
      // ============================
      let subjectRecord = planner.subjectStats.find(
        s => s.subject === subject
      );

      if (!subjectRecord) {
        subjectRecord = {
          subject,
          totalAttempts: 0,
          totalAccuracy: 0,
          mastery: 0
        };
        planner.subjectStats.push(subjectRecord);
      }

      subjectRecord.totalAttempts += 1;
      subjectRecord.totalAccuracy += accuracy;
      subjectRecord.mastery = Math.round(
        subjectRecord.totalAccuracy / subjectRecord.totalAttempts
      );

      // ============================
      // UPDATE TREND + RISK
      // ============================
      updatePlannerAnalytics(planner);

      // ============================
      // AUTO REBALANCE
      // ============================
      rebalancePlannerByMastery(planner);

      // ============================
      // CONFIDENCE
      // ============================
      const confidenceData = calculateConfidence(planner, subject);

      // ============================
      // PREDICTION
      // ============================
      const predictionData = predictNextScore(planner);

      // ============================
      // EXAM READINESS
      // ============================
      const examData = calculateExamReadiness(
        planner,
        confidenceData.confidenceScore,
        predictionData.predictedNextScore
      );

      await planner.save();

      res.json({
        message: "Mock evaluated successfully",
        correctAnswers,
        totalQuestions: questions.length,
        accuracy,
        riskScore: planner.riskScore,
        riskLevel: planner.riskLevel,
        performanceTrend: planner.performanceTrend,
        subjectMastery: subjectRecord.mastery,
        confidenceScore: confidenceData.confidenceScore,
        confidenceLevel: confidenceData.confidenceLevel,
        predictedNextScore: predictionData.predictedNextScore,
        readinessLevel: predictionData.readinessLevel,
        examReadinessIndex: examData.examReadinessIndex,
        readinessStatus: examData.readinessStatus,
        focusArea: examData.focusArea
      });

    } catch (error) {
      console.error("Mock Submit Error:", error);
      res.status(500).json({ message: "Mock submission failed" });
    }
  }
);

module.exports = router;
