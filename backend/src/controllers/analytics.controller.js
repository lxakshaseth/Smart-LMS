// =======================================================
// 📊 ANALYTICS CONTROLLER
// Smart AI LMS Intelligence Layer (Stable Version)
// =======================================================

const Planner = require("../models/planner.model");
const User = require("../models/user.model");

const analyticsService = require("../services/analytics.service");

const {
    calculateConfidence,
    predictNextScore,
    calculateExamReadiness,
    calculateFocusScore,
    calculateBurnoutRisk
} = analyticsService;


// =======================================================
// 1️⃣ ANALYTICS OVERVIEW
// GET /api/analytics/overview
// =======================================================

exports.getAnalyticsOverview = async (req, res) => {
    try {

        const planner = await Planner.findOne({ user: req.user.id });
        const user = await User.findById(req.user.id);

        if (!planner) {
            return res.status(404).json({
                success: false,
                message: "Planner not found"
            });
        }

        // ================= AVERAGE MASTERY =================
        let averageMastery = 0;

        if (planner.subjectStats?.length) {
            const total = planner.subjectStats.reduce(
                (sum, s) => sum + (s.mastery || 0),
                0
            );
            averageMastery = Math.round(
                total / planner.subjectStats.length
            );
        }

        // ================= WEEKLY TREND =================
        const weeklyAccuracyTrend =
            planner.accuracyHistory?.slice(-7) || [];

        // ================= CONFIDENCE =================
        const subject =
            planner.weakSubject ||
            planner.subjectStats?.[0]?.subject ||
            "General";

        const confidenceData =
            typeof calculateConfidence === "function"
                ? calculateConfidence(planner, subject)
                : { confidenceScore: 50, confidenceLevel: "Medium" };

        // ================= PREDICTION =================
        const predictionData =
            typeof predictNextScore === "function"
                ? predictNextScore(planner)
                : { predictedNextScore: 60 };

        // ================= EXAM READINESS =================
        const examData =
            typeof calculateExamReadiness === "function"
                ? calculateExamReadiness(
                      planner,
                      confidenceData.confidenceScore,
                      predictionData.predictedNextScore
                  )
                : {
                      examReadinessIndex: 60,
                      readinessStatus: "Moderate",
                      focusArea: "Revision"
                  };

        // ================= FOCUS SCORE =================
        const focusScore =
            typeof calculateFocusScore === "function"
                ? calculateFocusScore(planner, user)
                : 70;

        // ================= BURNOUT =================
        const burnoutRisk =
            typeof calculateBurnoutRisk === "function"
                ? calculateBurnoutRisk(planner)
                : "Low";

        return res.json({
            success: true,

            averageMastery,
            subjectStats: planner.subjectStats || [],

            riskScore: planner.riskScore || 0,
            riskLevel: planner.riskLevel || "Low",

            performanceTrend:
                planner.performanceTrend || "Stable",

            weeklyCompletion:
                planner.weeklyCompletion || 0,

            weeklyAccuracyTrend,

            confidenceScore:
                confidenceData.confidenceScore,

            confidenceLevel:
                confidenceData.confidenceLevel,

            predictedNextScore:
                predictionData.predictedNextScore,

            examReadinessIndex:
                examData.examReadinessIndex,

            readinessStatus:
                examData.readinessStatus,

            focusArea:
                examData.focusArea,

            focusScore,
            burnoutRisk
        });

    } catch (error) {

        console.error("Analytics Overview Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics"
        });
    }
};



// =======================================================
// 2️⃣ PREDICT EXAM SCORE
// GET /api/analytics/predict-score
// =======================================================

exports.predictExamScore = async (req, res) => {

    try {

        const planner =
            await Planner.findOne({ user: req.user.id });

        if (!planner) {
            return res.status(404).json({
                success: false,
                message: "Planner not found"
            });
        }

        const predictionData =
            typeof predictNextScore === "function"
                ? predictNextScore(planner)
                : { predictedNextScore: 60 };

        const confidenceData =
            typeof calculateConfidence === "function"
                ? calculateConfidence(
                      planner,
                      planner.weakSubject || "General"
                  )
                : { confidenceScore: 50 };

        const examData =
            typeof calculateExamReadiness === "function"
                ? calculateExamReadiness(
                      planner,
                      confidenceData.confidenceScore,
                      predictionData.predictedNextScore
                  )
                : {
                      examReadinessIndex: 60,
                      readinessStatus: "Moderate"
                  };

        const burnoutRisk =
            typeof calculateBurnoutRisk === "function"
                ? calculateBurnoutRisk(planner)
                : "Low";

        return res.json({
            success: true,

            predictedScore:
                predictionData.predictedNextScore,

            confidenceScore:
                confidenceData.confidenceScore,

            readinessIndex:
                examData.examReadinessIndex,

            readinessStatus:
                examData.readinessStatus,

            burnoutRisk
        });

    } catch (error) {

        console.error("Predict Score Error:", error);

        return res.status(500).json({
            success: false,
            message: "Prediction failed"
        });
    }
};
