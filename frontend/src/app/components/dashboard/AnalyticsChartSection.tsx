import { useState } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight, BarChart2, BookOpen, Layers, Plus } from "lucide-react";
import { Link } from "react-router";

const defaultEmptyWeek = [
  { day: "Mon", xp: 0, target: 300 },
  { day: "Tue", xp: 0, target: 300 },
  { day: "Wed", xp: 0, target: 300 },
  { day: "Thu", xp: 0, target: 300 },
  { day: "Fri", xp: 0, target: 300 },
  { day: "Sat", xp: 0, target: 300 },
  { day: "Sun", xp: 0, target: 300 },
];

const defaultEmptyMonth = [
  { day: "W1", xp: 0, target: 2100 },
  { day: "W2", xp: 0, target: 2100 },
  { day: "W3", xp: 0, target: 2100 },
  { day: "W4", xp: 0, target: 2100 },
];

function Ring({ pct, color, size = 50 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/20" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

interface AnalyticsChartSectionProps {
  subjectStats?: any[];
  weeklyAccuracyTrend?: any[];
  totalXP?: number;
}

export function AnalyticsChartSection({ subjectStats = [], weeklyAccuracyTrend = [], totalXP = 0 }: AnalyticsChartSectionProps) {
  const [tab, setTab] = useState<"week" | "month">("week");

  // Format real trend data if available, otherwise flatline at 0 XP
  const hasRealTrend = Array.isArray(weeklyAccuracyTrend) && weeklyAccuracyTrend.length > 0;
  
  const chartData = tab === "week"
    ? (hasRealTrend
        ? weeklyAccuracyTrend.map((item, idx) => ({
            day: item.day || item.label || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][idx % 7],
            xp: item.xp ?? item.accuracy ?? 0,
            target: 300,
          }))
        : defaultEmptyWeek)
    : defaultEmptyMonth;

  const subjects = subjectStats.map((s, idx) => ({
    name: s.subject || s.name || `Subject ${idx + 1}`,
    pct: s.mastery || s.pct || 0,
    color: ["#5B5CEB", "#36CFC9", "#7C6BFF", "#F59E0B"][idx % 4],
    icon: ["⚛️", "🧪", "📐", "🧬"][idx % 4],
    topics: s.totalTopics || 0,
    done: s.completedTopics || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* ── Left Column: Recharts XP Trend Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-2 rounded-3xl bg-card border border-border/80 p-6 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <BarChart2 size={18} className="text-primary" /> Learning Analytics & XP Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Track experience points earned versus daily goal targets
            </p>
          </div>

          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
            {(["week", "month"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B5CEB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#5B5CEB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.12)" />
              <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#5B5CEB"
                strokeWidth={3}
                fill="url(#xpGrad)"
                dot={{ fill: "#5B5CEB", r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <span className="w-3.5 h-1 bg-indigo-500 rounded-full inline-block" /> XP Earned
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <span className="w-3.5 h-0 border-t-2 border-dashed border-emerald-500 inline-block" /> Target Baseline
            </span>
          </div>

          <Link to="/analytics" className="text-primary font-bold hover:underline flex items-center gap-1">
            Detailed Analytics <ChevronRight size={13} />
          </Link>
        </div>
      </motion.div>

      {/* ── Right Column: Subject Mastery Progress ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layers size={18} className="text-indigo-500" /> Subject Mastery
          </h3>
          <Link to="/analytics" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
            View All <ChevronRight size={13} />
          </Link>
        </div>

        {subjects.length > 0 ? (
          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-muted/40 transition-colors">
                <div className="relative flex-shrink-0">
                  <Ring pct={s.pct} color={s.color} size={50} />
                  <span className="absolute inset-0 flex items-center justify-center text-sm">{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{s.name}</span>
                    <span className="text-xs font-black" style={{ color: s.color }}>
                      {s.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1">
                    {s.done}/{s.topics} topics mastered
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-border/80 text-center space-y-2 my-auto bg-muted/20">
            <Layers size={28} className="mx-auto text-muted-foreground/60" />
            <p className="text-xs font-bold text-foreground">No subject mastery data yet</p>
            <p className="text-[11px] text-muted-foreground font-medium max-w-xs mx-auto">
              Complete practice tests or study modules to generate mastery scores.
            </p>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-1 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
            >
              <Plus size={14} /> Start Quiz
            </Link>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border/60 text-center">
          <Link
            to="/study"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <BookOpen size={13} /> Explore Learning Hub Courses
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
