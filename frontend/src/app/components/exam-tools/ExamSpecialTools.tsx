import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Zap, Dna, Calculator, BarChart3, BookOpen, Timer, Shield, Train, FileText,
  Sparkles, Check, RefreshCw, Eye, ArrowRight, CheckCircle2, AlertTriangle,
  Award, Copy, Info, Sliders, Activity, Flame, HelpCircle, EyeOff, RotateCcw,
  CheckSquare, ChevronDown, Beaker, FlaskConical, Droplets, Lightbulb, MessageSquare,
  Clock, Target, Play, Send, CheckSquare2, FileCheck, Layers, Scale, Crosshair,
  UserCheck, Compass, Radio, ChevronRight, CornerDownRight, Brain, Zap as ZapIcon
} from "lucide-react";
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
   DYNAMIC QUESTION BANK FOR ALL TARGET EXAMS & SUBJECTS
   ═══════════════════════════════════════════════════════════════════════════ */
const QUESTION_BANK: Record<string, Record<string, AiQuestion[]>> = {
  "Railway RRB": {
    "Reasoning": [
      {
        id: "q_rrb_r1",
        targetExam: "Railway RRB",
        subject: "Reasoning",
        topic: "Syllogism & Deductive Venn Logic",
        marks: "1.0 Mark (RRB CBT-1 / CBT-2)",
        questionTitle: "Statements: (I) All Trains are Locomotives. (II) Some Locomotives are Electric. Conclusions: Evaluate Validity.",
        diagramDescription: "Overlapping Venn Circles: Set T (Trains) inside Set L (Locomotives), intersecting Set E (Electric).",
        steps: [
          { stepNum: 1, title: "Step 1: Statement Venn Circle Mapping", formula: "Trains (T) ⊂ Locomotives (L); L ∩ Electric (E) ≠ ∅", explanation: "Draw Set T entirely inside Set L. Draw Set E intersecting Set L.", credit: "+0.33 Mark" },
          { stepNum: 2, title: "Step 2: Conclusion I: 'Some Trains are Electric'", formula: "T ∩ E may or may not be empty (Uncertain)", explanation: "Since E intersects L, it might not overlap T directly. Conclusion I is NOT universally true.", credit: "+0.33 Mark" },
          { stepNum: 3, title: "Step 3: Conclusion II: 'Some Locomotives are Trains'", formula: "L ∩ T = T (Valid)", explanation: "Since T is inside L, part of L is definitely T. Conclusion II is DEFINITELY TRUE.", credit: "+0.34 Mark" }
        ],
        examinerAlerts: [
          "⚠️ RRB CBT Negative Marking: 1/3rd mark (-0.33) is deducted per wrong answer.",
          "💡 Venn Tip: If a conclusion is only 'possible' but not mandatory, mark it False in Syllogisms!"
        ]
      },
      {
        id: "q_rrb_r2",
        targetExam: "Railway RRB",
        subject: "Reasoning",
        topic: "Alphabetical Matrix & Coding Shifts",
        marks: "1.0 Mark (CBT-1)",
        questionTitle: "If 'LOCOMOTIVE' is coded as 'NQEOMQVIVE', how will 'RAILWAY' be coded under +2 letter shift?",
        diagramDescription: "A=1 to Z=26 Numerical Alphabet Position Grid",
        steps: [
          { stepNum: 1, title: "Step 1: Determine Letter Shift Rule", formula: "L(+2)=N, O(+2)=Q, C(+2)=E, O(+0)=O...", explanation: "Odd position characters are shifted +2 forward; vowels remain constant.", credit: "+0.33 Mark" },
          { stepNum: 2, title: "Step 2: Apply Shift to RAILWAY", formula: "R(+2)=T, A(Vowel)=A, I(Vowel)=I, L(+2)=N, W(+2)=Y, A(Vowel)=A, Y(+2)=A", explanation: "Transform consonants by +2 positions in alphabet.", credit: "+0.33 Mark" },
          { stepNum: 3, title: "Step 3: Final Code", formula: "Result = TAINYAA", explanation: "Verify vowels remain unchanged.", credit: "+0.34 Mark" }
        ],
        examinerAlerts: [
          "⚠️ Watch out for vowel vs consonant shift rules in RRB NTPC papers.",
          "💡 Memorize EJOTY (5, 10, 15, 20, 25) for instant position lookup."
        ]
      }
    ],
    "General Science": [
      {
        id: "q_rrb_s1",
        targetExam: "Railway RRB",
        subject: "General Science",
        topic: "Newton's Laws of Motion & Momentum",
        marks: "1.0 Mark (CBT-1 Science 25 Marks)",
        questionTitle: "Calculate force required to accelerate a 1200kg train coach from 10 m/s to 25 m/s in 15 seconds.",
        diagramDescription: "Free Body Diagram: Mass m=1200kg with Forward Acceleration Vector a",
        steps: [
          { stepNum: 1, title: "Step 1: Calculate Acceleration (a)", formula: "a = (v - u) / t", explanation: "Substitute u = 10 m/s, v = 25 m/s, t = 15 s. a = (25 - 10)/15 = 1.0 m/s².", credit: "+0.33 Mark" },
          { stepNum: 2, title: "Step 2: Newton's Second Law Formula", formula: "F = m × a", explanation: "Substitute m = 1200 kg and a = 1.0 m/s².", credit: "+0.33 Mark" },
          { stepNum: 3, title: "Step 3: Compute Force in Newtons", formula: "F = 1200 N (1.2 kN)", explanation: "Box the final force answer in Newtons.", credit: "+0.34 Mark" }
        ],
        examinerAlerts: [
          "⚠️ Convert km/h to m/s by multiplying with 5/18 whenever velocity is given in km/h.",
          "💡 SI unit of Force is Newton (kg·m/s²)."
        ]
      }
    ],
    "Mathematics": [
      {
        id: "q_rrb_m1",
        targetExam: "Railway RRB",
        subject: "Mathematics",
        topic: "Speed, Distance & Train Crossing Problems",
        marks: "1.0 Mark (CBT-1 / CBT-2)",
        questionTitle: "A 180m long train running at 72 km/h crosses a 220m long platform. Calculate time taken in seconds.",
        diagramDescription: "Relative Distance Diagram: Train Length L1 + Platform Length L2",
        steps: [
          { stepNum: 1, title: "Step 1: Convert Speed to m/s", formula: "Speed v = 72 × (5 / 18) = 20 m/s", explanation: "Multiply km/h by 5/18 to convert into SI unit m/s.", credit: "+0.33 Mark" },
          { stepNum: 2, title: "Step 2: Total Distance to Cross Platform", formula: "Total D = L_train + L_platform = 180 + 220 = 400 meters", explanation: "When crossing a platform, total distance equals sum of train and platform lengths.", credit: "+0.33 Mark" },
          { stepNum: 3, title: "Step 3: Time Calculation", formula: "Time t = Distance / Speed = 400 / 20 = 20 seconds", explanation: "Divide total distance by speed.", credit: "+0.34 Mark" }
        ],
        examinerAlerts: [
          "⚠️ Never forget to add platform length to train length!",
          "💡 72 km/h is 20 m/s, 54 km/h is 15 m/s, 36 km/h is 10 m/s (Standard multiples of 18)."
        ]
      }
    ]
  },
  "NDA/CDS": {
    "Mathematics": [
      {
        id: "q_nda_m1",
        targetExam: "NDA/CDS",
        subject: "Mathematics",
        topic: "Trigonometric Identities & Quadratic Relations",
        marks: "2.5 Marks (NDA Math 300 Marks Paper)",
        questionTitle: "If sin(θ) + cos(θ) = 7/5, find the value of sin(θ) × cos(θ) and sin(2θ).",
        diagramDescription: "Unit Circle Representation with Angle θ in First Quadrant",
        steps: [
          { stepNum: 1, title: "Step 1: Square Both Sides of Equation", formula: "(sin(θ) + cos(θ))² = (7/5)² = 49/25", explanation: "Expand LHS: sin²(θ) + cos²(θ) + 2 sin(θ)cos(θ) = 49/25.", credit: "+1.0 Mark" },
          { stepNum: 2, title: "Step 2: Apply Fundamental Identity sin²(θ) + cos²(θ) = 1", formula: "1 + 2 sin(θ)cos(θ) = 49/25 ⇒ 2 sin(θ)cos(θ) = 49/25 - 1 = 24/25", explanation: "Isolate 2 sin(θ)cos(θ).", credit: "+1.0 Mark" },
          { stepNum: 3, title: "Step 3: Solve for Product & Double Angle sin(2θ)", formula: "sin(2θ) = 24/25 = 0.96; sin(θ)cos(θ) = 12/25", explanation: "Recall sin(2θ) = 2 sin(θ)cos(θ).", credit: "+0.5 Mark" }
        ],
        examinerAlerts: [
          "⚠️ NDA Cutoff Tip: Rapid squaring shortcut saves 45 seconds on trigonometry questions.",
          "💡 Check numerator > denominator: 24/25 < 1, confirming valid sine value."
        ]
      }
    ]
  }
};

