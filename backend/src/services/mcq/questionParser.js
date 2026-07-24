const crypto = require("crypto");
const { getFallbackQuestionsForCategory } = require("./fallbackQuestions");

/**
 * Fisher-Yates shuffle implementation.
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Normalizes correct answer representation to 0-indexed number (0, 1, 2, 3).
 */
function normalizeCorrectAnswerIndex(rawAnswer, options) {
  if (typeof rawAnswer === "number" && rawAnswer >= 0 && rawAnswer < options.length) {
    return Math.floor(rawAnswer);
  }

  if (typeof rawAnswer === "string") {
    const trimmed = rawAnswer.trim().toUpperCase();
    if (["A", "B", "C", "D"].includes(trimmed)) {
      return ["A", "B", "C", "D"].indexOf(trimmed);
    }
    if (["0", "1", "2", "3"].includes(trimmed)) {
      return parseInt(trimmed, 10);
    }
    // Match option text
    const foundIndex = options.findIndex(opt => opt.trim().toLowerCase() === rawAnswer.trim().toLowerCase());
    if (foundIndex !== -1) return foundIndex;
  }

  return 0; // fallback default
}

/**
 * State-machine JSON repair engine for raw LLM output.
 * Handles unescaped backslashes (\frac, \theta, \user, \alpha, \int, etc.), unescaped newlines/tabs,
 * trailing commas, missing closing brackets, and smart quotes.
 */
