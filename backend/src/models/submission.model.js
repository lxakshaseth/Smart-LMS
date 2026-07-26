const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: { type: String, enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error"], required: true },
    executionTime: { type: String },
    memoryUsage: { type: String },
    output: { type: String },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
