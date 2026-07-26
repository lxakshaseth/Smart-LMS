import { useState } from "react";
import { motion } from "motion/react";
import { Github, GitCommit, GitFork, Star, ShieldCheck, ExternalLink, Activity } from "lucide-react";

export default function GitHubIntegration() {
  const [username, setUsername] = useState("akshatseth");
  const [connected, setConnected] = useState(true);

  const repos = [
    { name: "Smart-AI-LMS", stars: 142, forks: 28, lang: "TypeScript", desc: "AI-Powered Learning Management System platform with Monaco Editor" },
    { name: "CodePilot-Compiler-Core", stars: 89, forks: 12, lang: "C++", desc: "High throughput multi-language online judge execution engine" },
    { name: "Generative-AI-RAG-Engine", stars: 210, forks: 45, lang: "Python", desc: "Enterprise vector store RAG indexing and LLM fine-tuning pipeline" }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Github className="text-purple-400" size={20} />
          GitHub Profile Integration & Portfolio Matrix
        </h2>
        <p className="text-xs text-muted-foreground">Sync your repositories, contribution commit heatmaps, and repository strength score</p>
      </div>

      {/* Profile Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 border border-purple-500/30 p-6 shadow-xl flex flex-wrap items-center justify-between gap-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-black">
            GH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">@{username}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px] border border-green-500/30">
                Connected
              </span>
            </div>
            <p className="text-xs text-purple-200/80">32 Repositories • 4,120 Total Commits • Top 5% Global Developer</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 rounded-2xl bg-black/40 border border-purple-500/30">
            <div className="text-lg font-black text-purple-400">92 / 100</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Profile Strength</div>
          </div>
        </div>
      </div>

      {/* Repositories & Pinned Projects Grid */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <h3 className="text-base font-bold text-foreground">Pinned Repositories</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {repos.map((r, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-purple-500/40 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                  <Github size={14} /> {r.name}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground font-mono">{r.lang}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40 font-mono">
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {r.stars}</span>
                <span className="flex items-center gap-1"><GitFork size={12} /> {r.forks}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
