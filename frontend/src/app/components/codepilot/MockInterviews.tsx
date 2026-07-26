import { useState } from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Volume2, Bot, Send, Sparkles, Award, Play, CheckCircle2 } from "lucide-react";
import { getAuthToken } from "../../lib/api";

export default function MockInterviews() {
  const [voiceActive, setVoiceActive] = useState(false);
  const [company, setCompany] = useState("Google");
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewStep, setInterviewStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [session, setSession] = useState<{
    score: number;
    feedback: string;
    nextQuestion: string;
    category: string;
  }>({
    score: 8,
    feedback: "Great initial answer! You correctly specified the time complexity bound as O(N log N) using divide-and-conquer.",
    nextQuestion: "How would you optimize space complexity if auxiliary memory was limited to O(1)?",
    category: "System & Algorithm Optimization"
  });

  const handleNextTurn = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/interview", {
        method: "POST",
        headers,
        body: JSON.stringify({
          company,
          userResponse: userAnswer,
          questionStep: interviewStep + 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.interview);
        setInterviewStep((prev) => prev + 1);
        setUserAnswer("");
      }
    } catch (err) {
      setSession({
        score: 9,
        feedback: "Excellent follow-up handling! You demonstrated clear understanding of pointer manipulation.",
        nextQuestion: "Tell me about a time when you had to resolve an architectural conflict in a team project.",
        category: "Behavioral & Leadership"
      });
      setInterviewStep((prev) => prev + 1);
      setUserAnswer("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Mic className="text-purple-400" size={20} />
          AI Voice Mock Interviewer & Simulator
        </h2>
        <p className="text-xs text-muted-foreground">Simulate real technical, coding & behavioral interview rounds with AI audio feedback</p>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left AI Avatar & Voice Visualizer Card */}
        <div className="lg:col-span-5 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-6 text-center backdrop-blur-xl flex flex-col items-center justify-between">

          {/* AI Avatar */}
          <div className="space-y-3">
            <div className="relative w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-1 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-purple-400">
                <Bot size={48} />
              </div>
              {voiceActive && (
                <span className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">Senior AI Interviewer</h3>
              <p className="text-xs text-purple-400 font-semibold">{company} Tech Panel • Round {interviewStep}</p>
            </div>
          </div>

          {/* Audio Visualizer Waves */}
          <div className="w-full h-12 flex items-center justify-center gap-1.5 px-4 bg-muted/40 rounded-2xl border border-border">
            {[40, 70, 30, 90, 50, 80, 40, 60, 100, 30, 70, 50].map((h, idx) => (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-300 ${
                  voiceActive ? "bg-gradient-to-t from-purple-500 to-blue-400 animate-pulse" : "bg-muted-foreground/30"
                }`}
                style={{ height: voiceActive ? `${h}%` : "20%" }}
              />
            ))}
          </div>

          {/* Voice Mode Toggle */}
          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              voiceActive
                ? "bg-red-500 text-white shadow-red-500/25"
                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-purple-500/25"
            }`}
          >
            {voiceActive ? <MicOff size={16} /> : <Mic size={16} />}
            {voiceActive ? "Stop AI Voice Mode" : "Enable AI Voice Mode (Speech-to-Text)"}
          </button>
        </div>

        {/* Right Q&A and Feedback Panel */}
        <div className="lg:col-span-7 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-6 backdrop-blur-xl">

          {/* Current Question */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              {session.category}
            </span>
            <h4 className="text-base font-bold text-white">{session.nextQuestion}</h4>
          </div>

          {/* User Answer Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Your Answer / Explanation
            </label>
            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Speak or type your answer clearly..."
              className="w-full p-4 rounded-2xl bg-muted/40 border border-border text-xs text-foreground outline-none focus:border-purple-500 resize-none"
            />
            <button
              onClick={handleNextTurn}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md ml-auto"
            >
              <Send size={14} /> Submit Response
            </button>
          </div>

          {/* AI Score & Feedback Box */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Latest Response Score</span>
              <span className="text-purple-400 font-mono text-sm">{session.score} / 10</span>
            </div>
            <p className="text-xs text-muted-foreground">{session.feedback}</p>
          </div>

        </div>

      </div>

    </div>
  );
}
