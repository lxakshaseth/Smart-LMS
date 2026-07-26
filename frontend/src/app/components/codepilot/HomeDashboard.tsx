import { motion } from "motion/react";
import {
  Flame, Zap, Trophy, ArrowRight, CheckCircle2, Clock, Star,
  TrendingUp, Code2, Brain, Sparkles, Calendar, Target, Award
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface HomeDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onSelectProblem: (problemId: string) => void;
}

const skillRadarData = [
  { subject: "Arrays & Strings", value: 88 },
  { subject: "Trees & Graphs", value: 72 },
  { subject: "Dynamic Prog", value: 65 },
  { subject: "System Design", value: 80 },
  { subject: "Algorithms", value: 90 },
  { subject: "SQL & DB", value: 85 },
];

const weeklyProgressData = [
  { day: "Mon", solved: 4 },
  { day: "Tue", solved: 6 },
  { day: "Wed", solved: 3 },
  { day: "Thu", solved: 8 },
  { day: "Fri", solved: 5 },
  { day: "Sat", solved: 9 },
  { day: "Sun", solved: 7 },
];

const recommendedProblems = [
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays & Hash", company: "Google", timeEst: "15 mins" },
  { id: "max-subarray", title: "Maximum Subarray", difficulty: "Medium", topic: "Kadane's DP", company: "Amazon", timeEst: "20 mins" },
  { id: "lru-cache", title: "LRU Cache", difficulty: "Hard", topic: "Doubly Linked List", company: "Microsoft", timeEst: "35 mins" },
];

const recentlySolved = [
  { id: "valid-parentheses", title: "Valid Parentheses", time: "2 hours ago", status: "Accepted", lang: "Python" },
  { id: "binary-search", title: "Binary Search", time: "Yesterday", status: "Accepted", lang: "C++" },
  { id: "climbing-stairs", title: "Climbing Stairs", time: "2 days ago", status: "Accepted", lang: "Java" },
];

export default function HomeDashboard({ onNavigateTab, onSelectProblem }: HomeDashboardProps) {
  return (
    <div className="space-y-6">

      {/* Top Banner & Daily Coding Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Challenge Card (Glassmorphism & Gradient Accent) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 border border-purple-500/30 p-6 lg:p-8 shadow-xl flex flex-col justify-between backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="fill-purple-400" />
              Daily Coding Challenge
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Clock size={13} /> Resets in 14h 22m
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Two Sum & Target Complement Search
            </h2>
            <p className="text-sm text-purple-200/80 max-w-xl">
              Given an array of integers <code className="bg-purple-950/60 px-1.5 py-0.5 rounded text-purple-300">nums</code> and an integer <code className="bg-purple-950/60 px-1.5 py-0.5 rounded text-purple-300">target</code>, return indices of the two numbers such that they add up to target.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-500/20">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold text-xs border border-green-500/30">
                Easy
              </span>
              <span className="text-xs text-muted-foreground">Acceptance Rate: 49.8%</span>
              <span className="text-xs text-purple-300 font-semibold">+50 XP</span>
            </div>

            <button
              onClick={() => onSelectProblem("two-sum")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all"
            >
              Solve Challenge <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* Streak & Stats Card */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Flame className="text-orange-500 fill-orange-500" size={18} />
              Coding Streak
            </h3>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Active
            </span>
          </div>

          <div className="text-center py-4">
            <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
              14 Days
            </div>
            <p className="text-xs text-muted-foreground mt-1">Personal Best: 21 Days 🔥</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Problems Solved</span>
              <span className="font-bold text-foreground">128</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Global Rank</span>
              <span className="font-bold text-purple-400">#412</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Contest Rating</span>
              <span className="font-bold text-blue-400">1,784</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended & Continue Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Recommended Problems */}
        <div className="lg:col-span-2 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              AI Recommended Problems
            </h3>
            <button
              onClick={() => onNavigateTab("problems")}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              View All Problems →
            </button>
          </div>

          <div className="space-y-3">
            {recommendedProblems.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProblem(p.id)}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                      {p.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                    <span className="text-purple-400/80 font-medium">Tag: {p.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{p.timeEst}</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning Course Progress */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
              <Code2 className="text-blue-400" size={18} />
              Continue Learning
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-300">DSA & Algorithm Masterclass</span>
                <span className="text-purple-400">72% Completed</span>
              </div>

              <div className="w-full h-2 rounded-full bg-purple-950/80 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-[72%]" />
              </div>

              <p className="text-xs text-muted-foreground">
                Next Lesson: <span className="text-foreground font-medium">Graph Traversal (BFS & DFS Intuition)</span>
              </p>

              <button
                onClick={() => onNavigateTab("dsa")}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all text-center"
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
              Weekly Contest #142 (Sat 8 PM)
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skill Radar */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Brain className="text-purple-400" size={18} />
            Skill Competency Radar
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={11} />
                <PolarRadiusAxis stroke="#4B5563" fontSize={10} />
                <Radar name="Proficiency" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Progress Line Chart */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={18} />
            Weekly Solved Activity
          </h3>
          <div className="h-64 w-full">
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
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="text-green-400" size={18} />
          Recently Solved Problems
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentlySolved.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProblem(item.id)}
              className="p-4 rounded-2xl bg-muted/30 border border-border hover:border-purple-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  {item.status}
                </span>
                <span className="text-[11px] text-muted-foreground">{item.time}</span>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">{item.title}</h4>
              <span className="text-xs text-muted-foreground font-mono">Language: {item.lang}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
