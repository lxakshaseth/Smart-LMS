const { generateAIResponse } = require("../services/ai.service");
const MockTest = require("../models/mocktest.model");
const User = require("../models/user.model");
const Planner = require("../models/planner.model");

// =====================================================
// GENERATE MOCK TEST (AI)
// =====================================================
exports.generateTest = async (req, res) => {
  try {
    const { subject, topic, excludeQuestions = [] } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: "Subject and topic required"
      });
    }

    let excludeClause = "";
    if (Array.isArray(excludeQuestions) && excludeQuestions.length > 0) {
      excludeClause = `\nCRITICAL: You MUST NOT generate any of the following questions (they have already been answered by this user):\n${excludeQuestions.map(q => `- "${q}"`).join("\n")}\n`;
    }

    const prompt = `
Generate 5 unique, diverse, and randomized MCQs for ${subject} on topic ${topic}.
Session Seed: ${Math.random().toString(36).substring(7)}
${excludeClause}
Return ONLY valid JSON structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["Option text 1", "Option text 2", "Option text 3", "Option text 4"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this option is correct."
    }
  ]
}

Note:
- The questions generated must be completely new and randomized for each request. Avoid repetitions.
- "options" must contain 4 distinct plausible options.
- "correctAnswer" must be a number (0, 1, 2, or 3) representing the index of the correct option in the "options" array.
`;

    const aiText = await generateAIResponse(prompt, { temperature: 0.95 });

    let cleaned = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON");
    }

    cleaned = cleaned.substring(start, end + 1);

    const parsed = JSON.parse(cleaned);

    res.json(parsed);

  } catch (err) {
    console.error("Mock Test Error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate test"
    });
  }
};

// =====================================================
// SUBMIT MOCK TEST RESULT
// =====================================================
exports.submitTest = async (req, res) => {
  try {
    const {
      subject,
      topic,
      totalQuestions,
      correctAnswers,
      weakAreas
    } = req.body;

    if (!totalQuestions || correctAnswers == null) {
      return res.status(400).json({
        success: false,
        message: "Invalid test data"
      });
    }

    const accuracy = Math.round(
      (correctAnswers / totalQuestions) * 100
    );

    // =====================================================
    // 1️⃣ Save Mock Test
    // =====================================================
    await MockTest.create({
      user: req.user.id,
      subject,
      topic,
      totalQuestions,
      correctAnswers,
      accuracy,
      weakAreas
    });

    // =====================================================
    // 2️⃣ Update User XP + Streak + Rank
    // =====================================================
    const xpEarned = correctAnswers * 5;

    const user = await User.findById(req.user.id);

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

    // =====================================================
    // 3️⃣ Update Planner Intelligence
    // =====================================================
    let planner = await Planner.findOne({ user: req.user.id });

    if (!planner) {
      planner = await Planner.create({ user: req.user.id });
    }

    // ---- Accuracy history ----
    planner.lastMockAccuracy = accuracy;

    // ---- Weak subject detection (frequency based) ----
    if (weakAreas && weakAreas.length > 0) {

      const freqMap = {};

      weakAreas.forEach(area => {
        freqMap[area] = (freqMap[area] || 0) + 1;
      });

      const sortedWeak = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1]);

      planner.weakSubject = sortedWeak[0][0];
    } else {
      planner.weakSubject = subject;
    }

    // ---- Risk auto calculation ----
    if (accuracy < 50) {
      planner.riskLevel = "High";
    } else if (accuracy < 75) {
      planner.riskLevel = "Medium";
    } else {
      planner.riskLevel = "Low";
    }

    await planner.save();

    // =====================================================
    // 4️⃣ Response
    // =====================================================
    res.json({
      success: true,
      message: "Test submitted successfully",
      xpEarned,
      accuracy,
      level: user.level,
      rank: user.rank,
      weakSubject: planner.weakSubject,
      riskLevel: planner.riskLevel
    });

  } catch (err) {
    console.error("Submit Test Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit test"
    });
  }
};
