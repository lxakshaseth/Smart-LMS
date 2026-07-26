import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, Calendar, Zap, PieChart as PieIcon, Flame, Target, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";
import { getAuthToken } from "../../lib/api";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsStats();
  }, []);

  const fetchAnalyticsStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/user-stats", { headers });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load analytics stats", err);
    } finally {
      setLoading(false);
    }
  };

  const totalSolved = stats?.totalSolved ?? 0;
  const streak = stats?.streak ?? 0;
  const contestRating = stats?.contestRating ?? 1000;
  const rank = stats?.globalRank ?? "Unranked";

  const diffData = stats?.diffData || [
    { name: "Easy", value: 0, color: "#10B981" },
    { name: "Medium", value: 0, color: "#F59E0B" },
    { name: "Hard", value: 0, color: "#EF4444" }
  ];

  const easyCount = diffData.find((d: any) => d.name === "Easy")?.value || 0;
  const mediumCount = diffData.find((d: any) => d.name === "Medium")?.value || 0;
  const hardCount = diffData.find((d: any) => d.name === "Hard")?.value || 0;

  const monthlyProgressData = stats?.monthlyProgressData || [
    { month: "Jan", solved: 0 },
    { month: "Feb", solved: 0 },
    { month: "Mar", solved: 0 },
    { month: "Apr", solved: 0 },
    { month: "May", solved: 0 },
    { month: "Jun", solved: 0 }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={20} />
          CodePilot Personal Analytics Suite
        </h2>
        <p className="text-xs text-muted-foreground">Comprehensive performance metrics, difficulty distribution & activity heatmap (Stored in MongoDB)</p>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Solved</span>
          <div className="text-3xl font-black text-foreground">{totalSolved}</div>
          <span className="text-[10px] text-green-400 font-semibold">MongoDB Record</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Global Rank</span>
          <div className="text-3xl font-black text-green-400">{rank}</div>
          <span className="text-[10px] text-muted-foreground">XP Leaderboard</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Contest Rating</span>
          <div className="text-3xl font-black text-purple-400">{contestRating}</div>
          <span className="text-[10px] text-purple-300 font-semibold">{contestRating >= 1500 ? "Knight Tier" : "Coder Tier"}</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Active Streak</span>
          <div className="text-3xl font-black text-orange-400 flex items-center gap-1">
            {streak} <Flame size={24} className="fill-orange-400 text-orange-400" />
          </div>
          <span className="text-[10px] text-muted-foreground">Days active</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Difficulty Distribution Pie Chart */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <h3 className="text-base font-bold text-foreground">Difficulty Distribution</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diffData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {diffData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "12px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold text-muted-foreground">
            <span className="text-green-400">Easy: {easyCount}</span>
            <span className="text-yellow-400">Medium: {mediumCount}</span>
            <span className="text-red-400">Hard: {hardCount}</span>
          </div>
        </div>

        {/* Monthly Solved Growth Line Chart */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <h3 className="text-base font-bold text-foreground">Monthly Problem Solving Velocity</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProgressData}>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="solved" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

