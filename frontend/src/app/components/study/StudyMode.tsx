import { useState } from "react";
import {
  FileText, BookOpen, ClipboardList, Copy, Download, Check,
  Sparkles, Clock, Hash, AlignLeft, ChevronRight, RefreshCw,
  Printer, Share2, BookMarked, Zap, GraduationCap, Brain, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "../../lib/api";

type Tab = "notes" | "summary" | "quiz";

interface StudyApiResponse {
  success: boolean;
  type?: "notes" | "summary";
  content?: string;
  notes?: string;
  summary?: string;
  xpEarned?: number;
}

interface QuizApiResponse {
  success: boolean;
  content?: string;
  quiz?: string;
  xpEarned?: number;
}

const emptyResults: Record<Tab, string> = {
  notes: "",
  summary: "",
  quiz: "",
};

function safeFilePart(value: string) {
  return (value || "study-material")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "study-material";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

/* ═══════════════════════════════════
   SAMPLE CONTENT (replace with API)
═══════════════════════════════════ */
/* ═══════════════════════════════════
   MARKDOWN RENDERER
═══════════════════════════════════ */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const inline = (raw: string, key: string | number): React.ReactNode => {
    const parts = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
    return (
      <span key={key}>
        {parts.map((p, pi) => {
          if (p.startsWith("**") && p.endsWith("**"))
            return <strong key={pi} className="font-semibold text-foreground">{p.slice(2,-2)}</strong>;
          if ((p.startsWith("*") && p.endsWith("*")) || (p.startsWith("_") && p.endsWith("_")))
            return <em key={pi} className="italic text-foreground/80">{p.slice(1,-1)}</em>;
          if (p.startsWith("`") && p.endsWith("`"))
            return <code key={pi} className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono text-primary">{p.slice(1,-1)}</code>;
          return p;
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    /* fenced code block */
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      nodes.push(
        <div key={`cb${i}`} className="my-4 rounded-2xl overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-white/10">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70"/>
              <span className="w-3 h-3 rounded-full bg-amber-500/70"/>
              <span className="w-3 h-3 rounded-full bg-green-500/70"/>
            </div>
            <span className="text-white/40 text-[10px] font-mono">formula</span>
          </div>
          <pre className="p-4 overflow-x-auto bg-[#0d1117] text-[#e6edf3] text-sm leading-relaxed font-mono">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++; continue;
    }

    /* headings */
    if (line.startsWith("### ")) { nodes.push(<h3 key={i} className="text-base font-bold mt-5 mb-2 text-foreground">{inline(line.slice(4),i)}</h3>); i++; continue; }
    if (line.startsWith("## "))  { nodes.push(<h2 key={i} className="text-lg font-bold mt-6 mb-2 pb-2 border-b border-border text-foreground">{inline(line.slice(3),i)}</h2>); i++; continue; }
    if (line.startsWith("# "))   { nodes.push(<h1 key={i} className="text-2xl font-bold mt-2 mb-3 text-foreground">{inline(line.slice(2),i)}</h1>); i++; continue; }

    /* hr */
    if (/^---+$/.test(line.trim())) { nodes.push(<hr key={i} className="my-5 border-border"/>); i++; continue; }

    /* blockquote */
    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={i} className="my-3 pl-4 border-l-4 border-primary/50 bg-primary/5 py-2 pr-3 rounded-r-xl">
          <p className="text-sm text-muted-foreground italic">{inline(line.slice(2),i)}</p>
        </blockquote>
      );
      i++; continue;
    }

    /* callout boxes */
    if (line.startsWith(":::")) {
      const kind = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) { body.push(lines[i]); i++; }
      const styles: Record<string,string> = {
        tip:     "bg-green-500/8 border-green-500/25 text-green-400",
        warning: "bg-amber-500/8 border-amber-500/25 text-amber-400",
        note:    "bg-blue-500/8 border-blue-500/25 text-blue-400",
        info:    "bg-indigo-500/8 border-indigo-500/25 text-indigo-400",
      };
      const labels: Record<string,string> = { tip:"💡 Tip", warning:"⚠️ Warning", note:"📝 Note", info:"ℹ️ Info" };
      nodes.push(
        <div key={`call${i}`} className={`my-4 rounded-2xl border p-4 ${styles[kind] ?? styles.info}`}>
          <p className="text-xs font-bold mb-1.5">{labels[kind] ?? kind}</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{body.join(" ")}</p>
        </div>
      );
      i++; continue;
    }

    /* table */
    if (line.includes("|") && lines[i+1]?.includes("---")) {
      const headers = line.split("|").map(h=>h.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c=>c.trim()).filter(Boolean));
        i++;
      }
      nodes.push(
        <div key={`tbl${i}`} className="my-4 overflow-x-auto rounded-2xl border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70">
                {headers.map((h,hi)=>(
                  <th key={hi} className="px-4 py-3 text-left font-semibold text-xs border-b border-border">{inline(h,hi)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row,ri)=>(
                <tr key={ri} className={ri%2===0?"":"bg-muted/20"}>
                  {row.map((cell,ci)=>(
                    <td key={ci} className="px-4 py-2.5 border-b border-border/50 text-sm">{inline(cell,ci)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    /* unordered list */
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-*•]\s/,"")); i++; }
      nodes.push(
        <ul key={`ul${i}`} className="my-2.5 space-y-2 pl-1">
          {items.map((item,ii)=>(
            <li key={ii} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"/>
              <span className="text-foreground/90">{inline(item,ii)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    /* ordered list */
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let start = 1;
      const m = line.match(/^(\d+)\./);
      if (m) start = parseInt(m[1]);
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/,"")); i++; }
      nodes.push(
        <ol key={`ol${i}`} className="my-2.5 space-y-2 pl-1" start={start}>
          {items.map((item,ii)=>(
            <li key={ii} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {start+ii}
              </span>
              <span className="text-foreground/90">{inline(item,ii)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    /* empty line */
    if (line.trim() === "") { nodes.push(<div key={`sp${i}`} className="h-1.5"/>); i++; continue; }

    /* paragraph */
    nodes.push(<p key={i} className="text-sm leading-[1.8] text-foreground/90">{inline(line,i)}</p>);
    i++;
  }
  return nodes;
}

/* ═══════════════════════════════════
   STATS BAR
═══════════════════════════════════ */
function StatsBar({ content, label }: { content: string; label: string }) {
  const words      = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readMin    = Math.max(1, Math.ceil(words / 200));
  const headings   = (content.match(/^#{1,3} .+/gm) ?? []).length;
  const paragraphs = content.split(/\n\n+/).filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-1 mb-4">
      {[
        { icon:<AlignLeft size={13}/>,     val: `${words} words`     },
        { icon:<Clock size={13}/>,         val: `${readMin} min read` },
        { icon:<Hash size={13}/>,          val: `${headings} sections`},
        { icon:<BookMarked size={13}/>,    val: label                 },
      ].map(s => (
        <div key={s.val} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="text-primary/70">{s.icon}</span>
          {s.val}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════
   OUTPUT CARD
═══════════════════════════════════ */
function OutputCard({
  title, icon, content, accentClass, statsLabel, onCopy, onDownload, onRegenerate, onShare, copied,
}: {
  title: string; icon: React.ReactNode; content: string; accentClass: string;
  statsLabel: string; onCopy: () => void; onDownload: () => void; onRegenerate: () => void;
  onShare: () => void; copied: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4,0,0.2,1] }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* card header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border bg-gradient-to-r ${accentClass}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-white/60 text-[10px]">AI-generated · Ready to study</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${copied ? "bg-green-500 text-white" : "bg-white/15 text-white hover:bg-white/25"}`}>
            {copied ? <Check size={12}/> : <Copy size={12}/>}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-white hover:bg-white/25 text-xs font-medium transition-all">
            <Download size={12}/> Export
          </button>
          <button onClick={() => window.print()}
            className="p-1.5 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-all">
            <Printer size={13}/>
          </button>
          <button onClick={onShare}
            className="p-1.5 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-all">
            <Share2 size={13}/>
          </button>
        </div>
      </div>

      {/* stats bar */}
      <div className="px-6 pt-4 pb-2 border-b border-border/50 bg-muted/20">
        <StatsBar content={content} label={statsLabel}/>
      </div>

      {/* rendered content */}
      <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
        <div className="max-w-none">
          {renderMarkdown(content)}
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Sparkles size={10} className="text-primary"/>
          AI-generated content · Verify with your textbook before exams
        </p>
        <button onClick={onRegenerate}
          className="flex items-center gap-1.5 text-[11px] text-primary hover:underline font-medium">
          <RefreshCw size={11}/> Regenerate
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   QUIZ GENERATOR CARD
═══════════════════════════════════ */
function QuizCard({
  topic,
  count,
  setCount,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  language,
  setLanguage,
  onGenerate,
  loading,
}: {
  topic: string;
  count: number;
  setCount: (updater: (value: number) => number) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  questionType: string;
  setQuestionType: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-gradient-to-r from-violet-600 to-purple-700">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
          <Brain size={16} className="text-white"/>
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Quiz Generator</h3>
          <p className="text-white/60 text-[10px]">Customise and generate practice questions</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Questions</label>
            <div className="flex items-center gap-2">
              <button onClick={()=>setCount(c=>Math.max(5,c-5))}
                className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-bold">−</button>
              <span className="flex-1 text-center font-bold text-lg">{count}</span>
              <button onClick={()=>setCount(c=>Math.min(50,c+5))}
                className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-bold">+</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Difficulty</label>
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
              <option>Easy</option><option>Medium</option><option>Hard</option><option>Mixed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Type</label>
            <select value={questionType} onChange={e=>setQuestionType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
              <option>MCQ</option><option>True/False</option><option>Fill in Blanks</option><option>Short Answer</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Language</label>
            <select value={language} onChange={e=>setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
              <option>English</option><option>Hindi</option><option>Bilingual</option>
            </select>
          </div>
        </div>

        {/* config preview chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label:`${count} Questions`, color:"bg-indigo-500/10 text-indigo-400 border-indigo-500/20"     },
            { label:difficulty,           color:"bg-amber-500/10 text-amber-400 border-amber-500/20"        },
            { label:questionType,         color:"bg-green-500/10 text-green-400 border-green-500/20"        },
            { label:language,             color:"bg-purple-500/10 text-purple-400 border-purple-500/20"     },
            { label:topic||"Topic TBD",   color:"bg-primary/10 text-primary border-primary/20"              },
          ].map(c=>(
            <span key={c.label} className={`px-3 py-1 rounded-full border text-xs font-medium ${c.color}`}>{c.label}</span>
          ))}
        </div>

        <button onClick={onGenerate} disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-60">
          {loading ? <RefreshCw size={18} className="animate-spin"/> : <Zap size={18}/>}
          {loading ? "Generating Quiz..." : `Generate ${count} ${questionType} Questions`}
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          Quiz will be added to your practice history · Results tracked in Analytics
        </p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   TOPIC INPUT
═══════════════════════════════════ */
function TopicInput({ topic, setTopic, onGenerate, loading }: {
  topic: string; setTopic: (v:string) => void; onGenerate: () => void; loading: boolean;
}) {
  const suggestions = ["Thermodynamics","Organic Chemistry","Integration","Mitosis vs Meiosis","Newton's Laws","Indian Polity","Matrices"];
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block">
        Enter Topic or Subject
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onGenerate()}
            placeholder="e.g. Thermodynamics, Organic Chemistry, Calculus…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-60 active:scale-[0.98] whitespace-nowrap"
        >
          {loading
            ? <><RefreshCw size={16} className="animate-spin"/> Generating…</>
            : <><Sparkles size={16}/> Generate</>
          }
        </button>
      </div>
      {/* quick suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] text-muted-foreground self-center">Try:</span>
        {suggestions.map(s => (
          <button key={s} onClick={() => setTopic(s)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 text-muted-foreground transition-all">
            <ChevronRight size={9}/>{s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN
═══════════════════════════════════ */
const tabs: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id:"notes",   label:"Notes Generator", icon:FileText,     desc:"Structured chapter notes" },
  { id:"summary", label:"Summary",         icon:BookOpen,     desc:"Key points & formulas"    },
  { id:"quiz",    label:"Quiz Generator",  icon:ClipboardList,desc:"Practice questions"        },
];

export default function StudyMode() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [topic, setTopic]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<Record<Tab, string>>(emptyResults);
  const [error, setError]         = useState("");
  const [count, setCount]         = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionType, setQuestionType] = useState("MCQ");
  const [language, setLanguage]   = useState("English");
  const [copiedNotes, setCopiedNotes]     = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedQuiz, setCopiedQuiz]       = useState(false);

  const generated = Boolean(results[activeTab]);

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError("Please enter a topic first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (activeTab === "quiz") {
        const response = await apiRequest<QuizApiResponse>("/ai/generate-quiz", {
          method: "POST",
          body: JSON.stringify({
            topic: cleanTopic,
            count,
            difficulty,
            questionType,
            language,
          }),
        });
        const content = (response.content || response.quiz || "").trim();
        if (!content) throw new Error("AI returned an empty quiz. Please try again.");
        setResults(previous => ({ ...previous, quiz: content }));
        return;
      }

      const response = await apiRequest<StudyApiResponse>("/ai/study", {
        method: "POST",
        body: JSON.stringify({
          topic: cleanTopic,
          type: activeTab,
        }),
      });
      const content = (response.content || response[activeTab] || "").trim();
      if (!content) throw new Error("AI returned empty content. Please try again.");
      setResults(previous => ({ ...previous, [activeTab]: content }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = (content: string, setCopied: (v:boolean)=>void) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const download = (content: string, name: string) => {
    const blob = new Blob([content], { type:"text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const share = async (title: string, content: string) => {
    if (navigator.share) {
      await navigator.share({ title, text: content });
      return;
    }
    await navigator.clipboard.writeText(content);
  };

  const outputName = (kind: string) => `${kind}-${safeFilePart(topic)}.txt`;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered notes, summaries, and practice quizzes</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <Sparkles size={15} className="text-primary"/>
          <span className="text-xs font-medium text-primary">AI Ready</span>
        </div>
      </div>

      {/* tab strip */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setError(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${active ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon size={16}/>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* topic input */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <TopicInput topic={topic} setTopic={setTopic} onGenerate={handleGenerate} loading={loading}/>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
          <span>{error}</span>
        </div>
      )}

      {/* loading shimmer */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="rounded-2xl border border-border bg-card p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles size={16} className="text-primary animate-pulse"/>
              </div>
              <div>
                <p className="text-sm font-semibold">Generating {tabs.find(t=>t.id===activeTab)?.label}…</p>
                <p className="text-xs text-muted-foreground">AI is processing your topic</p>
              </div>
            </div>
            {[100,80,90,60,75,85,55].map((w,i) => (
              <div key={i} className="h-3 bg-muted rounded-full animate-pulse" style={{width:`${w}%`,animationDelay:`${i*80}ms`}}/>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "quiz" && !loading && (
        <QuizCard
          topic={topic}
          count={count}
          setCount={setCount}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          questionType={questionType}
          setQuestionType={setQuestionType}
          language={language}
          setLanguage={setLanguage}
          onGenerate={handleGenerate}
          loading={loading}
        />
      )}

      {/* output */}
      {!loading && generated && (
        <>
          {activeTab === "notes" && (
            <OutputCard
              title="Generated Notes"
              icon={<FileText size={16} className="text-white"/>}
              content={results.notes}
              accentClass="from-indigo-600 to-violet-700"
              statsLabel="Chapter Notes"
              onCopy={() => copy(results.notes, setCopiedNotes)}
              onDownload={() => download(results.notes, outputName("notes"))}
              onRegenerate={handleGenerate}
              onShare={() => share(`Notes: ${topic}`, results.notes)}
              copied={copiedNotes}
            />
          )}

          {activeTab === "summary" && (
            <OutputCard
              title="Quick Summary"
              icon={<BookOpen size={16} className="text-white"/>}
              content={results.summary}
              accentClass="from-green-600 to-teal-700"
              statsLabel="Summary"
              onCopy={() => copy(results.summary, setCopiedSummary)}
              onDownload={() => download(results.summary, outputName("summary"))}
              onRegenerate={handleGenerate}
              onShare={() => share(`Summary: ${topic}`, results.summary)}
              copied={copiedSummary}
            />
          )}

          {activeTab === "quiz" && (
            <OutputCard
              title="Practice Quiz"
              icon={<ClipboardList size={16} className="text-white"/>}
              content={results.quiz}
              accentClass="from-violet-600 to-purple-700"
              statsLabel="Quiz"
              onCopy={() => copy(results.quiz, setCopiedQuiz)}
              onDownload={() => download(results.quiz, outputName("quiz"))}
              onRegenerate={handleGenerate}
              onShare={() => share(`Quiz: ${topic}`, results.quiz)}
              copied={copiedQuiz}
            />
          )}
        </>
      )}

      {/* empty state */}
      {!generated && !loading && activeTab !== "quiz" && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-muted-foreground/50"/>
          </div>
          <h3 className="font-bold text-lg">Enter a topic to get started</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Type any subject or topic above and click Generate to create AI-powered study material.
          </p>
        </div>
      )}
    </div>
  );
}
