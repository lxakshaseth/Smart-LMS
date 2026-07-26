const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    category: { type: String, required: true },
    acceptance: { type: String, default: "50%" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    companies: [{ type: String }],
    frequency: { type: String, default: "50%" },
    statement: { type: String, required: true },
    examples: [
      {
        input: String,
        output: String,
        explanation: String
      }
    ],
    constraints: [{ type: String }],
    hints: [{ type: String }],
    approach: { type: String },
    pseudoCode: { type: String },
    codeSnippets: { type: Map, of: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
