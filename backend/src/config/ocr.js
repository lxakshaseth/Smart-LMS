const axios = require("axios");
require("dotenv").config();

// Validate environment variables
if (!process.env.OCR_API_KEY || !process.env.OCR_ENDPOINT) {
  throw new Error("❌ OCR_API_KEY or OCR_ENDPOINT missing in .env file");
}

const AZURE_KEY = process.env.OCR_API_KEY;
const AZURE_ENDPOINT = process.env.OCR_ENDPOINT;

const extractTextFromImage = async (imageUrl) => {
  try {
    const response = await axios.post(
      `${AZURE_ENDPOINT}/vision/v3.2/ocr`,
      {
        url: imageUrl,
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const regions = response.data.regions || [];

    let extractedText = "";

    regions.forEach((region) => {
      region.lines.forEach((line) => {
        line.words.forEach((word) => {
          extractedText += word.text + " ";
        });
        extractedText += "\n";
      });
    });

    return extractedText.trim();
  } catch (error) {
    console.error("OCR Error:", error.response?.data || error.message);
    throw new Error("Failed to extract text from image");
  }
};

module.exports = { extractTextFromImage };
