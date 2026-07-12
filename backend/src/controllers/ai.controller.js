const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Note = require("../models/note.model");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");

/* ===============================
   GROQ CONFIG
=============================== */

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

const gemini = !groq && !openai && process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null;

/* ===============================
   SAFE GROQ CALL
=============================== */

async function safeGroqCall(config) {
  const client = groq || openai;
  if (!client && !gemini) {
    const error = new Error("AI_API_KEY_MISSING");
    error.status = 500;
    throw error;
  }

  if (gemini) {
    return await Promise.race([
      callGemini(config),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI Timeout")), 30000)
      )
    ]);
  }

  const model = groq
    ? (config.model || process.env.GROQ_MODEL || "llama-3.1-8b-instant")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  return await Promise.race([
    client.chat.completions.create({
      ...config,
      model
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI Timeout")), 30000)
    )
  ]);
}

async function callGemini(config) {
  const prompt = (config.messages || [])
    .map(message => `${String(message.role || "user").toUpperCase()}:\n${message.content || ""}`)
    .join("\n\n");

  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: config.temperature,
      maxOutputTokens: config.max_tokens
    }
  });

  return {
    choices: [
      {
        message: {
          content: response.text || ""
        }
      }
    ]
  };
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
    const { chatId, language = "Auto-Detect" } = req.body;
    const question = req.body.question?.trim();

    if (!question)
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });

    if (question.length > 4000)
      return res.status(400).json({
        success: false,
        message: "Question must be under 4000 characters"
      });

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user.id
    });
    if (!chat)
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });

    chat.language = language;
    chat.messages.push({ role: "user", content: question });

    if (chat.title === "New Chat" && chat.messages.length === 1) {
      chat.title = question.slice(0, 60);
    }

    const cleanMessages = chat.messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    const completion = await safeGroqCall({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a professional academic AI tutor/mentor.

Preferred Response Language: ${language}

Rules:
1. You MUST ONLY discuss study-related topics, exam preparation, schedule planning, academic subjects, time management, and learning advice.
2. Academic subjects, computer science terms, engineering topics, languages, history, and educational concepts (such as "dbms", "web dev", "newton's laws", "mitosis", "math", "integration") are ON-TOPIC. Answer them clearly at the student's level.
3. Friendly greetings (such as "hi", "hello", "hey", "good morning") are ON-TOPIC. Respond with a welcoming greeting and ask what topic they want to study in the preferred language.
4. If the user's message is completely unrelated to study, academic subjects, exam prep, or learning (e.g., asking how to cook, asking for recipes, jokes, sports/movies, writing general software scripts unrelated to learning, etc.), you MUST politely reject it in the preferred response language (or detect and use the user's language if 'Auto-Detect' is active). Keep the rejection message clear and friendly, conveying the exact meaning of: "I am your study mentor and can only assist with academic or study-related queries. Let's focus on improving your studies!"
5. Never invent facts. Keep your answers clear, accurate, and student friendly.
6. Language Guideline: 
   - By default, converse in English.
   - If the Preferred Response Language is 'Auto-Detect' and the user writes in a language other than English (e.g. Hindi, Hinglish, Spanish, French, German, Gujarati, Marathi, Bengali, Tamil, Telugu, etc.), you MUST automatically detect it and respond strictly and naturally in that same language. Do not mix multiple languages or append brackets containing translations (e.g., do not write 'Aap kaise hain? (How are you?)'; write purely in the detected language).
   - If a specific language is selected (e.g. English, Hindi, Spanish, French, German, Gujarati, Marathi, Bengali, Tamil, Telugu, Hinglish), you MUST respond strictly in that selected language (for Hinglish, write Hindi in the Roman/Latin script, e.g. "Aap kya padhna chahte hain?").`
        },
        ...cleanMessages
      ],
      max_tokens: 600
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
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("ASK AI ERROR:", error);
    const timedOut = error.message === "Groq Timeout";
    res.status(timedOut ? 504 : 502).json({
      success: false,
      message: timedOut
        ? "AI service timed out. Please try again."
        : "AI service is unavailable right now. Please try again."
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
  try {
    if (!req.file)
      return res.status(400).json({ success: false });

    const result = await Tesseract.recognize(req.file.path, "eng");
    fs.unlinkSync(req.file.path);

    res.json({ success: true, text: result.data.text });

  } catch (error) {
    console.error("OCR ERROR:", error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  askAI,
  studyMode,
  generateQuiz,
  ocrFromImage,
  createNewChat,
  getSessions,
  getSingleChat
};
