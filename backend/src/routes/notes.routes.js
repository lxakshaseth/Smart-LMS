const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const Note = require("../models/note.model");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const query = { user: req.user.id };
    if (req.query.source) query.source = req.query.source;
    const notes = await Note.find(query).sort({ starred: -1, updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content = "", subject = "General", tags = [], starred = false, color, source = "manual" } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Note title is required" });
    }
    const note = await Note.create({
      user: req.user.id,
      title: title.trim(),
      content,
      subject,
      tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
      starred,
      color,
      source
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const allowed = ["title", "content", "subject", "tags", "starred", "color"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
