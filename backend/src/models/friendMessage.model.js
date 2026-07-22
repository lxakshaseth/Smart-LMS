const mongoose = require("mongoose");

const friendMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isAttachment: {
      type: Boolean,
      default: false,
    },
    attachmentType: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: String,
    },
    fileMimeType: {
      type: String,
    },
    fileData: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    audioDuration: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Compound index for fast conversation message lookup
friendMessageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

module.exports = mongoose.model("FriendMessage", friendMessageSchema);
