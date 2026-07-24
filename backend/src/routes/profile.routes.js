const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { protect } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

/*
========================================================
GET PROFILE DATA
========================================================
*/
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const xp = user.xp ?? 0;
    const level = Math.floor(xp / 100) + 1;
    const levelProgress = xp % 100;

    return res.status(200).json({
      success: true,
      data: {
        name: user.username || "User",
        email: user.email || "",
        exam: user.exam || "",
        xp,
        level,
        levelProgress,
        accuracy: user.accuracy ?? 0,
        streak: user.streak ?? 0,
        risk: user.risk || "Low",
        readiness: user.readiness ?? 0,
        weakSubject: user.weakSubject || "Not Available",
        strongSubject: user.strongSubject || "Not Available",
        trend: user.trend || "Stable",
        darkMode: user.darkMode ?? false,
        weeklyXP: user.weeklyXP || [40, 80, 20, 120, 90, 150, 110]
      }
    });

  } catch (error) {
    console.error("PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
========================================================
UPDATE PROFILE
========================================================
*/
router.put("/update", protect, async (req, res) => {
  try {
    const { username, name, exam, weakSubject, strongSubject } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name || username) {
      const displayVal = (name || username || "").trim();
      if (displayVal && displayVal.length >= 3) {
        if (username) user.username = username.trim();
        user.name = displayVal;
      }
    }

    if (typeof exam === "string") {
      user.exam = exam.trim();
    }

    if (typeof weakSubject === "string") {
      user.weakSubject = weakSubject.trim();
    }

    if (typeof strongSubject === "string") {
      user.strongSubject = strongSubject.trim();
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        username: user.username,
        name: user.name,
        exam: user.exam,
        weakSubject: user.weakSubject,
        strongSubject: user.strongSubject
      }
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
========================================================
UPLOAD PROFILE PHOTO
========================================================
*/
router.put("/upload-photo", protect, async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ success: false, message: "No image data provided" });
    }

    // Validate it's a data URI (jpg, png, gif, webp)
    if (!imageData.startsWith("data:image/")) {
      return res.status(400).json({ success: false, message: "Invalid image format. Must be JPG, PNG, GIF, or WebP." });
    }

    // Estimate base64 size → original bytes ≈ base64Length * 0.75
    const base64Data = imageData.split(",")[1] || "";
    const estimatedBytes = Math.ceil(base64Data.length * 0.75);
    const maxBytes = 2 * 1024 * 1024; // 2MB

    if (estimatedBytes > maxBytes) {
      return res.status(400).json({ success: false, message: "Image too large. Maximum size is 2 MB." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.profileImage = imageData;
    await user.save();

    return res.json({
      success: true,
      message: "Profile photo updated successfully",
      data: { profileImage: user.profileImage }
    });

  } catch (error) {
    console.error("UPLOAD PHOTO ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
========================================================
REMOVE PROFILE PHOTO
========================================================
*/
router.delete("/remove-photo", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.profileImage = null;
    await user.save();

    return res.json({ success: true, message: "Profile photo removed" });
  } catch (error) {
    console.error("REMOVE PHOTO ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
========================================================
UPDATE SETTINGS
========================================================
*/
router.put("/settings", protect, async (req, res) => {
  try {
    const { darkMode } = req.body;

    if (typeof darkMode !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "darkMode must be true or false"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.darkMode = darkMode;
    await user.save();

    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        darkMode: user.darkMode
      }
    });

  } catch (error) {
    console.error("SETTINGS UPDATE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
========================================================
CHANGE PASSWORD
========================================================
*/
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password incorrect"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
========================================================
RESET STUDY PROGRESS
========================================================
*/
router.post("/reset-progress", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.xp = 0;
    user.streak = 0;
    user.totalQuizzes = 0;
    user.accuracy = 0;
    user.readiness = 0;
    user.weakSubject = "";
    user.strongSubject = "";
    user.weeklyXP = [0, 0, 0, 0, 0, 0, 0];
    user.updateLevelAndRank();

    await user.save();

    // Optionally delete mock test history
    try {
      const MockTest = require("../models/mocktest.model");
      await MockTest.deleteMany({ user: req.user._id });
    } catch (e) {
      console.warn("MockTest cleanup notice:", e.message);
    }

    return res.json({
      success: true,
      message: "Study progress reset successfully",
      data: {
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        streak: user.streak,
        accuracy: user.accuracy,
        totalQuizzes: user.totalQuizzes
      }
    });

  } catch (error) {
    console.error("RESET PROGRESS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to reset study progress"
    });
  }
});

/*
========================================================
EXPORT USER DATA
========================================================
*/
router.get("/export-data", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let mockTests = [];
    try {
      const MockTest = require("../models/mocktest.model");
      mockTests = await MockTest.find({ user: req.user._id }).lean();
    } catch (e) {
      console.warn("MockTest fetch notice:", e.message);
    }

    return res.json({
      success: true,
      exportTimestamp: new Date().toISOString(),
      user,
      mockTestCount: mockTests.length,
      mockTests
    });

  } catch (error) {
    console.error("EXPORT DATA ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to export data" });
  }
});

/*
========================================================
GET ACTIVE SESSIONS
========================================================
*/
router.get("/sessions", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentToken = req.headers.authorization?.split(" ")[1];
    const { formatRelativeTime } = require("../utils/deviceParser");

    const rawSessions = user.activeSessions || [];

    const formattedSessions = rawSessions.map(s => {
      const isCurrent = s.token === currentToken;
      return {
        id: s.sessionId,
        device: s.deviceName,
        location: s.location || "Mumbai, IN",
        time: isCurrent ? "Now" : formatRelativeTime(s.lastActive),
        current: isCurrent,
        lastActive: s.lastActive
      };
    }).sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0));

    return res.json({
      success: true,
      sessions: formattedSessions
    });

  } catch (error) {
    console.error("GET SESSIONS ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch active sessions" });
  }
});

/*
========================================================
REVOKE SESSION BY ID
========================================================
*/
router.delete("/sessions/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.activeSessions = (user.activeSessions || []).filter(s => s.sessionId !== sessionId);
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: "Session revoked successfully"
    });

  } catch (error) {
    console.error("REVOKE SESSION ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to revoke session" });
  }
});

/*
========================================================
REVOKE ALL OTHER SESSIONS
========================================================
*/
router.delete("/sessions-revoke-others", protect, async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(" ")[1];
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.activeSessions = (user.activeSessions || []).filter(s => s.token === currentToken);
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: "All other active sessions revoked successfully"
    });

  } catch (error) {
    console.error("REVOKE OTHERS ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to revoke other sessions" });
  }
});

/*
========================================================
DELETE ACCOUNT
========================================================
*/
router.delete("/delete-account", protect, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;


