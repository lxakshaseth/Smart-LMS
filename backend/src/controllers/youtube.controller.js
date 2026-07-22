const youtubeService = require("../services/youtube.service");

// =======================================================
// 1️⃣ SEARCH VIDEOS (YouTube Data API v3 & Fallback)
// GET /api/youtube/search
// =======================================================
exports.searchVideos = async (req, res) => {
  try {
    const {
      q,
      query,
      category,
      pageToken,
      maxResults = 12,
      sort = "relevance",
      difficulty
    } = req.query;

    let rawQuery = (q || query || "").trim();
    let finalQuery = "";

    if (rawQuery) {
      finalQuery = rawQuery;
    } else if (category && category !== "All") {
      finalQuery = `${category} course tutorial`;
    } else {
      finalQuery = "Educational Tutorials Courses";
    }

    const result = await youtubeService.searchYouTube({
      query: finalQuery,
      category: category || "",
      pageToken: pageToken || "",
      maxResults: parseInt(maxResults, 10) || 12,
      sort,
      difficulty: difficulty || ""
    });

    res.json(result);
  } catch (error) {
    console.error("YouTube Controller Search Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to search learning videos",
      error: error.message
    });
  }
};

// =======================================================
// 2️⃣ PERSONALIZED AI RECOMMENDATIONS
// GET /api/youtube/recommendations
// =======================================================
exports.getRecommendations = async (req, res) => {
  try {
    const recommendedQueries = [
      "Full Stack Web Development MERN Tutorial",
      "Data Structures & Algorithms Complete Course",
      "Machine Learning & Artificial Intelligence Crash Course",
      "System Design & Coding Interview Preparation",
      "Python for Beginners to Advanced Full Course",
      "Calculus & Higher Mathematics Tutorials",
      "Operating Systems & Computer Networks Deep Dive"
    ];

    // Fetch primary recommendation results
    const primaryQuery = recommendedQueries[0];
    const result = await youtubeService.searchYouTube({
      query: primaryQuery,
      maxResults: 8
    });

    res.json({
      success: true,
      recommendedQueries,
      videos: result.videos || []
    });
  } catch (error) {
    console.error("YouTube Controller Recommendations Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message
    });
  }
};

// =======================================================
// 3️⃣ USER BOOKMARKS & WATCH HISTORY
// GET / POST endpoints for bookmarks & history
// =======================================================
exports.toggleBookmark = async (req, res) => {
  try {
    // In-memory / local storage sync
    res.json({ success: true, message: "Bookmark synced" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    res.json({ success: true, savedVideos: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordWatchHistory = async (req, res) => {
  try {
    res.json({ success: true, message: "History recorded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWatchHistory = async (req, res) => {
  try {
    res.json({ success: true, watchHistory: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
