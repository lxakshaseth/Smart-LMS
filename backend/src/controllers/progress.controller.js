const User = require("../models/user.model");

// ===============================
// GET USER PROGRESS
// ===============================

const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    // ===============================
    // RANK SYSTEM
    // ===============================

    let rank = "Beginner";

    if (user.xp >= 1000) rank = "Master";
    else if (user.xp >= 500) rank = "Advanced";
    else if (user.xp >= 200) rank = "Intermediate";

    res.json({
      success: true,
      data: {
        xp: user.xp,
        streak: user.streak,
        rank,
        totalQuestions: user.totalQuestions,
        totalNotes: user.totalNotes,
        totalQuizzes: user.totalQuizzes,
        weeklyActivity: user.weeklyActivity,
        subjectStats: user.subjectStats
      }
    });

  } catch (error) {
    console.error("Progress Error:", error.message);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getProgress
};
