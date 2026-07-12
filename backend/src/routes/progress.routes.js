const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const progressController = require("../controllers/progress.controller");

// =====================================================
// GET USER PROGRESS (Analytics + XP + Graph Data)
// =====================================================
router.get("/", protect, progressController.getProgress);

module.exports = router;
