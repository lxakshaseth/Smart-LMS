import { motion } from "motion/react";
import { Trophy, ChevronRight, Users, UserPlus } from "lucide-react";
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
  friends?: any[];
}

export function LeaderboardWidget({ user, friends = [] }: LeaderboardWidgetProps) {
  const currentUserName = user?.fullName?.split(" ")[0] || "You";

  let leaderboard: LeaderItem[] = [];

  if (friends && friends.length > 0) {
    const formattedFriends: LeaderItem[] = friends.map((f, idx) => ({
      rank: idx + 1,
      name: f.fullName || f.name || "Study Partner",
      xp: (f.xp || 0) + (idx === 0 ? 500 : 200),
      avatar: f.avatar || "SP",
      badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
    }));

    // Insert user into list
    formattedFriends.push({
      rank: formattedFriends.length + 1,
      name: currentUserName,
      xp: user?.xp || 0,
      avatar: user?.avatar || "ME",
      badge: undefined,
      me: true,
    });

    leaderboard = formattedFriends.sort((a, b) => b.xp - a.xp).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
    }));
  } else {
    // Single user default card when no friends added yet
    leaderboard = [
      {
        rank: 1,
        name: currentUserName,
        xp: user?.xp || 0,
        avatar: user?.avatar || "ME",
        badge: "🥇",
        me: true,
      },
    ];
  }

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
          <span className="text-xs font-semibold text-muted-foreground">Active Peers</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((p) => (
            <div
              key={p.name + p.rank}
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

        {friends.length === 0 && (
          <div className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground font-medium">Add study partners to compete on the weekly leaderboard!</p>
            <Link
              to="/friends"
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
            >
              <UserPlus size={13} /> Find Study Partners
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 text-center">
        <Link to="/friends" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          View All Friends & Rankings <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
