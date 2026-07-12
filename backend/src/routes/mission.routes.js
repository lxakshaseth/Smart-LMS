const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

/*
===========================================
GET DAILY MISSION
===========================================
*/
router.get("/", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    const today = new Date().toISOString().split("T")[0];

    // If no mission OR old mission
    if (!user.dailyMission || user.dailyMission.date !== today) {

      user.dailyMission = {
        date: today,
        questionsTarget: 20,
        notesTarget: 5,
        quizTarget: 1,
        questionsDone: 0,
        notesDone: 0,
        quizDone: 0,
        completed: false
      };

      await user.save();
    }

    res.json({
      success: true,
      mission: user.dailyMission
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


/*
===========================================
UPDATE MISSION PROGRESS
===========================================
*/
router.post("/update", protect, async (req, res) => {
  try {

    const { type } = req.body; // question / notes / quiz

    const user = await User.findById(req.user._id);

    if (!user.dailyMission) {
      return res.status(400).json({ success: false });
    }

    if (type === "question")
      user.dailyMission.questionsDone++;

    if (type === "notes")
      user.dailyMission.notesDone++;

    if (type === "quiz")
      user.dailyMission.quizDone++;

    // Check completion
    if (
      user.dailyMission.questionsDone >= user.dailyMission.questionsTarget &&
      user.dailyMission.notesDone >= user.dailyMission.notesTarget &&
      user.dailyMission.quizDone >= user.dailyMission.quizTarget &&
      !user.dailyMission.completed
    ) {
      user.dailyMission.completed = true;
      user.xp += 50; // 🎉 Bonus XP
    }

    await user.save();

    res.json({
      success: true,
      mission: user.dailyMission
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
