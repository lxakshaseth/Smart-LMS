import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Lock, Star, Trophy, Zap, Target, ChevronRight, X,
  RotateCcw, CheckCircle2, XCircle, Clock, Lightbulb, Shuffle,
  Hash, ArrowLeft, Crown, Flame, Gamepad2, Calculator, Eye,
  TrendingUp, Award, Swords, Code2, Grid3x3, BookOpen, Layers,
} from "lucide-react";

/* ═══════════ TYPES ═══════════ */
interface GameDef {
  id: string; title: string; desc: string; icon: React.ReactNode;
  xp: number; time: number; level: number; color: string; tag: string;
  difficulty: string;
}
interface LevelDef {
  level: number; title: string; subtitle: string; emoji: string;
  gradient: string; ring: string; unlockXp: number; desc: string;
}

/* ═══════════ LEVEL CONFIG ═══════════ */
const LEVELS: LevelDef[] = [
  { level:1, title:"Initiate",      subtitle:"Brain Warm-Up",        emoji:"🌱", gradient:"from-emerald-400 to-green-500",   ring:"ring-emerald-400", unlockXp:0,    desc:"Simple games to get your neurons firing"       },
  { level:2, title:"Challenger",    subtitle:"Pattern Seeker",       emoji:"⚡", gradient:"from-blue-400 to-indigo-500",     ring:"ring-blue-400",    unlockXp:200,  desc:"Spot what others miss — speed & accuracy"      },
  { level:3, title:"Strategist",    subtitle:"Logic Engineer",       emoji:"🧩", gradient:"from-violet-500 to-purple-600",   ring:"ring-violet-400",  unlockXp:500,  desc:"Multi-step reasoning & deduction chains"        },
  { level:4, title:"Mastermind",    subtitle:"Cognitive Athlete",    emoji:"🔥", gradient:"from-amber-500 to-orange-600",    ring:"ring-amber-400",   unlockXp:1000, desc:"High-speed decisions under real pressure"       },
  { level:5, title:"Apex Thinker",  subtitle:"Genius Zone",          emoji:"👑", gradient:"from-rose-500 to-pink-600",       ring:"ring-rose-400",    unlockXp:2000, desc:"Only the sharpest 1% reach this tier"          },
];

/* ═══════════ GAME REGISTRY ═══════════ */
const GAMES: GameDef[] = [
  // L1
  { id:"memory",      title:"Memory Matrix",       desc:"Flip & match cards before time runs out",           icon:<Grid3x3 size={18}/>,    xp:30,  time:90,  level:1, color:"from-emerald-400 to-teal-500",   tag:"Memory",     difficulty:"Easy"   },
  { id:"quickmath",   title:"Speed Maths",         desc:"Mental arithmetic under 45 s — beat your score",    icon:<Calculator size={18}/>, xp:40,  time:45,  level:1, color:"from-cyan-400 to-blue-500",      tag:"Numbers",    difficulty:"Easy"   },
  { id:"tictactoe",   title:"Tic-Tac-Toe AI",      desc:"Outsmart the adaptive AI — can you win?",           icon:<Target size={18}/>,     xp:35,  time:0,   level:1, color:"from-green-400 to-emerald-500",  tag:"Strategy",   difficulty:"Easy"   },
  // L2
  { id:"sequence",    title:"Number Series",        desc:"Detect the rule and find the missing term",         icon:<Hash size={18}/>,       xp:55,  time:60,  level:2, color:"from-blue-400 to-indigo-500",   tag:"Pattern",    difficulty:"Medium" },
  { id:"oddone",      title:"Odd One Out",          desc:"Spot what doesn't belong — 6 rounds",               icon:<Eye size={18}/>,        xp:50,  time:30,  level:2, color:"from-sky-400 to-blue-500",       tag:"Reasoning",  difficulty:"Medium" },
  { id:"wordscram",   title:"Word Scramble",        desc:"Unscramble subject-related terms fast",             icon:<Shuffle size={18}/>,    xp:50,  time:45,  level:2, color:"from-indigo-400 to-violet-500",  tag:"Language",   difficulty:"Medium" },
  { id:"analogy",     title:"Analogy Quest",        desc:"CAT / GRE-style — complete the relationship",       icon:<BookOpen size={18}/>,   xp:60,  time:60,  level:2, color:"from-violet-400 to-purple-500",  tag:"Verbal",     difficulty:"Medium" },
  // L3
  { id:"riddles",     title:"Lateral Riddles",      desc:"Trick questions that break linear thinking",        icon:<Lightbulb size={18}/>,  xp:70,  time:90,  level:3, color:"from-purple-400 to-fuchsia-500", tag:"Logic",      difficulty:"Hard"   },
  { id:"sudoku",      title:"Sudoku 4×4",           desc:"Classic logic — no repeats in row, col or box",     icon:<Layers size={18}/>,     xp:80,  time:120, level:3, color:"from-fuchsia-400 to-pink-500",   tag:"Deduction",  difficulty:"Hard"   },
  { id:"logicgrid",   title:"Logic Grid",           desc:"Use clue-chains to solve who-has-what",             icon:<Grid3x3 size={18}/>,    xp:90,  time:180, level:3, color:"from-pink-400 to-rose-500",      tag:"Deduction",  difficulty:"Hard"   },
  // L4
  { id:"stroop",      title:"Stroop Clash",         desc:"Name the ink colour, ignore the word — 10 rounds",  icon:<Zap size={18}/>,        xp:90,  time:45,  level:4, color:"from-amber-400 to-orange-500",   tag:"Focus",      difficulty:"Expert" },
  { id:"cryptarith",  title:"Cryptarithmetic",      desc:"Each letter = unique digit — crack the equation",   icon:<Code2 size={18}/>,      xp:120, time:180, level:4, color:"from-orange-400 to-amber-500",   tag:"Math",       difficulty:"Expert" },
  { id:"visualpat",   title:"Visual Patterns",      desc:"IQ-style matrix — what shape completes the grid?",  icon:<Layers size={18}/>,     xp:100, time:60,  level:4, color:"from-yellow-400 to-orange-500",  tag:"Spatial",    difficulty:"Expert" },
  // L5
  { id:"mastermind",  title:"Mastermind Code",      desc:"Crack the 4-colour secret in ≤8 guesses",           icon:<Gamepad2 size={18}/>,   xp:130, time:0,   level:5, color:"from-rose-400 to-pink-600",      tag:"Deduction",  difficulty:"Elite"  },
  { id:"decision",    title:"Decision Blitz",       desc:"Real-world dilemmas — pick the sharpest move",      icon:<Swords size={18}/>,     xp:140, time:60,  level:5, color:"from-red-400 to-rose-500",        tag:"IQ",         difficulty:"Elite"  },
  { id:"catquant",    title:"CAT Quant Sprint",     desc:"10 competition-level quantitative aptitude MCQs",   icon:<TrendingUp size={18}/>, xp:150, time:90,  level:5, color:"from-pink-500 to-rose-600",       tag:"Aptitude",   difficulty:"Elite"  },
];

/* ══════════════════════════════════════════════════
   MINI GAMES
══════════════════════════════════════════════════ */

