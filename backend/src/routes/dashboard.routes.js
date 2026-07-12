const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

// =====================================================
// GET DASHBOARD DATA
// =====================================================
router.get("/", protect, dashboardController.getDashboard);

module.exports = router;
