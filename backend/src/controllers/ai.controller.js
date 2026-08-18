const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Note = require("../models/note.model");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const { getCurrentTargetExam } = require("../utils/targetExam.utils");

/* ===============================
   GROQ CONFIG
=============================== */

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is missing in .env file.");
    error.status = 500;
    throw error;
  }
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
};

/* ===============================
   SAFE GROQ CALL
=============================== */

async function safeGroqCall(config) {
  const client = getGroqClient();
  const model = config.model || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  return await Promise.race([
    client.chat.completions.create({
      ...config,
      model
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Groq Timeout")), 30000)
    )
  ]);
}

/* ===============================
   HELPERS
=============================== */

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function updateStreak(user) {
  const today = getToday();

  if (!user.lastActiveDate) {
    user.streak = 1;
  } else {
    const last = new Date(user.lastActiveDate);
    const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) user.streak += 1;
    else if (diff > 1) user.streak = 1;
  }

  user.lastActiveDate = today;
}

function updateWeeklyActivity(user, type, xpEarned = 0) {
  const today = getToday();

  let activity = user.weeklyActivity.find(a => a.date === today);

  if (!activity) {
    activity = {
      date: today,
      questions: 0,
      notes: 0,
      quizzes: 0,
      xpEarned: 0
    };
    user.weeklyActivity.push(activity);
  }

  activity[type] += 1;
  activity.xpEarned += xpEarned;

  user.weeklyActivity = user.weeklyActivity.slice(-7);
}

function updateSubjectStats(user, topic, type) {
  const subject = getSubjectFromTopic(topic);

  let stat = user.subjectStats.find(s => s.subject === subject);

  if (!stat) {
    stat = {
      subject,
      questions: 0,
      notes: 0,
      quizzes: 0,
      mastery: 0
    };
    user.subjectStats.push(stat);
  }

  stat[type] += 1;

  stat.mastery = Math.min(
    100,
    stat.questions * 5 + stat.notes * 7 + stat.quizzes * 10
  );
}

function sanitizeTopic(topic) {
  return String(topic || "").trim().replace(/\s+/g, " ").slice(0, 160);
}

function getSubjectFromTopic(topic = "") {
  const clean = sanitizeTopic(topic);
  const first = clean.split(/[\s:,-]+/)[0];
  return first || "General";
}

function safeNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeChoice(value, allowed, fallback) {
  const text = String(value || fallback).trim();
  return allowed.includes(text) ? text : fallback;
}

function buildStudyPrompt(type, topic) {
  if (type === "summary") {
    return `
Create a crisp exam-focused summary for: "${topic}".

Use markdown and include:
# ${topic} - Quick Summary
## Big Picture
## Must-Know Points
## Important Formulas / Facts
## Common Mistakes
## 5-Minute Revision Checklist

Keep it clear, accurate, and student friendly.`;
  }

  return `
Create complete structured study notes for: "${topic}".

Use markdown and include:
# ${topic} - Study Notes
## Overview
## Core Concepts
## Step-by-Step Explanation
## Important Formulas / Facts
## Examples
## Exam Tips
## Quick Revision Points

Keep the notes practical, accurate, and easy to revise.`;
}

function buildQuizPrompt({ topic, count, difficulty, questionType, language }) {
  return `
Generate a ${difficulty} level ${questionType} practice quiz on "${topic}".

Requirements:
- Number of questions: ${count}
- Language: ${language}
- Use clean markdown.
- For MCQ questions, give 4 options labelled A-D and include the correct answer.
- For True/False, Fill in Blanks, or Short Answer, include the answer after each question.
- Add a brief explanation for every answer.

Format:
# ${topic} - Practice Quiz
## Questions
1. ...

## Answer Key
1. Answer: ...
Explanation: ...`;
}

async function saveAiNote({ userId, type, topic, content }) {
  const label = type === "summary" ? "Summary" : "Notes";
  return await Note.create({
    user: userId,
    title: `${label}: ${topic}`,
    content,
    subject: getSubjectFromTopic(topic),
    tags: [type, "learning-hub", "ai"],
    source: "ai",
    color: type === "summary"
      ? "bg-green-500/10 border-green-500/20"
      : "bg-indigo-500/10 border-indigo-500/20"
  });
}

