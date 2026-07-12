const express = require("express");
const router = express.Router();
const multer = require("multer");

// ============================
// CONTROLLER IMPORT
// ============================

const {
  askAI,
  studyMode,
  generateQuiz,
  ocrFromImage,
  createNewChat,
  getSessions,
  getSingleChat
} = require("../controllers/ai.controller");

const { protect } = require("../middleware/auth.middleware");

// ============================
// MULTER CONFIG (OCR UPLOAD)
// ============================

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ============================
// HEALTH CHECK
// ============================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI routes working successfully 🚀"
  });
});

// ============================
// CHAT SYSTEM
// ============================

// Create New Chat
router.post("/new-chat", protect, createNewChat);

// Get All Sessions
router.get("/sessions", protect, getSessions);

// Get Single Chat
router.get("/chat/:id", protect, getSingleChat);

// Ask AI
router.post("/ask", protect, askAI);

// ============================
// STUDY SYSTEM
// ============================

// Study Mode
router.post("/study", protect, studyMode);

// Generate Notes (Alias)
router.post("/generate-notes", protect, studyMode);

// Generate Quiz
router.post("/generate-quiz", protect, generateQuiz);

// ============================
// OCR SYSTEM
// ============================

router.post(
  "/ocr",
  protect,
  upload.single("image"),
  ocrFromImage
);

// ============================
// EXPORT ROUTER
// ============================

module.exports = router;
