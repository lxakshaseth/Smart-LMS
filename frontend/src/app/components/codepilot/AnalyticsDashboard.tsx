import { useState } from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, Calendar, Zap, PieChart as PieIcon, Flame, Target } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";

const diffData = [
  { name: "Easy", value: 65, color: "#10B981" },
  { name: "Medium", value: 48, color: "#F59E0B" },
  { name: "Hard", value: 15, color: "#EF4444" }
];

const langData = [
  { name: "JavaScript / TS", value: 45, color: "#8B5CF6" },
  { name: "Python", value: 30, color: "#3B82F6" },
  { name: "C++", value: 25, color: "#EC4899" }
];

const monthlyProgressData = [
  { month: "Jan", solved: 18 },
  { month: "Feb", solved: 24 },
  { month: "Mar", solved: 32 },
  { month: "Apr", solved: 28 },
  { month: "May", solved: 40 },
  { month: "Jun", solved: 55 }
];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={20} />
          CodePilot Personal Analytics Suite
        </h2>
        <p className="text-xs text-muted-foreground">Comprehensive performance metrics, difficulty distribution & activity heatmap</p>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Solved</span>
          <div className="text-3xl font-black text-foreground">128</div>
          <span className="text-[10px] text-green-400 font-semibold">+14 this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Submission Accuracy</span>
          <div className="text-3xl font-black text-green-400">84.2%</div>
          <span className="text-[10px] text-muted-foreground">First try pass rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Contest Rating</span>
          <div className="text-3xl font-black text-purple-400">1,784</div>
          <span className="text-[10px] text-purple-300 font-semibold">Knight Tier</span>
        </div>

        <div className="p-5 rounded-2xl bg-card/80 border border-border space-y-1 shadow-lg backdrop-blur-xl">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Active Streak</span>
          <div className="text-3xl font-black text-orange-400 flex items-center gap-1">
            14 <Flame size={24} className="fill-orange-400 text-orange-400" />
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
                  {diffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold text-muted-foreground">
            <span className="text-green-400">Easy: 65</span>
            <span className="text-yellow-400">Medium: 48</span>
            <span className="text-red-400">Hard: 15</span>
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
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "12px" }} />
                <Bar dataKey="solved" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