function cleanJSONString(jsonString) {
  if (!jsonString || typeof jsonString !== "string") return "";
  let text = jsonString.trim();

  // 1. Remove markdown backticks
  text = text
    .replace(/^```json\s*/gi, "")
    .replace(/^```\s*/g, "")
    .replace(/```$/g, "")
    .trim();

  // 2. Locate JSON boundaries
  const firstArr = text.indexOf("[");
  const firstObj = text.indexOf("{");
  let startIdx = -1;
  if (firstArr !== -1 && firstObj !== -1) startIdx = Math.min(firstArr, firstObj);
  else if (firstArr !== -1) startIdx = firstArr;
  else if (firstObj !== -1) startIdx = firstObj;

  if (startIdx !== -1) {
    text = text.substring(startIdx);
  }

  // 3. Normalize smart quotes
  text = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // 4. Transform string literals safely state-machine
  let inString = false;
  let isEscaped = false;
  let result = "";
  const openStack = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') {
        inString = true;
        isEscaped = false;
        result += ch;
      } else if (ch === '[' || ch === '{') {
        openStack.push(ch);
        result += ch;
      } else if (ch === ']' || ch === '}') {
        if (openStack.length > 0) openStack.pop();
        result += ch;
      } else {
        result += ch;
      }
    } else {
      // Inside JSON string literal
      if (isEscaped) {
        isEscaped = false;
        if (ch === '"' || ch === '\\' || ch === '/') {
          result += ch;
        } else if (ch === 'b' || ch === 'f' || ch === 'n' || ch === 'r' || ch === 't') {
          const nextChar = text[i + 1] || '';
          if (/[a-zA-Z]/.test(nextChar)) {
            result = result.slice(0, -1) + '\\\\' + ch;
          } else {
            result += ch;
          }
        } else if (ch === 'u') {
          const next4 = text.substring(i + 1, i + 5);
          if (/^[0-9a-fA-F]{4}$/.test(next4)) {
            result += ch;
          } else {
            result = result.slice(0, -1) + '\\\\' + ch;
          }
        } else {
          result = result.slice(0, -1) + '\\\\' + ch;
        }
      } else {
        if (ch === '\\') {
          isEscaped = true;
          result += ch;
        } else if (ch === '"') {
          inString = false;
          result += ch;
        } else if (ch === '\n') {
          result += '\\n';
        } else if (ch === '\r') {
          result += '\\r';
        } else if (ch === '\t') {
          result += '\\t';
        } else {
          result += ch;
        }
      }
    }
  }

  // Auto-close string if left open
  if (inString) {
    result += '"';
  }

  // Remove trailing commas
  result = result.replace(/,\s*([\]\}])/g, "$1");

  // Auto-close open arrays and objects
  while (openStack.length > 0) {
    const last = openStack.pop();
    if (last === '[') result += ']';
    else if (last === '{') result += '}';
  }

  return result;
}

/**
 * Clean & extract JSON from raw AI text response with multi-stage fallback parsing.
 */
function extractRawJSON(rawText) {
  if (!rawText) throw new Error("Empty raw text provided to question parser.");

  let cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Stage 1: Native direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Stage 2: State-machine repair parse
    try {
      const repaired = cleanJSONString(cleaned);
      return JSON.parse(repaired);
    } catch (e2) {
      // Stage 3: Substring extraction + repair parse
      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");
      if (arrayStart !== -1 && arrayEnd > arrayStart) {
        const jsonArrayStr = cleaned.substring(arrayStart, arrayEnd + 1);
        try {
          return JSON.parse(jsonArrayStr);
        } catch (e3) {
          return JSON.parse(cleanJSONString(jsonArrayStr));
        }
      }

      const objStart = cleaned.indexOf("{");
      const objEnd = cleaned.lastIndexOf("}");
      if (objStart !== -1 && objEnd > objStart) {
        const jsonObjStr = cleaned.substring(objStart, objEnd + 1);
        try {
          return JSON.parse(jsonObjStr);
        } catch (e4) {
          return JSON.parse(cleanJSONString(jsonObjStr));
        }
      }

      throw new Error(`Could not extract valid JSON structure from AI output: ${e2.message}`);
    }
  }
}

/**
 * Parses, validates, shuffles options, shuffles questions, and hashes the generated paper.
 * Includes auto-fallback if AI generation fails or returns empty array.
 */
function parseAndProcessMCQs(rawText, category = "GATE", requestedCount = 10) {
  let parsedData = null;

  try {
    parsedData = extractRawJSON(rawText);
  } catch (parseErr) {
    console.warn("⚠️ AI JSON parse failed, using fallback question generator:", parseErr.message);
    const fallbackList = getFallbackQuestionsForCategory(category, requestedCount);
    const paperHash = crypto.createHash("sha256").update(JSON.stringify(fallbackList)).digest("hex");
    return {
      questions: fallbackList,
      questionCount: fallbackList.length,
      paperHash
    };
  }

  let rawQuestions = [];
  if (Array.isArray(parsedData)) {
    rawQuestions = parsedData;
  } else if (parsedData && Array.isArray(parsedData.questions)) {
    rawQuestions = parsedData.questions;
  }

  const processedQuestions = [];
  const questionTextSet = new Set();

  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    if (!q || typeof q !== "object") continue;

    const questionStr = String(q.question || "").trim();
    if (questionStr.length < 10) continue; // Skip truncated questions

    const normalizedQuestion = questionStr.toLowerCase();
    if (questionTextSet.has(normalizedQuestion)) continue;
    questionTextSet.add(normalizedQuestion);

    let rawOptions = Array.isArray(q.options) ? q.options.map(opt => String(opt || "").trim()) : [];
    if (rawOptions.length < 4) continue;
    rawOptions = rawOptions.slice(0, 4);

    if (rawOptions.some(opt => !opt)) continue;

    const origCorrectIndex = normalizeCorrectAnswerIndex(q.correctAnswer, rawOptions);
    const indexedOptions = rawOptions.map((optText, idx) => ({ text: optText, isCorrect: idx === origCorrectIndex }));
    const shuffledIndexed = shuffleArray(indexedOptions);

    const newOptions = shuffledIndexed.map(item => item.text);
    const newCorrectIndex = shuffledIndexed.findIndex(item => item.isCorrect);

    const explanation = String(q.explanation || `The correct answer is option ${newCorrectIndex + 1}.`).trim();

    processedQuestions.push({
      id: processedQuestions.length + 1,
      question: questionStr,
      options: newOptions,
      correctAnswer: newCorrectIndex,
      explanation
    });
  }

  if (processedQuestions.length === 0) {
    console.warn("⚠️ 0 valid questions parsed from AI output, using fallback question generator for category:", category);
    const fallbackList = getFallbackQuestionsForCategory(category, requestedCount);
    const paperHash = crypto.createHash("sha256").update(JSON.stringify(fallbackList)).digest("hex");
    return {
      questions: fallbackList,
      questionCount: fallbackList.length,
      paperHash
    };
  }

  const finalQuestions = shuffleArray(processedQuestions).map((q, idx) => ({
    ...q,
    id: idx + 1
  }));

  const paperContent = finalQuestions.map(q => q.question + q.options.join("")).join("|");
  const paperHash = crypto.createHash("sha256").update(paperContent).digest("hex");

  return {
    questions: finalQuestions,
    questionCount: finalQuestions.length,
    paperHash
  };
}

module.exports = {
  parseAndProcessMCQs,
  extractRawJSON,
  cleanJSONString,
  shuffleArray
};

