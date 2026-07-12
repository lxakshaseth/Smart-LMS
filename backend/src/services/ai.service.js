const OpenAI = require("openai");
require("dotenv").config();

// =====================================================
// LOAD GROQ CLIENT SECURELY (.env REQUIRED)
// =====================================================
const useGroq = Boolean(process.env.GROQ_API_KEY);
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  ...(useGroq ? { baseURL: "https://api.groq.com/openai/v1" } : {})
});

function getModel() {
  return useGroq
    ? (process.env.GROQ_MODEL || "llama-3.1-8b-instant")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");
}

// =====================================================
// UTILITY: CLEAN MARKDOWN (For JSON safety)
// =====================================================
function cleanAIResponse(text) {
  if (!text) return "";

  // Remove ```json ``` wrappers if present
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// =====================================================
// UTILITY: SAFE JSON PARSE
// =====================================================
function safeJSONParse(text) {
  try {
    const cleaned = cleanAIResponse(text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    return null;
  }
}

// =====================================================
// CORE GENERIC AI RESPONSE
// =====================================================
async function generateAIResponse(prompt, options = {}) {
  try {
    const systemPrompt = options.system || "You are an intelligent academic AI system. Return clean JSON when requested. Never include markdown unless asked.";
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: options.temperature || 0.6,
      max_tokens: options.maxTokens || 1500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Error:", error.response?.data || error.message);
    throw new Error("AI service failed");
  }
}

// =====================================================
// STRUCTURED JSON RESPONSE (Auto Parse)
// =====================================================
async function generateStructuredResponse(prompt) {
  const raw = await generateAIResponse(prompt);
  const parsed = safeJSONParse(raw);

  if (!parsed) {
    throw new Error("Invalid JSON received from AI");
  }

  return parsed;
}

// =====================================================
// SOLVE QUESTION (Tutor Mode)
// =====================================================
async function solveQuestion(question) {
  try {
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content:
            "You are a professional academic tutor. Provide clear step-by-step explanation."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq Solve Error:", error.response?.data || error.message);
    throw new Error("AI solve failed");
  }
}

// =====================================================
// WEEKLY REVIEW GENERATOR (Planner Integration)
// =====================================================
async function generateWeeklyReview(data) {
  const prompt = `
You are an AI academic performance analyst.

Student Data:
Average Accuracy: ${data.accuracy}%
Risk Score: ${data.riskScore}/100
Completion: ${data.completion}%
Trend: ${data.trend}
Weak Subject: ${data.weakSubject}

Generate JSON only:
{
  "summary": "",
  "strengths": "",
  "weaknesses": "",
  "nextStrategy": "",
  "motivation": ""
}

No markdown. Only valid JSON.
`;

  return await generateStructuredResponse(prompt);
}

// =====================================================
// ADAPTIVE STUDY PLAN GENERATOR
// =====================================================
async function generateAdaptivePlanner(data) {
  const prompt = `
You are an AI adaptive study planner.

Student Stats:
Accuracy: ${data.accuracy}%
Risk Score: ${data.riskScore}/100
Risk Level: ${data.riskLevel}
Trend: ${data.trend}
Weak Subject: ${data.weakSubject}
Streak: ${data.streak}
Exam in: ${data.daysLeft} days

Rules:
- High risk → Increase practice weight
- Declining trend → Add revision blocks
- Improving trend → Increase difficulty
- Weak subject → Daily focus

Return JSON:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "tasks": [
        { "type": "Core", "topic": "...", "weight": 3 },
        { "type": "Weak Practice", "topic": "...", "weight": 5 }
      ]
    }
  ]
}

Only valid JSON. No markdown.
`;

  return await generateStructuredResponse(prompt);
}

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  generateAIResponse,
  generateStructuredResponse,
  generateWeeklyReview,
  generateAdaptivePlanner,
  solveQuestion
};
// =====================================================
// 🔥 AUTO REBALANCE PLANNER BASED ON SUBJECT MASTERY
// =====================================================
function rebalancePlannerByMastery(planner) {
  if (!planner.weeklyPlan || !planner.subjectStats) return;

  planner.weeklyPlan.forEach(day => {
    if (!day.tasks) return;

    day.tasks.forEach(task => {
      const subjectRecord = planner.subjectStats.find(
        s => task.topic.toLowerCase().includes(s.subject.toLowerCase())
      );

      if (!subjectRecord) return;

      // Low mastery → increase weight
      if (subjectRecord.mastery < 50) {
        task.weight = Math.min(task.weight + 1, 5);
      }

      // High mastery → normalize weight
      if (subjectRecord.mastery > 80) {
        task.weight = Math.max(task.weight - 1, 1);
      }
    });
  });
}

module.exports.rebalancePlannerByMastery = rebalancePlannerByMastery;
// =====================================================
// 🔥 CONFIDENCE SCORE CALCULATOR
// =====================================================
function calculateConfidence(planner, subject) {
  const subjectRecord = planner.subjectStats.find(
    s => s.subject === subject
  );

  const mastery = subjectRecord ? subjectRecord.mastery : 50;

  const stability = 100 - planner.riskScore;

  let trendBonus = 0;
  if (planner.performanceTrend === "Improving") trendBonus = 20;
  if (planner.performanceTrend === "Stable") trendBonus = 10;
  if (planner.performanceTrend === "Declining") trendBonus = 0;

  const confidenceScore = Math.round(
    mastery * 0.5 +
    stability * 0.3 +
    trendBonus * 0.2
  );

  let confidenceLevel = "Medium";

  if (confidenceScore >= 75) confidenceLevel = "High";
  else if (confidenceScore >= 50) confidenceLevel = "Medium";
  else confidenceLevel = "Low";

  return {
    confidenceScore,
    confidenceLevel
  };
}

module.exports.calculateConfidence = calculateConfidence;
// =====================================================
// 🔥 PERFORMANCE PREDICTION ENGINE
// =====================================================
function predictNextScore(planner) {
  if (!planner.accuracyHistory || planner.accuracyHistory.length === 0) {
    return {
      predictedNextScore: 50,
      readinessLevel: "Insufficient Data"
    };
  }

  const recent = planner.accuracyHistory.slice(-3);
  const avg =
    recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;

  let trendBoost = 0;

  if (planner.performanceTrend === "Improving") trendBoost = 5;
  if (planner.performanceTrend === "Stable") trendBoost = 2;
  if (planner.performanceTrend === "Declining") trendBoost = -5;

  let predictedNextScore = Math.round(avg + trendBoost);

  if (predictedNextScore > 100) predictedNextScore = 100;
  if (predictedNextScore < 0) predictedNextScore = 0;

  let readinessLevel = "Needs Improvement";

  if (predictedNextScore >= 80) readinessLevel = "Exam Ready";
  else if (predictedNextScore >= 60) readinessLevel = "Moderate Readiness";

  return {
    predictedNextScore,
    readinessLevel
  };
}

module.exports.predictNextScore = predictNextScore;
// =====================================================
// 🔥 EXAM READINESS INDEX CALCULATOR
// =====================================================
function calculateExamReadiness(planner, confidenceScore, predictedNextScore) {
  if (!planner.subjectStats || planner.subjectStats.length === 0) {
    return {
      examReadinessIndex: 50,
      readinessStatus: "Insufficient Data",
      focusArea: "Start giving mock tests"
    };
  }

  // Average Mastery
  const totalMastery = planner.subjectStats.reduce(
    (sum, s) => sum + s.mastery,
    0
  );

  const avgMastery =
    totalMastery / planner.subjectStats.length;

  const stability = 100 - planner.riskScore;

  const examReadinessIndex = Math.round(
    avgMastery * 0.4 +
    stability * 0.25 +
    confidenceScore * 0.2 +
    predictedNextScore * 0.15
  );

  let readinessStatus = "Needs Improvement";

  if (examReadinessIndex >= 80) readinessStatus = "Exam Ready";
  else if (examReadinessIndex >= 65) readinessStatus = "On Track";
  else if (examReadinessIndex >= 50) readinessStatus = "Moderate";
  else readinessStatus = "High Risk";

  // Weakest subject detection
  const weakest = planner.subjectStats.reduce((min, s) =>
    s.mastery < min.mastery ? s : min
  );

  return {
    examReadinessIndex,
    readinessStatus,
    focusArea: weakest.subject
  };
}

module.exports.calculateExamReadiness = calculateExamReadiness;
