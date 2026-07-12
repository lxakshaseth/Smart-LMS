const Goal = require("../models/goal.model");
const MockTest = require("../models/mocktest.model");

exports.getDashboard = async (req, res) => {

  try {

    const goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      return res.json({ message: "No goal set" });
    }

    const daysLeft = Math.ceil(
      (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const progress = goal.currentScore || 0;
    const requiredPerDay = (goal.targetScore - progress) / daysLeft;

    let risk = "Low";

    if (requiredPerDay > 5) risk = "High";
    else if (requiredPerDay > 2) risk = "Medium";

    res.json({
      subject: goal.subject,
      progress,
      target: goal.targetScore,
      daysLeft,
      risk
    });

  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
};
const { generateAIResponse } = require("../services/ai.service");

exports.getAISuggestions = async (req, res) => {

  const prompt = `
  User progress: 60%
  Risk: Medium
  Weak subject: DSA

  Give professional improvement suggestions in bullet points.
  `;

  const aiText = await generateAIResponse(prompt);

  res.json({ suggestions: aiText });
};