/* ── MEMORY MATRIX ── */
const MEM_EMOJIS = ["⚛️","🧪","📐","🧬","🌍","🎯","⚡","🔬","📚","🎓","💡","🔭","🧠","🏆","🚀","🎲"];
interface MC { id:number; e:string; flipped:boolean; matched:boolean; }
function MemoryGame({ onComplete }:{ onComplete:(s:number)=>void }) {
  const mk = (): MC[] => [...MEM_EMOJIS.slice(0,8),...MEM_EMOJIS.slice(0,8)].sort(()=>Math.random()-.5).map((e,id)=>({id,e,flipped:false,matched:false}));
  const [cards,setCards]   = useState<MC[]>(mk);
  const [open,setOpen]     = useState<number[]>([]);
  const [moves,setMoves]   = useState(0);
  const [t,setT]           = useState(0);
  const ref                = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{ ref.current=setInterval(()=>setT(x=>x+1),1000); return()=>{ if(ref.current)clearInterval(ref.current); }; },[]);
  const matched = cards.filter(c=>c.matched).length;
  useEffect(()=>{ if(matched===16&&ref.current)clearInterval(ref.current); },[matched]);
  const click=(id:number)=>{
    const c=cards[id]; if(c.matched||c.flipped||open.length===2) return;
    const nxt=[...open,id];
    setCards(x=>x.map(y=>y.id===id?{...y,flipped:true}:y));
    if(nxt.length===2){
      setMoves(m=>m+1);
      const [a,b]=[cards[nxt[0]].e,cards[nxt[1]].e];
      setTimeout(()=>{
        if(a===b) setCards(x=>x.map(y=>nxt.includes(y.id)?{...y,matched:true}:y));
        else       setCards(x=>x.map(y=>nxt.includes(y.id)?{...y,flipped:false}:y));
        setOpen([]);
      },700);
    }
    setOpen(nxt);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1"><Clock size={12}/>{t}s</span>
        <span className="text-primary font-bold">{matched/2}/8 pairs</span>
        <span>{moves} moves</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(c=>(
          <motion.button key={c.id} onClick={()=>click(c.id)} whileTap={{scale:.9}}
            className={`aspect-square rounded-xl text-xl flex items-center justify-center border-2 transition-all select-none
              ${c.matched?"bg-emerald-500/20 border-emerald-500/50":c.flipped?"bg-primary/10 border-primary":"bg-muted border-border hover:border-primary/40"}`}>
            {(c.flipped||c.matched)?c.e:"?"}
          </motion.button>
        ))}
      </div>
      {matched===16&&<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-center space-y-3 pt-2">
        <p className="text-xl font-bold">🎉 Done in {t}s · {moves} moves</p>
        <button onClick={()=>onComplete(Math.max(10,30-moves)*10)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Claim XP →</button>
      </motion.div>}
    </div>
  );
}

/* ── SPEED MATHS ── */
function genQ(r:number) {
  const ops=["+","-","×"]; const op=ops[Math.floor(Math.random()*(r>5?3:2))];
  const a=Math.floor(Math.random()*(r>5?99:49))+1, b=Math.floor(Math.random()*(r>5?49:19))+1;
  const ans=op==="+"?a+b:op==="-"?a-b:a*b;
  const w=new Set<number>(); while(w.size<3)w.add(ans+(Math.floor(Math.random()*10)-4)||ans+6);
  return {q:`${a} ${op} ${b}`, ans, opts:[...Array.from(w),ans].sort(()=>Math.random()-.5)};
}
function SpeedMath({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [q,setQ]   = useState(()=>genQ(1));
  const [score,sc] = useState(0);
  const [round,sr] = useState(1);
  const [time,st]  = useState(45);
  const [fb,setFb] = useState<"ok"|"no"|null>(null);
  const total=12;
  useEffect(()=>{ if(time<=0){onComplete(score*8);return;} const t=setTimeout(()=>st(x=>x-1),1000); return()=>clearTimeout(t); },[time,score]);
  const pick=(o:number)=>{
    if(fb) return;
    const ok=o===q.ans; setFb(ok?"ok":"no"); if(ok)sc(s=>s+1);
    setTimeout(()=>{ setFb(null); setQ(genQ(round)); sr(r=>r+1); if(round>=total)onComplete((score+(ok?1:0))*8); },500);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Q {round}/{total}</span>
        <span className="text-2xl font-black text-foreground">{q.q} = ?</span>
        <span className={`flex items-center gap-1 font-bold ${time<10?"text-destructive":"text-muted-foreground"}`}><Clock size={12}/>{time}s</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all rounded-full" style={{width:`${(time/45)*100}%`}}/></div>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((o,i)=>(
          <motion.button key={i} onClick={()=>pick(o)} whileTap={{scale:.95}}
            className={`py-5 rounded-2xl text-2xl font-black border-2 transition-all
              ${fb&&o===q.ans?"bg-emerald-500 text-white border-emerald-500":fb&&o!==q.ans?"bg-muted/50 border-border text-muted-foreground/50":"bg-muted/60 border-border hover:border-primary hover:bg-primary/5"}`}>
            {o}
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Score <span className="font-bold text-foreground">{score}/{total}</span></p>
    </div>
  );
}

/* ── TIC TAC TOE ── */
type Cell="X"|"O"|null;
const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const checkW=(b:Cell[],p:Cell)=>WINS.some(l=>l.every(i=>b[i]===p));
const ai=(b:Cell[])=>{
  for(const[a,c,d]of WINS){if(b[a]==="O"&&b[c]==="O"&&!b[d])return d;if(b[a]==="O"&&b[d]==="O"&&!b[c])return c;if(b[c]==="O"&&b[d]==="O"&&!b[a])return a;}
  for(const[a,c,d]of WINS){if(b[a]==="X"&&b[c]==="X"&&!b[d])return d;if(b[a]==="X"&&b[d]==="X"&&!b[c])return c;if(b[c]==="X"&&b[d]==="X"&&!b[a])return a;}
  if(!b[4])return 4; const cr=[0,2,6,8].filter(i=>!b[i]); if(cr.length)return cr[~~(Math.random()*cr.length)];
  const em=b.map((v,i)=>v?-1:i).filter(i=>i>=0); return em[~~(Math.random()*em.length)];
};
function TicTacToe({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [board,setB]=useState<Cell[]>(Array(9).fill(null));
  const [score,setS]=useState({X:0,O:0,D:0});
  const [msg,setM]=useState<string|null>(null);
  const [games,setG]=useState(0);
  const play=(i:number)=>{
    if(board[i]||msg) return;
    const nb=[...board]; nb[i]="X";
    if(checkW(nb,"X")){setB(nb);setS(s=>({...s,X:s.X+1}));setM("🏆 You Win!");setG(g=>g+1);return;}
    if(nb.every(Boolean)){setB(nb);setS(s=>({...s,D:s.D+1}));setM("🤝 Draw");setG(g=>g+1);return;}
    const ai_i=ai(nb); nb[ai_i]="O";
    if(checkW(nb,"O")){setB(nb);setS(s=>({...s,O:s.O+1}));setM("🤖 AI Wins");setG(g=>g+1);return;}
    if(nb.every(Boolean)){setB(nb);setS(s=>({...s,D:s.D+1}));setM("🤝 Draw");setG(g=>g+1);return;}
    setB(nb);
  };
  const reset=()=>{setB(Array(9).fill(null));setM(null);};
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-semibold">
        <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary">You (X) {score.X}W</span>
        <span className="text-muted-foreground self-center">Draws {score.D}</span>
        <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400">AI (O) {score.O}W</span>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {board.map((c,i)=>(
          <motion.button key={i} onClick={()=>play(i)} whileTap={{scale:.88}}
            className={`aspect-square rounded-2xl text-3xl font-black border-2 transition-all
              ${c==="X"?"bg-primary/10 border-primary text-primary":c==="O"?"bg-rose-500/10 border-rose-400 text-rose-400":"bg-muted border-border hover:border-primary/50"}`}>
            {c}
          </motion.button>
        ))}
      </div>
      {msg&&<motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} className="text-center space-y-3">
        <p className="text-xl font-bold">{msg}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm flex items-center gap-1.5"><RotateCcw size={13}/>Rematch</button>
          {games>=2&&<button onClick={()=>onComplete(score.X*25+score.D*10)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Claim XP</button>}
        </div>
      </motion.div>}
      <p className="text-center text-[11px] text-muted-foreground">Play {Math.max(0,2-games)} more {games<2?"games":"game"} to claim XP</p>
    </div>
  );
}

