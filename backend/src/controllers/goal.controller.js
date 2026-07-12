const Goal = require("../models/goal.model");

// SET GOAL
exports.setGoal = async (req, res) => {
  try {

    const { subject, targetScore, targetDate } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { user: req.user.id },
      { subject, targetScore, targetDate },
      { new: true, upsert: true }
    );

    res.json(goal);

  } catch (err) {
    res.status(500).json({ message: "Failed to set goal" });
  }
};

// GET GOAL
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goal" });
  }
};
