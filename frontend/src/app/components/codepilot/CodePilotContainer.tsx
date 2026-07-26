import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Bot, Code2, ListFilter, Map, BookOpen,
  Trophy, Mic, FileText, Github, Briefcase, GraduationCap,
  BarChart3, Award, Sparkles, Search, Layers, Compass, Zap
} from "lucide-react";

import HomeDashboard from "./HomeDashboard";
import AICodingAssistant from "./AICodingAssistant";
import MonacoCodeEditor from "./MonacoCodeEditor";
import ProblemList from "./ProblemList";
import ProblemPage from "./ProblemPage";
import LearningRoadmaps from "./LearningRoadmaps";
import DSALearning from "./DSALearning";
import ContestPlatform from "./ContestPlatform";
import MockInterviews from "./MockInterviews";
import EngineeringExam from "./EngineeringExam";
import AnalyticsDashboard from "./AnalyticsDashboard";
import Achievements from "./Achievements";
import AIPersonalizedPlan from "./AIPersonalizedPlan";
import CommandPalette from "./CommandPalette";

import { useAuth } from "../../context/AuthContext";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Core" },
  { id: "assistant", label: "AI Mentor", icon: Bot, category: "Core", badge: "AI" },
  { id: "editor", label: "Code Editor", icon: Code2, category: "Core" },
  { id: "problems", label: "Problems", icon: ListFilter, category: "Practice" },
  { id: "roadmaps", label: "Roadmaps", icon: Map, category: "Learn" },
  { id: "dsa", label: "DSA Visualizer", icon: BookOpen, category: "Learn", badge: "Interactive" },
  { id: "contests", label: "Contests", icon: Trophy, category: "Practice" },
  { id: "mock_interview", label: "AI Interview", icon: Mic, category: "Career", badge: "Voice" },
  { id: "sppu", label: "SPPU Engineering", icon: GraduationCap, category: "Exam & Prep" },
  { id: "analytics", label: "Analytics", icon: BarChart3, category: "Stats" },
  { id: "achievements", label: "Rewards & XP", icon: Award, category: "Stats" },
  { id: "ai_plan", label: "AI Study Plan", icon: Sparkles, category: "Core", badge: "Auto" },
];

export default function CodePilotContainer() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  const currentExam = (user?.exam || localStorage.getItem("targetExam") || "Engineering").toLowerCase();
  const isEngineeringTarget =
    currentExam.includes("engineering") ||
    currentExam.includes("gate") ||
    currentExam.includes("sppu") ||
    currentExam.includes("computer") ||
    currentExam.includes("coding") ||
    currentExam.includes("software") ||
    currentExam.includes("tech") ||
    !user?.exam;

  const handleSwitchToEngineering = () => {
    localStorage.setItem("targetExam", "Engineering");
    updateUser({ exam: "Engineering" });
  };

  // Command palette hotkey listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    setActiveTab("problem_detail");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-purple-500/30">

      {/* Particle & Gradient Accent Background */}
      {particlesEnabled && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-30">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px]" />
        </div>
      )}

      {/* CodePilot Header Banner */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/60 shadow-xs px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-background/90 rounded-[10px] flex items-center justify-center text-purple-500 font-bold">
              <Zap size={20} className="fill-purple-500/20 text-purple-500" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                CodePilot AI
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Exclusive for Engineering Students & Competitive Coding Prep
            </p>
          </div>
        </div>

        {/* Search Command Palette Trigger & Particle Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground hover:border-purple-500/50 hover:text-foreground transition-all shadow-inner"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search problems, roadmaps, tools...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border text-[10px] font-semibold text-muted-foreground">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={() => setParticlesEnabled(!particlesEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium transition-all ${
              particlesEnabled
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Ambient Glass Effect"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </header>

      {/* Sub-Navigation Tabs Bar */}
      <nav className="sticky top-[65px] z-20 backdrop-blur-md bg-card/60 border-b border-border/40 px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar shadow-xs">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (activeTab === "problem_detail" && tab.id === "problems");

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "problems") setSelectedProblemId(null);
                }}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-4 lg:p-8 max-w-full w-full mx-auto overflow-x-hidden">
        {!isEngineeringTarget ? (
          <div className="p-8 lg:p-12 rounded-3xl bg-card/90 border border-purple-500/40 text-center space-y-6 shadow-2xl backdrop-blur-xl my-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto text-2xl">
              🎓
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">CodePilot AI is Exclusive to the Engineering Section</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your current target exam is set to <span className="text-purple-400 font-bold uppercase">{user?.exam || currentExam}</span>.
                CodePilot AI (Compiler, DSA visualizer, Monaco Editor, Placement Prep, SPPU Labs) is tailored specifically for Engineering & Coding Target Exams.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSwitchToEngineering}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs shadow-lg hover:brightness-110"
              >
                Switch Target Exam to Engineering Section
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedProblemId || "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === "dashboard" && (
                <HomeDashboard
                  onNavigateTab={(tabId) => setActiveTab(tabId)}
                  onSelectProblem={handleSelectProblem}
                />
              )}

            {activeTab === "assistant" && <AICodingAssistant />}

            {activeTab === "editor" && <MonacoCodeEditor />}

            {activeTab === "problems" && (
              <ProblemList onSelectProblem={handleSelectProblem} />
            )}

            {activeTab === "problem_detail" && (
              <ProblemPage
                problemId={selectedProblemId || "two-sum"}
                onBack={() => setActiveTab("problems")}
              />
            )}

            {activeTab === "roadmaps" && <LearningRoadmaps />}

            {activeTab === "dsa" && <DSALearning />}

            {activeTab === "contests" && <ContestPlatform />}

            {activeTab === "mock_interview" && <MockInterviews />}

            {activeTab === "sppu" && <EngineeringExam />}

            {activeTab === "analytics" && <AnalyticsDashboard />}

            {activeTab === "achievements" && <Achievements />}

            {activeTab === "ai_plan" && <AIPersonalizedPlan />}
          </motion.div>
        </AnimatePresence>
        )}
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setCmdOpen(false);
        }}
      />
    </div>
  );
}
