const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

// Ensure a user cannot send multiple pending requests to the same person
friendRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
