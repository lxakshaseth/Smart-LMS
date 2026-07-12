// Load environment variables (safe even if already loaded in index.js)
require("dotenv").config();

const Groq = require("groq-sdk");

// Validate API key
if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY is missing in .env file");
}

// Create Groq instance
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = groq;
