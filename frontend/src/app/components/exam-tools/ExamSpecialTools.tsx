import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Zap, Dna, Calculator, BarChart3, BookOpen, Timer, Shield, Train, FileText,
  Sparkles, Check, RefreshCw, Eye, ArrowRight, CheckCircle2, AlertTriangle,
  Award, Copy, Info, Sliders, Activity, Flame, HelpCircle, EyeOff, RotateCcw,
  CheckSquare, ChevronDown, Beaker, FlaskConical, Droplets, Lightbulb, MessageSquare
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
   VIRTUAL PRACTICAL LAB & EXPERIMENT DOUBT SOLVER (CLASS 10 & 12)
   ═══════════════════════════════════════════════════════════════════════════ */
function VirtualPracticalLab() {
  const [activeExp, setActiveExp] = useState<"physics" | "chemistry" | "biology">("physics");

  /* --- Physics Experiment State (Snell's Law & Refraction) --- */
  const [incidentAngle, setIncidentAngle] = useState<number>(45); // i in deg
  const [refIndex, setRefIndex]           = useState<number>(1.5); // n (Glass = 1.5, Water = 1.33, Diamond = 2.42)

  // Snell's Law: sin(i) / sin(r) = n => sin(r) = sin(i) / n
  const sinI = Math.sin((incidentAngle * Math.PI) / 180);
  const sinR = Math.min(0.999, sinI / refIndex);
  const refractAngle = (Math.asin(sinR) * 180) / Math.PI;
  const lateralShift = (40 * Math.sin(((incidentAngle - refractAngle) * Math.PI) / 180) / Math.cos((refractAngle * Math.PI) / 180)).toFixed(1);

  /* --- Chemistry Experiment State (Acid-Base Titration) --- */
  const [naohVolume, setNaohVolume] = useState<number>(10); // mL added
  const [indicator, setIndicator]   = useState<"phenolphthalein" | "universal" | "methyl">("phenolphthalein");

  // pH calculation simulation: 25mL is equivalence point (pH = 7)
  const calcPh = naohVolume < 24
    ? (2.0 + (naohVolume / 24) * 3.5).toFixed(1)
    : naohVolume === 25
    ? "7.0"
    : (7.0 + ((naohVolume - 25) / 25) * 5.5).toFixed(1);

  const numericPh = parseFloat(calcPh);

  const getSolutionColor = () => {
    if (indicator === "phenolphthalein") {
      return numericPh >= 8.2 ? "rgba(236, 72, 153, 0.85)" : "rgba(241, 245, 249, 0.25)";
    } else if (indicator === "universal") {
      if (numericPh < 4) return "rgba(239, 68, 68, 0.85)";
      if (numericPh < 7) return "rgba(234, 179, 8, 0.85)";
      if (numericPh === 7) return "rgba(34, 197, 94, 0.85)";
      return "rgba(59, 130, 246, 0.85)";
    } else {
      return numericPh < 4.4 ? "rgba(239, 68, 68, 0.85)" : "rgba(234, 179, 8, 0.85)";
    }
  };

  /* --- Biology Experiment State (Photosynthesis Bubble Rate) --- */
  const [lightIntensity, setLightIntensity] = useState<number>(60); // %
  const [waterTemp, setWaterTemp]           = useState<number>(25); // °C

  const bubbleRate = Math.round(
    (lightIntensity / 100) * (waterTemp <= 35 ? waterTemp / 35 : Math.max(0, (45 - waterTemp) / 10)) * 50
  );

  /* --- AI Experiment Doubt Solver --- */
  const [doubtText, setDoubtText]         = useState("");
  const [doubtAnswer, setDoubtAnswer]     = useState<string | null>(null);
  const [loadingDoubt, setLoadingDoubt]   = useState(false);

  const prefilledDoubts = [
    "Why does the emergent ray emerge parallel to the incident ray in a glass slab?",
    "Why does phenolphthalein turn bright pink at the titration endpoint?",
    "What limits the rate of photosynthesis if water temperature exceeds 40°C?"
  ];

  const handleAskDoubt = async (queryText: string = doubtText) => {
    if (!queryText.trim()) return;
    setLoadingDoubt(true);
    setDoubtAnswer(null);
    try {
      const res = await apiRequest<{ success: boolean; text?: string; answer?: string }>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          message: `Experiment Doubt for ${activeExp.toUpperCase()} Lab:\nQuestion: ${queryText}\nProvide a concise, crystal-clear conceptual answer matching CBSE Board practical exam standards.`
        })
      });
      if (res?.text || res?.answer) {
        setDoubtAnswer(res.text || res.answer || "Conceptual doubt resolved.");
      }
    } catch {
      // Local fallbacks if backend offline
      if (queryText.includes("parallel")) {
        setDoubtAnswer("In a rectangular glass slab, refraction occurs at two parallel faces. The bending towards the normal at face 1 is exactly equal and opposite to the bending away from the normal at face 2. Thus, the emergent ray is parallel to the incident ray, shifted laterally by distance d.");
      } else if (queryText.includes("pink")) {
        setDoubtAnswer("Phenolphthalein is a weak organic acid indicator. In acidic solution (pH < 8.2), it remains un-ionized and colorless. When excess NaOH is added beyond the equivalence point (pH ≥ 8.2), it ionizes into pink-colored anions, marking the exact endpoint!");
      } else {
        setDoubtAnswer("At temperatures above 40°C, the enzymes involved in the Calvin Cycle (like RuBisCO) undergo thermal denaturation. Heat destroys their tertiary protein structure, causing the photosynthesis rate to drop sharply despite high light intensity.");
      }
    } finally {
      setLoadingDoubt(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Lab Subject Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FlaskConical size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg tracking-tight">Interactive 3D Virtual Practical Laboratory</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-black text-[10px] uppercase">
                CLASS 10 & 12 PRACTICALS
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Manipulate live data parameters, observe instant visual results & clear experiment doubts with AI</p>
          </div>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          <button
            onClick={() => { setActiveExp("physics"); setDoubtAnswer(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeExp === "physics" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders size={14} />
            <span>Physics Slab</span>
          </button>
          <button
            onClick={() => { setActiveExp("chemistry"); setDoubtAnswer(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeExp === "chemistry" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Beaker size={14} />
            <span>Chemistry Titration</span>
          </button>
          <button
            onClick={() => { setActiveExp("biology"); setDoubtAnswer(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeExp === "biology" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Droplets size={14} />
            <span>Biology Bubbles</span>
          </button>
        </div>
      </div>

      {/* ── EXPERIMENT 1: PHYSICS REFRACTION & SNELL'S LAW ── */}
      {activeExp === "physics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Canvas (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] shadow-inner space-y-4">
            <svg className="w-full h-64" viewBox="0 0 500 240">
              {/* Glass Slab */}
              <rect x="150" y="70" width="200" height="100" fill="rgba(59, 130, 246, 0.12)" stroke="#3b82f6" strokeWidth="2" rx="4" />
              <text x="220" y="125" fill="#60a5fa" fontSize="12" fontStyle="italic" fontWeight="bold">Glass Slab (n = {refIndex})</text>

              {/* Normal Line at Surface 1 */}
              <line x1="250" y1="20" x2="250" y2="180" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="254" y="35" fill="#94a3b8" fontSize="10">Normal (N)</text>

              {/* Incident Ray */}
              {(() => {
                const startX = 250 - 100 * Math.tan((incidentAngle * Math.PI) / 180);
                const refractX = 250 + 100 * Math.tan((refractAngle * Math.PI) / 180);
                return (
                  <>
                    <line x1={startX} y1="10" x2="250" y2="70" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x={startX - 15} y="20" fill="#f59e0b" fontSize="11" fontWeight="bold">Incident Ray (i={incidentAngle}°)</text>

                    {/* Refracted Ray Inside Slab */}
                    <line x1="250" y1="70" x2={refractX} y2="170" stroke="#10b981" strokeWidth="2.5" />
                    <text x={255} y="110" fill="#34d399" fontSize="10">Refracted (r={refractAngle.toFixed(1)}°)</text>

                    {/* Emergent Ray */}
                    <line x1={refractX} y1="170" x2={refractX + (250 - startX)} y2="230" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x={refractX + 10} y="220" fill="#f59e0b" fontSize="11" fontWeight="bold">Emergent Ray (e={incidentAngle}°)</text>
                  </>
                );
              })()}
            </svg>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex flex-wrap items-center justify-between w-full gap-3">
              <div>Snell's Law: <span className="text-white font-bold">sin({incidentAngle}°) / sin({refractAngle.toFixed(1)}°) = {refIndex}</span></div>
              <div>Lateral Displacement (d): <span className="text-amber-400 font-bold">{lateralShift} mm</span></div>
            </div>
          </div>

          {/* Slider Parameters (1 Col) */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sliders size={16} className="text-blue-500" />
              <span>Experiment Variables</span>
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Angle of Incidence (i):</span>
                  <span className="text-amber-400 font-mono">{incidentAngle}°</span>
                </div>
                <input
                  type="range" min="10" max="75" value={incidentAngle}
                  onChange={e => setIncidentAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Medium Refractive Index (n):</span>
                  <span className="text-blue-400 font-mono">{refIndex}</span>
                </div>
                <input
                  type="range" min="1.0" max="2.4" step="0.1" value={refIndex}
                  onChange={e => setRefIndex(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Air (1.0)</span>
                  <span>Water (1.33)</span>
                  <span>Glass (1.5)</span>
                  <span>Diamond (2.4)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPERIMENT 2: CHEMISTRY ACID-BASE TITRATION ── */}
      {activeExp === "chemistry" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] shadow-inner space-y-4">
            {/* SVG Burette & Flask */}
            <div className="flex items-center gap-8">
              <svg className="w-48 h-64" viewBox="0 0 180 240">
                {/* Burette Tube */}
                <rect x="80" y="10" width="20" height="110" fill="rgba(255,255,255,0.1)" stroke="#cbd5e1" strokeWidth="2" rx="2" />
                {/* Burette Liquid Level */}
                <rect x="82" y={12 + naohVolume * 1.8} width="16" height={106 - naohVolume * 1.8} fill="#38bdf8" />
                <text x="35" y="30" fill="#94a3b8" fontSize="10" fontMono="true">Burette (NaOH)</text>

                {/* Valve */}
                <circle cx="90" cy="125" r="4" fill="#ef4444" />

                {/* Drops Animation */}
                {naohVolume > 0 && (
                  <circle cx="90" cy="138" r="3" fill="#38bdf8" className="animate-bounce" />
                )}

                {/* Flask Body */}
                <path d="M 75 145 L 40 210 Q 35 220 45 220 L 135 220 Q 145 220 140 210 L 105 145 Z" fill="rgba(255,255,255,0.05)" stroke="#cbd5e1" strokeWidth="2" />
                {/* Flask Liquid Fill */}
                <path d="M 52 190 L 40 210 Q 35 220 45 220 L 135 220 Q 145 220 140 210 L 128 190 Z" fill={getSolutionColor()} className="transition-all duration-500" />
              </svg>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400">SOLUTION pH LEVEL</span>
                  <div className="text-4xl font-black font-mono text-white">{calcPh}</div>
                  <span className="text-xs font-bold text-slate-400">
                    {numericPh < 7 ? "Acidic Solution" : numericPh === 7 ? "Equivalence Endpoint (Neutral)" : "Basic Solution"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sliders size={16} className="text-purple-500" />
              <span>Titration Controls</span>
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Added NaOH Volume:</span>
                  <span className="text-purple-400 font-mono">{naohVolume} mL</span>
                </div>
                <input
                  type="range" min="0" max="50" step="1" value={naohVolume}
                  onChange={e => setNaohVolume(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground">Select Indicator:</span>
                <select
                  value={indicator}
                  onChange={e => setIndicator(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-muted/60 border border-border text-xs font-bold cursor-pointer"
                >
                  <option value="phenolphthalein">Phenolphthalein (Colorless → Pink)</option>
                  <option value="universal">Universal Indicator (Red → Green → Blue)</option>
                  <option value="methyl">Methyl Orange (Red → Yellow)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPERIMENT 3: BIOLOGY PHOTOSYNTHESIS BUBBLES ── */}
      {activeExp === "biology" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] shadow-inner space-y-4">
            <div className="flex items-center gap-8">
              <svg className="w-48 h-64" viewBox="0 0 180 240">
                {/* Beaker */}
                <rect x="30" y="60" width="120" height="160" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" strokeWidth="2" rx="4" />
                {/* Inverted Funnel & Test Tube */}
                <path d="M 60 210 L 90 140 L 90 70 L 100 70 L 100 140 L 130 210 Z" fill="rgba(255,255,255,0.08)" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Animated O2 Bubbles */}
                {bubbleRate > 0 && (
                  <>
                    <circle cx="95" cy="120" r="3.5" fill="#38bdf8" className="animate-ping" />
                    <circle cx="95" cy="90" r="4" fill="#38bdf8" className="animate-bounce" />
                  </>
                )}

                {/* Hydrilla Plant leaves */}
                <path d="M 85 210 Q 70 190 85 170 Q 100 150 85 130" fill="none" stroke="#22c55e" strokeWidth="4" />
              </svg>

              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">OXYGEN (O₂) BUBBLE RATE</span>
                <div className="text-4xl font-black font-mono text-emerald-400">{bubbleRate}</div>
                <span className="text-xs font-bold text-slate-400">Bubbles per Minute</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sliders size={16} className="text-emerald-500" />
              <span>Environmental Factors</span>
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Light Intensity:</span>
                  <span className="text-amber-400 font-mono">{lightIntensity}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={lightIntensity}
                  onChange={e => setLightIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Water Temperature:</span>
                  <span className="text-emerald-400 font-mono">{waterTemp}°C</span>
                </div>
                <input
                  type="range" min="10" max="45" value={waterTemp}
                  onChange={e => setWaterTemp(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI EXPERIMENT DOUBT CLEARING ASSISTANT ── */}
      <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <MessageSquare size={18} className="text-indigo-500" />
          <h4 className="font-extrabold text-sm text-foreground">AI Experiment Doubt Clearing Assistant</h4>
        </div>

        {/* Quick Doubt Inquiry Chips */}
        <div className="flex flex-wrap gap-2">
          {prefilledDoubts.map((chip, i) => (
            <button
              key={i}
              onClick={() => { setDoubtText(chip); handleAskDoubt(chip); }}
              className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-indigo-500/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer text-left"
            >
              ❓ {chip}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Ask AI any conceptual doubt about this experiment..."
            value={doubtText}
            onChange={e => setDoubtText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAskDoubt()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-medium"
          />
          <button
            onClick={() => handleAskDoubt()}
            disabled={loadingDoubt || !doubtText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {loadingDoubt ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Clear Doubt</span>
          </button>
        </div>

        {doubtAnswer && (
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-foreground leading-relaxed space-y-2 animate-fadeIn">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 size={16} /> AI Conceptual Explanation:
            </span>
            <p className="text-muted-foreground">{doubtAnswer}</p>
          </div>
        )}
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

  const userExam = getCurrentTargetExam(user);
  const paramExam = searchParams.get("exam");
  const activeExam = paramExam || userExam || "Class 10 Boards";

  const availableSubjects = getSubjectsForExam(activeExam);
  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || "Physics");

  const tabParam = searchParams.get("tab");
  const [activeTabMode, setActiveTabMode]     = useState<"special" | "lab">(tabParam === "lab" ? "lab" : "special");

  useEffect(() => {
    if (tabParam === "lab") {
      setActiveTabMode("lab");
    } else {
      setActiveTabMode("special");
    }
  }, [tabParam]);

  useEffect(() => {
    const subs = getSubjectsForExam(activeExam);
    if (!subs.includes(selectedSubject)) {
      setSelectedSubject(subs[0] || "Physics");
    }
  }, [activeExam, selectedSubject]);

  /* --- Dynamic AI Question Pipeline --- */
  const [loadingAi, setLoadingAi]         = useState(false);
  const [aiQuestion, setAiQuestion]       = useState<AiQuestion | null>(null);
  const [viewMode, setViewMode]           = useState<"simulator" | "proof" | "selftest">("simulator");
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied]               = useState(false);

  /* --- Page Refresh Warning Protection --- */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (aiQuestion) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to refresh? Your current question and progress will be lost!";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [aiQuestion]);

  const fetchNewAiQuestion = async (sub: string = selectedSubject) => {
    setLoadingAi(true);
    setRevealedSteps({});
    try {
      const res = await apiRequest<{ success: boolean; question: AiQuestion }>("/ai/exam-special", {
        method: "POST",
        body: JSON.stringify({
          targetExam: activeExam,
          subject: sub
        })
      });
      if (res?.success && res.question) {
        setAiQuestion(res.question);
      }
    } catch (err) {
      console.error("Failed to fetch Groq AI Question:", err);
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

  const activeInfo = toolsMap[activeExam] || toolsMap["Class 10 Boards"];
  const ActiveIcon = activeInfo.icon;
  const isBoardExam = activeExam.includes("Class 10") || activeExam.includes("Class 12") || activeExam.includes("Board");

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
            <p className="text-xs text-muted-foreground mt-0.5">{activeInfo.subtitle} &nbsp;·&nbsp; Target Exam: <span className="font-bold text-primary">{activeExam}</span></p>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAi ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{loadingAi ? "Generating Question..." : "✨ Generate New Question"}</span>
          </button>
        </div>
      </div>

      {/* Main Derivation Content Area */}
      {loadingAi ? (
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 shadow-xl">
          <RefreshCw size={36} className="animate-spin text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Preparing Exam Question...</h3>
          <p className="text-xs text-muted-foreground">Generating a brand new, unique {selectedSubject} question strictly tailored for {activeExam}...</p>
        </div>
      ) : aiQuestion ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-3xl bg-card border border-border shadow-xl">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
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
                    viewMode === "simulator" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders size={14} />
                  <span>Proof Steps</span>
                </button>
                <button
                  onClick={() => setViewMode("selftest")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === "selftest" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckSquare size={14} />
                  <span>PYQ Self-Test</span>
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
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-start gap-2.5">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
              <span>{aiQuestion.diagramDescription}</span>
            </div>
          )}

          {viewMode === "simulator" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {aiQuestion.steps.map((st, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{st.title}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-extrabold text-[10px]">
                        +{st.credit}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold leading-relaxed">
                      {st.formula}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{st.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Award size={18} className="text-emerald-500" />
                  <h4 className="font-bold text-sm">Examiner Marking Insights</h4>
                </div>

                <div className="space-y-3">
                  {aiQuestion.examinerAlerts.map((alert, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 font-medium space-y-1">
                      <p className="leading-relaxed">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h4 className="font-extrabold text-lg text-foreground">Interactive Formula Recall Challenge</h4>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold cursor-pointer hover:bg-emerald-500/20"
                      >
                        {revealedSteps[i] ? <EyeOff size={13} /> : <Eye size={13} />}
                        {revealedSteps[i] ? "Hide Step Formula" : "Reveal Step Formula"}
                      </button>
                    </div>

                    {revealedSteps[i] ? (
                      <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold leading-relaxed animate-fadeIn">
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
