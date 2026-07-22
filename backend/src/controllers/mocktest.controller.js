const { buildMCQPrompt } = require("../services/mcq/prompt.service");
const { callGroqMCQ } = require("../services/mcq/groq.service");
const { parseAndProcessMCQs } = require("../services/mcq/questionParser");

const MockTest = require("../models/mocktest.model");
const User = require("../models/user.model");
const Planner = require("../models/planner.model");

// =====================================================
// 1️⃣ GENERATE DYNAMIC MCQ EXAMINATION PAPER
// POST /api/mocktest/generate
// =====================================================
exports.generateTest = async (req, res) => {
  try {
    const category = req.body.category || req.body.subject;
    const difficulty = req.body.difficulty || "Medium";
    const questionCount = Math.min(Math.max(Number(req.body.questionCount) || 10, 5), 30);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required to generate examination paper."
      });
    }

    // 1. Build prompt with random seed, timestamp, UUID, and syllabus
    const promptPayload = buildMCQPrompt({ category, difficulty, questionCount });

    // 2. Execute Groq API call with high entropy (temp 1.2, top_p 0.95) & auto-retry
    const rawAiText = await callGroqMCQ(promptPayload, questionCount, 3);

    // 3. Extract JSON, validate questions, shuffle options & update answer indices
    const processedResult = parseAndProcessMCQs(rawAiText);

    // 4. Return clean JSON response
    return res.json({
      success: true,
      category,
      difficulty,
      questionCount: processedResult.questionCount,
      paperHash: processedResult.paperHash,
      questions: processedResult.questions
    });

  } catch (err) {
    console.error("❌ Mock Test Generation Error:", err.message);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to generate examination paper."
    });
  }
};

// =====================================================
// 2️⃣ SUBMIT MOCK TEST RESULT & UPDATE XP / ANALYTICS
// POST /api/mocktest/submit
// =====================================================
exports.submitTest = async (req, res) => {
  try {
    const {
      subject,
      category,
      topic,
      totalQuestions,
      correctAnswers,
      weakAreas,
      timeTaken
    } = req.body;

    const targetCategory = category || subject || "General";

    if (!totalQuestions || correctAnswers == null) {
      return res.status(400).json({
        success: false,
        message: "Invalid test evaluation data."
      });
    }

    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // 1. Save Mock Test record
    await MockTest.create({
      user: req.user.id,
      subject: targetCategory,
      topic: topic || targetCategory,
      totalQuestions,
      correctAnswers,
      accuracy,
      weakAreas,
      timeTaken
    });

    // 2. Update User XP + Streak + Rank
    const xpEarned = correctAnswers * 5;
    const user = await User.findById(req.user.id);

    if (user) {
      user.xp += xpEarned;
      user.totalQuizzes += 1;

      const today = new Date().toISOString().split("T")[0];
      if (user.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toISOString().split("T")[0];

        if (user.lastActiveDate === yDate) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.lastActiveDate = today;
      }

      user.updateLevelAndRank();
      await user.save();
    }

    // 3. Update Planner Analytics & Risk Status
    let planner = await Planner.findOne({ user: req.user.id });
    if (!planner) {
      planner = await Planner.create({ user: req.user.id });
    }

    planner.lastMockAccuracy = accuracy;

    if (weakAreas && weakAreas.length > 0) {
      const freqMap = {};
      weakAreas.forEach(area => {
        freqMap[area] = (freqMap[area] || 0) + 1;
      });
      const sortedWeak = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      planner.weakSubject = sortedWeak[0][0];
    } else {
      planner.weakSubject = targetCategory;
    }

    if (accuracy < 50) {
      planner.riskLevel = "High";
    } else if (accuracy < 75) {
      planner.riskLevel = "Medium";
    } else {
      planner.riskLevel = "Low";
    }

    await planner.save();

    return res.json({
      success: true,
      message: "Test evaluation submitted successfully.",
      xpEarned,
      accuracy,
      level: user ? user.level : 1,
      rank: user ? user.rank : "Novice",
      weakSubject: planner.weakSubject,
      riskLevel: planner.riskLevel
    });

  } catch (err) {
    console.error("❌ Submit Test Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit test evaluation."
    });
  }
};
