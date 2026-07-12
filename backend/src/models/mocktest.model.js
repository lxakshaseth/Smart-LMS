const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: String,
  topic: String,

  totalQuestions: Number,
  correctAnswers: Number,
  accuracy: Number,

  weakAreas: [String],

}, { timestamps: true });

module.exports = mongoose.model("MockTest", mockTestSchema);
