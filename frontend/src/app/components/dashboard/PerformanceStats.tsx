import { motion } from "motion/react";
import { Flame, Target, Zap, Trophy, Clock, CheckCircle2, BookOpen, AlertCircle, TrendingUp } from "lucide-react";

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  subText: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

interface PerformanceStatsProps {
  streak: number;
  accuracy: number;
  xpToday: number;
  rank: string;
  avgStudyTime?: string;
  questionsSolved?: number;
  coursesCompleted?: number;
  weakSubject?: string;
}

export function PerformanceStats({
  streak,
  accuracy,
  xpToday,
  rank,
  avgStudyTime = "0 hrs/day",
  questionsSolved = 0,
  coursesCompleted = 0,
  weakSubject,
}: PerformanceStatsProps) {
  const stats: StatItem[] = [
    {
      id: "streak",
      label: "Study Streak",
      value: streak > 0 ? `${streak} Days` : "0 Days",
      subText: streak > 0 ? "Daily momentum" : "Start a session to build streak",
      icon: <Flame size={20} className="text-orange-300 fill-orange-300" />,
      gradient: "from-orange-600/90 to-amber-600/70",
      iconBg: "bg-white/20",
    },
    {
      id: "accuracy",
      label: "Quiz Accuracy",
      value: accuracy > 0 ? `${accuracy}%` : "—",
      subText: accuracy > 0 ? "Overall accuracy" : "Complete quizzes to calculate",
      icon: <Target size={20} className="text-emerald-300" />,
      gradient: "from-emerald-600/90 to-teal-600/70",
      iconBg: "bg-white/20",
    },
    {
      id: "xpToday",
      label: "XP Earned Today",
      value: `${xpToday}`,
      subText: xpToday > 0 ? "Today's total" : "Study today to earn XP",
      icon: <Zap size={20} className="text-yellow-300 fill-yellow-300" />,
      gradient: "from-indigo-600/90 to-purple-600/70",
      iconBg: "bg-white/20",
    },
    {
      id: "rank",
      label: "Leaderboard Rank",
      value: rank || "Unranked",
      subText: rank && rank !== "Unranked" ? "Current position" : "Complete quizzes to rank",
      icon: <Trophy size={20} className="text-amber-300 fill-amber-300" />,
      gradient: "from-rose-600/90 to-pink-600/70",
      iconBg: "bg-white/20",
    },
    {
      id: "studyTime",
      label: "Daily Average",
      value: avgStudyTime,
      subText: "Focus time average",
      icon: <Clock size={20} className="text-cyan-300" />,
      gradient: "from-blue-600/90 to-cyan-600/70",
      iconBg: "bg-white/20",
    },
    {
      id: "questions",
      label: "Questions Solved",
      value: questionsSolved,
      subText: "Practice Arena total",
      icon: <CheckCircle2 size={20} className="text-emerald-300" />,
      gradient: "from-teal-600/90 to-emerald-700/70",
      iconBg: "bg-white/20",
    },
    {
      id: "courses",
      label: "Completed Modules",
      value: coursesCompleted,
      subText: "Learning tracks finished",
      icon: <BookOpen size={20} className="text-indigo-300" />,
      gradient: "from-violet-600/90 to-indigo-700/70",
      iconBg: "bg-white/20",
    },
    {
      id: "weakTopic",
      label: "Focus Subject",
      value: weakSubject && weakSubject !== "None" ? weakSubject : "Not set",
      subText: weakSubject ? "AI recommended focus" : "Set in goals / profile",
      icon: <AlertCircle size={20} className="text-amber-300" />,
      gradient: "from-amber-600/90 to-orange-700/70",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Performance Metrics
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {stats.map((st) => (
          <motion.div
            key={st.id}
            whileHover={{ scale: 1.025, y: -2 }}
            transition={{ duration: 0.2 }}
            className={`relative overflow-hidden rounded-2xl p-4.5 bg-gradient-to-br ${st.gradient} text-white shadow-md border border-white/10 cursor-pointer group`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="flex items-start justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl ${st.iconBg} backdrop-blur-md flex items-center justify-center shadow-xs`}>
                {st.icon}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90 backdrop-blur-xs flex items-center gap-1">
                <TrendingUp size={10} /> Active
              </span>
            </div>

            <p className="text-[11px] text-white/75 font-semibold tracking-wide uppercase">{st.label}</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate">{st.value}</p>
            <p className="text-[11px] text-white/70 font-medium mt-1 truncate">{st.subText}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
