import { useState } from "react";
import { motion } from "motion/react";
import { Compass, Download, Eye, Sparkles, Check, Code2, Award, GraduationCap, Briefcase } from "lucide-react";

export default function PortfolioBuilder() {
  const [name, setName] = useState("Akshat Seth");
  const [title, setTitle] = useState("Full Stack Developer & AI Engineer");
  const [exported, setExported] = useState(false);

  const portfolio = {
    skills: ["React", "TypeScript", "Node.js", "Python", "C++", "Docker", "PostgreSQL", "Generative AI"],
    projects: [
      { name: "CodePilot AI Platform", desc: "Integrated LeetCode & ChatGPT platform for LMS students" },
      { name: "Smart AI LMS", desc: "Adaptive learning system with AI tutor and note generators" }
    ],
    education: "B.E. Computer Engineering (SPPU Pune)",
    certificates: ["AWS Certified Developer", "Meta Frontend Specialization"]
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ name, title, portfolio }, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${name.toLowerCase().replace(/\s+/g, "_")}_portfolio.json`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Compass className="text-purple-400" size={20} />
          Developer Portfolio Builder & Live Export
        </h2>
        <p className="text-xs text-muted-foreground">Auto-generate personal portfolio sites showcasing projects, skills, education & credentials</p>
      </div>

      {/* Live Preview & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Input Controls */}
        <div className="lg:col-span-5 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Professional Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
          >
            {exported ? <Check size={16} /> : <Download size={16} />}
            {exported ? "Exported Successfully!" : "Export Portfolio JSON / Site Package"}
          </button>
        </div>

        {/* Live Portfolio Card Preview */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-purple-950/40 via-background to-blue-950/40 border border-purple-500/30 p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Live Preview</span>
            <h3 className="text-2xl font-black text-white">{name}</h3>
            <p className="text-sm text-purple-300">{title}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Code2 size={14} className="text-purple-400" /> Core Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {portfolio.skills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-blue-400" /> Key Projects
            </h4>
            <div className="space-y-2">
              {portfolio.projects.map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/40 border border-border text-xs">
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-muted-foreground">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
