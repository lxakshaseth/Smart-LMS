const express = require("express");
const router = express.Router();

const lectureController = require("../controllers/lecture.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Safe reference (no destructuring errors)
router.get(
  "/lectures",
  authMiddleware.protect,
  lectureController.getLectures
);

module.exports = router;
