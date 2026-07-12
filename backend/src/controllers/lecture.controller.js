const invidious = require("../config/invidious");

const getLectures = async (req, res) => {
  try {
    const topic = req.query.topic;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    const lectures = await invidious.searchYouTubeFree(topic);

    return res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });

  } catch (error) {
    console.error("Lecture Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getLectures
};
