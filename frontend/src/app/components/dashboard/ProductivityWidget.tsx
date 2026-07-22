import { motion } from "motion/react";
import { Timer, Play, Clock, Flame, CheckSquare } from "lucide-react";
import { Link } from "react-router";

export function ProductivityWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Timer size={18} className="text-cyan-500" /> Focus & Productivity
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">Pomodoro Mode</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
              25m
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Deep Focus Sprint</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                25 min study · 5 min break
              </p>
            </div>
          </div>

          <Link
            to="/focus"
            className="px-3.5 py-2 rounded-xl bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Play size={12} className="fill-white" /> Start Timer
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
        <Link to="/focus" className="hover:underline flex items-center gap-1">
          Open Focus Timer Room →
        </Link>
      </div>
    </motion.div>
  );
}
