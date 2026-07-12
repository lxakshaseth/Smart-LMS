const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/solve-image", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }

    res.json({
      message: "OCR route working",
      received_image: imageUrl
    });

  } catch (error) {
    console.error("OCR ERROR:", error.message);
    res.status(500).json({ error: "OCR Failed" });
  }
});

module.exports = router;
