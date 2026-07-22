import { motion } from "motion/react";
import { Link } from "react-router";
import { Bot, Zap, BookOpen, Youtube, Calendar, BarChart3, ChevronRight } from "lucide-react";

const quickLinks = [
  { to: "/ai-tutor",  label: "AI Mentor",    desc: "24/7 Personal Tutor", icon: <Bot size={22} />,      grad: "from-indigo-500 to-violet-600", border: "hover:border-indigo-500/40" },
  { to: "/quiz",      label: "Quick Quiz",   desc: "Adaptive Tests",     icon: <Zap size={22} />,      grad: "from-amber-500 to-orange-500", border: "hover:border-amber-500/40"  },
  { to: "/study",     label: "Learning Hub", desc: "Interactive Content",icon: <BookOpen size={22} />, grad: "from-emerald-500 to-teal-500", border: "hover:border-emerald-500/40"},
  { to: "/youtube",   label: "Lectures",     desc: "Curated Videos",     icon: <Youtube size={22} />,  grad: "from-rose-500 to-pink-500",    border: "hover:border-rose-500/40"   },
  { to: "/planner",   label: "Planner",      desc: "Smart Timetable",    icon: <Calendar size={22} />, grad: "from-blue-500 to-cyan-500",    border: "hover:border-blue-500/40"   },
  { to: "/analytics", label: "Analytics",   desc: "Performance Insights",icon: <BarChart3 size={22} />,grad: "from-purple-500 to-fuchsia-500",border: "hover:border-purple-500/40"},
];

export function QuickAccessGrid() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Quick Access Hub
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {quickLinks.map((q) => (
          <motion.div
            key={q.to}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={q.to}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border/80 ${q.border} hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 group text-center h-full relative overflow-hidden`}
            >
              {/* Soft background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${q.grad} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                {q.icon}
              </div>

              <div>
                <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors leading-tight">
                  {q.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block mt-0.5 leading-tight">
                  {q.desc}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
