import { useState } from "react";
import { motion } from "motion/react";
import { Award, Trophy, Star, CheckCircle2, Zap, Flame, Coins } from "lucide-react";

const badges = [
  { name: "Code Ninja", desc: "Solved 100+ coding problems", icon: "🥷", unlocked: true },
  { name: "Streak Master", desc: "14-day continuous daily coding streak", icon: "🔥", unlocked: true },
  { name: "Algorithm Architect", desc: "Mastered Dynamic Programming category", icon: "🏗️", unlocked: true },
  { name: "Contest Champion", desc: "Ranked in Top 10 in Weekly Contest", icon: "👑", unlocked: false },
  { name: "Bug Hunter", desc: "Used AI Debugger to fix 50 code bugs", icon: "🐛", unlocked: true }
];

export default function Achievements() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Award className="text-purple-400" size={20} />
          Gamification Badges, XP Points & Coins
        </h2>
        <p className="text-xs text-muted-foreground">Unlock rewards, earn developer coins, and complete daily & weekly milestones</p>
      </div>

      {/* Level Progress & Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Level Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-purple-300 uppercase tracking-wider">Level 18 Grandmaster</span>
            <span className="text-purple-400 font-mono">4,850 / 5,000 XP</span>
          </div>

          <div className="w-full h-3 rounded-full bg-purple-950/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-[97%]" />
          </div>

          <p className="text-xs text-muted-foreground">150 XP remaining to unlock <span className="text-foreground font-bold">Level 19 Code Titan</span></p>
        </div>

        {/* Coins Wallet */}
        <div className="p-6 rounded-3xl bg-card/80 border border-border shadow-xl space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">CodePilot Coins</span>
            <Coins size={24} className="text-amber-400" />
          </div>
          <div className="text-4xl font-black text-amber-400 font-mono">1,420 🪙</div>
          <p className="text-[11px] text-muted-foreground">Redeem for custom editor themes & interview passes</p>
        </div>

        {/* Goals Progress */}
        <div className="p-6 rounded-3xl bg-card/80 border border-border shadow-xl space-y-2 flex flex-col justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase">Daily Goal (3/3 Solved)</span>
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
            <CheckCircle2 size={18} /> Daily Goal Completed (+50 XP & +20 Coins)
          </div>
          <span className="text-[11px] text-muted-foreground">Resets at midnight</span>
        </div>

      </div>

      {/* Badges Showcase */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <h3 className="text-base font-bold text-foreground">Unlocked Achievements & Badges</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                b.unlocked
                  ? "bg-purple-500/10 border-purple-500/30 text-foreground"
                  : "bg-muted/30 border-border opacity-50 grayscale"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <div className="font-bold text-xs">{b.name}</div>
              <div className="text-[10px] text-muted-foreground">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
