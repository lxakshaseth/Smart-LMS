import { motion } from "motion/react";
import { Sparkles, Brain, ArrowRight, ShieldCheck, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router";

interface AIRecommendationsProps {
  examReadinessPct?: number;
  weakSubject?: string;
}

export function AIRecommendations({ examReadinessPct = 85, weakSubject = "Organic Reactions" }: AIRecommendationsProps) {
  const recommendations = [
    {
      id: 1,
      icon: "🎯",
      title: "Review Weak Topic: Organic Chemistry",
      desc: "Your accuracy dropped to 58% on Reaction Mechanisms. Take a 10-min focused sprint.",
      action: "Start Practice",
      path: "/quiz",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      id: 2,
      icon: "💡",
      title: "Physics Problem Solving Tip",
      desc: "Practice Rotational Dynamics vector cross-products before tomorrow's mock test.",
      action: "Ask AI Mentor",
      path: "/ai-tutor",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

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
            <Sparkles size={18} className="text-violet-500 fill-violet-500" /> AI Recommendations
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-extrabold uppercase tracking-wider">
            Realtime Adaptive
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`p-4 rounded-2xl border ${rec.bg} transition-all`}>
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground">{rec.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium leading-relaxed">
                    {rec.desc}
                  </p>
                  <Link
                    to={rec.path}
                    className={`mt-2.5 inline-flex items-center gap-1 text-xs font-extrabold ${rec.color} hover:underline`}
                  >
                    {rec.action} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Readiness Section */}
      <div className="mt-5 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Exam Readiness Score
          </span>
          <span className="text-xs font-black text-emerald-500">{examReadinessPct}% On Track</span>
        </div>

        <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${examReadinessPct}%` }}
          />
        </div>

        <Link
          to="/analytics"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-all"
        >
          <Brain size={14} /> View Full AI Diagnostic Report
        </Link>
      </div>
    </motion.div>
  );
}
