import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Award, Target, Flame, Loader2, RotateCcw } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Analytics() {
  const { user } = useAuth();
  const targetExam = getCurrentTargetExam(user);

  const [progressData, setProgressData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [progRes, analRes] = await Promise.allSettled([
        apiRequest<{ success: boolean; data: any }>("/progress"),
        apiRequest<{ success: boolean; data: any }>("/analytics/overview"),
      ]);

      if (progRes.status === "fulfilled" && progRes.value?.success) {
        setProgressData(progRes.value.data);
      }
      if (analRes.status === "fulfilled" && analRes.value?.success) {
        setAnalyticsData(analRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleResetProgress = async () => {
    if (!window.confirm("Are you sure you want to reset your XP and activity data to 0?")) return;
    try {
      setLoading(true);
      await apiRequest("/progress/reset", { method: "POST" });
      setProgressData({
        xp: 0,
        streak: 0,
        rank: "Beginner",
        totalQuestions: 0,
        totalNotes: 0,
        totalQuizzes: 0,
        totalStudyHours: 0,
        accuracy: 0,
        readiness: 0,
        weakSubject: "None",
        weeklyActivity: days.map(d => ({ day: d, xp: 0, questions: 0, notes: 0, quizzes: 0, studyHours: 0 })),
        accuracyHistory: [],
        heatmapData: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ],
        subjectStats: []
      });
      setAnalyticsData({
        examData: {
          examReadinessIndex: 0,
          readinessStatus: "Not Started",
          focusArea: "None"
        }
      });
      await loadAnalytics();
    } catch (err) {
      console.error("Failed to reset progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-muted";
    if (value < 1) return "bg-secondary/20";
    if (value < 2) return "bg-secondary/40";
    if (value < 4) return "bg-secondary/60";
    if (value < 6) return "bg-secondary/80";
    return "bg-secondary";
  };

  // Extract live metrics strictly from backend (handling 0 values correctly with nullish operators)
  const streak = progressData?.streak ?? user?.streak ?? 0;
  const rank = progressData?.rank ?? user?.rank ?? "Beginner";

  const overallReadiness = typeof progressData?.readiness === "number"
    ? progressData.readiness
    : (typeof analyticsData?.examData?.examReadinessIndex === "number" ? analyticsData.examData.examReadinessIndex : 0);

  const totalStudyHours = typeof progressData?.totalStudyHours === "number"
    ? progressData.totalStudyHours
    : 0;

  const totalQuestions = typeof progressData?.totalQuestions === "number"
    ? progressData.totalQuestions
    : 0;

  const rawWeak = progressData?.weakSubject || analyticsData?.examData?.focusArea;
  const weakSubject = (rawWeak && !["None", "All Subjects Good", "Not Available", "-"].includes(rawWeak))
    ? rawWeak
    : "None";

  // Derive Weekly XP chart from backend activity
  const xpChartData = progressData?.weeklyActivity?.length
    ? progressData.weeklyActivity.map((wa: any) => ({
        day: wa.day || "Day",
        xp: wa.xp || wa.xpEarned || 0,
      }))
    : days.map((d) => ({ day: d, xp: 0 }));

  // Derive Accuracy Trend chart from backend
  const accuracyData = progressData?.accuracyHistory?.length
    ? progressData.accuracyHistory
    : [{ week: "Current", accuracy: progressData?.accuracy || 0 }];

  // Derive Subject Readiness chart from backend
  const readinessChartData = progressData?.subjectStats?.length
    ? progressData.subjectStats.map((st: any, idx: number) => {
        const colors = ["#6366F1", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#3B82F6"];
        return {
          subject: st.subject,
          score: st.mastery || 0,
          fill: colors[idx % colors.length],
        };
      })
    : [];

  // Derive Heatmap Data (4 weeks matrix) from backend
  const heatmapData = progressData?.heatmapData?.length
    ? progressData.heatmapData
    : [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span>Loading progress metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-muted-foreground mt-1">Track your progress and performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1.5">
            🎯 Target Exam: <span className="underline">{targetExam}</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1">
            <Flame size={14} /> {streak} Day Streak ({rank})
          </span>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Reset Activity & XP Data"
          >
            <RotateCcw size={12} /> Reset Data
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Readiness</p>
              <h3 className="text-3xl font-bold mt-1">{overallReadiness}%</h3>
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> Target Exam Readiness
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Award className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Study Hours</p>
              <h3 className="text-3xl font-bold mt-1">{totalStudyHours}h</h3>
              <p className="text-xs text-muted-foreground mt-1">Logged study time</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="text-secondary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Questions Solved</p>
              <h3 className="text-3xl font-bold mt-1">{totalQuestions}</h3>
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> Total Practice Solved
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Focus Area</p>
              <h3 className="text-xl font-bold mt-1 truncate max-w-[140px]" title={weakSubject}>
                {weakSubject}
              </h3>
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <TrendingDown size={12} /> Attention Needed
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Accuracy & XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip
                cursor={{ stroke: "rgba(99, 102, 241, 0.15)", strokeWidth: 2, strokeDasharray: "4 4" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ fill: "#22C55E", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Weekly XP</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={xpChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <Bar dataKey="xp" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Heatmap & Subject Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Study Consistency Heatmap</h3>
          <div className="space-y-2">
            {heatmapData.map((week: number[], weekIdx: number) => (
              <div key={weekIdx} className="flex gap-2">
                {week.map((dayHours: number, dayIdx: number) => (
                  <div
                    key={dayIdx}
                    className={`flex-1 h-12 rounded-lg ${getHeatmapColor(
                      dayHours
                    )} flex items-center justify-center text-xs transition-all hover:scale-105 cursor-pointer`}
                    title={`${days[dayIdx]}: ${dayHours} hours`}
                  >
                    {dayHours}h
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between text-xs text-muted-foreground mt-4">
              {days.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Readiness Score by Subject</h3>
          {readinessChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                innerRadius="20%"
                outerRadius="90%"
                data={readinessChartData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="score" />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border/80 rounded-xl p-4 text-center">
              No subject stats recorded yet. Take mock tests or practice questions to view subject readiness!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
