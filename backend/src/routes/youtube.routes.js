const express = require("express");
const router = express.Router();
const youtubeController = require("../controllers/youtube.controller");
const { protect, protectOptional } = require("../middleware/auth.middleware");

// Public & Optional Auth Routes
router.get("/search", protectOptional, youtubeController.searchVideos);
router.get("/recommendations", protectOptional, youtubeController.getRecommendations);

// Protected User Routes (Bookmarks & History)
router.post("/bookmark", protect, youtubeController.toggleBookmark);
router.get("/bookmarks", protect, youtubeController.getBookmarks);
router.post("/history", protect, youtubeController.recordWatchHistory);
router.get("/history", protect, youtubeController.getWatchHistory);

module.exports = router;
