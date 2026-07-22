import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { getGreeting } from "../../lib/greeting";
import { getCurrentTargetExam } from "../../lib/targetExam";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { Link } from "react-router";
import {
  Flame, Zap, Target, Trophy, Star, BookOpen, Brain, Play,
  TrendingUp, CheckCircle2, Clock, ChevronRight, Sparkles,
  ArrowUpRight, Circle, BarChart3, Calendar, Youtube, Bot,
} from "lucide-react";

/* ─── data ─── */
const weekData = [
  { day: "Mon", xp: 0, target: 300 },
  { day: "Tue", xp: 0, target: 300 },
  { day: "Wed", xp: 0, target: 300 },
  { day: "Thu", xp: 0, target: 300 },
  { day: "Fri", xp: 0, target: 300 },
  { day: "Sat", xp: 0, target: 300 },
  { day: "Sun", xp: 0, target: 300 },
];

const subjects: { name: string; pct: number; color: string; icon: string; topics: number; done: number }[] = [];
const todayPlan:  { time: string; subject: string; topic: string; done: boolean; dur: string }[] = [];
const leaderboard: { rank: number; name: string; xp: number; avatar: string; badge: string; me?: boolean }[] = [];
const achievements: { icon: string; label: string; desc: string; color: string; border: string }[] = [];
const aiInsights:  { icon: string; text: string; action: string; color: string; bg: string }[] = [];

const quickLinks = [
  { to: "/ai-tutor", label: "AI Mentor",    icon: <Bot size={20} />,      grad: "from-indigo-500 to-violet-600" },
  { to: "/quiz",     label: "Quick Quiz",  icon: <Zap size={20} />,      grad: "from-amber-500 to-orange-500" },
  { to: "/study",    label: "Study Mode",  icon: <BookOpen size={20} />, grad: "from-green-500 to-teal-500"   },
  { to: "/youtube",  label: "Lectures",    icon: <Youtube size={20} />,  grad: "from-rose-500 to-pink-500"    },
  { to: "/planner",  label: "Planner",     icon: <Calendar size={20} />, grad: "from-blue-500 to-cyan-500"    },
  { to: "/analytics",label: "Analytics",  icon: <BarChart3 size={20} />, grad: "from-purple-500 to-fuchsia-500"},
];

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const rise    = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

/* ─── circular ring ─── */
function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/30" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

