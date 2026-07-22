import { motion } from "motion/react";
import { Flame, Zap, Trophy, Target, Sparkles, ArrowRight, Play, BookOpen, Bot } from "lucide-react";
import { getGreeting } from "../../lib/greeting";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { Link } from "react-router";

interface HeroBannerProps {
  user: any;
  streak: number;
  xp: number;
  level: number;
  rank: string;
  onContinueClick?: () => void;
}

export function HeroBanner({ user, streak, xp, level, rank }: HeroBannerProps) {
  const greetingData = getGreeting(user?.fullName);
  const targetExam = getCurrentTargetExam(user);

  // Level progress calculation (e.g., 300 XP per level)
  const xpInCurrentLevel = xp % 300;
  const xpNeeded = 300;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 shadow-2xl shadow-indigo-900/30 text-white"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-400/20 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Greeting & Action Buttons */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Target Exam: 🎯 {targetExam}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold flex items-center gap-1 backdrop-blur-md border border-amber-300/30">
              <Sparkles size={13} className="text-amber-300 fill-amber-300" /> AI Adaptive Track
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {greetingData.formattedGreeting}
            </h1>
            <p className="text-white/85 text-xs md:text-sm font-medium mt-1 leading-relaxed">
              {greetingData.subtitle}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2">
              <Flame size={18} className="text-orange-400 fill-orange-400 animate-bounce" />
              <div>
                <span className="text-sm font-black">{streak}</span>
                <span className="text-white/70 text-[11px] font-medium ml-1">Day Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2">
              <Zap size={18} className="text-amber-300 fill-amber-300" />
              <div>
                <span className="text-sm font-black">{xp.toLocaleString()}</span>
                <span className="text-white/70 text-[11px] font-medium ml-1">Total XP</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2">
              <Trophy size={18} className="text-yellow-300 fill-yellow-300" />
              <div>
                <span className="text-sm font-black">{rank}</span>
                <span className="text-white/70 text-[11px] font-medium ml-1">Rank</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/study"
              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs shadow-lg shadow-black/10 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Play size={14} className="fill-indigo-700" /> Continue Learning
            </Link>
            <Link
              to="/planner"
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all"
            >
              <BookOpen size={14} /> Study Plan
            </Link>
            <Link
              to="/ai-tutor"
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all"
            >
              <Bot size={14} /> Ask AI Mentor
            </Link>
          </div>
        </div>

        {/* Right Column: Level Ring & Floating AI Mascot */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-3xl self-center lg:self-auto min-w-[200px]">
          
          {/* Level Circular Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="8"
                strokeDasharray={`${(levelProgressPct / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{level}</span>
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Level</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-white/90">
              {xpNeeded - xpInCurrentLevel} XP to Level {level + 1}
            </p>
            <div className="w-32 h-2 bg-white/20 rounded-full mt-1.5 overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
