import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Lightbulb, FileText, MessageSquare, Video, Bookmark,
  Share2, CheckCircle2, ShieldCheck, Star, Play, Code2, Sparkles, AlertCircle, Loader2
} from "lucide-react";
import MonacoCodeEditor from "./MonacoCodeEditor";
import { getAuthToken } from "../../lib/api";

interface ProblemPageProps {
  problemId: string;
  onBack: () => void;
}

export default function ProblemPage({ problemId, onBack }: ProblemPageProps) {
  const [activeTab, setActiveTab] = useState<"statement" | "hints" | "editorial" | "discussion" | "video" | "review">("statement");
  const [hintLevel, setHintLevel] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [codeReviewData, setCodeReviewData] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/codepilot/problems/${problemId}`, { headers });
      const data = await res.json();

      if (data.success && data.problem) {
        setProblem(data.problem);
      }
    } catch (err) {
      console.error("Failed to fetch problem details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAICodeReview = async () => {
    if (!problem) return;
    setLoadingReview(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/review", {
        method: "POST",
        headers,
        body: JSON.stringify({
          code: problem.codeSnippets?.javascript || "// Solution code",
          language: "javascript",
          problemId
        })
      });
      const data = await res.json();
      if (data.success) {
        setCodeReviewData(data.review);
      }
    } catch (err) {
      console.error("Review failed", err);
    } finally {
      setLoadingReview(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="p-12 text-center text-purple-400 font-bold flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={24} /> Loading problem details...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-card/80 border border-border shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground">{problem.title}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                {problem.difficulty}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Acceptance: {problem.acceptance} • Companies: {problem.companies?.join(", ") || "Tech"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              bookmarked ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-muted border-border text-muted-foreground"
            }`}
          >
            <Bookmark size={14} className={bookmarked ? "fill-amber-400" : ""} /> {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>

          <button
            onClick={() => {
              setActiveTab("review");
              handleRunAICodeReview();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:brightness-110"
          >
            <ShieldCheck size={14} /> Run AI Code Review
          </button>
        </div>
      </div>

      {/* Grid: Left Column Tabs vs Right Column Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column Problem Details & Tabs */}
        <div className="lg:col-span-5 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl flex flex-col justify-between">

          {/* Sub Tab Bar */}
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
            {(["statement", "hints", "editorial", "discussion", "video", "review"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Views */}
          <div className="space-y-4 overflow-y-auto max-h-[540px] pr-2">

            {/* Statement View */}
            {activeTab === "statement" && (
              <div className="space-y-4 text-xs text-foreground leading-relaxed">
                <div className="whitespace-pre-wrap">{problem.statement}</div>

                {/* Examples */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400">Examples</h4>
                  {(problem.examples || []).map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1 font-mono text-[11px]">
                      <div><strong className="text-muted-foreground">Input:</strong> {ex.input}</div>
                      <div><strong className="text-muted-foreground">Output:</strong> {ex.output}</div>
                      {ex.explanation && <div className="text-muted-foreground font-sans mt-1">Explanation: {ex.explanation}</div>}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400">Constraints</h4>
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-muted-foreground">
                    {(problem.constraints || []).map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* AI Multi-Level Hint System */}
            {activeTab === "hints" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-sm">
                    <Lightbulb className="text-amber-400" size={16} /> AI Hint Progressive Reveal
                  </h4>
                </div>

                <div className="space-y-3">
                  {[
                    { level: 1, label: "Hint 1", content: problem.hints?.[0] },
                    { level: 2, label: "Hint 2", content: problem.hints?.[1] },
                    { level: 3, label: "Hint 3", content: problem.hints?.[2] },
                    { level: 4, label: "Approach Strategy", content: problem.approach },
                    { level: 5, label: "Pseudo Code", content: problem.pseudoCode },
                  ].map((h) => (
                    <div key={h.level} className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{h.label}</span>
                        {hintLevel >= h.level ? (
                          <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Revealed
                          </span>
                        ) : (
                          <button
                            onClick={() => setHintLevel(h.level)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold hover:brightness-110"
                          >
                            Unlock Level {h.level}
                          </button>
                        )}
                      </div>

                      {hintLevel >= h.level && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-2 border-t border-border/40 font-mono text-[11px] text-purple-200 whitespace-pre-wrap"
                        >
                          {h.content || "No hint content."}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Code Review Tab */}
            {activeTab === "review" && (
              <div className="space-y-4 text-xs">
                {loadingReview ? (
                  <div className="p-8 text-center text-purple-400 animate-pulse">
                    <Sparkles className="mx-auto mb-2" size={24} /> Analyzing code structure across 7 quality metrics...
                  </div>
                ) : codeReviewData ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 text-center space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Overall AI Score</span>
                      <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {codeReviewData.overallScore} / 100
                      </div>
                      <p className="text-xs text-purple-200/80">{codeReviewData.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(codeReviewData.metrics || {}).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                          <span className="text-[11px] capitalize text-muted-foreground">{key}</span>
                          <span className="font-bold text-foreground font-mono">{String(val)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Click "Run AI Code Review" above to analyze code quality and get a score out of 100.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column Monaco Editor */}
        <div className="lg:col-span-7">
          <MonacoCodeEditor />
        </div>

      </div>

    </div>
  );
}