function unlockAchievements(user) {
  const unlocked = [];

  if (user.xp >= 100 && !user.achievements.includes("100_XP")) {
    user.achievements.push("100_XP");
    unlocked.push("100 XP Milestone");
  }

  if (user.streak >= 7 && !user.achievements.includes("7_DAY_STREAK")) {
    user.achievements.push("7_DAY_STREAK");
    unlocked.push("7 Day Streak");
  }

  if (user.totalQuestions >= 50 && !user.achievements.includes("50_QUESTIONS")) {
    user.achievements.push("50_QUESTIONS");
    unlocked.push("50 Questions Completed");
  }

  return unlocked;
}

/* ===============================
   CREATE NEW CHAT
=============================== */

const createNewChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      title: "New Chat",
      messages: []
    });

    res.json({
      success: true,
      chatId: chat._id
    });

  } catch (error) {
    console.error("CREATE CHAT ERROR:", error);
    res.status(500).json({ success: false });
  }
};



/* ===============================
   GET ALL SESSIONS
=============================== */

const getSessions = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .select("_id title language updatedAt")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      sessions: chats
    });

  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   GET SINGLE CHAT
=============================== */

const getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!chat)
      return res.status(404).json({ success: false });

    res.json({
      success: true,
      chat
    });

  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   ASK AI
=============================== */

