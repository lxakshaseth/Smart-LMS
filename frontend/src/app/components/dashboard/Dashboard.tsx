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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: any }>("/analytics/overview");
        if (res.success && res.data) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        // Soft fallback — dashboard will gracefully display user context data
        console.warn("Analytics overview fetch fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const streak = analyticsData?.studyStreak ?? user?.streak ?? 7;
  const xp = analyticsData?.totalXP ?? user?.xp ?? 1450;
  const level = analyticsData?.level ?? user?.level ?? 5;
  const rank = analyticsData?.rank ?? "#3";
  const accuracy = analyticsData?.lastMockAccuracy ?? user?.accuracy ?? 84;
  const xpToday = analyticsData?.xpToday ?? 120;
  const subjectStats = analyticsData?.subjectStats || [];
  const weakSubject = analyticsData?.weakSubject || user?.weakSubject || "Organic Chemistry";
  const examReadiness = analyticsData?.examReadinessScore ?? 85;

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

      {/* 3. Quick Access Feature Cards */}
      <motion.div variants={riseUp}>
        <QuickAccessGrid />
      </motion.div>

      {/* 4. Responsive Performance Metric Cards */}
      <motion.div variants={riseUp}>
        <PerformanceStats
          streak={streak}
          accuracy={accuracy}
          xpToday={xpToday}
          rank={rank}
          weakSubject={weakSubject}
        />
      </motion.div>

      {/* 5. Learning Analytics & Subject Mastery Progress */}
      <motion.div variants={riseUp}>
        <AnalyticsChartSection subjectStats={subjectStats} />
      </motion.div>

      {/* 6. Today's Schedule & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={riseUp}>
          <ScheduleWidget />
        </motion.div>
        <motion.div variants={riseUp}>
          <AIRecommendations
            examReadinessPct={examReadiness}
            weakSubject={weakSubject}
          />
        </motion.div>
      </div>

      {/* 7. Achievements & Productivity Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={riseUp}>
          <AchievementsWidget />
        </motion.div>
        <motion.div variants={riseUp}>
          <ProductivityWidget />
        </motion.div>
      </div>

      {/* 8. Leaderboard Widget */}
      <motion.div variants={riseUp}>
        <LeaderboardWidget user={user} />
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
