const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

/*
===========================================
GET GLOBAL LEADERBOARD
===========================================
*/
router.get("/", protect, async (req, res) => {
  try {

    const topUsers = await User.find({})
      .select("username xp level rank")
      .sort({ xp: -1 })
      .limit(10);

    const currentUser = await User.findById(req.user._id)
      .select("username xp level rank");

    // Find current user's rank position
    const allUsersSorted = await User.find({})
      .select("_id")
      .sort({ xp: -1 });

    const position = allUsersSorted.findIndex(
      u => u._id.toString() === req.user._id.toString()
    ) + 1;

    res.json({
      success: true,
      leaderboard: topUsers,
      yourPosition: position,
      yourData: currentUser
    });

  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
