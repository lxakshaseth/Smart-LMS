const youtubeService = require("../services/youtube.service");
const User = require("../models/user.model");
const { getCurrentTargetExam } = require("../utils/targetExam.utils");
const { getExamMapping } = require("../utils/examCategoryMap");

// =======================================================
// 1️⃣ SEARCH VIDEOS (YouTube Data API v3)
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
    const activeTargetExam = targetExam || (user ? getCurrentTargetExam(user) : "");
    const mapping = getExamMapping(activeTargetExam);

    let rawQuery = (q || query || "").trim();
    let finalQuery = "";

    if (rawQuery) {
      // Ensure target exam prefix is included if missing
      const examKey = mapping.searchPrefix || activeTargetExam;
      if (examKey && !rawQuery.toLowerCase().includes(examKey.toLowerCase())) {
        finalQuery = `${examKey} ${rawQuery}`;
      } else {
        finalQuery = rawQuery;
      }
    } else if (category && category !== "All") {
      const examKey = mapping.searchPrefix || activeTargetExam;
      if (examKey && !category.toLowerCase().includes(examKey.toLowerCase())) {
        finalQuery = `${examKey} ${category}`;
      } else {
        finalQuery = category;
      }
    } else {
      finalQuery = mapping.defaultQuery;
    }

    const result = await youtubeService.searchYouTube({
      query: finalQuery,
      category: category || "",
      pageToken: pageToken || "",
      maxResults: parseInt(maxResults, 10) || 12,
      sort,
      difficulty: difficulty || "",
      targetExam: activeTargetExam
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
// 2️⃣ PERSONALIZED RECOMMENDATIONS
// GET /api/youtube/recommendations
// =======================================================
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user ? await User.findById(req.user.id) : null;
    const targetExam = user ? getCurrentTargetExam(user) : "JEE Main";
    const weakSubject = (user && user.weakSubject && !["Not Available", "Nursery-LKG", "-"].includes(user.weakSubject))
      ? user.weakSubject
      : "";

    const mapping = getExamMapping(targetExam);
    let recommendedQueries = [...mapping.recommendedQueries];

    // If user has a specific weak subject, prioritize it in top recommendation query
    if (weakSubject && weakSubject !== "None") {
      const weakQuery = `${mapping.searchPrefix || targetExam} ${weakSubject} Full Course & Revision`;
      recommendedQueries = [weakQuery, ...recommendedQueries.slice(0, 3)];
    }

    // Fetch primary recommendation results
    const primaryQuery = recommendedQueries[0] || mapping.defaultQuery;
    const result = await youtubeService.searchYouTube({
      query: primaryQuery,
      maxResults: 8,
      targetExam
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
// 3️⃣ BOOKMARK VIDEO (Toggle)
// POST /api/youtube/bookmark
// =======================================================
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { video } = req.body;
    if (!video || !video.videoId) {
      return res.status(400).json({ success: false, message: "Video object with videoId is required" });
    }

    const saved = user.savedVideos || [];
    const index = saved.findIndex(v => v.videoId === video.videoId);

    let isBookmarked = false;
    if (index > -1) {
      saved.splice(index, 1);
      isBookmarked = false;
    } else {
      saved.unshift({
        videoId: video.videoId,
        title: video.title || "",
        channel: video.channel || "YouTube",
        thumbnail: video.thumbnail || "",
        duration: video.duration || "10:00",
        views: video.views || "10K",
        savedAt: new Date()
      });
      isBookmarked = true;
    }

    user.savedVideos = saved;
    await user.save();

    res.json({
      success: true,
      isBookmarked,
      savedVideos: user.savedVideos
    });
  } catch (error) {
    console.error("Toggle Bookmark Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update bookmark" });
  }
};

// =======================================================
// 4️⃣ GET BOOKMARKED VIDEOS
// GET /api/youtube/bookmarks
// =======================================================
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      savedVideos: user.savedVideos || []
    });
  } catch (error) {
    console.error("Get Bookmarks Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookmarks" });
  }
};

// =======================================================
// 5️⃣ RECORD WATCH HISTORY
// POST /api/youtube/history
// =======================================================
exports.recordWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { video, progressSeconds, totalSeconds } = req.body;
    if (!video || !video.videoId) {
      return res.status(400).json({ success: false, message: "Video details required" });
    }

    const history = user.watchHistory || [];
    const existingIndex = history.findIndex(h => h.videoId === video.videoId);

    const completionPercent = totalSeconds > 0 ? Math.round((progressSeconds / totalSeconds) * 100) : 0;

    const entry = {
      videoId: video.videoId,
      title: video.title || "",
      channel: video.channel || "YouTube",
      thumbnail: video.thumbnail || "",
      duration: video.duration || "10:00",
      progressSeconds: progressSeconds || 0,
      totalSeconds: totalSeconds || 0,
      completionPercent,
      watchedAt: new Date()
    };

    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(entry);

    user.watchHistory = history.slice(0, 30);
    await user.save();

    res.json({
      success: true,
      watchHistory: user.watchHistory
    });
  } catch (error) {
    console.error("Watch History Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update watch history" });
  }
};

// =======================================================
// 6️⃣ GET WATCH HISTORY
// GET /api/youtube/history
// =======================================================
exports.getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      watchHistory: user.watchHistory || []
    });
  } catch (error) {
    console.error("Get Watch History Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch watch history" });
  }
};