const askAI = async (req, res) => {
  try {
    let { chatId, language = "Auto-Detect", targetExam: clientTargetExam, attachments = [] } = req.body;
    const question = (req.body.question || req.body.message || "").trim();

    if (!question && (!Array.isArray(attachments) || attachments.length === 0))
      return res.status(400).json({
        success: false,
        message: "Question or attachment is required"
      });

    const displayQuestion = question || "Please summarize and explain the attached material.";

    if (displayQuestion.length > 4000)
      return res.status(400).json({
        success: false,
        message: "Question must be under 4000 characters"
      });

    const dbUser = await User.findById(req.user.id);
    const activeTargetExam = getCurrentTargetExam(dbUser, clientTargetExam || "Class 10 Boards");

    let chat = null;
    if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await Chat.findOne({
        _id: chatId,
        user: req.user.id
      });
    }

    if (!chat) {
      chat = await Chat.create({
        user: req.user.id,
        title: displayQuestion.slice(0, 50) || "AI Discussion",
        messages: [],
        language
      });
    }

    chat.language = language;
    
    // Save user message with optional attachments
    const userMessageObj = { 
      role: "user", 
      content: displayQuestion,
      attachments: Array.isArray(attachments) ? attachments.map(a => ({
        name: a.name || "Attachment",
        type: a.type || "file",
        size: a.size || 0,
        extractedText: a.extractedText || ""
      })) : []
    };

    chat.messages.push(userMessageObj);

    if (chat.title === "New Chat" && chat.messages.length === 1) {
      chat.title = displayQuestion.slice(0, 60);
    }

    const cleanMessages = chat.messages.slice(-6).map(m => {
      let contentStr = m.content;
      if (m.attachments && m.attachments.length > 0) {
        const attContext = m.attachments.map((att, i) => (
          `[Attached File ${i+1}: "${att.name}" (${att.type})]\nContent Preview / Extracted Text:\n${(att.extractedText || "").slice(0, 4000)}`
        )).join("\n\n");
        contentStr = `${m.content}\n\n[USER ATTACHED MATERIALS]:\n${attContext}`;
      }
      return {
        role: m.role,
        content: contentStr
      };
    });

    const completion = await safeGroqCall({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are Smart AI Mentor, an intelligent educational assistant capable of helping learners of all ages. Answer any academic, technical, programming, engineering, mathematics, science, language, research, project, interview, or career-related question clearly and accurately.

Target Exam Context: ${activeTargetExam}

EXAM TARGET REQUIREMENT:
- The user is actively preparing for: ${activeTargetExam}.
- Tailor your explanations, problem-solving methods, formula tricks, step-by-step depth, and study advice to match the syllabus and standards of ${activeTargetExam}.

Preferred Response Language Setting: ${language}

DOCUMENT & MATERIAL ATTACHMENT INSTRUCTION:
- If the user has provided attached documents, PDFs, or image OCR text in [USER ATTACHED MATERIALS], analyze the text carefully to answer questions, solve math/physics problems, explain concepts, or summarize content directly based on the uploaded material.

LANGUAGE REQUIREMENT (STRICT):
- If the user inputs text in ENGLISH (e.g. "machine learning", "hi", "explain Newton's laws"), start and maintain the conversation strictly in ENGLISH until user asks to switch.
- Do NOT respond in Hinglish/Hindi when user writes in English.

Keep your answers clear, accurate, well-structured, helpful, and student-friendly.`
        },
        ...cleanMessages
      ],
      max_tokens: 1000
    });

    const reply = completion.choices[0].message.content;

    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = 5;

    user.totalQuestions += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "questions", earnedXP);
    updateSubjectStats(user, question, "questions");

    const unlocked = unlockAchievements(user);

    await user.save();

    res.json({
      success: true,
      reply,
      answer: reply,
      text: reply,
      chatId: chat._id,
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("ASK AI ERROR:", error.message || error);
    const timedOut = Boolean(error.message && error.message.includes("Timeout"));
    res.status(timedOut ? 504 : (error.status || 502)).json({
      success: false,
      message: timedOut
        ? "AI service timed out. Please try again."
        : (error.message || "AI service is unavailable right now. Please check your API keys.")
    });
  }
};

/* ===============================
   STUDY MODE
=============================== */

const studyMode = async (req, res) => {
  try {
    const topic = sanitizeTopic(req.body.topic);
    const type = req.body.type === "summary" ? "summary" : "notes";

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    const completion = await safeGroqCall({
      messages: [
        {
          role: "system",
          content: "You are an expert academic study assistant. Return accurate, well-structured markdown. Do not invent facts."
        },
        { role: "user", content: buildStudyPrompt(type, topic) }
      ],
      temperature: 0.35,
      max_tokens: type === "summary" ? 900 : 1800
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty response. Please try again."
      });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = type === "summary" ? 8 : 10;

    user.totalNotes += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "notes", earnedXP);
    updateSubjectStats(user, topic, "notes");

    const unlocked = unlockAchievements(user);

    await user.save();
    const note = await saveAiNote({ userId: req.user.id, type, topic, content });

    res.json({
      success: true,
      type,
      content,
      notes: type === "notes" ? content : undefined,
      summary: type === "summary" ? content : undefined,
      noteId: note._id,
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("STUDY MODE ERROR:", error);
    const timedOut = error.message === "AI Timeout";
    res.status(error.status || (timedOut ? 504 : 502)).json({
      success: false,
      message: error.message === "AI_API_KEY_MISSING"
        ? "AI API key is missing in backend .env"
        : timedOut
          ? "AI service timed out. Please try again."
          : "AI service is unavailable right now. Please try again."
    });
  }
};

/* ===============================
   QUIZ
=============================== */

const generateQuiz = async (req, res) => {
  try {
    const topic = sanitizeTopic(req.body.topic);
    const count = safeNumber(req.body.count, 10, 1, 50);
    const difficulty = normalizeChoice(req.body.difficulty, ["Easy", "Medium", "Hard", "Mixed"], "Medium");
    const questionType = normalizeChoice(
      req.body.questionType || req.body.type,
      ["MCQ", "True/False", "Fill in Blanks", "Short Answer"],
      "MCQ"
    );
    const language = normalizeChoice(req.body.language, ["English", "Hindi", "Bilingual"], "English");

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    const completion = await safeGroqCall({
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator for students. Return clean markdown with questions, answer key, and concise explanations."
        },
        { role: "user", content: buildQuizPrompt({ topic, count, difficulty, questionType, language }) }
      ],
      temperature: 0.45,
      max_tokens: Math.min(3500, 700 + count * 180)
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty response. Please try again."
      });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = 15;

    user.totalQuizzes += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "quizzes", earnedXP);
    updateSubjectStats(user, topic, "quizzes");

    const unlocked = unlockAchievements(user);

    await user.save();

    res.json({
      success: true,
      content,
      quiz: content,
      config: { topic, count, difficulty, questionType, language },
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("QUIZ ERROR:", error);
    const timedOut = error.message === "AI Timeout";
    res.status(error.status || (timedOut ? 504 : 502)).json({
      success: false,
      message: error.message === "AI_API_KEY_MISSING"
        ? "AI API key is missing in backend .env"
        : timedOut
          ? "AI service timed out. Please try again."
          : "AI service is unavailable right now. Please try again."
    });
  }
};

/* ===============================
   OCR
=============================== */

const ocrFromImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided" });
  }

  try {
    const result = await Tesseract.recognize(req.file.path, "eng");
    const rawText = result.data?.text || "";
    const cleanedText = rawText
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .join("\n");

    res.json({
      success: true,
      text: cleanedText || rawText.trim()
    });
  } catch (error) {
    console.error("OCR ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to extract text from image"
    });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("OCR TEMP FILE CLEANUP ERROR:", err);
      }
    }
  }
};

/* ===============================
   PDF TEXT EXTRACTION HELPER
=============================== */

async function extractTextFromPdf(dataBuffer) {
  try {
    const pdfModule = require("pdf-parse");
    if (typeof pdfModule === "function") {
      const data = await pdfModule(dataBuffer);
      return (data.text || "").trim();
    }
    const PDFParse = pdfModule.PDFParse || (pdfModule.default && pdfModule.default.PDFParse);
    if (PDFParse) {
      const uint8 = new Uint8Array(dataBuffer);
      const parser = new PDFParse(uint8);
      const res = await parser.getText();
      return (res.text || "").trim();
    }
  } catch (err) {
    console.warn("PDF extraction notice:", err.message);
  }
  return "";
}

/* ===============================
   PROCESS ATTACHMENT (PDF / IMAGE / DOC)
=============================== */

const processAttachment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided for extraction" });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname || "Uploaded Material";
  const mimeType = req.file.mimetype || "";
  const size = req.file.size || 0;

  try {
    let extractedText = "";
    let fileKind = "text";

    if (mimeType.includes("pdf") || originalName.toLowerCase().endsWith(".pdf")) {
      fileKind = "pdf";
      const dataBuffer = fs.readFileSync(filePath);
      extractedText = await extractTextFromPdf(dataBuffer);
      if (!extractedText) {
        extractedText = `PDF Document attached: "${originalName}" (${Math.round(size / 1024)} KB)`;
      }
    } else if (mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(originalName)) {
      fileKind = "image";
      try {
        const result = await Tesseract.recognize(filePath, "eng");
        const rawText = result.data?.text || "";
        extractedText = rawText.split("\n").map(line => line.trim()).filter(Boolean).join("\n");
      } catch (ocrErr) {
        console.warn("Image OCR notice:", ocrErr.message);
        extractedText = `Image file attached: "${originalName}"`;
      }
    } else {
      fileKind = "text";
      try {
        extractedText = fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        extractedText = `Document attached: ${originalName}`;
      }
    }

    res.json({
      success: true,
      attachment: {
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: originalName,
        type: fileKind,
        size,
        extractedText: extractedText.slice(0, 20000),
        textPreview: extractedText.slice(0, 300)
      }
    });
  } catch (error) {
    console.error("PROCESS ATTACHMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to extract content from attached file"
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("TEMP ATTACHMENT CLEANUP ERROR:", err);
      }
    }
  }
};

const generateExamSpecialQuestion = async (req, res) => {
  try {
    const { targetExam = "Class 10 Boards", subject = "Physics" } = req.body;

    const prompt = `You are a world-class exam author for ${targetExam}. Generate a brand new, unique, high-yield ${subject} question strictly aligned with the syllabus for ${targetExam}.
IMPORTANT: Make sure the question is strictly for ${targetExam} and subject ${subject}. Do NOT mix up topics from other classes or exams!

Return strictly valid JSON with this exact schema:
{
  "id": "q_${Date.now()}",
  "targetExam": "${targetExam}",
  "subject": "${subject}",
  "topic": "Topic Name",
  "marks": "5 Marks Question",
  "questionTitle": "Clear, precise title of the question or derivation",
  "diagramDescription": "Brief description of diagram or circuit or optics ray path",
  "steps": [
    {
      "stepNum": 1,
      "title": "Step 1 Title",
      "formula": "Mathematical Formula / Key Equation",
      "explanation": "Detailed explanation of this step",
      "credit": "1.5 Marks"
    },
    {
      "stepNum": 2,
      "title": "Step 2 Title",
      "formula": "Mathematical Formula / Key Equation",
      "explanation": "Detailed explanation of this step",
      "credit": "1.5 Marks"
    },
    {
      "stepNum": 3,
      "title": "Step 3 Title",
      "formula": "Mathematical Formula / Key Equation",
      "explanation": "Detailed explanation of this step",
      "credit": "1.0 Mark"
    },
    {
      "stepNum": 4,
      "title": "Step 4 Title",
      "formula": "Mathematical Formula / Key Equation",
      "explanation": "Detailed explanation of this step",
      "credit": "1.0 Mark"
    }
  ],
  "examinerAlerts": [
    "⚠️ Warning about common mistake that loses marks",
    "💡 Examiner key tip to get full marks"
  ]
}
DO NOT include any text before or after the JSON.`;

    const response = await safeGroqCall({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    const reply = response.choices[0]?.message?.content || "";
    let questionData;
    try {
      const cleaned = reply.replace(/```json/gi, "").replace(/```/g, "").trim();
      questionData = JSON.parse(cleaned);
    } catch {
      questionData = {
        id: `q_${Date.now()}`,
        targetExam,
        subject,
        topic: `${subject} Core Problem`,
        marks: "5 Marks Question",
        questionTitle: `Dynamic ${targetExam} ${subject} Problem`,
        diagramDescription: `Circuit / Diagram representation for ${subject}`,
        steps: [
          {
            stepNum: 1,
            title: "Step 1: Statement & Formula",
            formula: "Core Formula Definition",
            explanation: "Initial problem formulation and variable definitions.",
            credit: "1.5 Marks"
          },
          {
            stepNum: 2,
            title: "Step 2: Substitution & Calculation",
            formula: "Substituted Values & Step Simplification",
            explanation: "Applying principles to simplify equations.",
            credit: "1.5 Marks"
          },
          {
            stepNum: 3,
            title: "Step 3: Final Answer & Units",
            formula: "Final Result Boxed",
            explanation: "Final result with standard SI units.",
            credit: "2.0 Marks"
          }
        ],
        examinerAlerts: [
          "⚠️ Always write SI units in final answers to avoid mark loss.",
          "💡 Underline final values and write step numbers clearly."
        ]
      };
    }

    res.json({
      success: true,
      question: questionData
    });
  } catch (error) {
    console.error("EXAM SPECIAL AI FALLBACK ENGAGED:", error?.message || error);
    const { targetExam = "Railway RRB", subject = "Reasoning" } = req.body || {};
    
    // Dynamic question bank per exam & subject to ensure diverse real questions on every click
    const dynamicBank = {
      "Railway RRB": {
        "Reasoning": [
          {
            title: `RRB CBT-1 Syllogism: Statements & Venn Diagram Logic`,
            topic: "Syllogism & Deductive Logic",
            marks: "1.0 Mark (CBT-1 / CBT-2)",
            diagram: "Venn Diagram Circles overlapping sets: Mammals, Whales & Aquatic Animals",
            steps: [
              { stepNum: 1, title: "Step 1: Statement Breakdown & Venn Circle Mapping", formula: "All Whales (W) ⊂ Mammals (M); No Mammal is Fish (F)", explanation: "Draw W entirely inside M. Place F entirely separate from M.", credit: "+0.33 Mark" },
              { stepNum: 2, title: "Step 2: Conclusion I Evaluation", formula: "Conclusion I: 'No Whale is Fish' → VALID", explanation: "Since W is inside M and M cannot intersect F, W can never intersect F.", credit: "+0.33 Mark" },
              { stepNum: 3, title: "Step 3: Conclusion II Evaluation & Final Answer", formula: "Conclusion II: 'Some Mammals are Whales' → VALID", explanation: "Since W occupies part of M's area, at least some M is W.", credit: "+0.34 Mark" }
            ],
            alerts: ["⚠️ RRB Negative Marking Warning: 1/3rd mark deducted per wrong answer.", "💡 Rule of Thumb: If a statement is universal ('All'), the converse ('Some') is always true."]
          },
          {
            title: `RRB CBT Coding-Decoding: Matrix & Numerical Shift Code`,
            topic: "Alphabetical Position Shifts & Coding Patterns",
            marks: "1.0 Mark (CBT-1)",
            diagram: "Alphabet Position Scale A=1 to Z=26 with Reverse Index (Z=1 to A=26)",
            steps: [
              { stepNum: 1, title: "Step 1: Identify Letter Numerical Shift Pattern", formula: "S(+2) T(+2) A(+2) T(+2) I(+2) O(+2) N(+2)", explanation: "Each character is shifted forward by +2 positions in the English alphabet.", credit: "+0.33 Mark" },
              { stepNum: 2, title: "Step 2: Apply Shift Rule to Target Word", formula: "R(+2)=T, A(+2)=C, I(+2)=K, L(+2)=N, W(+2)=Y, A(+2)=C, Y(+2)=A", explanation: "Transform 'RAILWAY' step by step.", credit: "+0.33 Mark" },
              { stepNum: 3, title: "Step 3: Verification", formula: "Coded Result = TCKNYCA", explanation: "Cross-check reverse shift -2 to obtain original word.", credit: "+0.34 Mark" }
            ],
            alerts: ["⚠️ Learn reverse alphabet pairs (A-Z, B-Y, C-X, D-W) by heart for RRB Speed tests.", "💡 Write A-M and N-Z on rough sheet immediately at test start."]
          }
        ],
        "General Science": [
          {
            title: `RRB Science: Calculate Work Done & Power in Lifting Mass m=${Math.floor(Math.random()*20 + 10)}kg to Height h=${Math.floor(Math.random()*10 + 5)}m`,
            topic: "Work, Energy & Power (Physics NCERT)",
            marks: "1.0 Mark (CBT-1 Science 25 Marks)",
            diagram: "Vertical Displacement Vector h with Gravitational Force Vector F = mg",
            steps: [
              { stepNum: 1, title: "Step 1: Gravitational Potential Energy / Work Formula", formula: "W = m × g × h", explanation: `Substitute m = ${Math.floor(Math.random()*20 + 10)}kg, g = 9.8 m/s², h = ${Math.floor(Math.random()*10 + 5)}m.`, credit: "+0.33 Mark" },
              { stepNum: 2, title: "Step 2: Compute Work in Joules", formula: `W = ${Math.floor(Math.random()*20 + 10) * 9.8 * 10} Joules`, explanation: "Multiply mass, acceleration due to gravity, and height.", credit: "+0.33 Mark" },
              { stepNum: 3, title: "Step 3: Power Calculation (t = 10s)", formula: "P = W / t (Watts)", explanation: "Divide total work done by time elapsed.", credit: "+0.34 Mark" }
            ],
            alerts: ["⚠️ Check if g is specified as 9.8 or 10 in the question options.", "💡 SI Unit of Power is Watt (J/s); 1 Horsepower (HP) = 746 Watts."]
          }
        ]
      },
      "NDA/CDS": {
        "Mathematics": [
          {
            title: `NDA Trigonometry: Find sin(2θ) given tan(θ) = ${Math.floor(Math.random()*3 + 3)}/${Math.floor(Math.random()*2 + 4)}`,
            topic: "Trigonometric Identities & Double Angle Formulations",
            marks: "2.5 Marks (NDA Math 300 Marks Paper)",
            diagram: "Right Triangle with Opposite, Adjacent & Hypotenuse sides",
            steps: [
              { stepNum: 1, title: "Step 1: Double Angle Identity for Sine", formula: "sin(2θ) = 2 tan(θ) / (1 + tan²(θ))", explanation: "Express double angle in terms of single angle tangent.", credit: "+1.0 Mark" },
              { stepNum: 2, title: "Step 2: Substitution & Fraction Simplification", formula: "sin(2θ) = 2(3/4) / (1 + 9/16) = (3/2) / (25/16) = 24/25", explanation: "Multiply numerator and denominator by 16.", credit: "+1.0 Mark" },
              { stepNum: 3, title: "Step 3: Decimal Conversion & Verification", formula: "sin(2θ) = 0.96", explanation: "Verify value lies within valid range [-1, 1].", credit: "+0.5 Mark" }
            ],
            alerts: ["⚠️ Always verify quadrant conditions for angle θ.", "💡 Memorize triples (3,4,5), (5,12,13), (8,15,17) for speed."]
          }
        ]
      }
    };

    const examSuite = dynamicBank[targetExam] || dynamicBank["Railway RRB"];
    const subjectList = examSuite[subject] || examSuite[Object.keys(examSuite)[0]] || dynamicBank["Railway RRB"]["Reasoning"];
    const qTemplate = subjectList[Math.floor(Math.random() * subjectList.length)];

    res.json({
      success: true,
      question: {
        id: `q_dyn_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        targetExam,
        subject,
        topic: qTemplate.topic,
        marks: qTemplate.marks,
        questionTitle: qTemplate.title,
        diagramDescription: qTemplate.diagram,
        steps: qTemplate.steps,
        examinerAlerts: qTemplate.alerts
      }
    });
  }
};

module.exports = {
  safeGroqCall,
  askAI,
  studyMode,
  generateQuiz,
  ocrFromImage,
  processAttachment,
  createNewChat,
  getSessions,
  getSingleChat,
  generateExamSpecialQuestion
};
