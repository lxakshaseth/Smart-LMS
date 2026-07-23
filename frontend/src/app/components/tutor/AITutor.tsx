import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, ImageIcon, Bot, User, Pin, Trash2, Pencil,
  ChevronLeft, Plus, Search, MoreHorizontal,
  X, Check, GripVertical, Sparkles, BookOpen, Lightbulb,
  Clock, MessageSquare, Copy, ThumbsUp, ThumbsDown,
  RotateCcw, ChevronDown, AlertCircle, Code, Terminal, FileText, Cpu, HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "../../lib/api";
import { renderMarkdown } from "../../lib/renderMarkdown";

/* ═══════════════════════════════════════
   TYPES
═══════════════════════════════════════ */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
  error?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  pinned: boolean;
  messages: Message[];
  subject?: string;
  isDraft?: boolean;
  language?: string;
}

interface ServerMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface ServerChat {
  _id: string;
  title: string;
  messages: ServerMessage[];
  updatedAt: string;
  language?: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const fmtTime = (d: Date) => {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};


/* ═══════════════════════════════════════
   SUPPORTED LANGUAGES & GREETINGS
   ═══════════════════════════════════════ */
const LANGUAGES = [
  { code: "Auto-Detect", label: "🌐 Auto-Detect" },
  { code: "English", label: "🇺🇸 English" },
  { code: "Hindi", label: "🇮🇳 Hindi (हिन्दी)" },
  { code: "Hinglish", label: "🇮🇳 Hinglish" },
  { code: "Spanish", label: "🇪🇸 Spanish (Español)" },
  { code: "French", label: "🇫🇷 French (Français)" },
  { code: "German", label: "🇩🇪 German (Deutsch)" },
  { code: "Gujarati", label: "🇮🇳 Gujarati (ગુજરાતી)" },
  { code: "Marathi", label: "🇮🇳 Marathi (मराठी)" },
  { code: "Bengali", label: "🇮🇳 Bengali (বাংলা)" },
  { code: "Tamil", label: "🇮🇳 Tamil (தமிழ்)" },
  { code: "Telugu", label: "🇮🇳 Telugu (తెలుగు)" },
];

const getWelcomeMessage = () => {
  return "Hello! I'm your AI Study Mentor. Ask me anything related to learning, academics, coding, projects, research, competitive exams, or skill development.";
};

const getLanguageGreeting = (lang: string) => {
  const welcome = getWelcomeMessage();
  const map: Record<string, string> = {
    "Auto-Detect": welcome,
    "English": welcome,
    "Hindi": "नमस्ते! मैं आपका AI स्टडी मेंटर हूँ। आज आप क्या सीखना या पढ़ना चाहेंगे?",
    "Hinglish": "Hello! Main aapka AI Study Mentor hoon. Aaj aap kya seekhna ya padhna chahenge?",
    "Spanish": "¡Hola! Soy tu mentor de estudio IA. Pregúntame cualquier cosa sobre aprendizaje, programación o investigaciones.",
    "French": "Bonjour ! Je suis votre mentor d'étude IA. Posez-moi vos questions sur le codage, les projets ou vos études.",
    "German": "Hallo! Ich bin dein KI-Studienmentor. Frag mich alles rund ums Lernen, Programmieren oder Projekte.",
    "Gujarati": "નમસ્તે! હું તમારો AI સ્ટડી મેન્ટર છું. ભણતર, કોડિંગ કે સંશોધન અંગે કંઈપણ પૂછો.",
    "Marathi": "नमस्कार! मी तुमचा एआय स्टडी मेंटर आहे. शिक्षण, कोडिंग किंवा प्रोजेक्ट्सबद्दल काहीही विचारा.",
    "Bengali": "হ্যালো! আমি আপনার এআই স্টাডি মেন্টর। লার্নিং, কোডিং বা গবেষণা সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
    "Tamil": "வணக்கம்! நான் உங்கள் AI கற்றல் வழிகாட்டி. கல்வி, கோடிங் அல்லது ஆராய்ச்சி தொடர்பான எதையும் கேளுங்கள்.",
    "Telugu": "నమస్తే! నేను మీ AI స్టడీ మెంటర్. చదువు, కోడింగ్ లేదా ప్రాజెక్ట్‌ల గురించి ఏమైనా అడగండి.",
  };
  return map[lang] || welcome;
};



/* ═══════════════════════════════════════
   SEED CONVERSATIONS
═══════════════════════════════════════ */
const firstConv: Conversation = {
  id: uid(), title: "New Conversation", subject: undefined,
  preview: "Start a new conversation…",
  timestamp: new Date(), pinned: false, isDraft: true,
  messages: [
    { id: uid(), role: "assistant", content: getWelcomeMessage(), timestamp: new Date() },
  ],
};
const seedConvs: Conversation[] = [firstConv];

const MIN_W = 200, MAX_W = 420, DEF_W = 280;

/* ═══════════════════════════════════════
   CONTEXT MENU
═══════════════════════════════════════ */
function CtxMenu({ x, y, pinned, onPin, onRename, onDelete, onClose }: {
  x: number; y: number; pinned: boolean;
  onPin: () => void; onRename: () => void; onDelete: () => void; onClose: () => void;
}) {
  useEffect(() => {
    const h = () => onClose();
    window.addEventListener("click", h, { once: true });
    return () => window.removeEventListener("click", h);
  }, [onClose]);

  return (
    <div style={{ top: y, left: x }} className="fixed z-50 bg-card border border-border rounded-2xl shadow-2xl py-1.5 w-44 overflow-hidden text-sm">
      <button onClick={onPin}    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted w-full text-left transition-colors">
        <Pin size={13} className="text-amber-400" /> {pinned ? "Unpin" : "Pin to top"}
      </button>
      <button onClick={onRename} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted w-full text-left transition-colors">
        <Pencil size={13} className="text-muted-foreground" /> Rename
      </button>
      <div className="my-1 border-t border-border" />
      <button onClick={onDelete} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-destructive/10 w-full text-left text-destructive transition-colors">
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   CONVERSATION ITEM
═══════════════════════════════════════ */
function ConvItem({ conv, active, onSelect, onPin, onRename, onDelete }: {
  conv: Conversation; active: boolean;
  onSelect: () => void; onPin: () => void;
  onRename: (t: string) => void; onDelete: () => void;
}) {
  const [ctx, setCtx]       = useState<{ x: number; y: number } | null>(null);
  const [editing, setEdit]  = useState(false);
  const [draft, setDraft]   = useState(conv.title);
  const inputRef             = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const subClr: Record<string, string> = {
    Physics:   "bg-blue-500/10 text-blue-400",
    Chemistry: "bg-green-500/10 text-green-400",
    Maths:     "bg-amber-500/10 text-amber-400",
    Biology:   "bg-purple-500/10 text-purple-400",
  };

  return (
    <>
      <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        onContextMenu={e => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }); }}
        onClick={onSelect}
        className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none
          ${active ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60 border border-transparent"}`}>

        {conv.pinned && <Pin size={10} className="text-amber-400 flex-shrink-0 mt-1.5" />}

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { onRename(draft); setEdit(false); } if (e.key === "Escape") setEdit(false); }}
                className="flex-1 text-xs px-2 py-1 rounded-lg bg-background border border-primary/40 focus:outline-none" />
              <button onClick={() => { onRename(draft); setEdit(false); }} className="p-1 hover:text-green-500"><Check size={11} /></button>
              <button onClick={() => setEdit(false)} className="p-1 hover:text-destructive"><X size={11} /></button>
            </div>
          ) : (
            <p className={`text-xs font-semibold truncate ${active ? "text-primary" : ""}`}>{conv.title}</p>
          )}
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{conv.preview}</p>
          <div className="flex items-center gap-2 mt-1">
            {conv.subject && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${subClr[conv.subject] ?? "bg-muted text-muted-foreground"}`}>
                {conv.subject}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock size={9} />{fmtTime(conv.timestamp)}</span>
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setCtx({ x: r.left, y: r.bottom + 4 }); }}
          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all flex-shrink-0 mt-0.5">
          <MoreHorizontal size={13} />
        </button>
      </motion.div>

      {ctx && <CtxMenu x={ctx.x} y={ctx.y} pinned={conv.pinned} onClose={() => setCtx(null)}
        onPin={() => { onPin(); setCtx(null); }}
        onRename={() => { setEdit(true); setCtx(null); }}
        onDelete={() => { onDelete(); setCtx(null); }} />}
    </>
  );
}

/* ═══════════════════════════════════════
   MESSAGE BUBBLE
═══════════════════════════════════════ */
function MsgBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked]   = useState<boolean | null>(null);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-end gap-3 group">
        <div className="max-w-[78%]">
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-md shadow-primary/20">
            {msg.content}
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <User size={15} className="text-white" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.error ? "bg-destructive" : "bg-gradient-to-br from-primary to-secondary shadow-primary/20"}`}>
        {msg.error ? <AlertCircle size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>

      <div className="flex-1 min-w-0 max-w-[88%]">
        {/* rendered markdown */}
        <div className={msg.error ? "rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" : "text-foreground/90"}>
          {renderMarkdown(msg.content)}
        </div>

        {/* action bar */}
        {!msg.error && <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copy}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${copied ? "bg-green-500/10 text-green-500" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={() => setLiked(true)}
            className={`p-1.5 rounded-lg text-xs transition-all ${liked === true ? "text-green-500 bg-green-500/10" : "hover:bg-muted text-muted-foreground"}`}>
            <ThumbsUp size={13} />
          </button>
          <button onClick={() => setLiked(false)}
            className={`p-1.5 rounded-lg text-xs transition-all ${liked === false ? "text-rose-500 bg-rose-500/10" : "hover:bg-muted text-muted-foreground"}`}>
            <ThumbsDown size={13} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <RotateCcw size={13} />
          </button>
          <span className="ml-1 text-[10px] text-muted-foreground">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN
═══════════════════════════════════════ */
const quickPrompts = [
  { icon: <Lightbulb size={14} />, text: "Explain Newton's Laws with examples" },
  { icon: <Code size={14} />,      text: "Build a MERN authentication system" },
  { icon: <Cpu size={14} />,       text: "Difference between Machine Learning and Deep Learning" },
  { icon: <Terminal size={14} />,  text: "Explain Binary Search" },
  { icon: <BookOpen size={14} />,  text: "Solve this calculus problem" },
  { icon: <FileText size={14} />,  text: "Summarize my uploaded PDF" },
  { icon: <HelpCircle size={14} />,text: "Prepare me for Java interviews" },
  { icon: <Cpu size={14} />,       text: "Explain Operating Systems" },
  { icon: <Terminal size={14} />,  text: "Generate SQL queries" },
  { icon: <Code size={14} />,      text: "Help me write Python code" },
];

export default function AITutor() {
  const [convs, setConvs]         = useState<Conversation[]>(seedConvs);
  const [activeId, setActiveId]   = useState(seedConvs[0].id);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [sidebarW, setSidebarW]   = useState(DEF_W);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch]       = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const checkSidebarCollapse = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    checkSidebarCollapse();
    window.addEventListener("resize", checkSidebarCollapse);
    return () => window.removeEventListener("resize", checkSidebarCollapse);
  }, []);
  const endRef                    = useRef<HTMLDivElement>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const dragging                  = useRef(false);
  const dragStartX                = useRef(0);
  const dragStartW                = useRef(DEF_W);

  const active = convs.find(c => c.id === activeId)!;

  const updateActiveLanguage = (lang: string) => {
    if (!active) return;
    setConvs(p => p.map(c => {
      if (c.id === activeId) {
        let updatedMessages = c.messages;
        if (c.messages.length === 1 && c.messages[0].role === "assistant") {
          updatedMessages = [{
            ...c.messages[0],
            content: getLanguageGreeting(lang)
          }];
        }
        return { ...c, language: lang, messages: updatedMessages };
      }
      return c;
    }));
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages, typing]);

  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      try {
        const response = await apiRequest<{
          success: boolean;
          sessions: Array<{ _id: string }>;
        }>("/ai/sessions");

        const chats = await Promise.all(
          response.sessions.slice(0, 20).map(async (session) => {
            const result = await apiRequest<{ success: boolean; chat: ServerChat }>(`/ai/chat/${session._id}`);
            const chat = result.chat;
            const fallbackTime = new Date(chat.updatedAt);
            const messages: Message[] = chat.messages.map((message) => ({
              id: message._id || uid(),
              role: message.role,
              content: message.content,
              timestamp: message.createdAt ? new Date(message.createdAt) : fallbackTime,
            }));
            const lastMessage = messages[messages.length - 1];

            return {
              id: chat._id,
              title: chat.title || "New Conversation",
              preview: lastMessage?.content.slice(0, 60) || "Start a new conversation…",
              timestamp: fallbackTime,
              pinned: false,
              language: chat.language || "Auto-Detect",
              messages: messages.length
                ? messages
                : [{ id: uid(), role: "assistant" as const, content: getWelcomeMessage(), timestamp: fallbackTime }],
            } satisfies Conversation;
          })
        );

        if (!cancelled && chats.length) {
          setConvs((current) => {
            const serverIds = new Set(chats.map((chat) => chat.id));
            const localOnly = current.filter((conversation) =>
              conversation.isDraft || !serverIds.has(conversation.id)
            );
            return [...localOnly, ...chats];
          });
        }
      } catch (error) {
        console.error("Could not load AI conversations", error);
      }
    }

    void loadConversations();
    return () => {
      cancelled = true;
    };
  }, []);

  /* resize */
  const onGripDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartW.current = sidebarW;
    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(MAX_W, Math.max(MIN_W, dragStartW.current + (ev.clientX - dragStartX.current)));
      setSidebarW(next);
      if (next <= MIN_W + 10) setCollapsed(true);
      else setCollapsed(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", () => { dragging.current = false; }, { once: true });
  }, [sidebarW]);

  /* send */
  const send = async () => {
    if (!input.trim() || typing || !active) return;

    const question = input.trim();
    const localConversationId = activeId;
    const isDraft = active.isDraft;
    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setConvs((current) => current.map((conversation) =>
      conversation.id === localConversationId
        ? {
            ...conversation,
            messages: [...conversation.messages, userMsg],
            preview: question.slice(0, 60),
            title: conversation.isDraft ? question.slice(0, 60) : conversation.title,
          }
        : conversation
    ));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTyping(true);

    let serverChatId = localConversationId;

    try {
      if (isDraft) {
        const created = await apiRequest<{ success: boolean; chatId: string }>("/ai/new-chat", {
          method: "POST",
        });
        serverChatId = created.chatId;
        setConvs((current) => current.map((conversation) =>
          conversation.id === localConversationId
            ? { ...conversation, id: serverChatId, isDraft: false }
            : conversation
        ));
        setActiveId(serverChatId);
      }

      const response = await apiRequest<{ success: boolean; reply: string }>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          chatId: serverChatId,
          question,
          language: active?.language || "Auto-Detect",
        }),
      });
      const reply: Message = {
        id: uid(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };
      setConvs((current) => current.map((conversation) =>
        conversation.id === serverChatId
          ? { ...conversation, messages: [...conversation.messages, reply] }
          : conversation
      ));
    } catch (error) {
      const reply: Message = {
        id: uid(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Could not receive AI response. Please try again.",
        timestamp: new Date(),
        error: true,
      };
      setConvs((current) => current.map((conversation) =>
        conversation.id === serverChatId || conversation.id === localConversationId
          ? { ...conversation, messages: [...conversation.messages, reply] }
          : conversation
      ));
    } finally {
      setTyping(false);
    }
  };

  const newChat = () => {
    const c: Conversation = {
      id: uid(), title: "New Conversation", preview: "Start a new conversation…",
      timestamp: new Date(), pinned: false, isDraft: true,
      language: "Auto-Detect",
      messages: [{ id: uid(), role: "assistant", content: getWelcomeMessage(), timestamp: new Date() }],
    };
    setConvs(p => [c, ...p]);
    setActiveId(c.id);
  };

  const filtered = convs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.preview.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter(c => c.pinned);
  const recent = filtered.filter(c => !c.pinned);

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-background relative">

      {/* ── mobile backdrop overlay for chat sidebar ── */}
      <AnimatePresence>
        {!collapsed && (
          <div
            onClick={() => setCollapsed(true)}
            className="md:hidden absolute inset-0 z-10 bg-black/45 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* ── sidebar ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <>
            {/* mobile backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCollapsed(true)} className="md:hidden fixed inset-0 bg-black/40 z-20 backdrop-blur-xs" />
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              style={{ width: typeof window !== "undefined" && window.innerWidth < 768 ? "82vw" : sidebarW, maxWidth: "320px" }}
              className="fixed md:relative inset-y-0 left-0 z-30 flex-shrink-0 border-r border-border flex flex-col bg-card overflow-hidden shadow-2xl md:shadow-none"
            >

            <div className="flex items-center gap-2 px-3 pt-4 pb-3">
              <button onClick={newChat}
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
                <Plus size={14} /> New Chat
              </button>
              <button onClick={() => setCollapsed(true)}
                className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all flex-shrink-0">
                <ChevronLeft size={15} />
              </button>
            </div>

            <div className="px-3 pb-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
              {pinned.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Pin size={9} className="text-amber-400" /> Pinned
                  </p>
                  <div className="space-y-0.5">
                    {pinned.map(c => (
                      <ConvItem key={c.id} conv={c} active={activeId === c.id}
                        onSelect={() => setActiveId(c.id)}
                        onPin={() => setConvs(p => p.map(x => x.id === c.id ? { ...x, pinned: !x.pinned } : x))}
                        onRename={t => setConvs(p => p.map(x => x.id === c.id ? { ...x, title: t } : x))}
                        onDelete={() => { const r = convs.filter(x => x.id !== c.id); setConvs(r); if (activeId === c.id && r.length) setActiveId(r[0].id); }} />
                    ))}
                  </div>
                </div>
              )}
              {recent.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Clock size={9} /> Recent
                  </p>
                  <div className="space-y-0.5">
                    {recent.map(c => (
                      <ConvItem key={c.id} conv={c} active={activeId === c.id}
                        onSelect={() => setActiveId(c.id)}
                        onPin={() => setConvs(p => p.map(x => x.id === c.id ? { ...x, pinned: !x.pinned } : x))}
                        onRename={t => setConvs(p => p.map(x => x.id === c.id ? { ...x, title: t } : x))}
                        onDelete={() => { const r = convs.filter(x => x.id !== c.id); setConvs(r); if (activeId === c.id && r.length) setActiveId(r[0].id); }} />
                    ))}
                  </div>
                </div>
              )}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No conversations found</p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
      </AnimatePresence>

      {/* grip */}
      {!collapsed && (
        <div onMouseDown={onGripDown}
          className="hidden md:flex w-1 flex-shrink-0 cursor-col-resize hover:bg-primary/40 transition-colors items-center justify-center group">
          <GripVertical size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* ── chat ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
          {collapsed && (
            <button onClick={() => setCollapsed(false)}
              className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shadow-primary/30">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm truncate">{active?.title}</h2>
              {active?.pinned && <Pin size={11} className="text-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground">AI Mentor · Universal AI Study Assistant</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium hover:bg-muted transition-all select-none"
              >
                <span>
                  <span className="sm:hidden">
                    {LANGUAGES.find(l => l.code === (active?.language || "Auto-Detect"))?.label.split(" ")[0]}
                  </span>
                  <span className="hidden sm:inline">
                    {LANGUAGES.find(l => l.code === (active?.language || "Auto-Detect"))?.label || "Auto-Detect"}
                  </span>
                </span>
                <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${showLangMenu ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl py-1.5 z-50 max-h-64 overflow-y-auto"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            updateActiveLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-muted
                            ${(active?.language || "Auto-Detect") === lang.code ? "text-primary font-semibold bg-primary/5" : "text-foreground/80"}`}
                        >
                          <span>{lang.label}</span>
                          {(active?.language || "Auto-Detect") === lang.code && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setConvs(p => p.map(c => c.id === activeId ? { ...c, pinned: !c.pinned } : c))}
              className={`p-2 rounded-xl transition-all ${active?.pinned ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground hover:bg-muted"}`}>
              <Pin size={16} />
            </button>
            <button onClick={newChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
              title="New Chat">
              <Plus size={13} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* quick prompts */}
          {active?.messages.length <= 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
                  <Bot size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-bold">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground mt-1">Ask me any question — explanations, coding, summaries, interview prep, or problem solving.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                {quickPrompts.map(q => (
                  <button key={q.text} onClick={() => { setInput(q.text); textareaRef.current?.focus(); }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-left text-xs font-medium transition-all group">
                    <span className="text-primary group-hover:scale-110 transition-transform">{q.icon}</span>
                    {q.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {active?.messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)}
          </AnimatePresence>

          {/* typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shadow-primary/20">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* input */}
        <div className="px-5 pb-5 pt-3 border-t border-border bg-card/30 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/40 transition-all shadow-sm">
              <button className="p-1 rounded-xl hover:bg-muted transition-colors flex-shrink-0 mb-0.5 text-muted-foreground" title="Upload image">
                <ImageIcon size={18} />
              </button>
              <textarea ref={textareaRef} rows={1} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="Ask any study-related question, upload notes, solve problems, explain concepts, generate summaries, or prepare for interviews..."
                className="flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground/60 max-h-28 py-0.5" />
              <button onClick={send} disabled={!input.trim() || typing}
                className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${input.trim() && !typing ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              AI Mentor · Universal AI Study Assistant · Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
