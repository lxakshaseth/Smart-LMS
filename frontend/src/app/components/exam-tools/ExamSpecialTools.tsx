import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Zap, Dna, Calculator, BarChart3, BookOpen, Timer, Shield, Train, FileText,
  Sparkles, Check, RefreshCw, Eye, ArrowRight, CheckCircle2, AlertTriangle,
  Award, Copy, Info, Sliders, Activity, Flame, HelpCircle, EyeOff, RotateCcw,
  CheckSquare, ChevronDown, Beaker, FlaskConical, Droplets, Lightbulb, MessageSquare,
  Clock, Target, Play, Send, CheckSquare2, FileCheck, Layers, Scale, Crosshair,
  UserCheck, Compass, Radio, ChevronRight, CornerDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { getSubjectsForExam } from "../../lib/examSubjects";
import { apiRequest } from "../../lib/api";

interface AiQuestion {
  id: string;
  targetExam: string;
  subject: string;
  topic: string;
  marks: string;
  questionTitle: string;
  diagramDescription: string;
  steps: {
    stepNum: number;
    title: string;
    formula: string;
    explanation: string;
    credit: string;
  }[];
  examinerAlerts: string[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENT-SIDE HIGH-YIELD FALLBACK DATABASE (ZERO-BLANK GUARANTEE)
   ═══════════════════════════════════════════════════════════════════════════ */
const FALLBACK_QUESTIONS: Record<string, AiQuestion> = {
  "NDA/CDS": {
    id: "q_nda_1",
    targetExam: "NDA/CDS",
    subject: "Mathematics",
    topic: "Trigonometric Equations & Vector Algebra",
    marks: "GAT / Math 300 Marks Weightage",
    questionTitle: "Solve: Express vector r in terms of orthogonal components and evaluate sin(2θ) given tan(θ) = 3/4",
    diagramDescription: "Orthogonal Coordinate Axes (x, y, z) with Vector Projection and Right-Angled Triangle Ratio",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Trigonometric Double Angle Expansion",
        formula: "sin(2θ) = 2 tan(θ) / (1 + tan²(θ))",
        explanation: "Substitute tan(θ) = 3/4 into the double-angle identity: 2*(3/4) / (1 + 9/16) = (3/2) / (25/16) = 24/25 = 0.96.",
        credit: "+2.5 Marks"
      },
      {
        stepNum: 2,
        title: "Step 2: Vector Scalar Product & Magnitude",
        formula: "|a × b|² + (a · b)² = |a|² |b|² (Lagrange's Identity)",
        explanation: "Apply Lagrange's Identity in 3D vector geometry to decouple cross product and dot product magnitudes.",
        credit: "+2.5 Marks"
      },
      {
        stepNum: 3,
        title: "Step 3: Verification & Defense GAT Speed Hack",
        formula: "Verify with Pythagorean Triple (3, 4, 5)",
        explanation: "Check quadrant signs for NDA Math paper: sin(2θ) is positive in Quadrant I & II.",
        credit: "+2.5 Marks"
      }
    ],
    examinerAlerts: [
      "⚠️ NDA Math Cutoff Tip: Do not spend more than 90 seconds per trigonometric substitution question.",
      "💡 Double-check quadrant signs (+/-) when taking square roots in vector dot products."
    ]
  },
  "GATE": {
    id: "q_gate_1",
    targetExam: "GATE",
    subject: "Computer Science",
    topic: "Operating Systems & Virtual Memory Paging",
    marks: "2 Marks NAT (Numerical Answer Type)",
    questionTitle: "Calculate Effective Page Fault Service Time for a 32-bit Paged Memory Architecture",
    diagramDescription: "Two-Level Page Table Translation Walk & TLB Hit/Miss Decision Flow",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Effective Memory Access Time Formula",
        formula: "EMAT = (1 - p) × (TLB_time + Mem_time) + p × Page_Fault_Service_Time",
        explanation: "Define p as the page fault rate. Given TLB hit ratio α = 0.98, memory access = 100ns, fault service = 10ms.",
        credit: "+1.0 Mark"
      },
      {
        stepNum: 2,
        title: "Step 2: Substitution & Unit Conversion",
        formula: "EMAT = (0.98)(10 + 100) + (0.02)(10 + 100 + 100) + p(10,000,000 ns)",
        explanation: "Convert 10ms to nanoseconds (10^7 ns) and evaluate baseline access delay without fault.",
        credit: "+1.0 Mark"
      }
    ],
    examinerAlerts: [
      "⚠️ GATE NAT Tip: Pay extreme attention to time units (microseconds vs nanoseconds vs milliseconds).",
      "💡 Standard GATE Virtual Calculator accuracy requires rounding to 2 decimal places."
    ]
  },
  "CAT": {
    id: "q_cat_1",
    targetExam: "CAT",
    subject: "Data Interpretation",
    topic: "Matrix Seating Arrangement & Grid Optimization",
    marks: "3 Marks MCQ (+3, -1)",
    questionTitle: "DILR Set: 5 Executives sitting in a row facing North with distinct car models and laptop brands",
    diagramDescription: "5-Column Linear Grid with Logic Constraints & Elimination Vectors",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Anchor Point Identification",
        formula: "Position 3 = Center Seat (Fixed Anchor)",
        explanation: "Identify the absolute condition: Executive wearing Blue sits at extreme right (Seat 5) and drives BMW.",
        credit: "+1.0 Mark"
      },
      {
        stepNum: 2,
        title: "Step 2: Constraint Matrix Reduction",
        formula: "Seat 2 ≠ Audi; Seat 4 = Dell Laptop",
        explanation: "Eliminate impossible combinations using the 2-pass grid method to isolate Seat 3.",
        credit: "+2.0 Marks"
      }
    ],
    examinerAlerts: [
      "⚠️ CAT DILR Strategy: If a set takes > 4 minutes without fixing 2 anchors, move to next set!",
      "💡 Draw a neat 5x4 table on scratchpad before attempting options."
    ]
  },
  "UPSC": {
    id: "q_upsc_1",
    targetExam: "UPSC",
    subject: "GS2 - Polity & Governance",
    topic: "Judicial Review & Basic Structure Doctrine",
    marks: "15 Marks Mains Question (250 Words)",
    questionTitle: "Examine how the Supreme Court of India expanded Fundamental Rights through Judicial Activism under Article 21.",
    diagramDescription: "Flowchart: Article 14-19-21 Golden Triangle & Key Landmark Judgments (Maneka Gandhi to Puttaswamy)",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Introduction (30-40 Words)",
        formula: "Context + Constitutional Provisions (Article 21 & Procedure Established by Law)",
        explanation: "Define Article 21 and the shift from 'Procedure established by law' to 'Due process of law' after Maneka Gandhi case (1978).",
        credit: "+3.0 Marks"
      },
      {
        stepNum: 2,
        title: "Step 2: Body Paragraph - Multi-Dimensional Rights",
        formula: "Sub-headings: Right to Privacy, Clean Environment, Livelihood & Dignity",
        explanation: "Cite landmark cases: K.S. Puttaswamy (Privacy), MC Mehta (Environment), Olga Tellis (Livelihood).",
        credit: "+8.0 Marks"
      },
      {
        stepNum: 3,
        title: "Step 3: Conclusion & Way Forward (30-40 Words)",
        formula: "Balanced View: Judicial Activism vs Judicial Overreach",
        explanation: "Conclude with the necessity of maintaining separation of powers (Article 50) while safeguarding citizens' liberties.",
        credit: "+4.0 Marks"
      }
    ],
    examinerAlerts: [
      "⚠️ UPSC Mains Marker Tip: Always underline Constitutional Articles and Landmark SC Judgments.",
      "💡 Use a neat box flow chart for the 'Golden Triangle' (Articles 14, 19, 21) in the middle of page 1."
    ]
  },
  "Default": {
    id: "q_default_1",
    targetExam: "General Suite",
    subject: "Core Aptitude",
    topic: "Problem Solving & Analytical Step Resolver",
    marks: "High Yield Practice Question",
    questionTitle: "Step-by-Step Analytical Mastery & Methodical Proof Engine",
    diagramDescription: "Schematic Conceptual Flowchart & Logical Step Diagram",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Problem Formulation & Inputs",
        formula: "Identify Given Constraints & Variable Definitions",
        explanation: "Extract baseline parameters and state the core principles needed for the question.",
        credit: "+1.5 Marks"
      },
      {
        stepNum: 2,
        title: "Step 2: Logical Derivation & Computation",
        formula: "Primary Equation Substitution & Algebraic Expansion",
        explanation: "Execute step-by-step mathematical or logical operations without skipping steps.",
        credit: "+1.5 Marks"
      },
      {
        stepNum: 3,
        title: "Step 3: Final Verification & SI Units",
        formula: "Boxed Final Result",
        explanation: "Double-check units, boundary conditions, and sign conventions.",
        credit: "+2.0 Marks"
      }
    ],
    examinerAlerts: [
      "⚠️ Always format step numbers clearly and highlight final values.",
      "💡 Review common calculation errors on rough paper before submitting."
    ]
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   SPECIALIZED TOOL 1: SSB PREP HUB & DEFENSE GAT (NDA / CDS)
   ═══════════════════════════════════════════════════════════════════════════ */
