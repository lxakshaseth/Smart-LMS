const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    visibility: {
      type: String,
      enum: ["private", "shared"],
      default: "private",
      index: true
    },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        permission: { type: String, enum: ["view", "download"], default: "view" },
        sharedAt: { type: Date, default: Date.now }
      }
    ],
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    fileType: {
      type: String,
      enum: ["pdf", "image", "document", "video", "link", "text"],
      default: "text"
    },
    fileName: { type: String, trim: true },
    fileSize: { type: String, trim: true },
    fileMimeType: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    fileData: { type: String }, // Inline base64 data for images or files
    pageCount: { type: Number },
    duration: { type: Number },
    thumbnail: { type: String },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: "", maxlength: 200000 },
    subject: { type: String, default: "General", trim: true },
    tags: { type: [String], default: [] },
    starred: { type: Boolean, default: false },
    color: {
      type: String,
      default: "bg-indigo-500/10 border-indigo-500/20"
    },
    source: { type: String, enum: ["manual", "ai", "friend_exchange"], default: "manual" }
  },
  { timestamps: true }
);

// Pre-save hook to ensure user and ownerId stay in sync
noteSchema.pre("save", function (next) {
  if (this.ownerId && !this.user) {
    this.user = this.ownerId;
  } else if (this.user && !this.ownerId) {
    this.ownerId = this.user;
  }
  if (!this.createdBy) {
    this.createdBy = this.ownerId || this.user;
  }
  next();
});

noteSchema.index({ ownerId: 1, visibility: 1, updatedAt: -1 });
noteSchema.index({ receiverId: 1, visibility: 1 });
noteSchema.index({ "sharedWith.user": 1, visibility: 1 });

module.exports = mongoose.model("Note", noteSchema);

