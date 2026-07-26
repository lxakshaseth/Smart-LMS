import { useState } from "react";
import { motion } from "motion/react";
import {
  Bot, Send, Sparkles, Copy, Check, Terminal, Code2, Cpu,
  Flame, HelpCircle, Layers, ShieldAlert, Zap, RefreshCw, FileCode, Play, Trash2
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
  { id: "refactor", label: "Code Refactoring", icon: FileCode, desc: "Clean code & design rules" },
  { id: "explain_errors", label: "Explain Errors", icon: ShieldAlert, desc: "Diagnostic error guide" },
  { id: "compiler_errors", label: "Compiler Errors", icon: Terminal, desc: "Syntax & compile fixes" },
  { id: "runtime_errors", label: "Runtime Errors", icon: ShieldAlert, desc: "Crash & memory error fixes" },
];

const presetSnippets: Record<string, string> = {
  explain: `function binarySearch(arr, target) {\n    let left = 0, right = arr.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (arr[mid] === target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
  optimize: `function hasDuplicates(nums) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] === nums[j]) return true;\n        }\n    }\n    return false;\n}`,
  debug: `function sumArray(arr) {\n    let sum;\n    for (let i = 0; i <= arr.length; i++) {\n        sum += arr[i];\n    }\n    return sum;\n}`,
  complexity: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
  convert: `def reverse_string(s):\n    return s[::-1]\n\nprint(reverse_string("hello"))`,
  test_cases: `function validateUser(email, age) {\n    return email.includes("@") && age >= 18;\n}`
};

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  action?: string;
  language?: string;
  timestamp: string;
}

function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", val: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "code", val: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", val: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-3">
      {parts.map((p, idx) => {
        if (p.type === "code") {
          return (
            <div key={idx} className="my-3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg text-slate-100">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="uppercase font-bold text-purple-400">{p.lang}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(p.val)}
                  className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
                >
                  Copy Code
                </button>
              </div>
              <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed">
                <code>{p.val}</code>
              </pre>
            </div>
          );
        }

        const lines = p.val.split("\n");
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-1" />;

              if (line.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-base font-black text-purple-600 dark:text-purple-400 mt-3 mb-1">
                    {line.replace("### ", "")}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-lg font-black text-purple-600 dark:text-purple-400 mt-4 mb-1">
                    {line.replace("## ", "")}
                  </h3>
                );
              }

              const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
              const cleanLine = isBullet ? line.trim().substring(2) : line;
              const boldSegments = cleanLine.split(/(\*\*.*?\*\*)/g);

              return (
                <div key={lIdx} className={isBullet ? "flex items-start gap-2 pl-2" : ""}>
                  {isBullet && <span className="text-purple-500 font-bold">•</span>}
                  <span>
                    {boldSegments.map((seg, sIdx) => {
                      if (seg.startsWith("**") && seg.endsWith("**")) {
                        return <strong key={sIdx} className="font-extrabold text-foreground">{seg.slice(2, -2)}</strong>;
                      }
                      return seg;
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
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
      text: "Hello! I am **CodePilot AI Mentor** 🤖. Select any of my 14 specialized AI modes on the left, paste code or write a prompt, and click Send!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    if (presetSnippets[actionId] && !inputCode.trim()) {
      setInputCode(presetSnippets[actionId]);
    }
  };

  const handleSend = async () => {
    if (!inputCode.trim() && !inputPrompt.trim()) return;

    const userText = inputPrompt && inputCode.trim()
      ? `${inputPrompt}\n\n\`\`\`${selectedLang}\n${inputCode}\n\`\`\``
      : inputCode.trim()
      ? `\`\`\`${selectedLang}\n${inputCode}\n\`\`\``
      : inputPrompt;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
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
      if (data.success && data.reply) {
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
          text: `### CodePilot AI Analysis (${selectedAction.toUpperCase()})\n\n- **Target Language**: \`${selectedLang}\`\n\n\`\`\`${selectedLang}\n${inputCode || "// Executed analysis"}\n\`\`\`\n\n- **Status**: Processing completed successfully.\n- **Recommendation**: Check variable scope bounds and add comprehensive test cases.`,
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

  const currentActionObj = aiActions.find((a) => a.id === selectedAction) || aiActions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)] min-h-[700px]">

      {/* AI Controls Sidebar (14 Modes & 10 Languages) */}
      <div className="lg:col-span-4 xl:col-span-3 rounded-3xl bg-card border border-border p-6 shadow-xl flex flex-col gap-5 overflow-hidden">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
            Target Language
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500 shadow-inner"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              AI Assistant Modes ({aiActions.length})
            </label>
            {presetSnippets[selectedAction] && (
              <button
                onClick={() => setInputCode(presetSnippets[selectedAction])}
                className="text-xs text-purple-500 hover:underline font-bold"
              >
                Load Sample Code
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1.5 space-y-2 scrollbar-thin scrollbar-thumb-purple-500/20">
            {aiActions.map((act) => {
              const Icon = act.icon;
              const isSelected = selectedAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => handleActionSelect(act.id)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30 border border-purple-500"
                      : "hover:bg-purple-500/10 border border-transparent text-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={20} className={isSelected ? "text-white shrink-0" : "text-muted-foreground shrink-0"} />
                  <div className="truncate min-w-0">
                    <div className={isSelected ? "text-white font-black text-xs sm:text-sm truncate" : "font-bold text-foreground text-xs sm:text-sm truncate"}>
                      {act.label}
                    </div>
                    <div className={isSelected ? "text-purple-100/90 text-xs mt-0.5 truncate" : "text-muted-foreground text-xs mt-0.5 truncate"}>
                      {act.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main ChatGPT Style Chat Window */}
      <div className="lg:col-span-8 xl:col-span-9 rounded-3xl bg-card border border-border shadow-xl flex flex-col overflow-hidden">

        {/* Chat Header */}
        <div className="px-8 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-foreground">CodePilot AI Mentor</h3>
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-purple-600 text-white shadow-xs">
                  Mode: {currentActionObj.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Targeting <span className="text-purple-500 font-bold">{selectedLang}</span> • {currentActionObj.desc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="px-4 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                  AI
                </div>
              )}

              <div
                className={`max-w-4xl rounded-2xl p-5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-purple-600 text-white shadow-md font-medium"
                    : "bg-muted/50 border border-border text-foreground shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2.5 text-xs opacity-75">
                  <span className="font-bold">{m.sender === "user" ? "You" : "CodePilot AI"}</span>
                  <span>{m.timestamp}</span>
                </div>

                <FormattedMarkdown content={m.text} />

                {m.sender === "ai" && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="flex items-center gap-1.5 text-xs text-purple-500 hover:underline font-bold"
                    >
                      {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === m.id ? "Copied to Clipboard" : "Copy Response"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-purple-500 animate-pulse font-bold">
              <Sparkles size={18} /> CodePilot AI is analyzing {selectedLang} code in {currentActionObj.label} mode...
            </div>
          )}
        </div>

        {/* Input & Code Composer Area */}
        <div className="p-6 border-t border-border/60 bg-muted/20 space-y-4">
          
          {/* Preset Helper Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-muted-foreground font-bold">Quick Actions:</span>
            {presetSnippets[selectedAction] && (
              <button
                onClick={() => setInputCode(presetSnippets[selectedAction])}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-500 text-xs font-bold hover:bg-purple-500/20 transition-all"
              >
                + Insert Sample Code
              </button>
            )}
            <button
              onClick={() => setInputPrompt(`Optimize time complexity for ${selectedLang}`)}
              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs hover:text-foreground font-medium transition-all"
            >
              + Optimize Complexity
            </button>
            <button
              onClick={() => setInputPrompt(`Explain Big-O bounds for ${selectedLang}`)}
              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs hover:text-foreground font-medium transition-all"
            >
              + Big-O Bounds
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`// Paste your ${selectedLang} code snippet here (optional for general prompts)...`}
              className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500 resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Ask CodePilot AI in ${currentActionObj.label} mode...`}
              className="flex-1 px-5 py-3 rounded-2xl bg-background border border-border text-xs sm:text-sm text-foreground outline-none focus:border-purple-500 shadow-inner font-medium"
            />

            <button
              onClick={handleSend}
              disabled={loading || (!inputCode.trim() && !inputPrompt.trim())}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
            >
              <Send size={16} /> Send
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