/* ── NUMBER SERIES ── */
const SEQS=[
  {seq:[2,4,6,8,10],ans:12,rule:"Even numbers (+2)"},
  {seq:[1,4,9,16,25],ans:36,rule:"Perfect squares"},
  {seq:[2,3,5,8,13],ans:21,rule:"Fibonacci pattern"},
  {seq:[3,6,12,24,48],ans:96,rule:"Multiply by 2"},
  {seq:[100,90,81,73,66],ans:60,rule:"Decreasing gaps: 10,9,8,7,6"},
  {seq:[1,2,4,7,11,16],ans:22,rule:"Add 1,2,3,4,5,6…"},
  {seq:[5,10,20,40,80],ans:160,rule:"Double each time"},
  {seq:[81,27,9,3],ans:1,rule:"Divide by 3"},
  {seq:[2,6,12,20,30],ans:42,rule:"n×(n+1)"},
  {seq:[7,14,28,56,112],ans:224,rule:"Multiply by 2"},
];
function NumberSeries({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [input,setIn]=useState("");
  const [fb,setFb]=useState<"ok"|"no"|null>(null);
  const [hint,setH]=useState(false);
  const total=7;
  const q=SEQS[idx%SEQS.length];
  const submit=()=>{
    const ok=parseInt(input)===q.ans; setFb(ok?"ok":"no"); if(ok)setS(s=>s+1);
    setTimeout(()=>{ setFb(null);setIn("");setH(false); if(idx+1>=total){onComplete((score+(ok?1:0))*15);return;} setIdx(i=>i+1); },900);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Round {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total} correct</span>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 p-5 text-center">
        <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider">Find the next number</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {q.seq.map((n,i)=>(
            <span key={i} className="w-11 h-11 rounded-xl bg-primary text-primary-foreground text-base font-black flex items-center justify-center shadow-md shadow-primary/20">{n}</span>
          ))}
          <span className="w-11 h-11 rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/40 text-xl font-black">?</span>
        </div>
        {hint&&<p className="mt-3 text-xs text-amber-400 flex items-center justify-center gap-1"><Lightbulb size={11}/>Rule: {q.rule}</p>}
      </div>
      <div className="flex gap-3">
        <input type="number" value={input} onChange={e=>setIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
          placeholder="Your answer…"
          className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-xl font-black focus:outline-none transition-all
            ${fb==="ok"?"border-emerald-500 bg-emerald-500/10":fb==="no"?"border-destructive bg-destructive/10":"border-border bg-muted/50 focus:ring-2 focus:ring-primary/30"}`}/>
        <button onClick={submit} className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">Check</button>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={()=>setH(true)} className="text-xs text-amber-400 hover:underline flex items-center gap-1"><Lightbulb size={11}/>Hint</button>
        {fb&&<span className={`text-sm font-semibold flex items-center gap-1 ${fb==="ok"?"text-emerald-500":"text-destructive"}`}>{fb==="ok"?<CheckCircle2 size={14}/>:<XCircle size={14}/>}{fb==="ok"?"Correct +1":"Wrong"}</span>}
      </div>
    </div>
  );
}

/* ── ODD ONE OUT ── */
const ODDS=[
  {items:["🐕","🐈","🐟","🦁","🐦"],odd:"🐟",why:"Fish — not a mammal"},
  {items:["Mercury","Venus","Earth","Moon","Mars"],odd:"Moon",why:"Moon is a satellite, not a planet"},
  {items:["2","4","6","9","10"],odd:"9",why:"9 is odd; rest are even"},
  {items:["Piano","Guitar","Violin","Drum","Flute"],odd:"Drum",why:"Percussion — others are melodic"},
  {items:["Copper","Iron","Gold","Wood","Silver"],odd:"Wood",why:"Wood is not a metal"},
  {items:["JEE","NEET","CAT","UPSC","CBSE"],odd:"CBSE",why:"CBSE is a board, others are entrance exams"},
  {items:["Mitosis","Meiosis","Osmosis","Photosynthesis","Transpiration"],odd:"Mitosis",why:"Only cell division; rest are transport/energy processes"},
  {items:["Newton","Pascal","Joule","Kelvin","Gandhi"],odd:"Gandhi",why:"Gandhi is not a scientific unit"},
];
function OddOneOut({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const total=6; const q=ODDS[idx%ODDS.length];
  const pick=(item:string)=>{
    if(picked) return; setPk(item); const ok=item===q.odd; if(ok)setS(s=>s+1);
    setTimeout(()=>{ setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*13);return;} setIdx(i=>i+1); },1300);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Round {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <p className="text-center text-sm text-muted-foreground font-medium">Which one does NOT belong?</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {q.items.map((item,i)=>{
          const isOdd=item===q.odd; const isPicked=picked===item;
          return (
            <motion.button key={i} onClick={()=>pick(item)} whileTap={{scale:.92}}
              className={`px-5 py-3 rounded-2xl font-semibold text-sm border-2 transition-all
                ${isPicked&&isOdd?"bg-emerald-500 text-white border-emerald-500":
                  isPicked&&!isOdd?"bg-destructive text-white border-destructive":
                  picked&&isOdd?"bg-emerald-500/20 border-emerald-500/50 text-emerald-500":
                  "bg-muted/60 border-border hover:border-primary/50 hover:bg-primary/5"}`}>
              {item}
            </motion.button>
          );
        })}
      </div>
      {picked&&<motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
        className={`p-3.5 rounded-2xl border text-sm text-center font-medium
          ${picked===q.odd?"bg-emerald-500/10 border-emerald-500/30 text-emerald-500":"bg-destructive/10 border-destructive/30 text-destructive"}`}>
        {picked===q.odd?"✅ Correct! ":"❌ Wrong! "}<span className="opacity-80">{q.why}</span>
      </motion.div>}
    </div>
  );
}

/* ── WORD SCRAMBLE ── */
const WORDS_DATA=[
  {word:"ENTROPY",hint:"Measure of disorder",subj:"Chemistry"},
  {word:"INTEGRAL",hint:"Area under a curve",subj:"Maths"},
  {word:"MITOSIS",hint:"Type of cell division",subj:"Biology"},
  {word:"MOMENTUM",hint:"Mass × velocity",subj:"Physics"},
  {word:"CATALYST",hint:"Speeds up reactions",subj:"Chemistry"},
  {word:"TANGENT",hint:"Line touching a curve",subj:"Maths"},
  {word:"OSMOSIS",hint:"Water through membrane",subj:"Biology"},
  {word:"ELECTRON",hint:"Negative sub-atomic particle",subj:"Physics"},
  {word:"PROTEIN",hint:"Made from amino acids",subj:"Biology"},
  {word:"POLYGON",hint:"Multi-sided figure",subj:"Maths"},
];
function WordScramble({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [input,setIn]=useState("");
  const [fb,setFb]=useState<"ok"|"no"|null>(null);
  const [hint,setH]=useState(false);
  const total=7; const q=WORDS_DATA[idx%WORDS_DATA.length];
  const sc=q.word.split("").sort(()=>Math.random()-.5).join("");
  const submit=()=>{
    const ok=input.toUpperCase()===q.word; setFb(ok?"ok":"no"); if(ok)setS(s=>s+1);
    setTimeout(()=>{ setFb(null);setIn("");setH(false); if(idx+1>=total){onComplete((score+(ok?1:0))*13);return;} setIdx(i=>i+1); },900);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Round {idx+1}/{total}</span>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{q.subj}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-5 text-center">
        <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider">Unscramble the word</p>
        <div className="flex justify-center gap-1.5 flex-wrap">
          {sc.split("").map((ch,i)=>(
            <span key={i} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground text-lg font-black flex items-center justify-center shadow-md shadow-primary/20">{ch}</span>
          ))}
        </div>
        {hint&&<p className="mt-3 text-xs text-amber-400 flex items-center justify-center gap-1"><Lightbulb size={11}/>{q.hint}</p>}
      </div>
      <div className="flex gap-3">
        <input value={input} onChange={e=>setIn(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&submit()}
          placeholder="Your answer…"
          className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-lg font-black tracking-widest uppercase focus:outline-none transition-all
            ${fb==="ok"?"border-emerald-500 bg-emerald-500/10":fb==="no"?"border-destructive bg-destructive/10":"border-border bg-muted/50 focus:ring-2 focus:ring-primary/30"}`}/>
        <button onClick={submit} className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">Check</button>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={()=>setH(true)} className="text-xs text-amber-400 hover:underline flex items-center gap-1"><Lightbulb size={11}/>Hint</button>
        {fb&&<span className={`text-sm font-semibold flex items-center gap-1 ${fb==="ok"?"text-emerald-500":"text-destructive"}`}>{fb==="ok"?<CheckCircle2 size={14}/>:<XCircle size={14}/>}{fb==="ok"?"Correct!":"Nope — "+q.word}</span>}
      </div>
    </div>
  );
}

