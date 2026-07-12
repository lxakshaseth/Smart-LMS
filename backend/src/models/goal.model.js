const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: String,
  targetScore: Number,
  targetDate: Date,
  currentScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);