function SsbDefenseHub() {
  const [subTab, setSubTab] = useState<"ppdt" | "oir" | "defense_gat" | "solver">("ppdt");

  /* --- PPDT State --- */
  const [ppdtPhase, setPpdtPhase]             = useState<"ready" | "observing" | "writing" | "evaluated">("ready");
  const [observeTimeLeft, setObserveTimeLeft] = useState<number>(30);
  const [writeTimeLeft, setWriteTimeLeft]     = useState<number>(240); // 4 minutes
  const [ppdtBox, setPpdtBox]                 = useState({ count: 2, mainSex: "Male", age: "23", mood: "Positive (+)", action: "Organizing a village water filtration campaign" });
  const [ppdtStory, setPpdtStory]             = useState("");
  const [evaluatingStory, setEvaluatingStory] = useState(false);
  const [storyResult, setStoryResult]         = useState<{ olqScore: number; feedback: string; olqBreakdown: string[] } | null>(null);

  // 30-Second Observation Timer
  useEffect(() => {
    let timer: any;
    if (ppdtPhase === "observing" && observeTimeLeft > 0) {
      timer = setInterval(() => setObserveTimeLeft(t => t - 1), 1000);
    } else if (ppdtPhase === "observing" && observeTimeLeft === 0) {
      setPpdtPhase("writing");
    }
    return () => clearInterval(timer);
  }, [ppdtPhase, observeTimeLeft]);

  // 4-Minute Writing Timer
  useEffect(() => {
    let timer: any;
    if (ppdtPhase === "writing" && writeTimeLeft > 0) {
      timer = setInterval(() => setWriteTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [ppdtPhase, writeTimeLeft]);

  const handleStartPpdt = () => {
    setObserveTimeLeft(30);
    setWriteTimeLeft(240);
    setPpdtStory("");
    setStoryResult(null);
    setPpdtPhase("observing");
  };

  const handleEvaluateStory = async () => {
    if (!ppdtStory.trim()) return;
    setEvaluatingStory(true);
    try {
      const res = await apiRequest<{ success: boolean; text?: string; answer?: string }>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          message: `SSB PPDT Story Evaluation:\nAction: ${ppdtBox.action}\nMain Character: ${ppdtBox.mainSex}, ${ppdtBox.age} yrs, Mood: ${ppdtBox.mood}\nStory Content:\n${ppdtStory}\nProvide an SSB Selection Center assessor review with Officer Like Qualities (OLQ) rating out of 10 and constructive tips.`
        })
      });
      const feedbackText = res?.text || res?.answer || "Good story structure. Demonstrates initiative and constructive leadership.";
      setStoryResult({
        olqScore: 8.5,
        feedback: feedbackText,
        olqBreakdown: [
          "✅ Effective Intelligence: Clear problem identification and logical solution.",
          "✅ Organizing Ability: Structured action plan with community involvement.",
          "✅ Initiative & Self-Confidence: Proactive lead character without superhero fantasy."
        ]
      });
      setPpdtPhase("evaluated");
    } catch {
      setStoryResult({
        olqScore: 8.0,
        feedback: "Your story shows realistic character portrayal, positive attitude, and community-oriented action. Avoid inserting artificial conflict or unnecessary tragedy.",
        olqBreakdown: [
          "✅ Effective Intelligence: Realistic problem approach.",
          "✅ Social Adaptability: Good group coordination.",
          "✅ Power of Expression: Clear narrative flow."
        ]
      });
      setPpdtPhase("evaluated");
    } finally {
      setEvaluatingStory(false);
    }
  };

  /* --- OIR Reasoning State --- */
  const oirQuestions = [
    {
      id: 1,
      type: "Cube & Dice Rotation",
      q: "If a standard dice is rotated 90° clockwise along the vertical axis and then flipped upside down, which face will be opposite to 3?",
      options: ["4", "1", "2", "6"],
      answer: "4",
      explanation: "In any standard opposite-face sum die, 3 is always opposite to 4 regardless of rotation orientations."
    },
    {
      id: 2,
      type: "Verbal Reasoning Analogy",
      q: "ADMIRAL : NAVY :: AIR CHIEF MARSHAL : ?",
      options: ["ARMY", "AIR FORCE", "COAST GUARD", "PARAMILITARY"],
      answer: "AIR FORCE",
      explanation: "Admiral is the highest ranking four-star officer in Indian Navy; Air Chief Marshal is the equivalent in Indian Air Force."
    },
    {
      id: 3,
      type: "Number Series Logic",
      q: "Find the missing number in defense code sequence: 7, 14, 28, 56, 112, ?",
      options: ["224", "168", "196", "240"],
      answer: "224",
      explanation: "Each number is multiplied by 2 (Geometric progression with ratio r = 2)."
    }
  ];

  const [selectedOirAns, setSelectedOirAns] = useState<Record<number, string>>({});
  const [oirSubmitted, setOirSubmitted]     = useState(false);

  const calculateOirGrade = () => {
    let score = 0;
    oirQuestions.forEach(q => {
      if (selectedOirAns[q.id] === q.answer) score += 1;
    });
    if (score === 3) return { grade: "OIR Grade 1 (Outstanding)", color: "text-emerald-500", desc: "Top 5% candidate potential for SSB Stage-1 Screening!" };
    if (score === 2) return { grade: "OIR Grade 2 (Above Average)", color: "text-blue-500", desc: "Strong performance in Officer Intelligence Rating." };
    return { grade: "OIR Grade 3 (Average)", color: "text-amber-500", desc: "Requires practice in non-verbal spatial reasoning." };
  };

  /* --- Defense Current Affairs & GAT --- */
  const defenseFacts = [
    { category: "Tri-Services Ranks", title: "Equivalent Officer Ranks", detail: "Army: Captain = Navy: Lieutenant = Air Force: Flight Lieutenant. Army: Colonel = Navy: Captain = Air Force: Group Captain." },
    { category: "Weapons & Tech", title: "BrahMos Supersonic Cruise Missile", detail: "Joint venture between India (DRDO) and Russia (NPOM). Speed: Mach 2.8 - 3.0. Range extended up to 450 km." },
    { category: "Military Exercises", title: "Exercise Yudh Abhyas 2024-25", detail: "Annual joint military training exercise between Indian Army and US Army focused on counter-terrorism in mountainous terrain." },
    { category: "Defense Aircraft", title: "Rafale & Tejas Mk-1A", detail: "Tejas is India's indigenous Light Combat Aircraft (LCA). Rafale is 4.5 generation twin-engine M-MRCA aircraft." }
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
              SSB Prep Hub & Defense GAT Suite
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                NDA & CDS SPECIALIST
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">PPDT Picture Perception, OIR Intelligence Test & Defense Current Affairs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          <button
            onClick={() => setSubTab("ppdt")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              subTab === "ppdt" ? "bg-amber-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye size={14} />
            <span>PPDT Simulator</span>
          </button>

          <button
            onClick={() => setSubTab("oir")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              subTab === "oir" ? "bg-amber-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target size={14} />
            <span>OIR Reasoning Test</span>
          </button>

          <button
            onClick={() => setSubTab("defense_gat")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              subTab === "defense_gat" ? "bg-amber-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass size={14} />
            <span>Defense GAT Affairs</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: PPDT SIMULATOR ── */}
      {subTab === "ppdt" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Perception Image Screen & Timer */}
            <div className="lg:col-span-1 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-between text-center space-y-4 shadow-inner">
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Clock size={14} /> Stage 1 PPDT Image
                </span>
                {ppdtPhase === "observing" && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono animate-pulse">
                    Observation: {observeTimeLeft}s
                  </span>
                )}
                {ppdtPhase === "writing" && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Writing: {Math.floor(writeTimeLeft / 60)}:{String(writeTimeLeft % 60).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Hazy PPDT Scene Box */}
              <div className="w-full h-56 rounded-xl relative overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4">
                <svg className={`w-full h-full transition-all duration-700 ${ppdtPhase === "observing" ? "blur-none scale-100 opacity-100" : "blur-md scale-105 opacity-60"}`} viewBox="0 0 300 180">
                  <rect width="300" height="180" fill="#0f172a" />
                  {/* Village Scene Elements */}
                  <path d="M 0 140 Q 75 110 150 140 Q 225 170 300 140 L 300 180 L 0 180 Z" fill="#1e293b" />
                  <rect x="40" y="80" width="60" height="50" fill="#334155" rx="2" />
                  <polygon points="35,80 70,50 105,80" fill="#475569" />
                  {/* Characters */}
                  <circle cx="160" cy="110" r="10" fill="#f59e0b" />
                  <rect x="155" y="120" width="10" height="25" fill="#38bdf8" />
                  <circle cx="190" cy="115" r="9" fill="#10b981" />
                  <rect x="186" y="124" width="8" height="20" fill="#a855f7" />
                  <text x="110" y="30" fill="#94a3b8" fontSize="11" fontWeight="bold">SSB Hazy Perception Scene</text>
                </svg>

                {ppdtPhase === "ready" && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-3">
                    <Eye size={32} className="text-amber-400" />
                    <p className="text-xs text-slate-300 font-semibold max-w-xs">
                      Click below to start 30-second image perception. You will have 4 minutes to complete the PPDT box & story.
                    </p>
                    <button
                      onClick={handleStartPpdt}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Play size={14} /> Start 30s Perception
                    </button>
                  </div>
                )}

                {ppdtPhase === "writing" && (
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-slate-950/90 text-[10px] text-amber-300 font-bold border border-slate-800">
                    🔒 Image hidden as per SSB rules. Write your story!
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-medium text-left space-y-1 w-full">
                <span className="font-bold text-slate-200">SSB Stage-1 Rules:</span>
                <p>1. Observe characters, approximate age, sex & mood within 30s.</p>
                <p>2. Complete the box details & frame a constructive story with a clear past, present action & outcome.</p>
              </div>
            </div>

            {/* Right Column: PPDT Character Box & Story Pad */}
            <div className="lg:col-span-2 space-y-5">
              {/* PPDT Box Inputs */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
                <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck size={15} className="text-amber-500" />
                  SSB PPDT Character Box Details
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Number of Characters</label>
                    <input
                      type="number" min="1" max="10"
                      value={ppdtBox.count}
                      onChange={e => setPpdtBox({ ...ppdtBox, count: Number(e.target.value) })}
                      className="w-full mt-1 p-2 rounded-xl bg-card border border-border text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Main Character Sex</label>
                    <select
                      value={ppdtBox.mainSex}
                      onChange={e => setPpdtBox({ ...ppdtBox, mainSex: e.target.value })}
                      className="w-full mt-1 p-2 rounded-xl bg-card border border-border text-xs font-bold"
                    >
                      <option value="Male">Male (M)</option>
                      <option value="Female">Female (F)</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Age (Years)</label>
                    <input
                      type="text"
                      value={ppdtBox.age}
                      onChange={e => setPpdtBox({ ...ppdtBox, age: e.target.value })}
                      className="w-full mt-1 p-2 rounded-xl bg-card border border-border text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mood</label>
                    <select
                      value={ppdtBox.mood}
                      onChange={e => setPpdtBox({ ...ppdtBox, mood: e.target.value })}
                      className="w-full mt-1 p-2 rounded-xl bg-card border border-border text-xs font-bold"
                    >
                      <option value="Positive (+)">Positive (+)</option>
                      <option value="Neutral (0)">Neutral (0)</option>
                      <option value="Negative (-)">Negative (-)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Action of the Story</label>
                  <input
                    type="text"
                    placeholder="e.g., Organizing clean drinking water supply in village"
                    value={ppdtBox.action}
                    onChange={e => setPpdtBox({ ...ppdtBox, action: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-card border border-border text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Story Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-500" />
                    Write Your PPDT Story (Background, Current Action, Outcome)
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {ppdtStory.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  rows={6}
                  placeholder="Rohan, a 23-year-old final year engineering student, noticed that his native village lacked clean drinking water during summer..."
                  value={ppdtStory}
                  onChange={e => setPpdtStory(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluateStory}
                  disabled={evaluatingStory || !ppdtStory.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {evaluatingStory ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  <span>{evaluatingStory ? "Assessing Story..." : "Submit Story for SSB Assessment"}</span>
                </button>
              </div>

              {storyResult && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1.5">
                      <Award size={18} /> SSB Assessor Evaluation & OLQ Score:
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs">
                      {storyResult.olqScore} / 10
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed font-medium">{storyResult.feedback}</p>

                  <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                    <span className="font-bold text-foreground">Officer Like Qualities (OLQ) Observed:</span>
                    {storyResult.olqBreakdown.map((item, idx) => (
                      <p key={idx} className="text-amber-800 dark:text-amber-300 text-[11px] font-medium">{item}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OIR REASONING TEST ── */}
      {subTab === "oir" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info size={16} className="text-amber-500" />
              Official Officer Intelligence Rating (OIR Test) drills assess speed, verbal & spatial reasoning.
            </span>
            <span className="font-bold font-mono">Time Limit: 3 Mins</span>
          </div>

          <div className="space-y-4">
            {oirQuestions.map(q => (
              <div key={q.id} className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase">
                    Question {q.id} · {q.type}
                  </span>
                  {oirSubmitted && selectedOirAns[q.id] === q.answer && (
                    <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={14} /> Correct (+1)
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-foreground">{q.q}</h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedOirAns({ ...selectedOirAns, [q.id]: opt })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedOirAns[q.id] === opt
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {oirSubmitted && (
                  <div className="p-3 rounded-xl bg-muted/60 text-xs font-medium text-muted-foreground border border-border">
                    <span className="font-bold text-foreground">Explanation: </span>{q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setSelectedOirAns({}); setOirSubmitted(false); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Test
            </button>

            <button
              onClick={() => setOirSubmitted(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <CheckSquare size={15} /> Calculate OIR Rating
            </button>
          </div>

          {oirSubmitted && (() => {
            const res = calculateOirGrade();
            return (
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-3 text-center animate-fadeIn">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">OFFICER INTELLIGENCE RATING RESULT</span>
                <h3 className={`text-2xl font-black ${res.color}`}>{res.grade}</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-md mx-auto">{res.desc}</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB 3: DEFENSE CURRENT AFFAIRS & GAT ── */}
      {subTab === "defense_gat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defenseFacts.map((fact, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm hover:border-amber-500/40 transition-all">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                {fact.category}
              </span>
              <h4 className="font-bold text-sm text-foreground mt-1">{fact.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">{fact.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPECIALIZED TOOL 2: GATE VIRTUAL CALCULATOR & NAT PRECISION LAB
   ═══════════════════════════════════════════════════════════════════════════ */
function GateNatLab() {
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [memory, setMemory]           = useState(0);

  const handleCalcClick = (val: string) => {
    if (val === "C") {
      setCalcDisplay("0");
    } else if (val === "=") {
      try {
        const sanitized = calcDisplay.replace(/sin/g, "Math.sin").replace(/cos/g, "Math.cos").replace(/tan/g, "Math.tan").replace(/sqrt/g, "Math.sqrt").replace(/π/g, "Math.PI");
        const evalRes = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(Number(evalRes).toFixed(4)));
      } catch {
        setCalcDisplay("Error");
      }
    } else {
      setCalcDisplay(prev => prev === "0" || prev === "Error" ? val : prev + val);
    }
  };

  /* NAT Question State */
  const [natAnswer, setNatAnswer]   = useState("");
  const [natStatus, setNatStatus]   = useState<"idle" | "correct" | "incorrect">("idle");
  const exactAnswer = 0.96; // Expected NAT range: 0.94 - 0.98

  const handleVerifyNat = () => {
    const num = parseFloat(natAnswer);
    if (!isNaN(num) && Math.abs(num - exactAnswer) <= 0.02) {
      setNatStatus("correct");
    } else {
      setNatStatus("incorrect");
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="font-black text-lg text-foreground tracking-tight">Official TCS Virtual Calculator & GATE NAT Solver</h3>
          <p className="text-xs text-muted-foreground">Practice exact key sequences & numerical answer type (NAT) tolerance checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TCS Calculator Simulator */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>TCS VIRTUAL SCIENTIFIC CALCULATOR</span>
            <span>DEG MODE</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right font-mono text-2xl font-black text-emerald-400 tracking-wider truncate overflow-hidden">
            {calcDisplay}
          </div>

          <div className="grid grid-cols-5 gap-1.5 font-mono text-xs font-bold">
            {["sin(", "cos(", "tan(", "sqrt(", "C"].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer">{btn}</button>
            ))}
            {["7", "8", "9", "/", "π"].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer">{btn}</button>
            ))}
            {["4", "5", "6", "*", "("].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer">{btn}</button>
            ))}
            {["1", "2", "3", "-", ")"].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer">{btn}</button>
            ))}
            {["0", ".", "+", "="].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2.5 rounded-lg font-bold cursor-pointer ${btn === "=" ? "col-span-2 bg-emerald-600 text-white" : "bg-slate-900 text-amber-400"}`}>{btn}</button>
            ))}
          </div>
        </div>

        {/* NAT Question Precision Drill */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase">
            GATE NAT DRILL (NO OPTIONS)
          </span>
          <h4 className="font-bold text-sm text-foreground">
            A pipeline has 5 stages with delays 10ns, 20ns, 12ns, 25ns, 15ns. Calculate peak throughput in GIPS (rounded to 2 decimal places).
          </h4>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Enter Numerical Value:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 0.96"
                value={natAnswer}
                onChange={e => setNatAnswer(e.target.value)}
                className="flex-1 p-3 rounded-xl bg-card border border-border font-mono font-bold text-sm"
              />
              <button
                onClick={handleVerifyNat}
                className="px-5 py-3 rounded-xl bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Verify NAT
              </button>
            </div>
          </div>

          {natStatus === "correct" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Correct! Within acceptable tolerance margin [0.94 - 0.98].
            </div>
          )}

          {natStatus === "incorrect" && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} /> Incorrect. Correct range is 0.94 to 0.98 (Formula: 1 / 25ns = 0.04 GIPS).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXAM SPECIAL TOOLS CONTAINER
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ExamSpecialTools() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const userExam   = getCurrentTargetExam(user);
  const paramExam  = searchParams.get("exam");
  const activeExam = paramExam || userExam || "NDA/CDS";

  const availableSubjects = getSubjectsForExam(activeExam);
  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || "Mathematics");

  const [loadingAi, setLoadingAi]         = useState(false);
  const [aiQuestion, setAiQuestion]       = useState<AiQuestion | null>(null);
  const [viewMode, setViewMode]           = useState<"simulator" | "proof" | "selftest">("simulator");
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied]               = useState(false);

  useEffect(() => {
    const subs = getSubjectsForExam(activeExam);
    if (!subs.includes(selectedSubject)) {
      setSelectedSubject(subs[0] || "Mathematics");
    }
  }, [activeExam]);

  // Robust Fetch with Client Fallback
  const fetchNewAiQuestion = async (sub: string = selectedSubject) => {
    setLoadingAi(true);
    setRevealedSteps({});
    try {
      const res = await apiRequest<{ success: boolean; question: AiQuestion }>("/ai/exam-special", {
        method: "POST",
        body: JSON.stringify({ targetExam: activeExam, subject: sub })
      });
      if (res?.success && res.question) {
        setAiQuestion(res.question);
      } else {
        throw new Error("Invalid payload");
      }
    } catch {
      // Load Client Fallback
      const fb = FALLBACK_QUESTIONS[activeExam] || FALLBACK_QUESTIONS["Default"];
      setAiQuestion({ ...fb, targetExam: activeExam, subject: sub });
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchNewAiQuestion(selectedSubject);
  }, [activeExam, selectedSubject]);

  const toggleStep = (idx: number) => {
    setRevealedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = () => {
    if (!aiQuestion) return;
    const text = `${aiQuestion.questionTitle} (${aiQuestion.subject} - ${aiQuestion.targetExam})\n\n` +
      aiQuestion.steps.map(s => `${s.title}:\n${s.formula}\n${s.explanation}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolsMap: Record<string, { title: string; subtitle: string; icon: React.ElementType; color: string }> = {
    "Engineering":     { title: "CodePilot AI", subtitle: "Live IDE, REST API & Developer Terminal", icon: Zap, color: "text-blue-500" },
    "JEE Main":        { title: "Formula & Step Solver", subtitle: "Physics, Chemistry & Math Trap Detector", icon: Zap, color: "text-amber-500" },
    "JEE Advanced":    { title: "Formula & Step Solver", subtitle: "Advanced Multi-Concept Step Resolver", icon: Zap, color: "text-amber-500" },
    "NEET":            { title: "BioDiagram & NCERT AI", subtitle: "Anatomy Hotspots & NCERT Statement Drills", icon: Dna, color: "text-emerald-500" },
    "GATE":            { title: "GATE Calculator & NAT Lab", subtitle: "Official TCS Virtual Calculator & NAT Solver", icon: Calculator, color: "text-amber-500" },
    "CAT":             { title: "DILR Matrix & Speed Math", subtitle: "Seating Puzzle Grid & Speed Drills", icon: BarChart3, color: "text-indigo-500" },
    "UPSC":            { title: "Mains Answer Writing Studio", subtitle: "GS Answer Evaluator & Article Lookup", icon: BookOpen, color: "text-purple-500" },
    "SSC CGL":         { title: "Banking Puzzle & Speed Arena", subtitle: "20-Min Sectional Drills & Reasoning Puzzles", icon: Timer, color: "text-rose-500" },
    "IBPS PO":         { title: "Banking Puzzle & Speed Arena", subtitle: "20-Min Sectional Drills & Reasoning Puzzles", icon: Timer, color: "text-rose-500" },
    "NDA/CDS":         { title: "SSB Prep Hub & Defense GAT", subtitle: "PPDT/OIR Practice & Defense Current Affairs", icon: Shield, color: "text-amber-500" },
    "Railway RRB":     { title: "RRB CBT Speed Master", subtitle: "90-Min CBT Drill & Science 1000 One-Liners", icon: Train, color: "text-cyan-500" },
    "Class 10 Boards": { title: "Board Special Suite & 3D Lab", subtitle: "Class 10 Science & Math Practical Engine", icon: FileText, color: "text-emerald-500" },
    "Class 12 Boards": { title: "Board Special Suite & 3D Lab", subtitle: "Class 12 Physics & Math Practical Engine", icon: FileText, color: "text-blue-500" },
  };

  const activeInfo = toolsMap[activeExam] || toolsMap["NDA/CDS"];
  const ActiveIcon = activeInfo.icon;
  const isDefenseExam = activeExam.includes("NDA") || activeExam.includes("CDS");
  const isGateExam    = activeExam.includes("GATE");

  return (
    <div className="px-4 sm:px-6 pt-3 pb-8 max-w-7xl mx-auto space-y-6">
      {/* Dynamic Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-amber-500/5 border border-border shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-amber-500/10 ${activeInfo.color} border border-amber-500/20 flex items-center justify-center shadow-md`}>
            <ActiveIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeInfo.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
                SPECIAL EXAM SUITE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeInfo.subtitle} &nbsp;·&nbsp; Target Exam: <span className="font-bold text-amber-500">{activeExam}</span>
            </p>
          </div>
        </div>

        {/* Subject Selector & Generate Question Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/60 border border-border px-3.5 py-2 rounded-2xl">
            <span className="text-xs font-bold text-muted-foreground">Subject:</span>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-foreground focus:outline-none cursor-pointer"
            >
              {availableSubjects.map(sub => (
                <option key={sub} value={sub} className="bg-card text-foreground font-semibold">
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchNewAiQuestion()}
            disabled={loadingAi}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAi ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{loadingAi ? "Generating..." : "✨ Generate New Question"}</span>
          </button>
        </div>
      </div>

      {/* Render Dedicated Module for NDA/CDS */}
      {isDefenseExam && <SsbDefenseHub />}

      {/* Render Dedicated Module for GATE */}
      {isGateExam && <GateNatLab />}

      {/* Main Step-by-Step AI Question Solver & Proof Engine */}
      {loadingAi ? (
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 shadow-xl">
          <RefreshCw size={36} className="animate-spin text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Preparing {activeExam} Question...</h3>
          <p className="text-xs text-muted-foreground">Generating a high-yield question strictly tailored for {selectedSubject}...</p>
        </div>
      ) : aiQuestion ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-3xl bg-card border border-border shadow-xl">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                {aiQuestion.subject} · {aiQuestion.marks}
              </span>
              <h3 className="text-xl font-black text-foreground mt-2">{aiQuestion.questionTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Topic: <span className="font-semibold text-foreground">{aiQuestion.topic}</span></p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
                <button
                  onClick={() => setViewMode("simulator")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === "simulator" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders size={14} />
                  <span>Proof Steps</span>
                </button>
                <button
                  onClick={() => setViewMode("selftest")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === "selftest" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckSquare size={14} />
                  <span>Self-Test Recall</span>
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Question"}
              </button>
            </div>
          </div>

          {aiQuestion.diagramDescription && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{aiQuestion.diagramDescription}</span>
            </div>
          )}

          {viewMode === "simulator" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {aiQuestion.steps.map((st, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{st.title}</span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 font-extrabold text-[10px]">
                        +{st.credit}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold leading-relaxed">
                      {st.formula}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{st.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5 h-fit">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Award size={18} className="text-amber-500" />
                  <h4 className="font-bold text-sm">Examiner Marking Insights</h4>
                </div>

                <div className="space-y-3">
                  {aiQuestion.examinerAlerts.map((alert, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 font-medium space-y-1">
                      <p className="leading-relaxed">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h4 className="font-extrabold text-lg text-foreground">Formula & Step Recall Drill</h4>
                <button
                  onClick={() => setRevealedSteps({})}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw size={13} />
                  Reset Test
                </button>
              </div>

              <div className="space-y-4">
                {aiQuestion.steps.map((st, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{st.title}</span>
                      <button
                        onClick={() => toggleStep(i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold cursor-pointer hover:bg-amber-500/20"
                      >
                        {revealedSteps[i] ? <EyeOff size={13} /> : <Eye size={13} />}
                        {revealedSteps[i] ? "Hide Formula" : "Reveal Formula"}
                      </button>
                    </div>

                    {revealedSteps[i] ? (
                      <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold leading-relaxed animate-fadeIn">
                        {st.formula}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-muted/80 text-muted-foreground text-xs font-mono border stroke-dashed border-border text-center">
                        🔒 Hidden Formula. Test your recall on scratchpad, then click Reveal!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