/* ── ANALOGY QUEST ── */
const ANALOGIES=[
  {q:"Book : Library :: Painting : ___",a:"Museum",opts:["Museum","School","Hospital","Factory"]},
  {q:"Newton : Physics :: Darwin : ___",a:"Biology",opts:["Biology","Chemistry","Geology","Astronomy"]},
  {q:"Thermometer : Temperature :: Barometer : ___",a:"Pressure",opts:["Pressure","Wind","Humidity","Altitude"]},
  {q:"Mitosis : Growth :: Meiosis : ___",a:"Reproduction",opts:["Reproduction","Respiration","Digestion","Excretion"]},
  {q:"JEE : Engineering :: NEET : ___",a:"Medicine",opts:["Medicine","Law","Arts","Commerce"]},
  {q:"Joule : Energy :: Pascal : ___",a:"Pressure",opts:["Pressure","Temperature","Force","Power"]},
  {q:"RNA : Transcription :: Protein : ___",a:"Translation",opts:["Translation","Replication","Mutation","Digestion"]},
];
function AnalogyQuest({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const total=6; const q=ANALOGIES[idx%ANALOGIES.length];
  const pick=(opt:string)=>{
    if(picked) return; setPk(opt); const ok=opt===q.a; if(ok)setS(s=>s+1);
    setTimeout(()=>{ setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*16);return;} setIdx(i=>i+1); },1200);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Q {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 text-center">
        <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">Complete the analogy</p>
        <p className="font-bold text-base">{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((opt,i)=>{
          const isA=opt===q.a; const isPk=picked===opt;
          return (
            <motion.button key={i} onClick={()=>pick(opt)} whileTap={{scale:.95}}
              className={`py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all
                ${isPk&&isA?"bg-emerald-500 text-white border-emerald-500":
                  isPk&&!isA?"bg-destructive text-white border-destructive":
                  picked&&isA?"bg-emerald-500/20 border-emerald-500/50 text-emerald-500":
                  "bg-muted/60 border-border hover:border-primary/50"}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── LATERAL RIDDLES ── */
const RIDDLES=[
  {q:"I have cities but no houses, forests but no trees, water but no fish. What am I?",a:"A map",opts:["A map","A painting","A mirror","A photo"]},
  {q:"The more you take, the more you leave behind. What am I?",a:"Footsteps",opts:["Footsteps","Memories","Time","Breath"]},
  {q:"What can travel around the world while staying in a corner?",a:"A stamp",opts:["A stamp","A coin","A letter","A phone"]},
  {q:"I have hands but cannot clap. What am I?",a:"A clock",opts:["A glove","A robot","A clock","A statue"]},
  {q:"The more you remove from me, the bigger I become. What am I?",a:"A hole",opts:["A sponge","A hole","A balloon","A shadow"]},
  {q:"I speak without a mouth, hear without ears. I have no body, but come alive with wind.",a:"An echo",opts:["A shadow","An echo","A dream","A cloud"]},
  {q:"What gets wetter the more it dries?",a:"A towel",opts:["A towel","A sponge","Sand","Paper"]},
];
function LateralRiddles({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const total=5; const q=RIDDLES[idx%RIDDLES.length];
  const pick=(opt:string)=>{
    if(picked) return; setPk(opt); const ok=opt===q.a; if(ok)setS(s=>s+1);
    setTimeout(()=>{ setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*18);return;} setIdx(i=>i+1); },1400);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Riddle {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="font-medium text-sm leading-relaxed text-foreground/90">{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((opt,i)=>{
          const isA=opt===q.a; const isPk=picked===opt;
          return (
            <motion.button key={i} onClick={()=>pick(opt)} whileTap={{scale:.95}}
              className={`py-3 rounded-2xl text-sm font-semibold border-2 transition-all
                ${isPk&&isA?"bg-emerald-500 text-white border-emerald-500":
                  isPk&&!isA?"bg-destructive text-white border-destructive":
                  picked&&isA?"bg-emerald-500/20 border-emerald-500/50":
                  "bg-muted/60 border-border hover:border-primary/50"}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── SUDOKU 4×4 ── */
const SUDOKU_PZ=[
  {p:[1,0,0,2,0,2,1,0,0,0,0,1,2,0,0,0],s:[1,3,4,2,4,2,1,3,3,4,2,1,2,1,3,4]},
  {p:[0,1,0,4,3,0,0,1,0,3,2,0,4,0,1,0],s:[2,1,3,4,3,4,2,1,1,3,4,2,4,2,1,3]},
];
function SudokuGame({ onComplete }:{ onComplete:(s:number)=>void }) {
  const pz=SUDOKU_PZ[~~(Math.random()*SUDOKU_PZ.length)];
  const [grid,setG]=useState([...pz.p]);
  const [errs,setE]=useState<Set<number>>(new Set());
  const [done,setD]=useState(false);
  const upd=(i:number,val:string)=>{
    const n=parseInt(val)||0; if(n<0||n>4)return;
    const g=[...grid]; g[i]=n; const e=new Set<number>();
    for(let r=0;r<4;r++){const row=g.slice(r*4,(r+1)*4).filter(Boolean);if(row.length!==new Set(row).size)for(let c=0;c<4;c++)if(g[r*4+c])e.add(r*4+c);}
    for(let c=0;c<4;c++){const col=[0,1,2,3].map(r=>g[r*4+c]).filter(Boolean);if(col.length!==new Set(col).size)for(let r=0;r<4;r++)if(g[r*4+c])e.add(r*4+c);}
    setG(g);setE(e);
    if(g.every((v,i)=>v===pz.s[i]))setD(true);
  };
  return (
    <div className="space-y-4">
      <p className="text-xs text-center text-muted-foreground">Fill 1–4 in every row, column and 2×2 box — no repeats!</p>
      <div className="grid grid-cols-4 gap-2 max-w-[220px] mx-auto">
        {grid.map((c,i)=>{
          const fixed=pz.p[i]!==0; const isErr=errs.has(i);
          return (
            <input key={i} type="number" min={1} max={4} value={c||""} readOnly={fixed}
              onChange={e=>!fixed&&upd(i,e.target.value)}
              className={`aspect-square text-center text-xl font-black rounded-xl border-2 focus:outline-none transition-all
                ${fixed?"bg-muted border-border cursor-not-allowed":
                  isErr?"bg-destructive/10 border-destructive text-destructive":
                  "bg-background border-border text-primary hover:border-primary/50 focus:ring-2 focus:ring-primary/30"}`}/>
          );
        })}
      </div>
      {done&&<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-center space-y-3">
        <p className="text-xl font-bold">🧩 Solved!</p>
        <button onClick={()=>onComplete(80)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Claim XP</button>
      </motion.div>}
    </div>
  );
}

/* ── LOGIC GRID ── */
const LG_PUZZLES=[{
  title:"Three students — find who studies what",
  people:["Aarav","Priya","Ravi"],
  subjects:["Physics","Chemistry","Maths"],
  clues:["Aarav does not study Physics","Priya does not study Maths","Ravi does not study Chemistry"],
  solution:{"Aarav":"Chemistry","Priya":"Physics","Ravi":"Maths"},
},{
  title:"Three friends — match each to their city",
  people:["Mehul","Sara","Kiran"],
  subjects:["Delhi","Mumbai","Bengaluru"],
  clues:["Mehul is not from Mumbai","Sara is not from Delhi","Kiran is not from Mumbai"],
  solution:{"Mehul":"Bengaluru","Sara":"Mumbai","Kiran":"Delhi"},
}];
function LogicGrid({ onComplete }:{ onComplete:(s:number)=>void }) {
  const pz=LG_PUZZLES[0];
  const [picks,setPicks]=useState<Record<string,string>>({});
  const [checked,setChk]=useState(false);
  const [score,setS]=useState<number|null>(null);
  const check=()=>{
    let ok=0; pz.people.forEach(p=>{ if(picks[p]===pz.solution[p])ok++; });
    setS(ok); setChk(true); onComplete(ok*30);
  };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4">
        <p className="text-xs font-bold text-indigo-400 mb-2">🧩 {pz.title}</p>
        {pz.clues.map((c,i)=><p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1"><span className="text-primary font-bold">{i+1}.</span>{c}</p>)}
      </div>
      <div className="space-y-3">
        {pz.people.map(person=>(
          <div key={person} className="flex items-center gap-3">
            <span className="w-16 text-sm font-semibold text-foreground flex-shrink-0">{person}</span>
            <div className="flex gap-2 flex-1">
              {pz.subjects.map(sub=>{
                const sel=picks[person]===sub;
                const correct=checked&&sub===pz.solution[person];
                const wrong=checked&&sel&&sub!==pz.solution[person];
                return (
                  <button key={sub} onClick={()=>!checked&&setPicks(p=>({...p,[person]:sub}))}
                    disabled={checked}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                      ${correct?"bg-emerald-500 text-white border-emerald-500":
                        wrong?"bg-destructive text-white border-destructive":
                        sel?"bg-primary text-primary-foreground border-primary":
                        "bg-muted/50 border-border hover:border-primary/50"}`}>
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!checked
        ?<button onClick={check} disabled={Object.keys(picks).length<pz.people.length}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 transition-all">
            Submit Solution
          </button>
        :<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-center">
          <p className="font-bold text-lg">{score===3?"🎊 Perfect!":score===2?"🙂 Almost!":"💡 Keep practicing"}</p>
          <p className="text-sm text-muted-foreground">{score}/3 correct</p>
        </motion.div>
      }
    </div>
  );
}

/* ── STROOP CLASH ── */
const STROOP_DATA=[
  {word:"RED",colour:"blue",hex:"#3B82F6"},{word:"BLUE",colour:"red",hex:"#EF4444"},
  {word:"GREEN",colour:"yellow",hex:"#EAB308"},{word:"YELLOW",colour:"green",hex:"#22C55E"},
  {word:"PURPLE",colour:"orange",hex:"#F97316"},{word:"ORANGE",colour:"purple",hex:"#A855F7"},
];
function StroopClash({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [time,setT]=useState(45);
  const [fb,setFb]=useState<"ok"|"no"|null>(null);
  const [round,sR]=useState(1);
  const total=12; const q=STROOP_DATA[idx%STROOP_DATA.length];
  useEffect(()=>{ if(time<=0){onComplete(score*8);return;} const t=setTimeout(()=>setT(x=>x-1),1000); return()=>clearTimeout(t); },[time,score]);
  const pick=(col:string)=>{
    if(fb) return; const ok=col===q.colour; setFb(ok?"ok":"no"); if(ok)setS(s=>s+1);
    setTimeout(()=>{ setFb(null);setIdx(i=>i+1);sR(r=>r+1); if(round>=total)onComplete(score*8); },400);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">{round}/{total}</span>
        <span className={`flex items-center gap-1 font-bold ${time<10?"text-destructive":"text-muted-foreground"}`}><Clock size={12}/>{time}s</span>
        <span className="font-bold text-primary">Score {score}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all rounded-full" style={{width:`${(time/45)*100}%`}}/></div>
      <div className="rounded-2xl bg-muted/30 border border-border p-5 text-center">
        <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">Tap the INK COLOUR — ignore the word!</p>
        <p className="text-6xl font-black tracking-widest" style={{color:q.hex}}>{q.word}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["red","blue","green","yellow","purple","orange"].map(col=>(
          <motion.button key={col} onClick={()=>pick(col)} whileTap={{scale:.93}}
            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all
              ${fb&&col===q.colour?"bg-emerald-500 text-white border-emerald-500":"bg-muted border-border hover:border-primary/50"}`}>
            {col}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── CRYPTARITHMETIC ── */
const CRYPTO=[
  {puzzle:"SEND + MORE = MONEY",clue:"S=9, E=5, N=6, D=7, M=1, O=0, R=8, Y=2",answer:"9567 + 1085 = 10652",verify:"9567+1085===10652"},
  {puzzle:"TWO + TWO = FOUR",clue:"T=7, W=3, O=4 gives 734+734=1468. Try T=8,W=6,O=5",answer:"Try: 765+765=1530 — find FOUR=1530",verify:"any"},
];
function CryptoGame({ onComplete }:{ onComplete:(s:number)=>void }) {
  const pz=CRYPTO[0];
  const [input,setIn]=useState("");
  const [checked,setChk]=useState(false);
  const [hint,setH]=useState(0);
  const hints=["Each letter represents a unique digit 0-9","Start by figuring out M — it must be 1 (carry from addition)","S must be 9 since SEND+MORE is close to 10000","Answer: 9567 + 1085 = 10652"];
  const check=()=>{ setChk(true); onComplete(Math.max(30,120-hint*20)); };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 p-5 text-center">
        <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">Each letter = unique digit (0-9)</p>
        <p className="text-2xl font-black tracking-widest text-foreground">{pz.puzzle}</p>
      </div>
      {hint>0&&<div className="space-y-1.5">
        {hints.slice(0,hint).map((h,i)=>(
          <p key={i} className="text-xs text-amber-400 flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
            <Lightbulb size={11} className="mt-0.5 flex-shrink-0"/>{h}
          </p>
        ))}
      </div>}
      {!checked
        ?<>
          <input value={input} onChange={e=>setIn(e.target.value)} placeholder="Type the numerical answer e.g. 9567 + 1085 = 10652"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono"/>
          <div className="flex gap-3">
            {hint<hints.length-1&&<button onClick={()=>setH(h=>h+1)} className="flex-1 py-2.5 rounded-xl border border-amber-500/40 text-amber-400 text-sm flex items-center justify-center gap-1.5 hover:bg-amber-500/10 transition-all"><Lightbulb size={14}/>Hint ({hints.length-1-hint} left)</button>}
            <button onClick={check} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all">Submit</button>
          </div>
        </>
        :<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
          <p className="font-bold text-emerald-500 mb-1">✅ Solution: {pz.answer}</p>
          <p className="text-xs text-muted-foreground">{pz.clue}</p>
        </motion.div>
      }
    </div>
  );
}

/* ── VISUAL PATTERNS ── */
const VP_PUZZLES=[
  {
    title:"Shape rotation pattern",
    grid:["🔴","🟦","🔺","🟦","🔺","🔴","🔺","🔴","?"],
    answer:"🟦",
    opts:["🟦","🔴","🔺","🟩"],
    explain:"Each shape appears exactly once per row and column — like Sudoku with shapes",
  },
  {
    title:"Number grid pattern",
    grid:["2","4","8","3","6","12","4","8","?"],
    answer:"16",
    opts:["16","14","20","12"],
    explain:"Each row: col2 = col1×2, col3 = col1×4. Row 3: 4×4=16",
  },
  {
    title:"Colour sequence",
    grid:["🟥","🟧","🟨","🟧","🟨","🟥","🟨","🟥","?"],
    answer:"🟧",
    opts:["🟧","🟥","🟨","🟦"],
    explain:"Latin square pattern — each colour once per row and column",
  },
];
function VisualPatterns({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const [showEx,setEx]=useState(false);
  const total=3; const q=VP_PUZZLES[idx%VP_PUZZLES.length];
  const pick=(opt:string)=>{
    if(picked) return; setPk(opt); const ok=opt===q.answer; if(ok)setS(s=>s+1); setEx(true);
    setTimeout(()=>{ setEx(false);setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*35);return;} setIdx(i=>i+1); },1800);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Puzzle {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="rounded-2xl bg-muted/30 border border-border p-4">
        <p className="text-[11px] text-muted-foreground mb-3 text-center uppercase tracking-wider">{q.title} — what replaces "?"</p>
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {q.grid.map((cell,i)=>(
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-black border-2 ${cell==="?"?"border-dashed border-primary/40 text-primary/40":"bg-muted/60 border-border"}`}>
              {cell}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {q.opts.map((opt,i)=>{
          const isA=opt===q.answer; const isPk=picked===opt;
          return (
            <motion.button key={i} onClick={()=>pick(opt)} whileTap={{scale:.92}}
              className={`py-4 rounded-xl text-2xl border-2 transition-all
                ${isPk&&isA?"bg-emerald-500 border-emerald-500":isPk&&!isA?"bg-destructive border-destructive":
                  picked&&isA?"bg-emerald-500/20 border-emerald-500/50":"bg-muted/60 border-border hover:border-primary/50"}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
      {showEx&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className={`p-3 rounded-xl text-xs border ${picked===q.answer?"bg-emerald-500/10 border-emerald-500/30 text-emerald-500":"bg-destructive/10 border-destructive/30 text-destructive"}`}>
        {picked===q.answer?"✅ Correct! ":"❌ Wrong! "}<span className="opacity-80">{q.explain}</span>
      </motion.div>}
    </div>
  );
}

/* ── MASTERMIND ── */
const COLS_MM=["🔴","🔵","🟢","🟡","🟣","🟠"];
function genSec():string[]{return Array.from({length:4},()=>COLS_MM[~~(Math.random()*COLS_MM.length)]);}
function Mastermind({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [secret]=useState(genSec);
  const [curr,setC]=useState<string[]>(Array(4).fill(""));
  const [guesses,setG]=useState<{row:string[];b:number;w:number}[]>([]);
  const [won,setW]=useState(false);
  const MAX=8;
  const place=(i:number,col:string)=>{
    if(won||guesses.length>=MAX) return;
    setC(c=>{ const n=[...c]; n[i]=col; return n; });
  };
  const clear=(i:number)=>setC(c=>{const n=[...c];n[i]="";return n;});
  const guess=()=>{
    if(curr.some(c=>!c)||won) return;
    const sc=[...secret],gc=[...curr]; let b=0,w=0;
    const su=Array(4).fill(false),gu=Array(4).fill(false);
    for(let i=0;i<4;i++){if(gc[i]===sc[i]){b++;su[i]=true;gu[i]=true;}}
    for(let i=0;i<4;i++){if(gu[i])continue;for(let j=0;j<4;j++){if(su[j])continue;if(gc[i]===sc[j]){w++;su[j]=true;break;}}}
    const row={row:[...curr],b,w}; const ng=[...guesses,row];
    setG(ng); setC(Array(4).fill(""));
    if(b===4)setW(true);
  };
  const over=won||guesses.length>=MAX;
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>Guess {guesses.length+1}/{MAX}</span>
        <span className="font-bold text-primary">{won?"🎉 Cracked it!":over?"Secret: "+secret.join(""):"Crack the code!"}</span>
      </div>
      <div className="flex justify-center gap-1.5 flex-wrap">
        {COLS_MM.map(c=>(
          <button key={c} onClick={()=>{const i=curr.indexOf("");if(i>=0)place(i,c);}}
            className="text-2xl w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:scale-110 transition-all">{c}</button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {curr.map((c,i)=>(
          <button key={i} onClick={()=>clear(i)}
            className="w-11 h-11 rounded-xl border-2 border-dashed border-primary/40 text-2xl flex items-center justify-center hover:border-primary transition-all">
            {c||"·"}
          </button>
        ))}
        <button onClick={guess} disabled={curr.some(c=>!c)||over}
          className="px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 ml-1">Go</button>
      </div>
      <div className="space-y-1.5 max-h-44 overflow-y-auto">
        {guesses.map((g,i)=>(
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 text-sm">
            <span className="text-muted-foreground text-xs w-4">{i+1}</span>
            <div className="flex gap-0.5">{g.row.map((c,ci)=><span key={ci} className="text-lg">{c}</span>)}</div>
            <div className="ml-auto flex gap-1">
              <span className="text-xs font-bold text-emerald-500">{"⬛".repeat(g.b)}</span>
              <span className="text-xs font-bold text-amber-400">{"⬜".repeat(g.w)}</span>
            </div>
          </div>
        ))}
      </div>
      {over&&<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-center space-y-2">
        <button onClick={()=>onComplete(won?Math.max(20,(MAX-guesses.length+1)*20):5)}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Claim XP</button>
      </motion.div>}
    </div>
  );
}

/* ── DECISION BLITZ ── */
const DECISIONS=[
  {q:"You have 2 hours before JEE Main. You've covered 90% of syllabus. What's the best use of time?",
    opts:["Rush to cover the remaining 10%","Revise the formulae you know well","Start a new topic to cover more","Sleep and rest your brain"],
    a:"Revise the formulae you know well",why:"High-confidence revision maximises score — new topics in 2 hours create confusion."},
  {q:"You score 60% in a mock test. Your friend scores 85%. Your best next step?",
    opts:["Copy your friend's study plan exactly","Analyse your weak topics and target them","Give up and lower your goal","Study more hours randomly"],
    a:"Analyse your weak topics and target them",why:"Targeted effort on weak areas gives the highest ROI — everyone's weak topics differ."},
  {q:"You have 3 assignments due tomorrow. Which do you tackle first?",
    opts:["The easiest one to build momentum","The hardest one while your mind is fresh","Random order","The one your friend is doing"],
    a:"The hardest one while your mind is fresh",why:"Cognitive energy is highest early — tackle complexity first (Eat the Frog strategy)."},
  {q:"Two job offers: ₹8L CTC startup with 40% growth potential vs ₹12L stable MNC. Age 22. Best choice?",
    opts:["MNC — higher immediate salary","Startup — high risk but high reward","Flip a coin","Ask your parents"],
    a:"Startup — high risk but high reward",why:"At 22 with low financial obligations, the equity upside of a growth startup often outweighs salary delta."},
  {q:"You forgot to study one chapter. In the exam you have 10 mins left and 5 questions from that chapter. Best strategy?",
    opts:["Attempt all 5 and guess randomly","Skip all 5 questions","Attempt the ones where you can partially eliminate options","Leave the exam early"],
    a:"Attempt the ones where you can partially eliminate options",why:"Partial elimination improves expected score above random guessing — selective attempt with logic."},
];
function DecisionBlitz({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const total=4; const q=DECISIONS[idx%DECISIONS.length];
  const pick=(opt:string)=>{
    if(picked) return; setPk(opt); const ok=opt===q.a; if(ok)setS(s=>s+1);
    setTimeout(()=>{ setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*28);return;} setIdx(i=>i+1); },1800);
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Scenario {idx+1}/{total}</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
        <p className="text-sm font-medium leading-relaxed">{q.q}</p>
      </div>
      <div className="space-y-2.5">
        {q.opts.map((opt,i)=>{
          const isA=opt===q.a; const isPk=picked===opt;
          return (
            <motion.button key={i} onClick={()=>pick(opt)} whileTap={{scale:.98}}
              className={`w-full py-3 px-4 rounded-2xl text-sm font-medium border-2 text-left transition-all
                ${isPk&&isA?"bg-emerald-500 text-white border-emerald-500":
                  isPk&&!isA?"bg-destructive text-white border-destructive":
                  picked&&isA?"bg-emerald-500/20 border-emerald-500/50 text-emerald-500":
                  "bg-muted/50 border-border hover:border-primary/50"}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
      {picked&&<motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl p-3 leading-relaxed">
        💡 <strong>Why:</strong> {q.why}
      </motion.div>}
    </div>
  );
}

/* ── CAT QUANT SPRINT ── */
const CAT_QS=[
  {q:"If 2x + 3y = 12 and 3x + 2y = 13, find x + y.",a:"5",opts:["4","5","6","7"],explain:"Add equations: 5x+5y=25 → x+y=5"},
  {q:"A train 200m long passes a pole in 10s. Speed in km/h?",a:"72",opts:["60","70","72","80"],explain:"Speed=200/10=20 m/s=20×3.6=72 km/h"},
  {q:"What is 15% of 80% of 500?",a:"60",opts:["45","55","60","75"],explain:"80% of 500=400; 15% of 400=60"},
  {q:"In how many ways can letters of LEVEL be arranged?",a:"30",opts:["20","30","40","60"],explain:"5!/(2!×2!)=120/4=30 (L repeats twice, E repeats twice)"},
  {q:"A can do a job in 10 days, B in 15 days. Together in?",a:"6",opts:["5","6","7","8"],explain:"Combined rate=1/10+1/15=1/6, so 6 days"},
  {q:"If a circle has area 154 cm², its circumference is?",a:"44 cm",opts:["33 cm","44 cm","55 cm","22 cm"],explain:"r²=154/π≈49, r=7; C=2π×7=44"},
  {q:"Simple interest on ₹5000 at 8% per year for 3 years?",a:"₹1200",opts:["₹1000","₹1100","₹1200","₹1500"],explain:"SI = P×R×T/100 = 5000×8×3/100 = ₹1200"},
  {q:"Two numbers in ratio 3:5. Their LCM is 75. Sum?",a:"40",opts:["30","35","40","45"],explain:"Numbers are 15 and 25 (LCM=75). Sum=40"},
];
function CATQuant({ onComplete }:{ onComplete:(s:number)=>void }) {
  const [idx,setIdx]=useState(0);
  const [score,setS]=useState(0);
  const [picked,setPk]=useState<string|null>(null);
  const [time,setT]=useState(90);
  const total=6; const q=CAT_QS[idx%CAT_QS.length];
  useEffect(()=>{ if(time<=0){onComplete(score*20);return;} const t=setTimeout(()=>setT(x=>x-1),1000); return()=>clearTimeout(t); },[time,score]);
  const pick=(opt:string)=>{
    if(picked) return; setPk(opt); const ok=opt===q.a; if(ok)setS(s=>s+1);
    setTimeout(()=>{ setPk(null); if(idx+1>=total){onComplete((score+(ok?1:0))*20);return;} setIdx(i=>i+1); },1400);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Q {idx+1}/{total}</span>
        <span className={`flex items-center gap-1 font-bold ${time<15?"text-destructive animate-pulse":"text-muted-foreground"}`}><Clock size={12}/>{time}s</span>
        <span className="font-bold text-primary">{score}/{total}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-rose-500 transition-all rounded-full" style={{width:`${(time/90)*100}%`}}/></div>
      <div className="rounded-2xl bg-gradient-to-br from-rose-500/5 to-pink-500/5 border border-rose-500/20 p-4">
        <p className="text-sm font-semibold leading-relaxed">{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((opt,i)=>{
          const isA=opt===q.a; const isPk=picked===opt;
          return (
            <motion.button key={i} onClick={()=>pick(opt)} whileTap={{scale:.95}}
              className={`py-3.5 rounded-2xl text-sm font-bold border-2 transition-all
                ${isPk&&isA?"bg-emerald-500 text-white border-emerald-500":
                  isPk&&!isA?"bg-destructive text-white border-destructive":
                  picked&&isA?"bg-emerald-500/20 border-emerald-500/50 text-emerald-500":
                  "bg-muted/60 border-border hover:border-primary/50"}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
      {picked&&<p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">💡 {q.explain}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   GAME MAP
══════════════════════════════════════════════════ */
const GAME_MAP: Record<string, React.ComponentType<{onComplete:(s:number)=>void}>> = {
  memory: MemoryGame, quickmath: SpeedMath, tictactoe: TicTacToe,
  sequence: NumberSeries, oddone: OddOneOut, wordscram: WordScramble,
  analogy: AnalogyQuest, riddles: LateralRiddles, sudoku: SudokuGame,
  logicgrid: LogicGrid, stroop: StroopClash, cryptarith: CryptoGame,
  visualpat: VisualPatterns, mastermind: Mastermind,
  decision: DecisionBlitz, catquant: CATQuant,
};

/* ══════════════════════════════════════════════════
   GAME MODAL
══════════════════════════════════════════════════ */
function GameModal({ game, onClose, onXP }:{ game:GameDef; onClose:()=>void; onXP:(xp:number)=>void }) {
  const Component = GAME_MAP[game.id];
  const handle=(score:number)=>{ const xp=Math.max(5,Math.round((score/100)*game.xp)+5); onXP(xp); };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,scale:.92,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.92}}
        className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r ${game.color} flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">{game.icon}</div>
            <div>
              <h3 className="font-bold text-white text-sm">{game.title}</h3>
              <div className="flex items-center gap-3 text-white/70 text-[11px]">
                <span className="flex items-center gap-1"><Zap size={10}/>{game.xp} XP</span>
                {game.time>0&&<span className="flex items-center gap-1"><Clock size={10}/>{game.time}s</span>}
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 font-semibold">{game.difficulty}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"><X size={15}/></button>
        </div>
        {/* body */}
        <div className="p-5 overflow-y-auto">
          {Component
            ? <Component onComplete={handle}/>
            : <div className="text-center py-12 space-y-3">
                <Brain size={48} className="mx-auto opacity-20"/>
                <p className="font-bold">Coming soon!</p>
                <button onClick={()=>{onXP(game.xp);onClose();}} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Claim Preview XP</button>
              </div>
          }
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ACHIEVEMENT BADGES
══════════════════════════════════════════════════ */
const BADGES=[
  {id:"first",  label:"First Blood",  emoji:"⚡", desc:"Complete your first game",         req:(p:Set<string>,_xp:number)=>p.size>=1},
  {id:"trio",   label:"Hat Trick",    emoji:"🎩", desc:"Complete 3 different games",       req:(p:Set<string>,_xp:number)=>p.size>=3},
  {id:"xp100",  label:"XP Hunter",    emoji:"🏹", desc:"Earn 100 XP",                      req:(_p:Set<string>,xp:number)=>xp>=100},
  {id:"xp500",  label:"Brain Grinder",emoji:"💪", desc:"Earn 500 XP",                      req:(_p:Set<string>,xp:number)=>xp>=500},
  {id:"all_l1", label:"Level 1 Pro",  emoji:"🌱", desc:"Complete all Level 1 games",       req:(p:Set<string>,_xp:number)=>["memory","quickmath","tictactoe"].every(id=>p.has(id))},
  {id:"l5",     label:"Apex Thinker", emoji:"👑", desc:"Unlock Level 5",                   req:(_p:Set<string>,xp:number)=>xp>=2000},
];

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const rise={hidden:{opacity:0,y:14},visible:{opacity:1,y:0,transition:{duration:0.35}}};
const stagger={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:0.06}}};

const DIFF_COLOR:Record<string,string>={
  Easy:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium:"bg-blue-500/10 text-blue-400 border-blue-500/20",
  Hard:"bg-violet-500/10 text-violet-400 border-violet-500/20",
  Expert:"bg-amber-500/10 text-amber-400 border-amber-500/20",
  Elite:"bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function CriticalThinking() {
  const [totalXP,setXP]         = useState(0);
  const [played,setPlayed]       = useState<Set<string>>(new Set());
  const [activeGame,setActive]   = useState<GameDef|null>(null);
  const [selectedLv,setLv]       = useState<number|null>(null);
  const [toast,setToast]         = useState<string|null>(null);
  const [view,setView]           = useState<"levels"|"all"|"badges">("levels");

  const earnXP=(game:GameDef,xp:number)=>{
    setXP(t=>t+xp);
    setPlayed(p=>new Set([...p,game.id]));
    setActive(null);
    setToast(`+${xp} XP — ${game.title} complete! 🎉`);
    setTimeout(()=>setToast(null),3000);
  };

  const curLevel = LEVELS.slice().reverse().find(l=>totalXP>=l.unlockXp)??LEVELS[0];
  const nextLevel = LEVELS.find(l=>l.unlockXp>totalXP);
  const progress  = nextLevel ? Math.min(100,((totalXP-curLevel.unlockXp)/(nextLevel.unlockXp-curLevel.unlockXp))*100) : 100;
  const isLocked  = (lv:number)=>totalXP<(LEVELS[lv-1]?.unlockXp??0);
  const byLevel   = (lv:number)=>GAMES.filter(g=>g.level===lv);

  const earnedBadges = BADGES.filter(b=>b.req(played,totalXP));

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 px-6 py-10">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10">
          {[...Array(14)].map((_,i)=>(
            <Brain key={i} size={28} className="absolute text-white" style={{top:`${Math.random()*100}%`,left:`${Math.random()*100}%`}}/>
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/50 font-medium uppercase tracking-widest">Ages 16–30</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center"><Brain size={24} className="text-white"/></div>
                <h1 className="text-3xl font-bold text-white">Critical Thinking</h1>
              </div>
              <p className="text-white/70 text-sm max-w-sm">Master logical reasoning, pattern recognition, and decision-making through 16 progressive brain games.</p>
              <div className="flex gap-5 mt-4 text-white/60 text-xs">
                <span className="flex items-center gap-1.5"><Gamepad2 size={12}/>{GAMES.length} games</span>
                <span className="flex items-center gap-1.5"><Layers size={12}/>5 levels</span>
                <span className="flex items-center gap-1.5"><Award size={12}/>{BADGES.length} badges</span>
                <span className="flex items-center gap-1.5"><Trophy size={12}/>{played.size} completed</span>
              </div>
            </div>

            {/* XP progress card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[220px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/60 text-xs">Total XP</p>
                  <p className="text-3xl font-black text-white">{totalXP}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${curLevel.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {curLevel.emoji}
                </div>
              </div>
              <p className="text-white font-bold text-sm">{curLevel.title}</p>
              <p className="text-white/50 text-[11px] mb-2">{curLevel.subtitle}</p>
              {nextLevel&&<>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-white rounded-full transition-all duration-700" style={{width:`${progress}%`}}/>
                </div>
                <p className="text-white/40 text-[10px]">{nextLevel.unlockXp-totalXP} XP → {nextLevel.title}</p>
              </>}
            </div>
          </div>

          {/* badges strip */}
          {earnedBadges.length>0&&(
            <div className="flex gap-2 mt-5 flex-wrap">
              {earnedBadges.map(b=>(
                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
                  {b.emoji} {b.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-muted/50 rounded-2xl p-1 w-fit">
          {([["levels","Levels","🎯"],["all","All Games","🎮"],["badges","Badges","🏅"]] as const).map(([k,l,ic])=>(
            <button key={k} onClick={()=>{setView(k);setLv(null);}}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${view===k?"bg-background shadow text-foreground":"text-muted-foreground hover:text-foreground"}`}>
              {ic} {l}
            </button>
          ))}
        </div>

        {/* ── LEVELS VIEW ── */}
        {view==="levels"&&!selectedLv&&(
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {LEVELS.map(lv=>{
              const locked=isLocked(lv.level);
              return (
                <motion.button key={lv.level} variants={rise}
                  onClick={()=>!locked&&setLv(lv.level)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                    ${locked?"border-border bg-muted/20 opacity-50 cursor-not-allowed":
                      `border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer`}`}>
                  {locked&&<Lock size={13} className="absolute top-3 right-3 text-muted-foreground"/>}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lv.gradient} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {lv.emoji}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Level {lv.level}</p>
                  <p className="font-bold text-base mt-0.5">{lv.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lv.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-amber-400 font-semibold">{byLevel(lv.level).length} games</span>
                    {locked
                      ?<span className="text-[11px] text-muted-foreground">{lv.unlockXp} XP</span>
                      :<span className={`text-[11px] font-semibold flex items-center gap-1 ${lv.ring.replace("ring-","text-")}`}>Play <ChevronRight size={11}/></span>
                    }
                  </div>
                  {!locked&&(
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                        style={{width:`${(byLevel(lv.level).filter(g=>played.has(g.id)).length/byLevel(lv.level).length)*100}%`}}/>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* ── LEVEL GAMES ── */}
        {view==="levels"&&selectedLv&&(
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={()=>setLv(null)} className="p-2 rounded-xl border border-border hover:bg-muted transition-all"><ArrowLeft size={16}/></button>
              <div>
                <h2 className="text-xl font-bold">Level {selectedLv} — {LEVELS[selectedLv-1].title}</h2>
                <p className="text-sm text-muted-foreground">{LEVELS[selectedLv-1].desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {byLevel(selectedLv).map(game=><GameCard key={game.id} game={game} played={played} onPlay={()=>setActive(game)}/>)}
            </div>
          </motion.div>
        )}

        {/* ── ALL GAMES ── */}
        {view==="all"&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {GAMES.map(game=>{
                const locked=isLocked(game.level);
                return <GameCard key={game.id} game={game} played={played} onPlay={()=>!locked&&setActive(game)} locked={locked}/>;
              })}
            </div>
          </motion.div>
        )}

        {/* ── BADGES ── */}
        {view==="badges"&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BADGES.map(b=>{
              const earned=b.req(played,totalXP);
              return (
                <div key={b.id} className={`p-5 rounded-2xl border-2 transition-all ${earned?"border-amber-500/40 bg-amber-500/5":"border-border bg-muted/20 opacity-60"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{earned?b.emoji:"🔒"}</span>
                    <div>
                      <p className={`font-bold ${earned?"text-amber-500":""}`}>{b.label}</p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                  {earned&&<p className="text-xs text-amber-500 font-semibold flex items-center gap-1"><CheckCircle2 size={12}/>Earned!</p>}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* modal */}
      <AnimatePresence>
        {activeGame&&<GameModal game={activeGame} onClose={()=>setActive(null)} onXP={xp=>earnXP(activeGame,xp)}/>}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast&&(
          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500 text-white shadow-2xl z-50 text-sm font-semibold whitespace-nowrap">
            <Trophy size={16}/>{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── GAME CARD ── */
function GameCard({ game, played, onPlay, locked=false }:{
  game:GameDef; played:Set<string>; onPlay:()=>void; locked?:boolean;
}) {
  const done=played.has(game.id);
  return (
    <motion.div variants={rise}
      onClick={onPlay}
      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300
        ${locked?"border-border bg-muted/20 opacity-50 cursor-not-allowed":
          "border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"}`}>
      <div className={`h-24 bg-gradient-to-br ${game.color} flex items-center justify-center relative overflow-hidden`}>
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg relative z-10 group-hover:scale-110 transition-transform">{game.icon}</div>
        {done&&<div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg z-10"><CheckCircle2 size={14} className="text-white"/></div>}
        {locked&&<Lock size={16} className="absolute top-3 right-3 text-white/60 z-10"/>}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{game.title}</h3>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${DIFF_COLOR[game.difficulty]}`}>{game.difficulty}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{game.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Zap size={10} className="text-amber-400"/>{game.xp}XP</span>
            {game.time>0&&<span className="flex items-center gap-0.5"><Clock size={10}/>{game.time}s</span>}
            <span className="flex items-center gap-0.5"><Star size={10}/>Lv{game.level}</span>
          </div>
          {!locked&&<button className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${done?"bg-emerald-500/10 text-emerald-500":"bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {done?"Replay":"Play"}<ChevronRight size={11}/>
          </button>}
        </div>
      </div>
    </motion.div>
  );
}
