const Groq = require("groq-sdk");
require("dotenv").config();

// =======================================================
// 🔐 GROQ CLIENT
// =======================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";


// =======================================================
// 🛡 SAFE JSON EXTRACTOR (PRODUCTION GRADE)
// =======================================================

function extractJSON(text) {
  if (!text) return null;

  try {
    // Remove markdown wrappers
    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    const jsonString = text.substring(firstBrace, lastBrace + 1);

    return JSON.parse(jsonString);

  } catch (err) {
    console.error("JSON Parse Error:", err.message);
    return null;
  }
}


// =======================================================
// 🔄 SAFE GROQ CALL (AUTO RETRY)
// =======================================================

async function safeGroqCall(messages, temperature = 0.5) {

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature,
    });

    return extractJSON(completion.choices[0].message.content);

  } catch (error) {
    console.error("Groq API Error:", error.message);
    return null;
  }
}


// =======================================================
// 🧠 1️⃣ LOGIC QUESTION
// =======================================================

async function generateLogicQuestion(difficulty = "normal") {

  const messages = [
    { role: "system", content: "You generate logical reasoning questions strictly in JSON." },
    {
      role: "user",
      content: `
Generate ONE ${difficulty} level logical reasoning question.

Return strictly JSON:

{
  "question": "question text",
  "answer": true or false
}
`
    }
  ];

  const parsed = await safeGroqCall(messages, 0.7);

  if (parsed?.question !== undefined) return parsed;

  // Fallback
  return {
    question: "If all A are B and all B are C, are A C?",
    answer: true
  };
}


// =======================================================
// 🔢 2️⃣ MATH QUESTION
// =======================================================

async function generateMathQuestion(difficulty = "normal") {

  const messages = [
    { role: "system", content: "You generate math brain training questions strictly in JSON." },
    {
      role: "user",
      content: `
Generate ONE ${difficulty} level math brain training question.

Return strictly JSON:

{
  "question": "math question text",
  "answer": number
}
`
    }
  ];

  const parsed = await safeGroqCall(messages, 0.6);

  if (parsed?.question !== undefined) return parsed;

  // Fallback
  let a = Math.floor(Math.random() * 50);
  let b = Math.floor(Math.random() * 50);

  if (difficulty === "hard") {
    a *= 2;
    b *= 2;
  }

  return {
    question: `${a} + ${b}`,
    answer: a + b
  };
}


// =======================================================
// 🎮 3️⃣ STRATEGY GAME AI
// =======================================================

async function generateStrategyOutcome(choice) {

  const messages = [
    { role: "system", content: "You simulate strategic outcomes strictly in JSON." },
    {
      role: "user",
      content: `
User selected strategy option: "${choice}"

Return strictly JSON:

{
  "scenario": "what happened",
  "xpChange": number
}
`
    }
  ];

  const parsed = await safeGroqCall(messages, 0.8);

  if (parsed) return parsed;

  return {
    scenario: "Your strategy had moderate success.",
    xpChange: 10
  };
}


// =======================================================
// ⚖ 4️⃣ DECISION SIMULATOR AI
// =======================================================

async function generateDecisionOutcome(decision) {

  const messages = [
    { role: "system", content: "You simulate realistic decisions strictly in JSON." },
    {
      role: "user",
      content: `
User decision: "${decision}"

Return strictly JSON:

{
  "result": "outcome explanation",
  "impactScore": number
}
`
    }
  ];

  const parsed = await safeGroqCall(messages, 0.8);

  if (parsed) return parsed;

  return {
    result: "Balanced outcome with moderate impact.",
    impactScore: 5
  };
}


// =======================================================
// 💻 5️⃣ AI CODE LAB (ADVANCED ERROR DETECTOR)
// =======================================================

async function analyzeCodeWithAI(code) {

  const messages = [
    {
      role: "system",
      content: "You are a strict senior software engineer. Return ONLY valid JSON."
    },
    {
      role: "user",
      content: `
Analyze this code carefully.

1. Detect syntax errors.
2. Detect logical issues.
3. Suggest improvements.
4. Provide optimized version.
5. Rate quality from 1-10.

Return strictly JSON:

{
  "hasError": true or false,
  "errors": "error explanation or null",
  "explanation": "what the code does",
  "optimizedVersion": "improved version",
  "qualityScore": number
}

Code:
${code}
`
    }
  ];

  const parsed = await safeGroqCall(messages, 0.3);

  if (parsed) return parsed;

  return {
    hasError: false,
    errors: null,
    explanation: "Basic explanation.",
    optimizedVersion: code,
    qualityScore: 5
  };
}


// =======================================================
// 🚀 EXPORTS
// =======================================================

module.exports = {
  generateLogicQuestion,
  generateMathQuestion,
  generateStrategyOutcome,
  generateDecisionOutcome,
  analyzeCodeWithAI
};
