import { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, Building, BookOpen, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

const companies = [
  { name: "Amazon", logo: "📦", count: 145, difficulty: "Medium-Hard", keyTopics: "DP, Trees, Graphs, System Design" },
  { name: "Microsoft", logo: "🪟", count: 130, difficulty: "Medium", keyTopics: "Arrays, Strings, Linked List" },
  { name: "Google", logo: "🔍", count: 180, difficulty: "Hard", keyTopics: "Segment Tree, Graph, Math, DP" },
  { name: "Infosys", logo: "💻", count: 95, difficulty: "Easy-Medium", keyTopics: "Aptitude, C/Java Basics, SQL" },
  { name: "TCS", logo: "⚙️", count: 110, difficulty: "Easy-Medium", keyTopics: "NQT Coding, Data Structures, OOPs" },
  { name: "Accenture", logo: "🚀", count: 85, difficulty: "Easy-Medium", keyTopics: "Pseudocode, Fundamentals" },
  { name: "Capgemini", logo: "🔷", count: 75, difficulty: "Easy", keyTopics: "Technical Assessment & Viva" },
  { name: "Wipro", logo: "🌐", count: 90, difficulty: "Easy-Medium", keyTopics: "NLTH Prep & Logical Coding" },
  { name: "Cognizant", logo: "⚡", count: 80, difficulty: "Easy-Medium", keyTopics: "GenC & GenC Elevate Questions" }
];

export default function PlacementPrep() {
  const [selectedComp, setSelectedComp] = useState("Amazon");

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Briefcase className="text-purple-400" size={20} />
          Company-Wise Placement Preparation Hub
        </h2>
        <p className="text-xs text-muted-foreground">Previous Year Questions & Interview Experiences for Top 9 Product & Service Companies</p>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {companies.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedComp(c.name)}
            className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
              selectedComp === c.name
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-md font-bold"
                : "bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <div className="text-lg mb-1">{c.logo}</div>
            <div className="font-bold truncate">{c.name}</div>
            <div className="text-[10px] opacity-80">{c.count} Questions</div>
          </button>
        ))}
      </div>

      {/* Questions & Experiences View */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 lg:p-8 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">{selectedComp} Interview Questions & PYQs</h3>
            <p className="text-xs text-muted-foreground">Curated problem sets & recent candidate interview experiences</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: "Top 20 Repeated Coding Questions in " + selectedComp, type: "PYQ Set", difficulty: "Medium" },
            { title: "Candidate Interview Experience & Round 2 Feedback", type: "Experience Log", difficulty: "Verified" },
            { title: "System Design & Architecture Questions Asked", type: "System Design", difficulty: "Hard" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-400">{item.type}</span>
                <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
              </div>
              <ArrowRight size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
