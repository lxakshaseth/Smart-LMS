const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, default: "", maxlength: 100000 },
    subject: { type: String, default: "General", trim: true },
    tags: { type: [String], default: [] },
    starred: { type: Boolean, default: false },
    color: {
      type: String,
      default: "bg-indigo-500/10 border-indigo-500/20"
    },
    source: { type: String, enum: ["manual", "ai"], default: "manual" }
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
