const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const goalController = require("../controllers/goal.controller");

// =====================================================
// SET USER GOAL
// =====================================================
router.post("/", protect, goalController.setGoal);

// =====================================================
// GET USER GOAL
// =====================================================
router.get("/", protect, goalController.getGoal);

module.exports = router;
