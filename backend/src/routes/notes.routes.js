const express = require("express");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth.middleware");
const Note = require("../models/note.model");
const User = require("../models/user.model");
const FriendMessage = require("../models/friendMessage.model");

const router = express.Router();
router.use(protect);

// ==========================================
// 🔒 GET /api/notes
// Retrieve user's personal private notes only
// ==========================================
router.get("/", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const query = {
      $or: [{ ownerId: currentUserId }, { user: currentUserId }],
      visibility: "private"
    };

    if (req.query.source) {
      query.source = req.query.source;
    }

    const notes = await Note.find(query).sort({ starred: -1, updatedAt: -1 });
    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 GET /api/notes/shared
// Retrieve notes/files shared WITH or BY current user
// (Includes both Note shares AND FriendMessage chat attachments)
// ==========================================
router.get("/shared", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // 1. Fetch explicitly shared Note documents
    const sharedNotes = await Note.find({
      visibility: "shared",
      $or: [
        { receiverId: currentUserId },
        { "sharedWith.user": currentUserId },
        { senderId: currentUserId },
        { ownerId: currentUserId, visibility: "shared" }
      ]
    })
      .populate("ownerId", "name username email")
      .populate("senderId", "name username email")
      .populate("receiverId", "name username email")
      .populate("sharedWith.user", "name username email")
      .sort({ createdAt: -1 });

    const formattedNotes = sharedNotes.map((n) => {
      const isSender = n.senderId?._id?.toString() === currentUserId || n.ownerId?._id?.toString() === currentUserId;
      const senderObj = n.senderId || n.ownerId;
      const receiverObj = n.receiverId;
      
      const senderName = isSender ? "You" : (senderObj?.name || senderObj?.username || "Study Partner");
      const receiverName = !isSender ? "You" : (receiverObj?.name || receiverObj?.username || "Study Partner");

      let permission = "download";
      if (!isSender && Array.isArray(n.sharedWith)) {
        const userShare = n.sharedWith.find((sw) => sw.user?._id?.toString() === currentUserId || sw.user?.toString() === currentUserId);
        if (userShare) permission = userShare.permission || "view";
      }

      return {
        id: n._id.toString(),
        title: n.title,
        content: n.content,
        subject: n.subject || "General",
        senderName,
        senderAvatar: (senderName || "SP").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2),
        receiverName,
        receiverAvatar: (receiverName || "SP").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2),
        isIncoming: !isSender,
        timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
        tags: n.tags || [],
        fileType: n.fileType || "pdf",
        fileName: n.fileName || n.title,
        fileSize: n.fileSize || "1.5 MB",
        fileMimeType: n.fileMimeType,
        fileData: n.fileData,
        fileUrl: n.fileUrl ? `/api/notes/files/${n._id}/stream` : null,
        permission,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      };
    });

    // 2. Fetch Chat Message attachments (PDFs, Images, Documents exchanged in Friend Chat)
    const chatAttachments = await FriendMessage.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
      isAttachment: true
    })
      .populate("sender", "name username email")
      .populate("receiver", "name username email")
      .sort({ createdAt: -1 });

    const formattedChatNotes = chatAttachments.map((msg) => {
      const isSender = msg.sender?._id?.toString() === currentUserId;
      const senderObj = msg.sender;
      const receiverObj = msg.receiver;

      const senderName = isSender ? "You" : (senderObj?.name || senderObj?.username || "Study Partner");
      const receiverName = !isSender ? "You" : (receiverObj?.name || receiverObj?.username || "Study Partner");

      const isPdf = msg.attachmentType === "document" || (msg.fileName && msg.fileName.toLowerCase().endsWith(".pdf"));
      const isImage = msg.attachmentType === "image" || (msg.fileName && /\.(png|jpg|jpeg|webp|gif)$/i.test(msg.fileName));
      const fileType = isPdf ? "pdf" : (isImage ? "image" : "document");

      return {
        id: `chat-msg-${msg._id.toString()}`,
        title: msg.fileName || (isPdf ? "PDF Document" : "Shared File"),
        content: msg.content || `Exchanged ${fileType.toUpperCase()} document in friend chat.`,
        subject: "Study Material",
        senderName,
        senderAvatar: (senderName || "SP").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2),
        receiverName,
        receiverAvatar: (receiverName || "SP").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2),
        isIncoming: !isSender,
        timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
        tags: ["Chat Attachment", fileType.toUpperCase()],
        fileType,
        fileName: msg.fileName || (isPdf ? "document.pdf" : "image.png"),
        fileSize: msg.fileSize ? (typeof msg.fileSize === "number" ? `${(msg.fileSize / 1024).toFixed(1)} KB` : String(msg.fileSize)) : "1.5 MB",
        fileMimeType: msg.fileMimeType,
        fileData: msg.fileData,
        fileUrl: msg.fileUrl || (msg.fileData ? null : `/api/notes/files/msg-${msg._id}/stream`),
        permission: "download",
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      };
    });

    // Deduplicate merged list by fileName + timestamp
    const dedupeMap = new Map();
    [...formattedNotes, ...formattedChatNotes].forEach((item) => {
      const key = `${item.fileName}_${item.senderName}_${item.receiverName}`;
      if (!dedupeMap.has(key)) {
        dedupeMap.set(key, item);
      }
    });

    const merged = Array.from(dedupeMap.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    res.json({ success: true, count: merged.length, notes: merged });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 POST /api/notes/share
// Share a file / note with a study partner
// ==========================================
router.post("/share", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const {
      receiverId,
      title,
      content = "",
      subject = "General",
      fileType = "pdf",
      fileName,
      fileSize,
      fileMimeType,
      fileData,
      fileUrl,
      permission = "download", // "view" or "download"
      chatMessage
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Document title is required" });
    }

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Recipient user ID is required" });
    }

    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    const note = await Note.create({
      ownerId: currentUserId,
      user: currentUserId,
      createdBy: currentUserId,
      senderId: currentUserId,
      receiverId: recipient._id,
      visibility: "shared",
      sharedWith: [
        {
          user: recipient._id,
          permission: permission === "view" ? "view" : "download",
          sharedAt: new Date()
        }
      ],
      title: title.trim(),
      content: chatMessage || content,
      subject,
      fileType,
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, "_")}.${fileType === "pdf" ? "pdf" : "png"}`,
      fileSize: fileSize || "1.5 MB",
      fileMimeType,
      fileData,
      fileUrl,
      source: "friend_exchange",
      tags: [subject, fileType.toUpperCase(), "Friend Shared"]
    });

    res.status(201).json({
      success: true,
      message: `Document shared with ${recipient.name || recipient.username || "friend"}!`,
      note
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 POST /api/notes
// Create personal private note
// ==========================================
router.post("/", async (req, res, next) => {
  try {
    const { title, content = "", subject = "General", tags = [], starred = false, color, source = "manual" } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Note title is required" });
    }
    const note = await Note.create({
      ownerId: req.user.id,
      user: req.user.id,
      createdBy: req.user.id,
      visibility: "private",
      title: title.trim(),
      content,
      subject,
      tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
      starred,
      color,
      source
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 GET /api/notes/files/:id/stream
// Secure authenticated file streaming endpoint
// ==========================================
router.get("/files/:id/stream", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    // Stream Chat Attachment
    if (id.startsWith("msg-")) {
      const msgId = id.replace("msg-", "");
      const msg = await FriendMessage.findById(msgId);
      if (!msg) {
        return res.status(404).json({ success: false, message: "Chat file attachment not found" });
      }
      const isSender = msg.sender?.toString() === currentUserId;
      const isReceiver = msg.receiver?.toString() === currentUserId;
      if (!isSender && !isReceiver) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      if (msg.fileData && msg.fileData.startsWith("data:")) {
        const parts = msg.fileData.split(";base64,");
        const mimeType = parts[0].replace("data:", "") || msg.fileMimeType || "application/octet-stream";
        const buffer = Buffer.from(parts[1], "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `inline; filename="${msg.fileName || "document"}"`);
        return res.send(buffer);
      }
      if (msg.fileUrl && !msg.fileUrl.startsWith("http")) {
        const safePath = path.join(__dirname, "../../uploads", path.basename(msg.fileUrl));
        if (fs.existsSync(safePath)) {
          res.setHeader("Content-Type", msg.fileMimeType || "application/octet-stream");
          return fs.createReadStream(safePath).pipe(res);
        }
      }
      return res.status(400).json({ success: false, message: "Attachment file content unavailable" });
    }

    // Stream Note Document
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const isOwner = note.ownerId?.toString() === currentUserId || note.user?.toString() === currentUserId || note.senderId?.toString() === currentUserId;
    const isReceiver = note.receiverId?.toString() === currentUserId;
    const isShared = Array.isArray(note.sharedWith) && note.sharedWith.some((sw) => sw.user?.toString() === currentUserId);

    if (!isOwner && !isReceiver && !isShared) {
      return res.status(403).json({ success: false, message: "403 Forbidden: You do not have permission to view this file" });
    }

    if (note.fileData && note.fileData.startsWith("data:")) {
      const parts = note.fileData.split(";base64,");
      const mimeType = parts[0].replace("data:", "") || note.fileMimeType || "application/octet-stream";
      const buffer = Buffer.from(parts[1], "base64");

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${note.fileName || "document"}"`);
      return res.send(buffer);
    }

    if (note.fileUrl && !note.fileUrl.startsWith("http")) {
      const safePath = path.join(__dirname, "../../uploads", path.basename(note.fileUrl));
      if (fs.existsSync(safePath)) {
        res.setHeader("Content-Type", note.fileMimeType || "application/octet-stream");
        return fs.createReadStream(safePath).pipe(res);
      }
    }

    return res.status(400).json({ success: false, message: "File content unavailable" });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 PUT /api/notes/:id
// Update note with strict owner validation
// ==========================================
router.put("/:id", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const allowed = ["title", "content", "subject", "tags", "starred", "color"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, $or: [{ ownerId: currentUserId }, { user: currentUserId }] },
      updates,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 🔒 DELETE /api/notes/:id
// Delete note with strict owner validation
// ==========================================
router.delete("/:id", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      $or: [{ ownerId: currentUserId }, { user: currentUserId }, { senderId: currentUserId }]
    });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


