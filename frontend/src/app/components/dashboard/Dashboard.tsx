import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { HeroBanner } from "./HeroBanner";
import { QuickAccessGrid } from "./QuickAccessGrid";
import { PerformanceStats } from "./PerformanceStats";
import { AnalyticsChartSection } from "./AnalyticsChartSection";
import { ScheduleWidget } from "./ScheduleWidget";
import { AIRecommendations } from "./AIRecommendations";
import { LeaderboardWidget } from "./LeaderboardWidget";
import { AchievementsWidget } from "./AchievementsWidget";
import { ProductivityWidget } from "./ProductivityWidget";
import { SmartWidgets } from "./SmartWidgets";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const riseUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Analytics Overview
        const overviewRes = await apiRequest<{ success: boolean; data?: any } | any>("/analytics/overview").catch(() => null);
        if (overviewRes) {
          setAnalyticsData(overviewRes.data || overviewRes);
        }

        // Fetch Friends List for Leaderboard
        const friendsRes = await apiRequest<{ success: boolean; friends?: any[] }>("/friends").catch(() => null);
        if (friendsRes?.success && Array.isArray(friendsRes.friends)) {
          setFriends(friendsRes.friends);
        }

        // Fetch Planner Tasks for Timetable Schedule
        const plannerRes = await apiRequest<{ success: boolean; planner?: any; schedule?: any[] }>("/planner").catch(() => null);
        if (plannerRes) {
          const scheduleList = plannerRes.planner?.schedule || plannerRes.schedule || [];
          if (Array.isArray(scheduleList)) {
            setPlannerTasks(
              scheduleList.map((item: any, idx: number) => ({
                id: item.id || item._id || String(idx + 1),
                time: item.time || "10:00 AM",
                subject: item.subject || "Study Session",
                topic: item.topic || item.task || "Module Revision",
                done: Boolean(item.completed || item.done),
                dur: item.duration || "45m",
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Dashboard dynamic data fetch fallback:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchDashboardData();
  }, []);

  const handleResetDashboardData = () => {
    if (window.confirm("Are you sure you want to reset your dashboard metrics and progress data?")) {
      setAnalyticsData({
        studyStreak: 0,
        totalXP: 0,
        level: 1,
        lastMockAccuracy: 0,
        xpToday: 0,
        subjectStats: [],
        weakSubject: "",
        examReadinessIndex: 0,
        totalQuestions: 0,
        completedCourses: 0,
      });
      setPlannerTasks([]);
      if (user?.email) {
        localStorage.removeItem(`lms_added_friends_${user.email}`);
        localStorage.removeItem(`lms_chat_messages_${user.email}`);
        localStorage.removeItem(`lms_call_logs_${user.email}`);
      }
    }
  };

  const streak = analyticsData?.studyStreak ?? user?.streak ?? 0;
  const xp = analyticsData?.totalXP ?? user?.xp ?? 0;
  const level = analyticsData?.level ?? user?.level ?? 1;
  const rank = analyticsData?.rank ?? (friends.length > 0 ? `#${friends.length + 1}` : "Unranked");
  const accuracy = analyticsData?.lastMockAccuracy ?? user?.accuracy ?? 0;
  const xpToday = analyticsData?.xpToday ?? 0;
  const subjectStats = analyticsData?.subjectStats || [];
  const weeklyAccuracyTrend = analyticsData?.weeklyAccuracyTrend || [];
  const weakSubject = analyticsData?.weakSubject || user?.weakSubject || analyticsData?.focusArea || "";
  const examReadiness = analyticsData?.examReadinessIndex ?? 0;
  const questionsSolved = analyticsData?.totalQuestions ?? user?.totalQuestions ?? 0;
  const coursesCompleted = analyticsData?.completedCourses ?? user?.completedCourses ?? 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Hero Greeting Banner */}
      <motion.div variants={riseUp}>
        <HeroBanner
          user={user}
          streak={streak}
          xp={xp}
          level={level}
          rank={rank}
        />
      </motion.div>

      {/* 2. Smart Live Clock, Motivation Quote & Exam Countdown Widgets */}
      <motion.div variants={riseUp}>
        <SmartWidgets user={user} />
      </motion.div>

      {/* 3. Quick Access Feature Cards with Reset Data Option */}
      <motion.div variants={riseUp}>
        <div className="flex items-center justify-between mb-2">
          <span />
          <button
            onClick={handleResetDashboardData}
            className="text-[11px] font-bold text-muted-foreground hover:text-destructive transition-colors underline cursor-pointer"
            title="Reset dashboard analytics data to zero"
          >
            Reset Dashboard Data
          </button>
        </div>
        <QuickAccessGrid />
      </motion.div>


      {/* 4. Responsive Performance Metric Cards */}
      <motion.div variants={riseUp}>
        <PerformanceStats
          streak={streak}
          accuracy={accuracy}
          xpToday={xpToday}
          rank={rank}
          questionsSolved={questionsSolved}
          coursesCompleted={coursesCompleted}
          weakSubject={weakSubject}
        />
      </motion.div>

      {/* 5. Learning Analytics & Subject Mastery Progress */}
      <motion.div variants={riseUp}>
        <AnalyticsChartSection
          subjectStats={subjectStats}
          weeklyAccuracyTrend={weeklyAccuracyTrend}
          totalXP={xp}
        />
      </motion.div>


      {/* 6. Today's Schedule & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={riseUp}>
          <ScheduleWidget initialTasks={plannerTasks} />
        </motion.div>
        <motion.div variants={riseUp}>
          <AIRecommendations
            examReadinessPct={examReadiness}
            weakSubject={weakSubject}
            targetExam={user?.targetExam || "JEE Prep"}
          />
        </motion.div>
      </div>

      {/* 7. Achievements & Productivity Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={riseUp}>
          <AchievementsWidget
            streak={streak}
            xp={xp}
            level={level}
            accuracy={accuracy}
          />
        </motion.div>
        <motion.div variants={riseUp}>
          <ProductivityWidget />
        </motion.div>
      </div>

      {/* 8. Leaderboard Widget */}
      <motion.div variants={riseUp}>
        <LeaderboardWidget user={user} friends={friends} />
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
