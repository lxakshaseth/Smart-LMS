const crypto = require("crypto");
const { getSyllabusForCategory } = require("./syllabus");

/**
 * Builds a professional examination paper generator prompt.
 */
function buildMCQPrompt({ category, difficulty = "Medium", questionCount = 10 }) {
  const syllabus = getSyllabusForCategory(category);
  const randomSeed = `${Date.now()}-${crypto.randomUUID()}`;
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();

  let difficultyGuideline = "";
  if (difficulty.toLowerCase() === "mixed") {
    difficultyGuideline = `
Distribute question difficulty as follows across the ${questionCount} questions:
- Approximately 30% Easy (Fundamental concepts & definitions)
- Approximately 40% Medium (Application, analysis, two-step calculations)
- Approximately 30% Hard (Complex scenarios, multi-concept integration, numerical/debugging)
`;
  } else {
    difficultyGuideline = `Target overall difficulty level: ${difficulty} across all questions.`;
  }

  const systemPrompt = `You are an experienced examination paper setter from elite examination boards (IIT, NTA, UPSC, GATE, Testbook, LeetCode).
Your task is to generate an authentic, high-quality, non-repetitive examination paper.
Return STRICT JSON ONLY. Never generate markdown wrappers like \`\`\`json or \`\`\`. Do not include any intro, text, or explanations outside the JSON array.`;

  const userPrompt = `
[REQUEST METADATA - HIGH ENTROPY SEEDING]
Request ID: ${requestId}
Timestamp: ${timestamp}
Random Seed: ${randomSeed}

EXAMINATION DETAILS:
- Category: ${category}
- Difficulty Setting: ${difficulty}
- Total Questions Required: ${questionCount}

SYLLABUS & CONCEPTUAL COVERAGE:
Cover a balanced spread of the following topics:
${syllabus.map(topic => `- ${topic}`).join("\n")}

STRICT GENERATION RULES:
1. Every request MUST generate completely unique, fresh questions. Never generate semantically repetitive questions.
2. Diversity of Question Styles: Mix different styles appropriate for ${category} (Conceptual, Numerical calculation, Scenario-based, Code output / Debugging for tech, Logical reasoning, Assertion-Reasoning).
3. Every question MUST have exactly 4 plausible, distinct options.
4. Provide a clear, educational explanation for why the correct option is right.
5. ${difficultyGuideline}
6. Do NOT include markdown code blocks. Output raw JSON array only.

REQUIRED JSON FORMAT:
[
  {
    "id": 1,
    "question": "Question text clear and detailed (>20 characters)",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of the solution."
  }
]
`;

  return {
    systemPrompt,
    userPrompt,
    randomSeed,
    requestId
  };
}

module.exports = {
  buildMCQPrompt
};
