import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Clock, Award, Users, CheckCircle2, ArrowRight, Flame } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Alex Chen", score: 1450, solved: 4, time: "42m 10s", country: "🇺🇸" },
  { rank: 2, name: "Priya Sharma", score: 1420, solved: 4, time: "48m 35s", country: "🇮🇳" },
  { rank: 3, name: "Kenji Sato", score: 1200, solved: 3, time: "35m 12s", country: "🇯🇵" },
  { rank: 4, name: "David Miller", score: 1180, solved: 3, time: "41m 50s", country: "🇬🇧" },
  { rank: 5, name: "Akshat Seth (You)", score: 980, solved: 2, time: "28m 14s", country: "🇮🇳", isUser: true },
];

export default function ContestPlatform() {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, mins: 42, secs: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">

      {/* Live Contest Banner with Timer */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 border border-purple-500/30 p-6 lg:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 backdrop-blur-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/40 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400" /> LIVE NOW
            </span>
            <span className="text-xs text-purple-300 font-semibold">Weekly Contest #142</span>
          </div>

          <h2 className="text-2xl font-black text-white">Global Algorithm Speed Run</h2>
          <p className="text-xs text-purple-200/80">4 Problems • 1.5 Hours • +200 Rating Points</p>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-black/60 border border-purple-500/30 font-mono text-xl font-bold text-purple-300 shadow-inner">
            <Clock size={20} className="text-purple-400" />
            <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
            <span>{String(timeLeft.mins).padStart(2, '0')}:</span>
            <span className="text-purple-400">{String(timeLeft.secs).padStart(2, '0')}</span>
          </div>

          <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs shadow-lg hover:brightness-110">
            Enter Contest Arena
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-amber-400" size={18} />
            Live Global Leaderboard
          </h3>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Problems Solved</th>
                <th className="py-3 px-4 text-right">Finish Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leaderboard.map((row) => (
                <tr
                  key={row.rank}
                  className={`hover:bg-purple-500/5 transition-all ${
                    row.isUser ? "bg-purple-500/10 border-l-4 border-l-purple-500 font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-purple-400">
                    #{row.rank}
                  </td>

                  <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                    <span>{row.country}</span>
                    <span>{row.name}</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-foreground font-bold">
                    {row.score} pts
                  </td>

                  <td className="py-3 px-4 font-mono text-green-400 font-bold">
                    {row.solved} / 4
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                    {row.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