/* ─── stat pill ─── */
function StatCard({ icon, label, value, sub, grad, iconBg }: {
  icon: React.ReactNode; label: string; value: string; sub: string; grad: string; iconBg: string;
}) {
  return (
    <motion.div variants={rise}
      className={`relative overflow-hidden rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${grad} cursor-pointer group hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>{icon}</div>
        <ArrowUpRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
      </div>
      <p className="text-xs text-white/60 mb-0.5">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-white/50 mt-1 flex items-center gap-1"><TrendingUp size={11} />{sub}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const greetingData = getGreeting(user?.fullName);

  const [tab, setTab] = useState<"week"|"month">("week");
  const completedToday = todayPlan.filter(t => t.done).length;
  const xpToday = 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="min-h-screen bg-background">

      {/* ── hero banner ── */}
      <motion.div variants={rise}
        className="relative overflow-hidden mx-6 mt-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-7 shadow-2xl shadow-indigo-900/40">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Target Exam: 🎯 {getCurrentTargetExam(user)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {greetingData.formattedGreeting}
            </h1>
            <p className="text-white/80 mt-1.5 text-sm font-medium">
              {greetingData.subtitle}
            </p>
            {/* streak row */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2">
                <Flame size={18} className="text-orange-400" />
                <span className="text-white font-bold">0</span>
                <span className="text-white/70 text-xs">day streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2">
                <Zap size={18} className="text-yellow-300" />
                <span className="text-white font-bold">0</span>
                <span className="text-white/70 text-xs">XP total</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2">
                <Trophy size={18} className="text-amber-300" />
                <span className="text-white font-bold">—</span>
                <span className="text-white/70 text-xs">rank</span>
              </div>
            </div>
          </div>

          {/* level ring */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="absolute inset-0 -rotate-90 w-full h-full">
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="8"
                  strokeDasharray={`${(650/1200)*301.6} 301.6`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">1</span>
                <span className="text-white/60 text-xs">Level</span>
              </div>
            </div>
            <p className="text-white/60 text-xs mt-1.5">300 XP to level 2</p>
            <div className="w-28 mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-6 space-y-6">

        {/* ── quick access ── */}
        <motion.div variants={rise}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Access</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickLinks.map(q => (
              <Link key={q.to} to={q.to}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group cursor-pointer">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${q.grad} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {q.icon}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{q.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── stat cards ── */}
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Flame size={22} className="text-orange-300" />} label="Study Streak"
            value="0 Days" sub="Start studying today"
            grad="from-orange-600/80 to-amber-600/60" iconBg="bg-white/20" />
          <StatCard icon={<Target size={22} className="text-green-300" />} label="Accuracy"
            value="—" sub="No quizzes yet"
            grad="from-green-600/80 to-teal-600/60" iconBg="bg-white/20" />
          <StatCard icon={<Zap size={22} className="text-yellow-300" />} label="XP Today"
            value="0" sub="Earn XP by studying"
            grad="from-indigo-600/80 to-violet-600/60" iconBg="bg-white/20" />
          <StatCard icon={<Trophy size={22} className="text-amber-300" />} label="Class Rank"
            value="—" sub="Complete quizzes to rank"
            grad="from-rose-600/80 to-pink-600/60" iconBg="bg-white/20" />
        </motion.div>

        {/* ── main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* left: chart */}
          <motion.div variants={rise} className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">Weekly XP Progress</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daily experience points earned</p>
              </div>
              <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                {(["week","month"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                    {t === "week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.12)" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#22C55E" strokeWidth={1.5}
                  strokeDasharray="4 4" fill="none" dot={false} />
                <Area type="monotone" dataKey="xp" stroke="#6366F1" strokeWidth={2.5}
                  fill="url(#xpGrad)" dot={{ fill: "#6366F1", r: 4, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-4 h-0.5 bg-indigo-500 rounded inline-block" /> XP Earned
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-4 h-0 border-t-2 border-dashed border-green-500 inline-block" /> Daily Target
              </span>
            </div>
          </motion.div>

          {/* right: leaderboard */}
          <motion.div variants={rise} className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Leaderboard</h3>
              <span className="text-xs text-muted-foreground">This week</span>
            </div>
            <div className="space-y-2.5">
              {leaderboard.map(p => (
                <div key={p.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${p.me ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}>
                  <span className="text-lg w-6 text-center">{p.badge || <span className="text-muted-foreground text-sm">{p.rank}</span>}</span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                    ${p.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : p.rank === 2 ? "bg-gradient-to-br from-slate-400 to-slate-500"
                    : p.rank === 3 ? "bg-gradient-to-br from-amber-600 to-yellow-700"
                    : "bg-gradient-to-br from-indigo-500 to-violet-500"}`}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${p.me ? "text-primary" : ""}`}>
                      {p.name}{p.me && <span className="ml-1 text-xs text-primary">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/analytics" className="flex items-center justify-center gap-1 mt-4 text-xs text-primary hover:underline font-medium">
              Full Rankings <ChevronRight size={13} />
            </Link>
          </motion.div>
        </div>

        {/* ── subject mastery + today's plan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* subject mastery */}
          <motion.div variants={rise} className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Subject Mastery</h3>
              <Link to="/analytics" className="text-xs text-primary flex items-center gap-1 hover:underline">
                Details <ChevronRight size={13} />
              </Link>
            </div>
            <div className="space-y-4">
              {subjects.map(s => (
                <div key={s.name} className="flex items-center gap-4 group">
                  <div className="relative flex-shrink-0">
                    <Ring pct={s.pct} color={s.color} size={56} />
                    <span className="absolute inset-0 flex items-center justify-center text-lg">{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold">{s.name}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.done}/{s.topics} topics completed</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* today's plan */}
          <motion.div variants={rise} className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">Today's Schedule</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{completedToday}/{todayPlan.length} sessions done</p>
              </div>
              <Link to="/planner"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                <Calendar size={13} /> View Planner
              </Link>
            </div>

            {/* progress bar */}
            <div className="mb-5">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${(completedToday / todayPlan.length) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-2.5">
              {todayPlan.map((t, i) => (
                <div key={i}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl transition-all cursor-pointer
                    ${t.done ? "bg-muted/40 opacity-70" : "bg-muted/20 hover:bg-muted/50 border border-border hover:border-primary/30"}`}>
                  {t.done
                    ? <CheckCircle2 size={22} className="text-green-500 flex-shrink-0" />
                    : <Circle size={22} className="text-muted-foreground/50 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.topic}</p>
                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-muted-foreground">{t.time}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                      <Clock size={10} />{t.dur}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── achievements + AI insights ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* achievements */}
          <motion.div variants={rise} className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold flex items-center gap-2"><Star size={18} className="text-amber-400" /> Recent Achievements</h3>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">4 earned</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map(a => (
                <div key={a.label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${a.color} border ${a.border} hover:scale-[1.03] transition-transform cursor-pointer`}>
                  <span className="text-3xl">{a.icon}</span>
                  <p className="text-sm font-bold text-center leading-tight">{a.label}</p>
                  <p className="text-xs text-muted-foreground text-center leading-tight">{a.desc}</p>
                </div>
              ))}
            </div>

            {/* daily goal summary */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Play size={20} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Continue: Organic Reactions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Chemistry · 35 min remaining · Last left at Nucleophilic Substitution</p>
              </div>
              <Link to="/study"
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
                Resume
              </Link>
            </div>
          </motion.div>

          {/* AI insights */}
          <motion.div variants={rise} className="rounded-2xl bg-card border border-border p-6">
            <h3 className="font-bold flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-violet-400" /> AI Insights
            </h3>
            <div className="space-y-3">
              {aiInsights.map((ins, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${ins.bg}`}>
                  <p className="text-sm leading-snug mb-2">
                    <span className="mr-1">{ins.icon}</span>{ins.text}
                  </p>
                  <button className={`text-xs font-semibold flex items-center gap-1 ${ins.color} hover:underline`}>
                    {ins.action} <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Exam Readiness</p>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Ring pct={85} color="#22C55E" size={56} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-500">85%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-500">On Track</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JEE Main readiness score</p>
                </div>
              </div>
            </div>

            <Link to="/analytics"
              className="flex items-center justify-center gap-1.5 mt-4 w-full py-2.5 rounded-xl bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-colors">
              <Brain size={15} /> Full AI Report
            </Link>
          </motion.div>
        </div>

        <div className="h-4" />
      </div>
    </motion.div>
  );
}
