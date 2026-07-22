const OpenAI = require("openai");
require("dotenv").config();

/**
 * Gets configured Groq client
 */
function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("GROQ_API_KEY is missing in backend environment variables.");
    err.status = 500;
    throw err;
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
}

/**
 * Calculates dynamic max output tokens based on question count to prevent truncation.
 */
function calculateMaxTokens(questionCount) {
  const count = Number(questionCount) || 10;
  if (count <= 5) return 1800;
  if (count <= 10) return 2800;
  if (count <= 20) return 4800;
  return 6500;
}

/**
 * Executes Groq API call for MCQ generation with high entropy parameters and retry mechanism.
 */
async function callGroqMCQ({ systemPrompt, userPrompt }, questionCount = 10, maxRetries = 3) {
  const client = getGroqClient();
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const max_tokens = calculateMaxTokens(questionCount);

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await Promise.race([
        client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 1.2,
          top_p: 0.95,
          max_tokens
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Groq API Timeout")), 45000)
        )
      ]);

      const content = completion.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Empty response received from Groq API.");
      }

      return content;
    } catch (err) {
      console.warn(`⚠️ [Groq MCQ Attempt ${attempt}/${maxRetries} Failed]:`, err.message);
      lastError = err;

      // Handle non-retryable 401 Unauthorized immediately
      if (err.status === 401 || (err.message && err.message.includes("401"))) {
        const error = new Error("Invalid Groq API Key. Please check your backend .env file.");
        error.status = 401;
        throw error;
      }

      // Brief delay before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Format final user-friendly error
  let friendlyMessage = "Failed to generate examination paper after multiple attempts.";
  if (lastError?.status === 429 || (lastError?.message && lastError.message.includes("429"))) {
    friendlyMessage = "Groq rate limit or quota exceeded. Please try again shortly.";
  } else if (lastError?.message && lastError.message.includes("Timeout")) {
    friendlyMessage = "AI service timed out while generating questions. Please try again.";
  }

  const finalErr = new Error(friendlyMessage);
  finalErr.status = lastError?.status || 502;
  finalErr.originalError = lastError;
  throw finalErr;
}

module.exports = {
  callGroqMCQ,
  calculateMaxTokens
};
