import { motion } from "motion/react";
import { Star, Award, Zap, Flame, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

interface AchievementsWidgetProps {
  streak?: number;
  xp?: number;
  level?: number;
  accuracy?: number;
}

export function AchievementsWidget({ streak = 0, xp = 0, level = 1, accuracy = 0 }: AchievementsWidgetProps) {
  const achievements = [
    {
      id: "streak",
      icon: "🔥",
      label: streak > 0 ? `${streak}-Day Streak` : "Streak Novice",
      desc: streak > 0 ? "Daily Momentum" : "Complete a session today",
      unlocked: streak > 0,
      color: "from-orange-500/10 to-amber-500/10",
      border: "border-orange-500/20",
    },
    {
      id: "xp",
      label: xp >= 500 ? "XP Scholar" : "XP Apprentice",
      icon: "⚡",
      desc: xp >= 500 ? "500+ XP Achieved" : "Earn 500 XP to unlock",
      unlocked: xp >= 500,
      color: "from-indigo-500/10 to-purple-500/10",
      border: "border-indigo-500/20",
    },
    {
      id: "level",
      icon: "🏅",
      label: `Level ${level} Pioneer`,
      desc: `Rank Level ${level}`,
      unlocked: true,
      color: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/20",
    },
    {
      id: "accuracy",
      icon: "🎯",
      label: accuracy >= 70 ? "Precision Master" : "Quiz Explorer",
      desc: accuracy >= 70 ? `${accuracy}% Quiz Accuracy` : "Reach 70%+ accuracy",
      unlocked: accuracy >= 70,
      color: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-500/20",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
            <Star size={18} className="text-amber-400 fill-amber-400" /> Milestone Achievements
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-extrabold">
            {unlockedCount} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br ${a.color} border ${a.border} ${
                a.unlocked ? "opacity-100 hover:scale-105" : "opacity-50 grayscale"
              } transition-all duration-200 cursor-pointer text-center`}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-bold text-foreground leading-tight">{a.label}</p>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 text-center">
        <Link to="/analytics" className="text-xs font-bold text-primary hover:underline">
          View Badges & Milestone Certificates →
        </Link>
      </div>
    </motion.div>
  );
}
