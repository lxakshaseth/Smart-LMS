const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const plannerController = require("../controllers/planner.controller");

/*
=====================================================
📘 SMART AI PLANNER ROUTES
Base Route: /api/planner
=====================================================
*/


// =====================================================
// 1️⃣ GET USER PLANNER
// GET /api/planner
// =====================================================
router.get(
    "/",
    protect,
    plannerController.getPlanner
);


// =====================================================
// 2️⃣ UPDATE USER PLANNER (Manual Edit)
// PUT /api/planner
// =====================================================
router.put(
    "/",
    protect,
    plannerController.updatePlanner
);


// =====================================================
// 3️⃣ GENERATE ADAPTIVE AI SMART PLAN
// POST /api/planner/generate
// =====================================================
router.post(
    "/generate",
    protect,
    plannerController.generatePlan
);


// =====================================================
// 4️⃣ TOGGLE TASK COMPLETE
// PATCH /api/planner/complete
// Body: { taskId }
// =====================================================
router.patch(
    "/complete",
    protect,
    plannerController.toggleTaskComplete
);


// =====================================================
// 5️⃣ AI RISK ANALYZER
// POST /api/planner/analyze
// =====================================================
router.post(
    "/analyze",
    protect,
    plannerController.analyzePlanner
);


// =====================================================
// 6️⃣ WEEKLY AI REVIEW
// POST /api/planner/weekly-review
// =====================================================
router.post(
    "/weekly-review",
    protect,
    plannerController.generateWeeklyReview
);


// =====================================================
// 7️⃣ PLANNER DASHBOARD DATA
// GET /api/planner/dashboard
// =====================================================
router.get(
    "/dashboard",
    protect,
    plannerController.getDashboard
);


// =====================================================
// 8️⃣ APPLY SMART STUDY RECOMMENDATION
// POST /api/planner/apply-recommendation
// =====================================================
router.post(
    "/apply-recommendation",
    protect,
    plannerController.applyRecommendation
);


// =====================================================
// 9️⃣ GENERATE TOMORROW SMART PLAN
// POST /api/planner/tomorrow
// =====================================================
router.post(
    "/tomorrow",
    protect,
    plannerController.generateTomorrowPlan
);


// =====================================================
// 10️⃣ HEALTH CHECK (Optional Debug Route)
// GET /api/planner/health
// =====================================================
router.get("/health", (req, res) => {
    res.json({ success: true, message: "Planner route working" });
});


// =====================================================
// 11️⃣ PLANNER AI STUDY ASSISTANT CHAT
// POST /api/planner/chat
// =====================================================
router.post(
    "/chat",
    protect,
    plannerController.chatPlanner
);


module.exports = router;
