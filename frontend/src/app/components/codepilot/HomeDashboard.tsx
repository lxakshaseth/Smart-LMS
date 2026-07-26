import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Flame, Zap, Trophy, ArrowRight, CheckCircle2, Clock, Star,
  TrendingUp, Code2, Brain, Sparkles, Calendar, Target, Award, Loader2
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { getAuthToken } from "../../lib/api";

interface HomeDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onSelectProblem: (problemId: string) => void;
}

export default function HomeDashboard({ onNavigateTab, onSelectProblem }: HomeDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
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
      console.error("Failed to load CodePilot user stats", err);
    } finally {
      setLoading(false);
    }
  };

  const totalSolved = stats?.totalSolved ?? 0;
  const streak = stats?.streak ?? 0;
  const globalRank = stats?.globalRank ?? "Unranked";
  const contestRating = stats?.contestRating ?? 1000;

  const skillRadarData = stats?.skillRadarData || [
    { subject: "Arrays", value: 0 },
    { subject: "Stack", value: 0 },
    { subject: "DP", value: 0 },
    { subject: "Trees", value: 0 },
    { subject: "Graphs", value: 0 },
    { subject: "Algorithms", value: 0 },
  ];

  const weeklyProgressData = stats?.weeklyProgressData || [
    { day: "Mon", solved: 0 },
    { day: "Tue", solved: 0 },
    { day: "Wed", solved: 0 },
    { day: "Thu", solved: 0 },
    { day: "Fri", solved: 0 },
    { day: "Sat", solved: 0 },
    { day: "Sun", solved: 0 },
  ];

  const recommendedProblems = stats?.recommendedProblems || [
    { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays & Hash", company: "Google", timeEst: "15 mins" },
    { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", company: "Amazon", timeEst: "15 mins" },
    { id: "max-subarray", title: "Maximum Subarray", difficulty: "Medium", topic: "Kadane's DP", company: "Microsoft", timeEst: "20 mins" },
  ];

  const recentlySolved = stats?.recentlySolved || [];

  return (
    <div className="space-y-8">

      {/* Top Banner & Daily Coding Challenge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Daily Challenge Card (Solid Deep Dark Gradient for Perfect Contrast in Light & Dark Mode) */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="xl:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 border border-purple-500/40 p-8 lg:p-10 shadow-2xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="fill-purple-400 text-purple-400" />
              Daily Coding Challenge
            </div>
            <span className="text-xs text-purple-300/80 flex items-center gap-1 font-mono">
              <Clock size={13} /> Resets Daily
            </span>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Two Sum & Target Complement Search
            </h2>
            <p className="text-sm lg:text-base text-purple-200/90 max-w-2xl leading-relaxed">
              Given an array of integers <code className="bg-purple-900/80 border border-purple-500/30 px-2.5 py-0.5 rounded-md text-purple-200 font-mono">nums</code> and an integer <code className="bg-purple-900/80 border border-purple-500/30 px-2.5 py-0.5 rounded-md text-purple-200 font-mono">target</code>, return indices of the two numbers such that they add up to target.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-purple-500/30">
            <div className="flex items-center gap-4">
              <span className="px-3.5 py-1 rounded-xl bg-green-500/20 text-green-400 font-bold text-xs border border-green-500/40">
                Easy
              </span>
              <span className="text-xs text-purple-200/80 font-medium">Acceptance: 49.8%</span>
              <span className="text-xs text-purple-300 font-bold">+20 XP</span>
            </div>

            <button
              onClick={() => onSelectProblem("two-sum")}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:brightness-110 transition-all"
            >
              Solve Challenge <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* Streak & Stats Card */}
        <div className="rounded-3xl bg-card/90 border border-border p-8 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Flame className="text-orange-500 fill-orange-500" size={20} />
              Coding Streak
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              streak > 0 ? "text-orange-400 bg-orange-500/10 border-orange-500/20" : "text-muted-foreground bg-muted border-border"
            }`}>
              {streak > 0 ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
              {streak} Days
            </div>
            <p className="text-xs text-muted-foreground mt-2">Stored in Database 🔥</p>
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Problems Solved</span>
              <span className="font-bold text-foreground">{totalSolved}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Global Rank</span>
              <span className="font-bold text-purple-400">{globalRank}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Contest Rating</span>
              <span className="font-bold text-blue-400">{contestRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended & Continue Learning Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* AI Recommended Problems */}
        <div className="xl:col-span-2 rounded-3xl bg-card/90 border border-border p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              AI Recommended Problems
            </h3>
            <button
              onClick={() => onNavigateTab("problems")}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              View All Problems →
            </button>
          </div>

          <div className="space-y-4">
            {recommendedProblems.map((p: any) => (
              <div
                key={p.id}
                onClick={() => onSelectProblem(p.id)}
                className="flex items-center justify-between p-5 rounded-2xl bg-muted/40 border border-border/60 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-foreground group-hover:text-purple-400 transition-colors">
                      {p.title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      p.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                      p.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.topic}</span>
                    <span>•</span>
                    <span className="text-purple-400/80 font-medium">Company: {p.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono">{p.timeEst}</span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning Course Progress */}
        <div className="rounded-3xl bg-card/90 border border-border p-8 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Code2 className="text-blue-400" size={20} />
              Continue Learning
            </h3>

            <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-purple-950 border border-purple-500/30 space-y-4 text-white">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-200">DSA & Algorithm Masterclass</span>
                <span className="text-purple-400">{totalSolved > 0 ? `${Math.min(100, totalSolved * 10)}% Completed` : "0% Completed"}</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-purple-950/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totalSolved * 10)}%` }}
                />
              </div>

              <p className="text-xs text-purple-200/80">
                Next Module: <span className="text-white font-medium">Graph Traversal (BFS & DFS Intuition)</span>
              </p>

              <button
                onClick={() => onNavigateTab("dsa")}
                className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all text-center"
              >
                Resume Course Module
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Upcoming Contest</span>
            <button
              onClick={() => onNavigateTab("contests")}
              className="text-purple-400 font-bold hover:underline"
            >
              Weekly Contest
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Skill Radar */}
        <div className="rounded-3xl bg-card/80 border border-border p-8 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Brain className="text-purple-400" size={20} />
            Skill Competency Radar
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={12} />
                <PolarRadiusAxis stroke="#4B5563" fontSize={11} />
                <Radar name="Proficiency" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Progress Line Chart */}
        <div className="rounded-3xl bg-card/80 border border-border p-8 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={20} />
            Weekly Solved Activity
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgressData}>
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "12px", color: "#fff" }}
                />
                <Line type="monotone" dataKey="solved" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: "#60A5FA" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recently Solved Feed */}
      <div className="rounded-3xl bg-card/80 border border-border p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="text-green-400" size={20} />
          Recently Solved Problems
        </h3>

        {recentlySolved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlySolved.map((item: any) => (
              <div
                key={item.id + item.time}
                onClick={() => onSelectProblem(item.id)}
                className="p-5 rounded-2xl bg-muted/30 border border-border hover:border-purple-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                    {item.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <h4 className="text-base font-bold text-foreground mb-1">{item.title}</h4>
                <span className="text-xs text-muted-foreground font-mono">Language: {item.lang}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground border border-dashed border-border/80 rounded-2xl">
            No problems solved yet. Pick a problem from recommended or problem list to start!
          </div>
        )}
      </div>

    </div>
  );
}

