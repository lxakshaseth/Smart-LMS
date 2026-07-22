import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Quote, Sparkles, Calendar, Sun, Moon } from "lucide-react";
import { getCurrentTargetExam } from "../../lib/targetExam";

const quotes = [
  "“The secret of getting ahead is getting started.” – Mark Twain",
  "“Success is the sum of small efforts, repeated day in and day out.” – Robert Collier",
  "“Push yourself, because no one else is going to do it for you.”",
  "“Deep focus is a superpower in the modern world.”",
];

export function SmartWidgets({ user }: { user?: any }) {
  const [time, setTime] = useState<string>("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const targetExam = getCurrentTargetExam(user);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * quotes.length);
    setQuoteIndex(randomIdx);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Live Clock Widget */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Time</p>
            <p className="text-xl font-black text-foreground tracking-tight">{time || "10:00 AM"}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
        </span>
      </motion.div>

      {/* Motivational Quote Widget */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
          <Quote size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Daily Inspiration</p>
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mt-0.5">
            {quotes[quoteIndex]}
          </p>
        </div>
      </motion.div>

      {/* Exam Countdown Widget */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Exam Target</p>
            <p className="text-sm font-black text-foreground tracking-tight truncate">{targetExam}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-500 text-xs font-extrabold">
          92 Days Left
        </span>
      </motion.div>
    </div>
  );
}
