const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["quiz", "critical", "focus"],
      required: true
    },
    subject: { type: String, default: "General", trim: true },
    mode: { type: String, default: "" },
    score: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    durationSeconds: { type: Number, default: 0, min: 0 },
    xpEarned: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
