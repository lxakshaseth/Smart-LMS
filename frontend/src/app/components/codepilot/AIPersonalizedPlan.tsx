import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, Clock, Target, CheckCircle2, ArrowRight } from "lucide-react";

export default function AIPersonalizedPlan() {
  const [weakTopics, setWeakTopics] = useState("Dynamic Programming, Graph Traversal");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [dailyHours, setDailyHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(true);

  const plan = [
    { day: "Day 1 (Today)", focus: "DP Basics: Fibonacci & Climbing Stairs", task: "Solve 3 Easy DP problems on memoization", duration: "1.5 hrs" },
    { day: "Day 2", focus: "Graph Traversal: BFS vs DFS Intuition", task: "Implement BFS graph level order traversal", duration: "2 hrs" },
    { day: "Day 3", focus: "Google Interview Focus: Array Partitioning", task: "Solve 2 Medium Array problems from Google PYQ bank", duration: "2 hrs" },
    { day: "Day 4", focus: "Mock Revision & System Design Basics", task: "Take 1 AI Voice Mock Interview & review weak areas", duration: "1 hr" }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="text-purple-400" size={20} />
          AI Personalized Study Plan Generator
        </h2>
        <p className="text-xs text-muted-foreground">Automatically tailored preparation schedule based on your target company, weak topics & available daily study hours</p>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-5 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Target Company</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Weak Topics to Prioritize</label>
            <input
              type="text"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Available Daily Hours</label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500"
            >
              <option value={1}>1 Hour / Day</option>
              <option value={2}>2 Hours / Day</option>
              <option value={4}>4 Hours / Day (Intensive)</option>
            </select>
          </div>

          <button
            onClick={() => setPlanGenerated(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
          >
            <Sparkles size={16} /> Re-Generate AI Schedule
          </button>
        </div>

        {/* Generated Schedule */}
        <div className="lg:col-span-7 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="text-purple-400" size={18} />
            Tailored AI Study Plan for {targetCompany}
          </h3>

          <div className="space-y-3">
            {plan.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-400">{item.day}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">{item.duration}</span>
                </div>
                <div className="font-bold text-xs text-foreground">{item.focus}</div>
                <p className="text-[11px] text-muted-foreground">{item.task}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
