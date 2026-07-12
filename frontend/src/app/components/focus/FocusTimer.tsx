import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, RotateCcw, SkipForward, Settings, X, Check,
  Flame, Trophy, Clock, Target, Plus, Trash2, CheckCircle2,
  Brain, Coffee, Zap, TrendingUp, Calendar, Star,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
type Phase = "work" | "short-break" | "long-break";

interface SessionTask {
  id: string;
  text: string;
  done: boolean;
  subject: string;
}

interface SessionLog {
  id: string;
  date: Date;
  phase: Phase;
  duration: number; // minutes
  subject: string;
  completed: boolean;
}

interface TimerConfig {
  work: number;        // minutes
  shortBreak: number;
  longBreak: number;
  longBreakAfter: number; // pomodoros before long break
}

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_CONFIG: TimerConfig = { work: 25, shortBreak: 5, longBreak: 15, longBreakAfter: 4 };

const PHASE_META: Record<Phase, { label: string; color: string; ring: string; gradient: string; icon: React.ReactNode; tip: string }> = {
  "work":        { label: "Focus Time",   color: "text-indigo-400", ring: "stroke-indigo-500", gradient: "from-indigo-600 to-violet-700", icon: <Brain size={20}/>,   tip: "Eliminate distractions. Phone away. Deep work only." },
  "short-break": { label: "Short Break",  color: "text-emerald-400", ring: "stroke-emerald-500", gradient: "from-emerald-500 to-teal-600", icon: <Coffee size={20}/>, tip: "Stretch, hydrate, look away from screen." },
  "long-break":  { label: "Long Break",   color: "text-amber-400",  ring: "stroke-amber-500",  gradient: "from-amber-500 to-orange-600",  icon: <Flame size={20}/>,  tip: "Great work! Take a walk or have a snack." },
};

const SUBJECTS = ["Physics","Chemistry","Mathematics","Biology","UPSC","SSC","General"];

const AMBIENT = [
  { label: "🌧️ Rain",       value: "rain"   },
  { label: "🌊 Ocean",      value: "ocean"  },
  { label: "🔥 Fireplace",  value: "fire"   },
  { label: "📚 Library",    value: "lib"    },
  { label: "🎵 Lo-fi",      value: "lofi"   },
  { label: "🔕 Silent",     value: "silent" },
];

const SEED_LOGS: SessionLog[] = [];

/* ═══════ RING PROGRESS ═══════ */
function RingTimer({ pct, phase, timeStr, isRunning }: {
  pct: number; phase: Phase; timeStr: string; isRunning: boolean;
}) {
  const meta = PHASE_META[phase];
  const r = 110; const circ = 2 * Math.PI * r;
  const dash = ((1 - pct) * circ);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mx-auto">
      <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 260 260">
        <circle cx="130" cy="130" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30"/>
        <circle cx="130" cy="130" r={r} fill="none" className={meta.ring} strokeWidth="10"
          strokeDasharray={`${circ}`} strokeDashoffset={`${dash}`} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}/>
      </svg>
      <div className="flex flex-col items-center z-10">
        <div className={`mb-1 ${meta.color}`}>{meta.icon}</div>
        <p className="text-5xl font-black tabular-nums tracking-tight">{timeStr}</p>
        <p className={`text-sm font-semibold mt-1 ${meta.color}`}>{meta.label}</p>
        {isRunning && (
          <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ repeat:Infinity, duration:2 }}
            className="flex gap-1 mt-2">
            {[0,1,2].map(i=><span key={i} className={`w-1.5 h-1.5 rounded-full ${meta.color.replace("text-","bg-")}`}/>)}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════ SETTINGS MODAL ═══════ */
