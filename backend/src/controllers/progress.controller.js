const User = require("../models/user.model");
const Planner = require("../models/planner.model");
const { getCurrentTargetExam } = require("../utils/targetExam.utils");

// ===============================
// GET USER PROGRESS
// ===============================

const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const planner = await Planner.findOne({ user: req.user.id });

    // ===============================
    // RANK SYSTEM
    // ===============================
    let rank = "Beginner";
    if (user.xp >= 2000) rank = "Grandmaster";
    else if (user.xp >= 1000) rank = "Master";
    else if (user.xp >= 500) rank = "Advanced";
    else if (user.xp >= 200) rank = "Intermediate";

    // Check if user has performed any real practice activity
    const hasActivity = (user.totalQuestions > 0 || user.totalQuizzes > 0 || user.totalNotes > 0 || user.totalStudyHours > 0 || user.xp > 0);

    // ===============================
    // TOTAL STUDY HOURS CALCULATION
    // ===============================
    const computedStudyHours = Math.round(
      ((user.totalQuestions * 2.5 + user.totalQuizzes * 10 + user.totalNotes * 4) / 60) * 10
    ) / 10;
    const totalStudyHours = hasActivity ? (user.totalStudyHours > 0 ? user.totalStudyHours : computedStudyHours) : 0;

    // ===============================
    // WEEKLY ACTIVITY (Current Week: Mon .. Sun)
    // ===============================
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
    const mondayOfCurrentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyActivity = dayNames.map((day, idx) => {
      const targetDate = new Date(mondayOfCurrentWeek);
      targetDate.setDate(mondayOfCurrentWeek.getDate() + idx);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dateNum = String(targetDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dateNum}`;

      const match = user.weeklyActivity?.find(wa => {
        if (!wa.date) return false;
        const waDateStr = String(wa.date).split("T")[0];
        return waDateStr === dateStr;
      });

      return {
        day,
        date: dateStr,
        questions: match ? (match.questions || 0) : 0,
        notes: match ? (match.notes || 0) : 0,
        quizzes: match ? (match.quizzes || 0) : 0,
        xp: match ? (match.xpEarned || 0) : 0,
        studyHours: match ? (match.studyHours || Math.round(((match.questions || 0) * 2 + (match.quizzes || 0) * 8) / 60 * 10) / 10) : 0
      };
    });

    // ===============================
    // ACCURACY HISTORY TREND
    // ===============================
    let accuracyHistory = [];
    if (hasActivity && planner?.accuracyHistory?.length) {
      accuracyHistory = planner.accuracyHistory.map((ah, i) => ({
        week: `Week ${i + 1}`,
        accuracy: ah.accuracy || 0
      }));
    } else if (hasActivity && user.accuracy > 0) {
      accuracyHistory = [{ week: "Current", accuracy: user.accuracy }];
    } else {
      accuracyHistory = [];
    }

    // ===============================
    // STUDY HEATMAP MATRIX (4 weeks x 7 days)
    // ===============================
    const heatmapData = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      weeklyActivity.map(wa => wa.studyHours)
    ];

    // ===============================
    // SUBJECT STATS & MASTERY
    // ===============================
    let subjectStats = [];
    if (hasActivity && user.subjectStats?.length) {
      subjectStats = user.subjectStats.map(st => ({
        subject: st.subject,
        mastery: st.mastery || 0,
        questions: st.questions || 0,
        quizzes: st.quizzes || 0,
        notes: st.notes || 0
      }));
    } else if (hasActivity && planner?.subjectStats?.length) {
      subjectStats = planner.subjectStats.map(st => ({
        subject: st.subject,
        mastery: st.mastery || 0,
        questions: st.totalAttempts || 0
      }));
    } else {
      subjectStats = [];
    }

    const targetExam = getCurrentTargetExam(user);
    const weakSubject = hasActivity
      ? ((planner && planner.weakSubject && !["General", "Nursery-LKG", "Not Available", "-"].includes(planner.weakSubject))
        ? planner.weakSubject
        : (user.weakSubject && !["Not Available", "Nursery-LKG", "-"].includes(user.weakSubject))
          ? user.weakSubject
          : "None")
      : "None";

    res.json({
      success: true,
      data: {
        xp: user.xp,
        streak: user.streak,
        rank,
        targetExam,
        weakSubject,
        totalQuestions: hasActivity ? user.totalQuestions : 0,
        totalNotes: hasActivity ? user.totalNotes : 0,
        totalQuizzes: hasActivity ? user.totalQuizzes : 0,
        totalStudyHours,
        accuracy: hasActivity ? (user.accuracy || planner?.lastMockAccuracy || 0) : 0,
        readiness: hasActivity ? (user.readiness || (planner?.riskScore ? (100 - planner.riskScore) : 0)) : 0,
        weeklyActivity,
        accuracyHistory,
        heatmapData,
        subjectStats
      }
    });

  } catch (error) {
    console.error("Progress Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch user progress" });
  }
};

const resetProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.weeklyActivity = [];
    user.subjectStats = [];
    user.xp = 0;
    user.totalQuestions = 0;
    user.totalQuizzes = 0;
    user.totalNotes = 0;
    user.totalStudyHours = 0;
    user.accuracy = 0;
    user.readiness = 0;
    user.weakSubject = "";
    user.strongSubject = "";
    await user.save();

    let planner = await Planner.findOne({ user: req.user.id });
    if (planner) {
      planner.weeklyCompletion = 0;
      planner.riskScore = 0;
      planner.lastMockAccuracy = 0;
      planner.weakSubject = "";
      planner.accuracyHistory = [];
      planner.subjectStats = [];
      await planner.save();
    }

    res.json({ success: true, message: "Progress reset successfully" });
  } catch (error) {
    console.error("Reset Progress Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to reset progress" });
  }
};

module.exports = {
  getProgress,
  resetProgress
};
