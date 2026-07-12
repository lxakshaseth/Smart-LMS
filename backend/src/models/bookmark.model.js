const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,
  link: String
}, { timestamps: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