function SettingsModal({ config, onSave, onClose }: {
  config: TimerConfig; onSave: (c: TimerConfig) => void; onClose: () => void;
}) {
  const [cfg, setCfg] = useState({ ...config });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }}
        className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Timer Settings</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted"><X size={15}/></button>
        </div>
        <div className="space-y-4">
          {([
            { key:"work",          label:"Focus Duration (min)"   },
            { key:"shortBreak",    label:"Short Break (min)"      },
            { key:"longBreak",     label:"Long Break (min)"       },
            { key:"longBreakAfter",label:"Long break after N 🍅"  },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setCfg(c=>({...c,[key]:Math.max(1,c[key]-1)})) }
                  className="w-9 h-9 rounded-xl border border-border hover:bg-muted font-bold text-lg flex items-center justify-center">−</button>
                <span className="flex-1 text-center font-black text-2xl tabular-nums">{cfg[key]}</span>
                <button onClick={() => setCfg(c=>({...c,[key]:c[key]+1}))}
                  className="w-9 h-9 rounded-xl border border-border hover:bg-muted font-bold text-lg flex items-center justify-center">+</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { onSave(cfg); onClose(); }}
          className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
          Save Settings
        </button>
      </motion.div>
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function FocusTimer() {
  const [config, setConfig]       = useState<TimerConfig>(DEFAULT_CONFIG);
  const [phase, setPhase]         = useState<Phase>("work");
  const [timeLeft, setTimeLeft]   = useState(config.work * 60);
  const [isRunning, setRunning]   = useState(false);
  const [pomCount, setPomCount]   = useState(0);
  const [totalFocus, setTotal]    = useState(0); // seconds today
  const [subject, setSubject]     = useState("Physics");
  const [ambient, setAmbient]     = useState("silent");
  const [showSettings, setShowS]  = useState(false);
  const [logs, setLogs]           = useState<SessionLog[]>(SEED_LOGS);
  const [tasks, setTasks]         = useState<SessionTask[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const intervalRef               = useRef<ReturnType<typeof setInterval>|null>(null);
  const totalSecondsForPhase      = (phase === "work" ? config.work : phase === "short-break" ? config.shortBreak : config.longBreak) * 60;
  const pct                       = timeLeft / totalSecondsForPhase;

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const nextPhase = useCallback((completed: boolean) => {
    if (completed) {
      if (phase === "work") {
        const newPom = pomCount + 1;
        setPomCount(newPom);
        setTotal(t => t + config.work * 60);
        setLogs(prev => [{ id:uid(), date:new Date(), phase:"work", duration:config.work, subject, completed:true }, ...prev]);
        if (newPom % config.longBreakAfter === 0) {
          setPhase("long-break"); setTimeLeft(config.longBreak * 60);
        } else {
          setPhase("short-break"); setTimeLeft(config.shortBreak * 60);
        }
      } else {
        setLogs(prev => [{ id:uid(), date:new Date(), phase, duration:phase==="short-break"?config.shortBreak:config.longBreak, subject, completed:true }, ...prev]);
        setPhase("work"); setTimeLeft(config.work * 60);
      }
    }
    setRunning(false);
  }, [phase, pomCount, config, subject]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current!); nextPhase(true); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, nextPhase]);

  const reset = () => {
    setRunning(false);
    setTimeLeft(totalSecondsForPhase);
  };

  const skip = () => nextPhase(false);

  const switchPhase = (p: Phase) => {
    setRunning(false);
    setPhase(p);
    setTimeLeft((p==="work"?config.work:p==="short-break"?config.shortBreak:config.longBreak)*60);
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(prev => [{ id:uid(), text:taskInput.trim(), done:false, subject }, ...prev]);
    setTaskInput("");
  };

  const todayFocus = logs.filter(l => l.phase === "work" && l.completed && new Date(l.date).toDateString() === new Date().toDateString());
  const todayMins  = todayFocus.reduce((acc, l) => acc + l.duration, 0) + Math.floor((config.work * 60 - timeLeft) / 60) * (phase === "work" && isRunning ? 1 : 0);

  const meta = PHASE_META[phase];

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Clock size={22} className="text-primary"/>Focus Timer</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Pomodoro technique · Deep work sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Flame size={13} className="text-orange-400"/><span className="font-bold text-foreground">{pomCount}</span> 🍅 today</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><Clock size={13} className="text-indigo-400"/><span className="font-bold text-foreground">{todayMins}m</span> focused</span>
            </div>
            <button onClick={() => setShowS(true)}
              className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all"><Settings size={17}/></button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── left: timer ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* phase switcher */}
            <div className="flex gap-1.5 bg-muted/50 rounded-2xl p-1.5">
              {(["work","short-break","long-break"] as Phase[]).map(p => (
                <button key={p} onClick={() => switchPhase(p)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all capitalize ${phase===p?"bg-background shadow text-foreground":"text-muted-foreground hover:text-foreground"}`}>
                  {p === "work" ? "🍅 Focus" : p === "short-break" ? "☕ Short Break" : "🌴 Long Break"}
                </button>
              ))}
            </div>

            {/* timer ring */}
            <div className={`rounded-3xl bg-gradient-to-br ${meta.gradient} p-8 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center">
                <Clock size={320} className="text-white"/>
              </div>

              {/* subject badge */}
              <div className="flex items-center justify-between mb-6 relative">
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold border border-white/20 focus:outline-none appearance-none cursor-pointer">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-white/70 text-xs italic">{meta.tip}</p>
              </div>

              <RingTimer pct={pct} phase={phase} timeStr={fmt(timeLeft)} isRunning={isRunning}/>

              {/* controls */}
              <div className="flex items-center justify-center gap-4 mt-6 relative">
                <button onClick={reset}
                  className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <RotateCcw size={20}/>
                </button>
                <button onClick={() => setRunning(r => !r)}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  {isRunning
                    ? <Pause size={30} className={meta.gradient.split(" ")[0].replace("from-","text-").replace("600","500").replace("700","500")}/>
                    : <Play  size={30} className={meta.gradient.split(" ")[0].replace("from-","text-").replace("600","500").replace("700","500")} style={{marginLeft:3}}/>
                  }
                </button>
                <button onClick={skip}
                  className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <SkipForward size={20}/>
                </button>
              </div>

              {/* pomodoro dots */}
              <div className="flex items-center justify-center gap-2 mt-5 relative">
                {Array.from({ length: config.longBreakAfter }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < (pomCount % config.longBreakAfter) ? "bg-white" : "bg-white/30"}`}/>
                ))}
                <span className="text-white/60 text-xs ml-2">{pomCount % config.longBreakAfter}/{config.longBreakAfter} until long break</span>
              </div>
            </div>

            {/* ambient sound */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Ambient Sound</p>
              <div className="flex gap-2 flex-wrap">
                {AMBIENT.map(a => (
                  <button key={a.value} onClick={() => setAmbient(a.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${ambient===a.value?"bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20":"border-border bg-muted/50 hover:bg-muted text-muted-foreground"}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* today stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon:<Flame size={18} className="text-orange-400"/>,  label:"Pomodoros",    val:pomCount,      suffix:"🍅"  },
                { icon:<Clock size={18} className="text-indigo-400"/>,   label:"Focus Time",   val:todayMins,     suffix:"min" },
                { icon:<Trophy size={18} className="text-amber-400"/>,   label:"Sessions",     val:todayFocus.length, suffix:"done"},
              ].map(s => (
                <div key={s.label} className="p-4 rounded-2xl border border-border bg-card text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-2xl font-black">{s.val}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── right: tasks + history ── */}
          <div className="space-y-5">

            {/* tasks */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Target size={16} className="text-primary"/>Session Tasks</h3>

              <div className="flex gap-2 mb-4">
                <input value={taskInput} onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="Add task…"
                  className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"/>
                <button onClick={addTask} className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  <Plus size={16}/>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${task.done?"bg-muted/30 border-border opacity-60":"border-border bg-muted/20 hover:border-primary/30"}`}>
                    <button onClick={() => setTasks(prev => prev.map(t => t.id===task.id?{...t,done:!t.done}:t))}
                      className="flex-shrink-0">
                      {task.done
                        ? <CheckCircle2 size={17} className="text-emerald-500"/>
                        : <div className="w-[17px] h-[17px] rounded-full border-2 border-border hover:border-primary transition-colors"/>
                      }
                    </button>
                    <p className={`text-xs flex-1 ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.text}</p>
                    <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                      className="p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all flex-shrink-0">
                      <Trash2 size={11}/>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{tasks.filter(t=>t.done).length}/{tasks.length} done</span>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${tasks.length?((tasks.filter(t=>t.done).length/tasks.length)*100):0}%`}}/>
                </div>
              </div>
            </div>

            {/* session history */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary"/>Today's Sessions</h3>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {logs.slice(0, 10).map(log => {
                  const m = PHASE_META[log.phase];
                  return (
                    <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${m.gradient} flex-shrink-0`}>
                        <span className="text-white text-xs">{log.phase==="work"?"🍅":log.phase==="short-break"?"☕":"🌴"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{log.subject}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label} · {log.duration}m</p>
                      </div>
                      {log.completed && <Check size={13} className="text-emerald-500 flex-shrink-0"/>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* weekly streak */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Star size={16} className="text-amber-400"/>Weekly Focus</h3>
              <div className="flex justify-between gap-1">
                {["M","T","W","T","F","S","S"].map((d,i) => {
                  const hrs = [0, 0, 0, 0, 0, 0, 0][i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-7 rounded-xl overflow-hidden flex flex-col justify-end" style={{height:56}}>
                        <div className={`w-full rounded-xl transition-all ${hrs > 0 ? "bg-primary" : "bg-muted"}`} style={{height:`${Math.min(100,(hrs/3)*100)}%`}}/>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{d}</span>
                      <span className="text-[9px] text-muted-foreground">{hrs>0?`${hrs}h`:"-"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && <SettingsModal config={config} onSave={setConfig} onClose={() => setShowS(false)}/>}
      </AnimatePresence>
    </div>
  );
}
