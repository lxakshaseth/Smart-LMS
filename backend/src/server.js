require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimit.middleware");

const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const lectureRoutes = require("./routes/lecture.routes");
const youtubeRoutes = require("./routes/youtube.routes");
const booksRoutes = require("./routes/books.routes");
const progressRoutes = require("./routes/progress.routes");
const plannerRoutes = require("./routes/planner.routes");
const notesRoutes = require("./routes/notes.routes");
const mockRoutes = require("./routes/mock.routes");
const mocktestRoutes = require("./routes/mocktest.routes");
const goalRoutes = require("./routes/goal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const brainRoutes = require("./routes/brain.routes");
const profileRoutes = require("./routes/profile.routes");
const friendsRoutes = require("./routes/friends.routes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Serve static uploads folder
const multer = require("multer");
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Serve static uploads
app.use("/uploads", express.static(uploadsDir));

// Dedicated HTTP file upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    fileMimeType: req.file.mimetype,
    fileSize: req.file.size
  });
});
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin: clientOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart AI LMS API is running",
    time: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/mocktest", mocktestRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/brain", brainRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/friends", friendsRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

// In production, `npm run build` in ../frontend creates this directory.
// In development Vite serves the UI on port 5173 and proxies /api here.
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
const frontendIndex = path.join(frontendDist, "index.html");
const hasReactBuild = fs.existsSync(frontendIndex);

if (hasReactBuild) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => res.sendFile(frontendIndex));
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Smart AI LMS backend is running",
      frontend: clientOrigins[0]
    });
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Wrap App in HTTP Server for WebSockets / Socket.io WebRTC signaling
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  maxHttpBufferSize: 50 * 1024 * 1024   // 50 MB — supports base64-encoded PDFs, images, audio
});

// Real-time user session status & call routing cache
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("⚡ Real-time client connected:", socket.id);

  socket.on("register-user", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User registered online: ${userId} -> socket ${socket.id}`);
      io.emit("user-status-change", { userId, online: true });
    }
  });

  socket.on("call-user", ({ to, offer, fromName, fromAvatar, isVideo }) => {
    const targetSocketId = onlineUsers.get(to);
    console.log(`Call requested to user: ${to} (socket: ${targetSocketId}) from ${socket.userId} (${fromName})`);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", {
        from: socket.userId,
        fromName,
        fromAvatar,
        offer,
        isVideo
      });
    } else {
      socket.emit("call-failed", { reason: "Friend is currently offline" });
    }
  });

  socket.on("accept-call", ({ to, answer }) => {
    const targetSocketId = onlineUsers.get(to);
    console.log(`Call accepted by ${socket.userId} for target user: ${to}`);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-accepted", {
        from: socket.userId,
        answer
      });
    }
  });

  socket.on("reject-call", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    console.log(`Call rejected by ${socket.userId} for target user: ${to}`);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-rejected", {
        from: socket.userId
      });
    }
  });

  socket.on("webrtc-signal", ({ to, signal }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-signal", {
        from: socket.userId,
        signal
      });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        from: socket.userId,
        candidate
      });
    }
  });

  socket.on("end-call", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    console.log(`Call ending between ${socket.userId} and ${to}`);
    if (targetSocketId) {
      io.to(targetSocketId).emit("end-call", {
        from: socket.userId
      });
    }
  });

  socket.on("send-message", ({
    to, content,
    isAttachment, attachmentType, fileName, fileSize, fileMimeType, fileData, fileUrl, audioDuration
  }) => {
    const targetSocketId = onlineUsers.get(to);
    console.log(`Relaying message from ${socket.userId} to ${to} [${isAttachment ? `attachment:${attachmentType}` : "text"}]`);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-message", {
        from: socket.userId,
        content,
        timestamp: new Date().toISOString(),
        // Pass through all attachment fields so receiver renders the proper media card
        ...(isAttachment && {
          isAttachment: true,
          attachmentType,
          fileName,
          fileSize,
          fileMimeType,
          fileData,       // base64 data URL fallback
          fileUrl,        // static HTTP URL
          audioDuration,
        }),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("⚡ Client disconnected:", socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user-status-change", { userId: socket.userId, online: false });
    }
  });
});

if (require.main === module) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Smart AI LMS API: http://localhost:${PORT}`);
      console.log(
        hasReactBuild
          ? `React app: http://localhost:${PORT}`
          : `React dev app: ${clientOrigins[0]}`
      );
    });
  });
}

module.exports = app;
