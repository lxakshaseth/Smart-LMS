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

// Compute this early so the GET / health-check can reference hasReactBuild
// before any route handlers run.
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
const frontendIndex = path.join(frontendDist, "index.html");
const hasReactBuild = fs.existsSync(frontendIndex);

// 1. Set up CORS allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://smart-lms-pj6i-lake.vercel.app"
];

// Parse extra origins from environment variable if present
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
}

const clientOrigins = allowedOrigins;

// 2. Apply Helmet and CORS before any routes (including static / uploads)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Ensure preflight OPTIONS requests are handled globally
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 3. Multer / Static Uploads setup after CORS
const multer = require("multer");
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

app.use("/uploads", express.static(uploadsDir));

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

app.use("/api", apiLimiter);

// ── Root health-check (Render pings GET / to verify the service is up) ──────
app.get("/", (req, res, next) => {
  // Only intercept if the React build is NOT present; otherwise fall through
  // to the static-file middleware defined later in the file.
  if (!hasReactBuild) {
    return res.json({
      status: "OK",
      server: "Running",
      environment: process.env.NODE_ENV || "development"
    });
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    server: "Running",
    environment: process.env.NODE_ENV || "development",
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
// On a backend-only Render deployment (rootDir: backend) there is no
// ../../frontend/dist – hasReactBuild will be false and the API-only mode
// is used instead.  When the frontend is co-located (monorepo deploy) the
// static files will be served automatically.
if (hasReactBuild) {
  app.use(express.static(frontendDist, { index: false }));
  // SPA fallback — must come after all API routes
  app.get("*", (req, res) => res.sendFile(frontendIndex));
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

// ── Global crash-safety handlers ─────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Promise Rejection:", reason);
  process.exit(1);
});

// ── Boot sequence ─────────────────────────────────────────────────────────────
if (require.main === module) {
  console.log("[BOOT] NODE_ENV  :", process.env.NODE_ENV || "development");
  console.log("[BOOT] PORT      :", PORT);
  console.log("[BOOT] Mongo URI :", process.env.MONGODB_URI || process.env.MONGO_URI ? "<set>" : "*** MISSING ***");
  console.log("[BOOT] Connecting to MongoDB...");

  connectDB()
    .then(() => {
      console.log("[BOOT] MongoDB   : Connected ✅");
      server.listen(PORT, () => {
        console.log(`[BOOT] Server    : Listening on port ${PORT} ✅`);
        console.log(`[BOOT] Frontend  : ${hasReactBuild ? `Serving React build from /` : `API-only mode — frontend at ${clientOrigins.find(o => !o.includes("localhost")) || clientOrigins[0]}`}`);
        console.log("[BOOT] Smart AI LMS is ready to serve requests.");
      });
    })
    .catch((err) => {
      console.error("[FATAL] Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
}

module.exports = app;
