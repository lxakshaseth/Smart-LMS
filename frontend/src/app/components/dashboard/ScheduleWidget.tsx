import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Clock, Calendar, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  topic: string;
  done: boolean;
  dur: string;
}

const initialSchedule: ScheduleItem[] = [
  { id: "1", time: "09:00 AM", subject: "Physics", topic: "Rotational Motion & Torque Practice", done: true, dur: "45m" },
  { id: "2", time: "11:30 AM", subject: "Chemistry", topic: "Organic Reactions & Mechanisms", done: true, dur: "60m" },
  { id: "3", time: "02:15 PM", subject: "Mathematics", topic: "Definite Integration & Areas", done: false, dur: "50m" },
  { id: "4", time: "05:00 PM", subject: "AI Quiz", topic: "Adaptive Full Syllabus Mock Sprint", done: false, dur: "30m" },
];

export function ScheduleWidget() {
  const [tasks, setTasks] = useState<ScheduleItem[]>(initialSchedule);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Today's Learning Schedule
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {completedCount} of {totalCount} tasks completed ({progressPct}%)
          </p>
        </div>

        <Link
          to="/planner"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          <Calendar size={13} /> Full Planner
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Checklist List */}
      <div className="space-y-2.5">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              t.done
                ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground"
                : "bg-muted/20 border-border/70 hover:border-primary/40 hover:bg-muted/50 text-foreground"
            }`}
          >
            {t.done ? (
              <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-muted-foreground/60 flex-shrink-0 hover:text-primary transition-colors" />
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${t.done ? "line-through text-muted-foreground" : ""}`}>
                {t.topic}
              </p>
              <span className="text-[11px] font-semibold text-primary/80">{t.subject}</span>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-foreground">{t.time}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5 font-medium">
                <Clock size={10} /> {t.dur}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
        <Link to="/planner" className="hover:underline flex items-center gap-1">
          + Add New Goal to Timetable
        </Link>
        <Link to="/planner" className="hover:underline flex items-center gap-0.5">
          View Calendar <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