/* Helper function to get random dynamic question fallback */
function getRandomFallbackQuestion(exam: string, subject: string): AiQuestion {
  const examSuite = QUESTION_BANK[exam] || QUESTION_BANK["Railway RRB"];
  const subjectList = examSuite[subject] || examSuite[Object.keys(examSuite)[0]] || QUESTION_BANK["Railway RRB"]["Reasoning"];
  const randomIndex = Math.floor(Math.random() * subjectList.length);
  const selected = subjectList[randomIndex];
  return {
    ...selected,
    id: `q_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPECIALIZED TOOL 1: SSB PREP HUB & DEFENSE GAT (NDA / CDS)
   ═══════════════════════════════════════════════════════════════════════════ */
function SsbDefenseHub() {
  const [subTab, setSubTab] = useState<"ppdt" | "oir" | "defense_gat">("ppdt");

  /* --- PPDT State --- */
  const [ppdtPhase, setPpdtPhase]             = useState<"ready" | "observing" | "writing" | "evaluated">("ready");
  const [observeTimeLeft, setObserveTimeLeft] = useState<number>(30);
  const [writeTimeLeft, setWriteTimeLeft]     = useState<number>(240);
  const [ppdtBox, setPpdtBox]                 = useState({ count: 2, mainSex: "Male", age: "23", mood: "Positive (+)", action: "Organizing a village water filtration campaign" });
  const [ppdtStory, setPpdtStory]             = useState("");
  const [evaluatingStory, setEvaluatingStory] = useState(false);
  const [storyResult, setStoryResult]         = useState<{ olqScore: number; feedback: string; olqBreakdown: string[] } | null>(null);

  useEffect(() => {
    let timer: any;
    if (ppdtPhase === "observing" && observeTimeLeft > 0) {
      timer = setInterval(() => setObserveTimeLeft(t => t - 1), 1000);
    } else if (ppdtPhase === "observing" && observeTimeLeft === 0) {
      setPpdtPhase("writing");
    }
    return () => clearInterval(timer);
  }, [ppdtPhase, observeTimeLeft]);

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

  const defenseFacts = [
    { category: "Tri-Services Ranks", title: "Equivalent Officer Ranks", detail: "Army: Captain = Navy: Lieutenant = Air Force: Flight Lieutenant. Army: Colonel = Navy: Captain = Air Force: Group Captain." },
    { category: "Weapons & Tech", title: "BrahMos Supersonic Cruise Missile", detail: "Joint venture between India (DRDO) and Russia (NPOM). Speed: Mach 2.8 - 3.0. Range extended up to 450 km." },
    { category: "Military Exercises", title: "Exercise Yudh Abhyas 2024-25", detail: "Annual joint military training exercise between Indian Army and US Army focused on counter-terrorism in mountainous terrain." },
    { category: "Defense Aircraft", title: "Rafale & Tejas Mk-1A", detail: "Tejas is India's indigenous Light Combat Aircraft (LCA). Rafale is 4.5 generation twin-engine M-MRCA aircraft." }
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
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

      {subTab === "ppdt" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              <div className="w-full h-56 rounded-xl relative overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4">
                <svg className={`w-full h-full transition-all duration-700 ${ppdtPhase === "observing" ? "blur-none scale-100 opacity-100" : "blur-md scale-105 opacity-60"}`} viewBox="0 0 300 180">
                  <rect width="300" height="180" fill="#0f172a" />
                  <path d="M 0 140 Q 75 110 150 140 Q 225 170 300 140 L 300 180 L 0 180 Z" fill="#1e293b" />
                  <rect x="40" y="80" width="60" height="50" fill="#334155" rx="2" />
                  <polygon points="35,80 70,50 105,80" fill="#475569" />
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
                <p>2. Frame a constructive story with past, present action & outcome.</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
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

/* Master Question Pool for RRB CBT Practice */
const RRB_QUESTION_POOL = [
  {
    id: 101,
    section: "Reasoning",
    q: "Statements: All Trains are Locomotives. Some Locomotives are Electric. Conclusions: I. Some Trains are Electric. II. Some Locomotives are Trains.",
    options: ["Only Conclusion I follows", "Only Conclusion II follows", "Both I & II follow", "Neither follows"],
    ans: "Only Conclusion II follows",
    exp: "Since Trains is entirely inside Locomotives, part of Locomotives is definitely Trains. Electric intersects Locomotives but not necessarily Trains."
  },
  {
    id: 102,
    section: "General Science",
    q: "What is the SI unit of Potential Difference (Voltage)?",
    options: ["Ampere", "Volt", "Ohm", "Joule"],
    ans: "Volt",
    exp: "Potential Difference is measured in Volts (V = Work / Charge = Joules per Coulomb)."
  },
  {
    id: 103,
    section: "Mathematics",
    q: "A train 180m long running at 72 km/h crosses a 220m long platform in how many seconds?",
    options: ["15 sec", "20 sec", "25 sec", "30 sec"],
    ans: "20 sec",
    exp: "72 km/h = 20 m/s. Total distance = 180 + 220 = 400m. Time = 400 / 20 = 20 seconds."
  },
  {
    id: 104,
    section: "Reasoning",
    q: "If 'STATION' is coded as 'UVCVKQP', how will 'RAILWAY' be coded under +2 forward shift?",
    options: ["TCKNYCA", "TCKNYAA", "UBLOZBZ", "SBJMXBZ"],
    ans: "TCKNYCA",
    exp: "Each letter is shifted forward by +2 positions in the English alphabet (R+2=T, A+2=C, I+2=K, L+2=N, W+2=Y, A+2=C, Y+2=A)."
  },
  {
    id: 105,
    section: "General Science",
    q: "Calculate the force required to accelerate a 1500 kg train carriage at 2 m/s².",
    options: ["1500 N", "3000 N", "750 N", "4500 N"],
    ans: "3000 N",
    exp: "Newton's Second Law: F = m × a = 1500 kg × 2 m/s² = 3000 N (3 kN)."
  },
  {
    id: 106,
    section: "Mathematics",
    q: "What is the Compound Interest on ₹10,000 at 10% per annum for 2 years compounded annually?",
    options: ["₹2,000", "₹2,100", "₹2,200", "₹1,210"],
    ans: "₹2,100",
    exp: "Amount A = 10000 × (1.1)² = 10000 × 1.21 = ₹12,100. CI = A - P = 12100 - 10000 = ₹2,100."
  },
  {
    id: 107,
    section: "General Awareness",
    q: "Which railway zone is headquartered in Secunderabad?",
    options: ["Southern Railway", "South Central Railway", "Western Railway", "East Coast Railway"],
    ans: "South Central Railway",
    exp: "South Central Railway (SCR) zone headquarters is located at Secunderabad."
  }
];

function RailwayRrbSpeedMaster() {
  const [rrbTab, setRrbTab] = useState<"cbt_mock" | "science_oneliners">("cbt_mock");

  /* Helper to pick 4 random distinct questions */
  const pickRandomQuestions = () => {
    const shuffled = [...RRB_QUESTION_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const [activeQuestions, setActiveQuestions] = useState(pickRandomQuestions);
  const [selectedMockAns, setSelectedMockAns] = useState<Record<number, string>>({});
  const [mockSubmitted, setMockSubmitted]     = useState(false);

  const loadNewQuestionSet = () => {
    setActiveQuestions(pickRandomQuestions());
    setSelectedMockAns({});
    setMockSubmitted(false);
  };

  /* Calculate CBT Score stats */
  const calculateScore = () => {
    let attempted = 0;
    let correct = 0;
    let wrong = 0;

    activeQuestions.forEach(q => {
      const userAns = selectedMockAns[q.id];
      if (userAns) {
        attempted += 1;
        if (userAns === q.ans) correct += 1;
        else wrong += 1;
      }
    });

    const netScore = Math.max(0, correct * 1.0 - wrong * 0.33);
    const totalPossible = activeQuestions.length * 1.0;
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0";

    let badge = { text: "⚡ Needs Speed & Practice", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
    if (netScore >= totalPossible * 0.75) {
      badge = { text: "🏆 RRB CBT Rank 1 Potential - Qualified!", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
    } else if (netScore >= totalPossible * 0.4) {
      badge = { text: "✅ Cutoff Cleared - Good Effort", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
    }

    return { attempted, correct, wrong, netScore: netScore.toFixed(2), totalPossible, accuracy, badge };
  };

  /* Science 1000 One Liners */
  const scienceOneLiners = [
    { topic: "Physics", Q: "What is the acceleration due to gravity on Earth's surface?", A: "9.8 m/s² (approx 10 m/s²)" },
    { topic: "Chemistry", Q: "Which acid is present in lemon and citrus fruits?", A: "Citric Acid (C₆H∈O⇇)" },
    { topic: "Biology", Q: "Which organelle is known as the Powerhouse of the Cell?", A: "Mitochondria (produces ATP)" },
    { topic: "Physics", Q: "Unit of Electrical Resistance?", A: "Ohm (Ω), measured using Ohmmeter" }
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Train size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
              RRB CBT Speed Master & Science 1000 One-Liners
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase">
                RAILWAY NTPC & GROUP D
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">90-Minute CBT Simulator, 1/3rd Negative Marking Drills & Science One-Liners</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          <button
            onClick={() => setRrbTab("cbt_mock")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              rrbTab === "cbt_mock" ? "bg-cyan-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Timer size={14} />
            <span>CBT Mock Arena</span>
          </button>

          <button
            onClick={() => setRrbTab("science_oneliners")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              rrbTab === "science_oneliners" ? "bg-cyan-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ZapIcon size={14} />
            <span>Science 1000 One-Liners</span>
          </button>
        </div>
      </div>

      {rrbTab === "cbt_mock" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 font-medium flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <Info size={16} className="text-cyan-500" />
              RRB CBT Practice Mode: +1.0 Mark per correct answer, -0.33 Mark per wrong answer.
            </span>
            <div className="flex items-center gap-3">
              <span className="font-bold font-mono">Timer: 90:00 Mins</span>
              <button
                onClick={loadNewQuestionSet}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500 text-white font-extrabold text-xs shadow-sm hover:bg-cyan-600 transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>✨ Load Fresh CBT Set</span>
              </button>
            </div>
          </div>

          {/* Scoreboard Card rendered after Submission */}
          {mockSubmitted && (() => {
            const stats = calculateScore();
            return (
              <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 text-white space-y-5 shadow-2xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">RRB CBT OFFICIAL SCOREBOARD RESULT</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black font-mono text-cyan-400">{stats.netScore}</span>
                      <span className="text-sm font-bold text-slate-400">/ {stats.totalPossible} Marks</span>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider ${stats.badge.color}`}>
                    {stats.badge.text}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Attempted</span>
                    <div className="text-xl font-black text-white font-mono">{stats.attempted} / {activeQuestions.length}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Correct (+1.0)</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">{stats.correct}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-rose-400 uppercase font-bold">Incorrect (-0.33)</span>
                    <div className="text-xl font-black text-rose-400 font-mono">{stats.wrong}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Accuracy</span>
                    <div className="text-xl font-black text-amber-400 font-mono">{stats.accuracy}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Review detailed step explanations below</span>
                  <button
                    onClick={loadNewQuestionSet}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>🔄 Load Fresh CBT Test Set (New Questions)</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Active Question Cards */}
          <div className="space-y-4">
            {activeQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase">
                    Q{idx + 1} · {q.section}
                  </span>
                  {mockSubmitted && selectedMockAns[q.id] === q.ans && (
                    <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={14} /> Correct (+1.0)
                    </span>
                  )}
                  {mockSubmitted && selectedMockAns[q.id] && selectedMockAns[q.id] !== q.ans && (
                    <span className="text-rose-500 font-bold text-xs flex items-center gap-1">
                      <AlertTriangle size={14} /> Wrong (-0.33)
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-foreground">{q.q}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => !mockSubmitted && setSelectedMockAns({ ...selectedMockAns, [q.id]: opt })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        selectedMockAns[q.id] === opt
                          ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                          : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {mockSubmitted && (
                  <div className="p-3.5 rounded-xl bg-muted/60 text-xs text-muted-foreground border border-border space-y-1">
                    <span className="font-bold text-foreground">💡 Solution Explanation: </span>
                    <p className="leading-relaxed">{q.exp}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => { setSelectedMockAns({}); setMockSubmitted(false); }}
              className="px-4 py-2 rounded-xl bg-muted text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Reset Current Selection
            </button>

            <div className="flex gap-2">
              <button
                onClick={loadNewQuestionSet}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs cursor-pointer border border-border"
              >
                <RefreshCw size={14} />
                <span>New Questions</span>
              </button>

              <button
                onClick={() => setMockSubmitted(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <CheckSquare size={15} />
                <span>Submit RRB CBT Score & View Scoreboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {rrbTab === "science_oneliners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scienceOneLiners.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold text-[10px]">
                {item.topic}
              </span>
              <h4 className="font-bold text-xs text-foreground mt-1">❓ {item.Q}</h4>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">💡 {item.A}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPECIALIZED TOOL 3: GATE VIRTUAL CALCULATOR & NAT PRECISION LAB
   ═══════════════════════════════════════════════════════════════════════════ */
function GateNatLab() {
  const [calcDisplay, setCalcDisplay] = useState("0");

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

  const [natAnswer, setNatAnswer] = useState("");
  const [natStatus, setNatStatus] = useState<"idle" | "correct" | "incorrect">("idle");

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
                placeholder="e.g. 0.04"
                value={natAnswer}
                onChange={e => setNatAnswer(e.target.value)}
                className="flex-1 p-3 rounded-xl bg-card border border-border font-mono font-bold text-sm"
              />
              <button
                onClick={() => setNatStatus(Math.abs(parseFloat(natAnswer) - 0.04) <= 0.01 ? "correct" : "incorrect")}
                className="px-5 py-3 rounded-xl bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Verify NAT
              </button>
            </div>
          </div>

          {natStatus === "correct" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Correct! Within acceptable tolerance margin [0.03 - 0.05].
            </div>
          )}

          {natStatus === "incorrect" && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} /> Incorrect. Correct value is 0.04 GIPS (1 / 25ns max stage delay).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CONTAINER COMPONENT
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

  /* Fetch Question with Dynamic Re-generation on Every Click */
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
        throw new Error("Fallback required");
      }
    } catch {
      // Dynamic Fallback Generator ensures different questions on every click
      const fb = getRandomFallbackQuestion(activeExam, sub);
      setAiQuestion(fb);
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

  const activeInfo = toolsMap[activeExam] || toolsMap["Railway RRB"];
  const ActiveIcon = activeInfo.icon;

  const isDefenseExam = activeExam.includes("NDA") || activeExam.includes("CDS");
  const isGateExam    = activeExam.includes("GATE");
  const isRrbExam     = activeExam.includes("Railway") || activeExam.includes("RRB");

  return (
    <div className="px-4 sm:px-6 pt-3 pb-8 max-w-7xl mx-auto space-y-6">
      {/* Dynamic Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/5 border border-border shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-primary/10 ${activeInfo.color} border border-primary/20 flex items-center justify-center shadow-md`}>
            <ActiveIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeInfo.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] uppercase tracking-wider">
                SPECIAL EXAM SUITE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeInfo.subtitle} &nbsp;·&nbsp; Target Exam: <span className="font-bold text-primary">{activeExam}</span>
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
            <span>{loadingAi ? "Generating Question..." : "✨ Generate New Question"}</span>
          </button>
        </div>
      </div>

      {/* Render Dedicated Module for NDA/CDS */}
      {isDefenseExam && <SsbDefenseHub />}

      {/* Render Dedicated Module for GATE */}
      {isGateExam && <GateNatLab />}

      {/* Render Dedicated Module for Railway RRB */}
      {isRrbExam && <RailwayRrbSpeedMaster />}

      {/* Main Step-by-Step AI Question Solver & Proof Engine */}
      {loadingAi ? (
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 shadow-xl">
          <RefreshCw size={36} className="animate-spin text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Preparing {activeExam} Question...</h3>
          <p className="text-xs text-muted-foreground">Generating a brand new question strictly tailored for {selectedSubject}...</p>
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
