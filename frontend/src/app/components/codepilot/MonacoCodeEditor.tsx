import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  Play, Send, Copy, Download, Upload, RotateCcw, Maximize2,
  Minimize2, Moon, Sun, Sliders, Terminal, CheckCircle2, XCircle, Clock, Cpu
} from "lucide-react";

import { getAuthToken } from "../../lib/api";

const DEFAULT_STARTER: Record<string, string> = {
  javascript: "",
  python: "",
  cpp: "",
  java: ""
};

export default function MonacoCodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [inputConsole, setInputConsole] = useState("");
  const [outputConsole, setOutputConsole] = useState("");
  const [errorConsole, setErrorConsole] = useState<string | null>(null);

  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [fullScreen, setFullScreen] = useState(false);
  const [splitScreen, setSplitScreen] = useState(true);

  const [executing, setExecuting] = useState(false);
  const [execStats, setExecStats] = useState<{ time: string; memory: string; status: string } | null>(null);

  useEffect(() => {
    if (DEFAULT_STARTER[language]) {
      setCode(DEFAULT_STARTER[language]);
    }
  }, [language]);

  const handleRun = async () => {
    setExecuting(true);
    setOutputConsole("Compiling and executing code...");
    setErrorConsole(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/compiler", {
        method: "POST",
        headers,
        body: JSON.stringify({
          code,
          language,
          input: inputConsole
        })
      });

      const data = await res.json();
      if (data.success) {
        setOutputConsole(data.output || "Program finished with exit code 0.");
        setErrorConsole(data.error);
        setExecStats({
          time: data.executionTime || "38 ms",
          memory: data.memoryUsage || "14.4 MB",
          status: "Accepted"
        });
      } else {
        setOutputConsole("");
        setErrorConsole(data.error || data.message || "Compilation/Runtime Exception");
        setExecStats({
          time: "0 ms",
          memory: "0 MB",
          status: "Error"
        });
      }
    } catch (err: any) {
      setOutputConsole(err.message || "Execution Error");
      setErrorConsole(err.message);
      setExecStats({
        time: "0 ms",
        memory: "0 MB",
        status: "Error"
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    setExecuting(true);
    setOutputConsole("Submitting solution & saving to MongoDB database...");
    setErrorConsole(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          problemId: "two-sum",
          language,
          code,
          input: inputConsole
        })
      });

      const data = await res.json();
      if (data.success) {
        setOutputConsole(`[ACCEPTED] Solution saved to MongoDB!\n${data.output || ""}`);
        setErrorConsole(null);
        setExecStats({
          time: data.executionTime || "24 ms",
          memory: data.memoryUsage || "12.2 MB",
          status: "Accepted"
        });
      } else {
        setOutputConsole("");
        setErrorConsole(data.error || data.message || "Submission Failed");
        setExecStats({
          time: "0 ms",
          memory: "0 MB",
          status: "Error"
        });
      }
    } catch (err: any) {
      setErrorConsole(err.message || "Failed to submit solution");
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution.${language === "python" ? "py" : language === "cpp" ? "cpp" : "js"}`;
    a.click();
  };

  const handleReset = () => {
    setCode(DEFAULT_STARTER[language] || "// Code reset");
    setOutputConsole("");
    setErrorConsole(null);
    setExecStats(null);
  };

  return (
    <div className={`space-y-4 ${fullScreen ? "fixed inset-0 z-50 p-4 bg-background overflow-hidden" : ""}`}>

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card/80 border border-border shadow-lg backdrop-blur-xl">

        {/* Language & Settings */}
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500 shadow-inner"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 17</option>
            <option value="typescript">TypeScript</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="sql">SQL</option>
          </select>

          <button
            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
            className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-all"
            title="Toggle Editor Theme"
          >
            {theme === "vs-dark" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-muted-foreground">
            <span>Font:</span>
            <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="px-1.5 font-bold hover:text-foreground">-</button>
            <span className="font-mono text-foreground font-semibold">{fontSize}px</span>
            <button onClick={() => setFontSize(Math.min(22, fontSize + 1))} className="px-1.5 font-bold hover:text-foreground">+</button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Copy Code"
          >
            <Copy size={15} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Download Code File"
          >
            <Download size={15} />
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Reset Code"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setFullScreen(!fullScreen)}
            className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Toggle Fullscreen"
          >
            {fullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={handleRun}
            disabled={executing}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
          >
            <Play size={15} className="fill-white" /> {executing ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={executing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
          >
            <Send size={15} /> Submit
          </button>
        </div>
      </div>

      {/* Editor & Console Split View */}
      <div className={`grid ${splitScreen ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"} gap-6`}>

        {/* Monaco Editor Canvas */}
        <div className="lg:col-span-8 rounded-3xl bg-card border border-border overflow-hidden shadow-xl min-h-[560px]">
          <MonacoEditor
            height="560px"
            language={language === "cpp" ? "cpp" : language === "python" ? "python" : "javascript"}
            theme={theme}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              cursorBlinking: "smooth",
              smoothScrolling: true
            }}
          />
        </div>

        {/* Output & Console Workspace */}
        <div className="lg:col-span-4 rounded-3xl bg-card/90 border border-border p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Terminal size={16} className="text-purple-400" /> Output Console
              </h3>
              {execStats && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <Clock size={12} /> {execStats.time}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">
                    <Cpu size={12} /> {execStats.memory}
                  </span>
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="p-4 rounded-2xl bg-black/80 border border-border font-mono text-xs sm:text-sm text-green-400 min-h-[220px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {outputConsole || <span className="text-muted-foreground">// Output will be displayed here...</span>}
            </div>

            {errorConsole && (
              <div className="mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 font-mono text-xs text-red-400">
                <div className="font-bold flex items-center gap-1.5 mb-1.5">
                  <XCircle size={15} /> Compilation / Runtime Exception
                </div>
                {errorConsole}
              </div>
            )}
          </div>

          {/* Custom Input Console */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Custom Input (stdin)
            </label>
            <textarea
              rows={3}
              value={inputConsole}
              onChange={(e) => setInputConsole(e.target.value)}
              placeholder="Custom input test values..."
              className="w-full p-3 rounded-2xl bg-muted/60 border border-border font-mono text-xs sm:text-sm text-foreground outline-none focus:border-purple-500 resize-none shadow-inner"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
