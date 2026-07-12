import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, GripHorizontal, Minus, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Msg { role: "user" | "assistant"; text: string; time: string }

const replies = [
  "Great question! Let me help you with that. This is a core concept that comes up frequently in exams — focus on understanding the *why* behind it.",
  "Sure! Here's a quick breakdown:\n• Start with the definition\n• Learn the formula or rule\n• Practice with examples\n\nWant me to walk through a specific problem?",
  "Good thinking! That topic is very important for your exam. I'd recommend reviewing it with practice problems for the best retention.",
  "Absolutely! Let me explain that step by step so it's crystal clear for you.",
];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const CHAT_W = 320;
const CHAT_H = 440;

export function FloatingAssistant() {
  const [open, setOpen]       = useState(false);
  const [minimized, setMin]   = useState(false);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([
    { role:"assistant", text:"👋 Hi! I'm your AI assistant. Ask me anything about your studies — notes, quizzes, topic explanations, or study plans!", time: now() },
  ]);

  /* ── position state: button + chat panel ── */
  const [btnPos, setBtnPos]   = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [chatPos, setChatPos] = useState({ x: window.innerWidth - CHAT_W - 16, y: window.innerHeight - CHAT_H - 90 });

  /* dragging refs */
  const btnDragging  = useRef(false);
  const chatDragging = useRef(false);
  const dragOffset   = useRef({ x:0, y:0 });
  const hasDragged   = useRef(false);

  const messagesEnd = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  /* ── clamp inside viewport ── */
  const clampBtn = (x:number, y:number) => ({
    x: Math.min(Math.max(x, 28), window.innerWidth  - 28),
    y: Math.min(Math.max(y, 28), window.innerHeight - 28),
  });
  const clampChat = (x:number, y:number) => ({
    x: Math.min(Math.max(x, 0), window.innerWidth  - CHAT_W),
    y: Math.min(Math.max(y, 0), window.innerHeight - 60),
  });

  /* ── button drag ── */
  const onBtnMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    hasDragged.current = false;
    btnDragging.current = true;
    dragOffset.current = { x: e.clientX - btnPos.x, y: e.clientY - btnPos.y };

    const move = (ev: MouseEvent) => {
      if (!btnDragging.current) return;
      hasDragged.current = true;
      const np = clampBtn(ev.clientX - dragOffset.current.x, ev.clientY - dragOffset.current.y);
      setBtnPos(np);
      /* keep chat tethered near button if open */
      setChatPos(clampChat(np.x - CHAT_W + 28, np.y - CHAT_H - 12));
    };
    const up = () => { btnDragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up, { once: true });
  }, [btnPos]);

  /* touch drag for button */
  const onBtnTouchStart = useCallback((e: React.TouchEvent) => {
    hasDragged.current = false;
    const t = e.touches[0];
    dragOffset.current = { x: t.clientX - btnPos.x, y: t.clientY - btnPos.y };

    const move = (ev: TouchEvent) => {
      hasDragged.current = true;
      const touch = ev.touches[0];
      const np = clampBtn(touch.clientX - dragOffset.current.x, touch.clientY - dragOffset.current.y);
      setBtnPos(np);
      setChatPos(clampChat(np.x - CHAT_W + 28, np.y - CHAT_H - 12));
    };
    const up = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up, { once: true });
  }, [btnPos]);

  /* ── chat panel drag (grip bar) ── */
  const onChatMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    chatDragging.current = true;
    dragOffset.current = { x: e.clientX - chatPos.x, y: e.clientY - chatPos.y };

    const move = (ev: MouseEvent) => {
      if (!chatDragging.current) return;
      setChatPos(clampChat(ev.clientX - dragOffset.current.x, ev.clientY - dragOffset.current.y));
    };
    const up = () => { chatDragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up, { once: true });
  }, [chatPos]);

  /* ── send message ── */
  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role:"user", text: input.trim(), time: now() };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs(p => [...p, { role:"assistant", text: replies[Math.floor(Math.random()*replies.length)], time: now() }]);
      setTyping(false);
    }, 1200 + Math.random()*600);
  };

  const handleBtnClick = () => {
    if (hasDragged.current) return; // was a drag, not a click
    if (!open) {
      /* place chat near button */
      setChatPos(clampChat(btnPos.x - CHAT_W + 28, btnPos.y - CHAT_H - 12));
    }
    setOpen(v => !v);
    setMin(false);
  };

  const quickPicks = ["Explain Newton's Laws", "JEE tip of the day", "Create a quiz for me", "Plan my study day"];

  return (
    <>
      {/* ── floating chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.9 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.9 }}
            transition={{ duration:0.18 }}
            style={{ left: chatPos.x, top: chatPos.y, width: CHAT_W, zIndex: 9999, position:"fixed" }}
            className="flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-border bg-card"
          >
            {/* ── drag grip / header ── */}
            <div
              onMouseDown={onChatMouseDown}
              className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white"/>
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">AI Assistant</p>
                  <p className="text-white/70 text-[10px] leading-tight">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <GripHorizontal size={14} className="text-white/50 mr-1"/>
                <button onClick={()=>setMin(v=>!v)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors" title={minimized?"Expand":"Minimize"}>
                  {minimized ? <Maximize2 size={13}/> : <Minimize2 size={13}/>}
                </button>
                <button onClick={()=>setOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors" title="Close">
                  <X size={14}/>
                </button>
              </div>
            </div>

            {/* ── body (collapsible) ── */}
            <AnimatePresence>
              {!minimized && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                  transition={{duration:0.2}} className="flex flex-col overflow-hidden"
                  style={{maxHeight: CHAT_H - 44}}>

                  {/* messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{maxHeight:260}}>
                    {msgs.map((m,i)=>(
                      <div key={i} className={`flex gap-2 ${m.role==="user"?"justify-end":"justify-start"}`}>
                        {m.role==="assistant"&&(
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot size={12} className="text-white"/>
                          </div>
                        )}
                        <div className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap
                          ${m.role==="user"
                            ?"bg-primary text-primary-foreground rounded-br-none"
                            :"bg-muted border border-border rounded-bl-none"}`}>
                          {m.text}
                          <p className={`text-[9px] mt-1 ${m.role==="user"?"text-primary-foreground/60":"text-muted-foreground"}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                    {typing&&(
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                          <Bot size={12} className="text-white"/>
                        </div>
                        <div className="bg-muted border border-border px-3 py-2.5 rounded-xl rounded-bl-none flex items-center gap-1">
                          {[0,150,300].map(d=>(
                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{animationDelay:`${d}ms`}}/>
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEnd}/>
                  </div>

                  {/* quick picks — only on first message */}
                  {msgs.length===1&&(
                    <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
                      {quickPicks.map(q=>(
                        <button key={q} onClick={()=>{setInput(q);}}
                          className="text-[10px] px-2.5 py-1.5 rounded-xl border border-border bg-muted/50 hover:border-primary/40 hover:bg-primary/5 text-left font-medium transition-all truncate">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* input */}
                  <div className="px-3 pb-3 pt-1 border-t border-border">
                    <div className="flex gap-1.5 bg-muted/50 border border-border rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
                      <input value={input} onChange={e=>setInput(e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
                        placeholder="Ask anything…"
                        className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground/60 py-1"/>
                      <button onClick={send} disabled={!input.trim()||typing}
                        className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${input.trim()&&!typing?"bg-primary text-primary-foreground hover:bg-primary/90":"bg-transparent text-muted-foreground/40 cursor-not-allowed"}`}>
                        <Send size={13}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── draggable floating button ── */}
      <motion.button
        style={{ left: btnPos.x - 28, top: btnPos.y - 28, position:"fixed", zIndex:9998, touchAction:"none" }}
        onMouseDown={onBtnMouseDown}
        onTouchStart={onBtnTouchStart}
        onClick={handleBtnClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        title="Drag to move · Click to open"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x"   initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.15}}><X size={22}/></motion.span>
            : <motion.span key="bot" initial={{rotate:90,opacity:0}}  animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.15}}><Bot size={22}/></motion.span>
          }
        </AnimatePresence>
        {/* pulse dot */}
        {!open && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"/>}
      </motion.button>
    </>
  );
}
