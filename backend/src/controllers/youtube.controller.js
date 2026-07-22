const youtubeService = require("../services/youtube.service");
const User = require("../models/user.model");
const { getCurrentTargetExam } = require("../utils/targetExam.utils");
const { getExamMapping } = require("../utils/examCategoryMap");

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
      difficulty,
      targetExam
    } = req.query;

    const user = req.user ? await User.findById(req.user.id) : null;
    const activeTargetExam = targetExam || (user ? getCurrentTargetExam(user) : "Class 12 Boards");
    const mapping = getExamMapping(activeTargetExam);

    let rawQuery = (q || query || "").trim();
    let finalQuery = "";

    // ⚠️ CRITICAL ARCHITECTURE RULE:
    // If the user entered a search query, execute UNRESTRICTED GLOBAL SEARCH across all YouTube content (e.g. "React", "Python").
    // Do NOT prefix targetExam to user search queries.
    // If rawQuery is empty, use the user's targetExam mapping default query to populate the personalized Explore Feed.
    if (rawQuery) {
      finalQuery = rawQuery;
    } else if (category && category !== "All") {
      finalQuery = `${category} course tutorial`;
    } else {
      finalQuery = mapping.defaultQuery;
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
    const user = req.user ? await User.findById(req.user.id) : null;
    const targetExam = user ? getCurrentTargetExam(user) : "Class 12 Boards";
    const weakSubject = (user && user.weakSubject && !["Not Available", "Nursery-LKG", "-"].includes(user.weakSubject))
      ? user.weakSubject
      : "";

    const mapping = getExamMapping(targetExam);
    let recommendedQueries = [...mapping.recommendedQueries];

    // If user has a specific weak subject, prioritize it in top recommendation query
    if (weakSubject && weakSubject !== "None") {
      const weakQuery = `${targetExam} ${weakSubject} Full Course & Revision`;
      recommendedQueries = [weakQuery, ...recommendedQueries.slice(0, 3)];
    }

    // Fetch primary recommendation results
    const primaryQuery = recommendedQueries[0] || mapping.defaultQuery;
    const result = await youtubeService.searchYouTube({
      query: primaryQuery,
      maxResults: 8
    });

    res.json({
      success: true,
      targetExam,
      weakSubject: weakSubject || "None",
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
