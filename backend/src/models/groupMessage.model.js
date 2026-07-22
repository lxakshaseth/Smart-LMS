const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "voice_note",
        "emoji",
        "gif",
        "sticker",
        "system",
      ],
      default: "text",
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
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupMessage" },
      senderName: String,
      content: String,
      messageType: String,
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    deliveredTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    seenBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

groupMessageSchema.index({ groupId: 1, createdAt: 1 });

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
