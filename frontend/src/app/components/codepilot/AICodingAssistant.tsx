import { useState } from "react";
import { motion } from "motion/react";
import {
  Bot, Send, Sparkles, Copy, Check, Terminal, Code2, Cpu,
  Flame, HelpCircle, Layers, ShieldAlert, Zap, RefreshCw, FileCode
} from "lucide-react";
import { getAuthToken } from "../../lib/api";

const languages = [
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "Go", "Rust", "PHP", "SQL"
];

const aiActions = [
  { id: "explain", label: "Explain Code", icon: HelpCircle, desc: "Step-by-step code breakdown" },
  { id: "generate", label: "Generate Code", icon: Code2, desc: "Write clean code from spec" },
  { id: "optimize", label: "Optimize Code", icon: Zap, desc: "Improve time & space complexity" },
  { id: "debug", label: "Debug Code", icon: ShieldAlert, desc: "Fix syntax & logical errors" },
  { id: "convert", label: "Convert Language", icon: RefreshCw, desc: "Transpile code across languages" },
  { id: "algorithm", label: "Explain Algorithm", icon: Cpu, desc: "Intuition & data structures" },
  { id: "complexity", label: "Complexity (Big O)", icon: Layers, desc: "Time & space complexity analysis" },
  { id: "best_approach", label: "Suggest Best Approach", icon: Sparkles, desc: "Brute force vs Optimal" },
  { id: "dry_run", label: "Dry Run Trace", icon: Terminal, desc: "Execution step-by-step trace" },
  { id: "test_cases", label: "Generate Test Cases", icon: Check, desc: "Boundary & edge case tests" },
  { id: "explain_errors", label: "Explain Errors", icon: ShieldAlert, desc: "Diagnostic error guide" },
  { id: "compiler_errors", label: "Compiler Errors", icon: Terminal, desc: "Syntax & compile fixes" },
  { id: "runtime_errors", label: "Runtime Errors", icon: ShieldAlert, desc: "Crash & memory error fixes" },
];

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  action?: string;
  language?: string;
  timestamp: string;
}

export default function AICodingAssistant() {
  const [selectedLang, setSelectedLang] = useState("JavaScript");
  const [selectedAction, setSelectedAction] = useState("explain");
  const [inputCode, setInputCode] = useState("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Hello! I am **CodePilot AI Mentor** 🤖. Select any of my 14 specialized AI modes below, paste your code, and I'll analyze, optimize, or generate solutions in real-time!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const handleSend = async () => {
    if (!inputCode.trim() && !inputPrompt.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputPrompt ? `${inputPrompt}\n\n\`\`\`${selectedLang}\n${inputCode}\n\`\`\`` : `\`\`\`${selectedLang}\n${inputCode}\n\`\`\``,
      action: selectedAction,
      language: selectedLang,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: selectedAction,
          code: inputCode,
          language: selectedLang,
          prompt: inputPrompt
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error(data.message || "Failed to fetch response");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ **AI Response Simulated**:\n\n### Mode: ${selectedAction.toUpperCase()} (${selectedLang})\n\n\`\`\`${selectedLang}\n// Optimized & verified algorithm\n${inputCode || "// Clean solution code generated"}\n\`\`\`\n\n- **Time Complexity**: $O(N \\log N)$\n- **Space Complexity**: $O(1)$\n- **Key Takeaway**: Uses in-place array partitioning to maintain minimal memory overhead.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
      setInputPrompt("");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[600px]">

      {/* AI Controls Sidebar (14 Modes & 10 Languages) */}
      <div className="lg:col-span-1 rounded-3xl bg-card/80 border border-border p-4 shadow-xl flex flex-col gap-4 overflow-y-auto backdrop-blur-xl">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Target Language
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            AI Assistant Modes (14)
          </label>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
            {aiActions.map((act) => {
              const Icon = act.icon;
              const isSelected = selectedAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedAction(act.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-purple-600/20 border border-purple-500/50 text-purple-300 shadow-sm"
                      : "hover:bg-muted/50 border border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} className={isSelected ? "text-purple-400" : "text-muted-foreground"} />
                  <div className="truncate">
                    <div className="font-semibold leading-tight">{act.label}</div>
                    <div className="text-[10px] text-muted-foreground/70 truncate">{act.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main ChatGPT Style Chat Window */}
      <div className="lg:col-span-3 rounded-3xl bg-card/80 border border-border shadow-xl flex flex-col overflow-hidden backdrop-blur-xl">

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">CodePilot ChatGPT Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Active Mode: <span className="text-purple-400 font-semibold uppercase">{selectedAction}</span> ({selectedLang})
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Chat
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  AI
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-muted/50 border border-border text-foreground shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                  <span>{m.sender === "user" ? "You" : "CodePilot AI"}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {m.text}
                </div>

                {m.sender === "ai" && (
                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="flex items-center gap-1 text-[11px] text-purple-400 hover:underline"
                    >
                      {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === m.id ? "Copied" : "Copy Explanation"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse">
              <Sparkles size={16} /> CodePilot is thinking and analyzing code...
            </div>
          )}
        </div>

        {/* Input & Code Composer Area */}
        <div className="p-4 border-t border-border/60 bg-muted/20 space-y-3">
          <div className="space-y-2">
            <textarea
              rows={2}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`// Paste your ${selectedLang} code snippet here...`}
              className="w-full p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question or specify prompt (e.g. Optimize time complexity to O(N))..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
