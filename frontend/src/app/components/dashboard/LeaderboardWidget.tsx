import { motion } from "motion/react";
import { Trophy, ChevronRight, Medal, Crown } from "lucide-react";
import { Link } from "react-router";

interface LeaderItem {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  badge?: string;
  me?: boolean;
}

interface LeaderboardWidgetProps {
  user?: any;
}

export function LeaderboardWidget({ user }: LeaderboardWidgetProps) {
  const currentUserName = user?.fullName?.split(" ")[0] || "You";

  const leaderboard: LeaderItem[] = [
    { rank: 1, name: "Ayush Anand", xp: 3450, avatar: "AA", badge: "🥇" },
    { rank: 2, name: "Anil Kumar", xp: 3120, avatar: "AK", badge: "🥈" },
    { rank: 3, name: currentUserName, xp: Math.max(2850, user?.xp || 0), avatar: user?.avatar || "ME", badge: "🥉", me: true },
    { rank: 4, name: "Priya Sharma", xp: 2640, avatar: "PS" },
    { rank: 5, name: "Rohan Verma", xp: 2410, avatar: "RV" },
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
            <Trophy size={18} className="text-amber-400 fill-amber-400" /> Study Leaderboard
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">This Week</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                p.me
                  ? "bg-primary/10 border border-primary/30 shadow-xs"
                  : "hover:bg-muted/50 border border-transparent"
              }`}
            >
              <span className="text-sm font-extrabold w-6 text-center">
                {p.badge || <span className="text-muted-foreground text-xs">{p.rank}</span>}
              </span>

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-xs ${
                  p.rank === 1
                    ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : p.rank === 2
                    ? "bg-gradient-to-br from-slate-400 to-slate-500"
                    : p.rank === 3
                    ? "bg-gradient-to-br from-amber-600 to-yellow-700"
                    : "bg-gradient-to-br from-indigo-500 to-purple-500"
                }`}
              >
                {p.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${p.me ? "text-primary" : "text-foreground"}`}>
                  {p.name} {p.me && <span className="text-[10px] text-primary font-black">(You)</span>}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">{p.xp.toLocaleString()} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 text-center">
        <Link to="/friends" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          View Friends & Global Rankings <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
