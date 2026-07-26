import { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, BookOpen, FileCode, HelpCircle, Layers, Rocket } from "lucide-react";

const semesters = [
  { sem: 1, name: "Semester 1", subjects: ["Python Problem Solving", "Basic Electrical"], labs: 12, viva: 45 },
  { sem: 2, name: "Semester 2", subjects: ["Data Structures (C)", "Physics"], labs: 14, viva: 50 },
  { sem: 3, name: "Semester 3", subjects: ["DSA (C++)", "Computer Graphics", "Digital Electronics"], labs: 16, viva: 60 },
  { sem: 4, name: "Semester 4", subjects: ["OOPs (Java)", "Microprocessor", "Principles of Prog"], labs: 15, viva: 55 },
  { sem: 5, name: "Semester 5", subjects: ["DBMS (SQL)", "Computer Networks", "Theory of Comp"], labs: 18, viva: 70 },
  { sem: 6, name: "Semester 6", subjects: ["Software Engineering", "Web Tech", "System Prog"], labs: 16, viva: 65 },
  { sem: 7, name: "Semester 7", subjects: ["DAA", "Cloud Computing", "AI & ML"], labs: 14, viva: 80 },
  { sem: 8, name: "Semester 8", subjects: ["High Perf Computing", "Distributed Systems", "Major Project"], labs: 10, viva: 90 }
];

export default function EngineeringExam() {
  const [selectedSem, setSelectedSem] = useState(3);
  const semData = semesters.find((s) => s.sem === selectedSem) || semesters[2];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <GraduationCap className="text-purple-400" size={20} />
          SPPU Engineering Target Exam Preparation (Semesters 1 - 8)
        </h2>
        <p className="text-xs text-muted-foreground">Subject coding, lab manuals, viva Q&A bank, mini projects, and major project repos</p>
      </div>

      {/* Semester Selector Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {semesters.map((s) => (
          <button
            key={s.sem}
            onClick={() => setSelectedSem(s.sem)}
            className={`py-3 rounded-2xl border text-center text-xs font-bold transition-all ${
              selectedSem === s.sem
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-md"
                : "bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Sem {s.sem}
          </button>
        ))}
      </div>

      {/* Subject & Lab Details Card */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 lg:p-8 shadow-xl space-y-6 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-black text-foreground">SPPU {semData.name} Academic Hub</h3>
          <p className="text-xs text-muted-foreground">Core subjects: {semData.subjects.join(" • ")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
            <FileCode size={20} className="text-purple-400" />
            <div className="font-bold text-sm text-foreground">{semData.labs} Lab Programs</div>
            <p className="text-[11px] text-muted-foreground">Verified executable lab assignments with code comments</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
            <HelpCircle size={20} className="text-blue-400" />
            <div className="font-bold text-sm text-foreground">{semData.viva} Practical Viva Q&As</div>
            <p className="text-[11px] text-muted-foreground">Top external examiner questions with crisp 1-line answers</p>
          </div>

          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 space-y-1">
            <Rocket size={20} className="text-green-400" />
            <div className="font-bold text-sm text-foreground">Mini / Major Projects</div>
            <p className="text-[11px] text-muted-foreground">Complete project reports, diagrams, and GitHub codebases</p>
          </div>
        </div>
      </div>

    </div>
  );
}
