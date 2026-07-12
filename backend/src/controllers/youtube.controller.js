const youtubeService = require("../services/youtube.service");

exports.searchVideos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    const videos = await youtubeService.searchYouTube(q);

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
