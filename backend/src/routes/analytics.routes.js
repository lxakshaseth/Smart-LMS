const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const analyticsController = require("../controllers/analytics.controller");

/*
=====================================================
📊 SMART AI ANALYTICS ROUTES
Base Route: /api/analytics
=====================================================
*/


// =====================================================
// 1️⃣ ANALYTICS OVERVIEW
// GET /api/analytics/overview
// =====================================================
router.get(
    "/overview",
    protect,
    analyticsController.getAnalyticsOverview
);


// =====================================================
// 2️⃣ EXAM SCORE PREDICTION (NEW)
// GET /api/analytics/predict-score
// =====================================================
router.get(
    "/predict-score",
    protect,
    analyticsController.predictExamScore
);


// =====================================================
// 3️⃣ (Optional Future) ADVANCED PERFORMANCE TREND
// GET /api/analytics/trend
// =====================================================
// router.get(
//     "/trend",
//     protect,
//     analyticsController.getPerformanceTrend
// );


// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
