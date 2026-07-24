import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  FileText, Bot, Highlighter, Bookmark, Plus, Search, Trash2,
  Tag, Clock, Star, StarOff, Download, Copy, Check, X, Edit3,
  BookOpen, Youtube, Brain, ChevronRight, Filter, SortAsc,
  Sparkles, Hash, AlignLeft, Users, Share2, Send, MessageSquare,
  ArrowUpRight, ArrowDownLeft, Eye, CheckCircle2, UserCheck, MessageCircle,
  Image as ImageIcon, FileCheck, Paperclip, ZoomIn, ZoomOut, RotateCw,
  Printer, Maximize2, Minimize2, ExternalLink, Play, Volume2, FileSpreadsheet, Presentation,
  Link as LinkIcon, FileCode, ShieldAlert, Lock, RefreshCw, SlidersHorizontal
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

/* ═══════ TYPES ═══════ */
type NoteTab = "my-notes" | "ai-notes" | "highlights" | "bookmarks" | "shared-notes";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
  color: string;
}

interface AINote {
  id: string;
  title: string;
  content: string;
  subject: string;
  source: string;
  createdAt: Date;
  wordCount: number;
}

interface ServerNote {
  _id: string;
  title: string;
  content: string;
  subject: string;
  source: string;
  createdAt: string;
}

interface Highlight {
  id: string;
  text: string;
  source: string;
  subject: string;
  color: string;
  createdAt: Date;
  note?: string;
}

interface BookmarkItem {
  id: string;
  title: string;
  type: "video" | "book" | "quiz" | "article";
  subject: string;
  url?: string;
  createdAt: Date;
  note?: string;
}

interface FriendPartner {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  online?: boolean;
}

interface SharedNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  senderName: string;
  senderAvatar: string;
  receiverName: string;
  receiverAvatar: string;
  isIncoming: boolean;
  chatMessage?: string;
  timestamp: string;
  tags?: string[];
  fileType: "pdf" | "image" | "document" | "video" | "link" | "text";
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  fileUrl?: string | null;
  permission?: "view" | "download";
  createdAt?: string;
}

/* ═══════ HELPERS ═══════ */
const uid = () => Math.random().toString(36).slice(2, 9);

const NOTE_COLORS = [
  "bg-indigo-500/10 border-indigo-500/20",
  "bg-amber-500/10 border-amber-500/20",
  "bg-green-500/10 border-green-500/20",
  "bg-rose-500/10 border-rose-500/20",
  "bg-violet-500/10 border-violet-500/20",
  "bg-cyan-500/10 border-cyan-500/20",
];

const seedNotes: Note[] = [];
const seedAINotes: AINote[] = [];
const seedHighlights: Highlight[] = [];
const seedBookmarks: BookmarkItem[] = [];

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtRelative = (d: Date) => {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const SUBJECT_COLOR: Record<string, string> = {
  Physics:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Chemistry:   "bg-green-500/10 text-green-400 border-green-500/20",
  Mathematics: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Biology:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
  UPSC:        "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  video:   { icon: <Youtube size={13}/>,   color: "bg-red-500/10 text-red-400 border-red-500/20"      },
  book:    { icon: <BookOpen size={13}/>,  color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  quiz:    { icon: <Brain size={13}/>,     color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  article: { icon: <FileText size={13}/>,  color: "bg-teal-500/10 text-teal-400 border-teal-500/20"    },
};

/* ═══════ NOTE EDITOR MODAL ═══════ */
function NoteEditor({ note, onSave, onClose, onShareNote }: { note: Partial<Note>; onSave: (n: Note) => void; onClose: () => void; onShareNote?: (payload: { title: string; content: string; subject?: string; fileType?: any }) => void }) {
  const [title, setTitle]     = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [subject, setSubject] = useState(note.subject ?? "Physics");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags]       = useState<string[]>(note.tags ?? []);
  const [color, setColor]     = useState(note.color ?? NOTE_COLORS[0]);

  const save = () => {
    if (!title.trim()) return;
    onSave({
      id: note.id ?? uid(), title, content, subject, tags,
      starred: note.starred ?? false, color,
      createdAt: note.createdAt ?? new Date(), updatedAt: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h3 className="font-bold">{note.id ? "Edit Note" : "New Note"}</h3>
          <div className="flex gap-2">
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c, i) => (
                <button key={i} onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${c.split(" ")[0].replace("/10", "/60")} ${color === c ? "scale-125 border-foreground" : "border-transparent"}`}/>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X size={15}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title…"
            className="w-full text-xl font-bold bg-transparent border-b-2 border-border focus:border-primary focus:outline-none pb-2 transition-colors placeholder:text-muted-foreground/40"/>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                {["Physics","Chemistry","Mathematics","Biology","UPSC","SSC","General"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { setTags(t => [...t, tagInput.trim()]); setTagInput(""); }}}
                  placeholder="Add tag…"
                  className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {t}<button onClick={() => setTags(ts => ts.filter(x => x !== t))}><X size={10}/></button>
                </span>
              ))}
            </div>
          )}

          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Start writing your notes… (supports plain text)"
            rows={14}
            className="w-full px-4 py-3 rounded-2xl bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm leading-[1.85] resize-none font-mono placeholder:text-muted-foreground/40"/>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={save}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all cursor-pointer">
            Save Note
          </button>
          <button
            type="button"
            onClick={() => {
              if (title && content) {
                onShareNote?.({ title, content, subject, fileType: "document" });
                onClose();
              }
            }}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Share2 size={14} /> Share with Friend
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-border hover:bg-muted transition-all text-sm cursor-pointer">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════ MY NOTES TAB ═══════ */
function MyNotes({ onShareNote }: { onShareNote?: (payload: { title: string; content: string; subject?: string; fileType?: any }) => void }) {
  const [notes, setNotes]     = useState<Note[]>(seedNotes);
  const [search, setSearch]   = useState("");
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const [copied, setCopied]   = useState<string | null>(null);
  const [filter, setFilter]   = useState("All");

  const subjects = ["All", ...Array.from(new Set(notes.map(n => n.subject)))];
  const filtered = notes.filter(n => {
    const matchS = filter === "All" || n.subject === filter;
    const matchQ = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchS && matchQ;
  }).sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.updatedAt.getTime() - a.updatedAt.getTime());

  const save = (n: Note) => {
    setNotes(prev => prev.some(x => x.id === n.id) ? prev.map(x => x.id === n.id ? n : x) : [n, ...prev]);
    setEditing(null);
  };
  const del  = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  const star = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  const copy = (n: Note) => { navigator.clipboard.writeText(`${n.title}\n\n${n.content}`); setCopied(n.id); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/50 hover:bg-muted text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          <Plus size={16}/> New Note
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText size={44} className="mx-auto mb-4 opacity-20"/>
          <p className="font-semibold">No notes found</p>
          <p className="text-sm mt-1">Create your first note or change the filter</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(note => (
              <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative rounded-2xl border-2 p-5 cursor-pointer hover:shadow-lg transition-all duration-200 ${note.color}`}
                onClick={() => setEditing(note)}>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); star(note.id); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-muted transition-colors" title="Star Note">
                    {note.starred ? <Star size={13} className="text-amber-400 fill-amber-400"/> : <StarOff size={13} className="text-muted-foreground"/>}
                  </button>
                  <button onClick={e => {
                    e.stopPropagation();
                    onShareNote?.({ title: note.title, content: note.content, subject: note.subject, fileType: "document" });
                  }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors" title="Share with Friend">
                    <Share2 size={13} className="text-muted-foreground hover:text-emerald-500" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); copy(note); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-muted transition-colors" title="Copy Note">
                    {copied === note.id ? <Check size={13} className="text-emerald-500"/> : <Copy size={13} className="text-muted-foreground"/>}
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(note.id); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-destructive hover:text-white transition-colors" title="Delete Note">
                    <Trash2 size={13} className="text-muted-foreground"/>
                  </button>
                </div>

                {note.starred && <Star size={12} className="text-amber-400 fill-amber-400 absolute top-3 left-4"/>}

                <h3 className="font-bold text-sm leading-snug mb-2 mt-1 pr-24 line-clamp-2">{note.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-3 font-mono whitespace-pre-wrap">{note.content}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${SUBJECT_COLOR[note.subject] ?? "bg-muted text-muted-foreground border-border"}`}>{note.subject}</span>
                    {note.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{t}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10}/>{fmtRelative(note.updatedAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {editing !== null && <NoteEditor note={editing} onSave={save} onClose={() => setEditing(null)}/>}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ AI NOTES TAB ═══════ */
function AINotes({ onShareNote }: { onShareNote?: (payload: { title: string; content: string; subject?: string; fileType?: any }) => void }) {
  const [notes, setNotes] = useState<AINote[]>(seedAINotes);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest<{ success: boolean; notes: ServerNote[] }>("/notes?source=ai")
      .then(response => {
        if (!active) return;
        setNotes(response.notes.map(note => ({
          id: note._id,
          title: note.title,
          content: note.content,
          subject: note.subject || "General",
          source: "Learning Hub",
          createdAt: new Date(note.createdAt),
          wordCount: note.content.trim() ? note.content.trim().split(/\s+/).length : 0,
        })));
      })
      .catch(err => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load AI notes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())
  );

  const copy = (n: AINote) => {
    navigator.clipboard.writeText(n.content);
    setCopied(n.id); setTimeout(() => setCopied(null), 2000);
  };

  const download = (n: AINote) => {
    const blob = new Blob([n.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${n.title}.txt`; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow shadow-indigo-500/30">
          <Sparkles size={18} className="text-white"/>
        </div>
        <div>
          <p className="font-semibold text-sm">AI-Generated Notes</p>
          <p className="text-xs text-muted-foreground mt-0.5">Automatically saved from Learning Hub generation and AI Mentor conversations. Review and share directly with study partners.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AI notes…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles size={36} className="mx-auto mb-3 opacity-30 animate-pulse"/>
            <p className="font-semibold">Loading AI notes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {filtered.map(note => (
          <motion.div key={note.id} layout
            className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-all overflow-hidden">
            <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === note.id ? null : note.id)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-indigo-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{note.title}</p>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                  <span className={`px-2 py-0.5 rounded-full border font-medium ${SUBJECT_COLOR[note.subject] ?? "bg-muted border-border"}`}>{note.subject}</span>
                  <span className="flex items-center gap-1"><AlignLeft size={10}/>{note.wordCount} words</span>
                  <span className="flex items-center gap-1"><Clock size={10}/>{fmtRelative(note.createdAt)}</span>
                  <span className="flex items-center gap-1"><Sparkles size={10}/>{note.source}</span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={e => {
                  e.stopPropagation();
                  onShareNote?.({ title: note.title, content: note.content, subject: note.subject, fileType: "document" });
                }}
                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors text-muted-foreground" title="Share with Friend">
                  <Share2 size={14}/>
                </button>
                <button onClick={e => { e.stopPropagation(); copy(note); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Copy Note">
                  {copied === note.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                </button>
                <button onClick={e => { e.stopPropagation(); download(note); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Download Note">
                  <Download size={14}/>
                </button>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expanded === note.id ? "rotate-90" : ""}`}/>
              </div>
            </div>
            <AnimatePresence>
              {expanded === note.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border">
                  <div className="px-5 py-4 max-h-72 overflow-y-auto">
                    <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground/80">{note.content}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bot size={44} className="mx-auto mb-4 opacity-20"/>
            <p className="font-semibold">No AI notes yet</p>
            <p className="text-sm mt-1">Generate notes or summaries from Learning Hub to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ SAVED HIGHLIGHTS TAB ═══════ */
function SavedHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>(seedHighlights);
  const [search, setSearch]         = useState("");
  const [noteFor, setNoteFor]       = useState<string | null>(null);
  const [noteText, setNoteText]     = useState("");

  const filtered = highlights.filter(h =>
    !search || h.text.toLowerCase().includes(search.toLowerCase()) || h.subject.toLowerCase().includes(search.toLowerCase())
  );

  const addNote = (id: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note: noteText } : h));
    setNoteFor(null); setNoteText("");
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search highlights…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
      </div>

      <div className="space-y-4">
        {filtered.map(h => (
          <div key={h.id} className={`rounded-2xl border-l-4 border border-border p-5 ${h.color} hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${SUBJECT_COLOR[h.subject] ?? "bg-muted"}`}>{h.subject}</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Highlighter size={10}/>{h.source}</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={10}/>{fmtRelative(h.createdAt)}</span>
              </div>
              <button onClick={() => setHighlights(prev => prev.filter(x => x.id !== h.id))}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all">
                <Trash2 size={13}/>
              </button>
            </div>

            <blockquote className="text-sm leading-relaxed text-foreground/90 italic mb-3 border-none p-0">
              "{h.text}"
            </blockquote>

            {h.note && (
              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                <Edit3 size={12} className="text-muted-foreground mt-0.5 flex-shrink-0"/>
                <p className="text-xs text-muted-foreground">{h.note}</p>
              </div>
            )}

            {noteFor === h.id ? (
              <div className="mt-3 flex gap-2">
                <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note…" autoFocus
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"/>
                <button onClick={() => addNote(h.id)} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">Save</button>
                <button onClick={() => setNoteFor(null)} className="p-2 rounded-xl border border-border hover:bg-muted text-xs"><X size={12}/></button>
              </div>
            ) : (
              <button onClick={() => { setNoteFor(h.id); setNoteText(h.note ?? ""); }}
                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={11}/>{h.note ? "Edit note" : "Add note"}
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Highlighter size={44} className="mx-auto mb-4 opacity-20"/>
            <p className="font-semibold">No highlights yet</p>
            <p className="text-sm mt-1">Highlights from Learning Videos and books will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ BOOKMARKS TAB ═══════ */
function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(seedBookmarks);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = bookmarks.filter(b => {
    const matchT = typeFilter === "all" || b.type === typeFilter;
    const matchQ = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return matchT && matchQ;
  });

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookmarks…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
        </div>
        <div className="flex gap-1.5">
          {["all","video","book","quiz"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/50 hover:bg-muted text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(b => {
          const meta = TYPE_META[b.type];
          return (
            <div key={b.id} className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.color}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{b.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full border font-medium ${SUBJECT_COLOR[b.subject] ?? "bg-muted border-border"}`}>{b.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full border font-medium capitalize ${meta.color}`}>{b.type}</span>
                  <span className="flex items-center gap-1"><Clock size={10}/>{fmtRelative(b.createdAt)}</span>
                </div>
                {b.note && <p className="text-xs text-muted-foreground mt-2 italic">📝 {b.note}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {b.url && (
                  <a href={b.url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    <ChevronRight size={15}/>
                  </a>
                )}
                <button onClick={() => setBookmarks(prev => prev.filter(x => x.id !== b.id))}
                  className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all">
                  <Trash2 size={15} className="text-muted-foreground"/>
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bookmark size={44} className="mx-auto mb-4 opacity-20"/>
            <p className="font-semibold">No bookmarks yet</p>
            <p className="text-sm mt-1">Save videos, books, and quizzes to find them here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ☁️ MODERN CLOUD GALLERY FRIEND NOTES (GOOGLE PHOTOS / DRIVE UX)
   ══════════════════════════════════════════════════════════════════ */
function FriendNotes({ prefillShare }: { prefillShare?: { title: string; content: string; subject?: string; fileType?: any } | null }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [myFriends, setMyFriends] = useState<FriendPartner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "image" | "pdf" | "document" | "video" | "link">("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Previewer Modal State (One-Click Experience)
  const [previewNote, setPreviewNote] = useState<SharedNote | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Share Flow Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareContent, setShareContent] = useState("");
  const [shareFileType, setShareFileType] = useState<"pdf" | "image" | "document" | "video" | "link">("pdf");
  const [shareSubject, setShareSubject] = useState("Physics");
  const [shareReceiverId, setShareReceiverId] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "download">("download");
  const [shareMsg, setShareMsg] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState("");
  const [sharingLoading, setSharingLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (prefillShare) {
      if (prefillShare.title) setShareTitle(prefillShare.title);
      if (prefillShare.content) setShareContent(prefillShare.content);
      if (prefillShare.subject) setShareSubject(prefillShare.subject);
      if (prefillShare.fileType) setShareFileType(prefillShare.fileType);
      setShowShareModal(true);
    }
  }, [prefillShare]);

  // Load shared notes strictly from MongoDB database API
  const loadSharedNotes = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ success: boolean; notes: SharedNote[] }>("/notes/shared");
      if (res.success && Array.isArray(res.notes)) {
        setSharedNotes(res.notes);
      } else {
        setSharedNotes([]);
      }
    } catch (err) {
      console.error("Error loading shared notes from MongoDB:", err);
      setSharedNotes([]);
    } finally {
      setLoading(false);
    }
  };



  // Load friends list from API for friend selection & filter bar
  const loadFriends = async () => {
    try {
      const res = await apiRequest<{ success: boolean; friends: any[] }>("/friends");
      if (res.success && Array.isArray(res.friends)) {
        setMyFriends(res.friends.map(f => ({
          id: f.id || f._id,
          fullName: f.fullName || f.username || "Study Partner",
          email: f.email || "",
          avatar: f.avatar || (f.fullName || f.username || "SP").slice(0, 2).toUpperCase(),
          online: f.online
        })));
        if (res.friends.length > 0 && !shareReceiverId) {
          setShareReceiverId(res.friends[0].id || res.friends[0]._id);
        }
      }
    } catch (err) {
      console.error("Error loading friends list:", err);
    }
  };

  useEffect(() => {
    loadSharedNotes();
    loadFriends();
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    if (!shareTitle) setShareTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTitle.trim()) {
      showToast("Please enter a document title.");
      return;
    }
    if (!shareReceiverId) {
      showToast("Please select a study partner to share with.");
      return;
    }

    try {
      setSharingLoading(true);
      const res = await apiRequest<{ success: boolean; message: string }>("/notes/share", {
        method: "POST",
        body: JSON.stringify({
          receiverId: shareReceiverId,
          title: shareTitle.trim(),
          content: shareContent.trim(),
          subject: shareSubject,
          fileType: shareFileType,
          fileName: uploadedFileName || `${shareTitle.toLowerCase().replace(/\s+/g, "_")}.${shareFileType === "pdf" ? "pdf" : "png"}`,
          fileSize: "1.8 MB",
          fileData: uploadedFileData,
          permission: sharePermission,
          chatMessage: shareMsg.trim()
        })
      });

      if (res.success) {
        showToast(res.message || "Document shared successfully!");
        setShowShareModal(false);
        setShareTitle("");
        setShareContent("");
        setShareMsg("");
        setUploadedFileName("");
        setUploadedFileData("");
        loadSharedNotes();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to share document.");
    } finally {
      setSharingLoading(false);
    }
  };

  // Filtered Media Array
  const filtered = sharedNotes.filter(n => {
    const matchesCategory = activeCategory === "all" || n.fileType === activeCategory;
    const matchesDirection = directionFilter === "all" || (directionFilter === "incoming" ? n.isIncoming : !n.isIncoming);
    const matchesPartner = !selectedPartner || n.senderName === selectedPartner || n.receiverName === selectedPartner;
    const matchesSearch = !search.trim() ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.senderName.toLowerCase().includes(search.toLowerCase()) ||
      n.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      (n.fileName && n.fileName.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesDirection && matchesPartner && matchesSearch;
  });

  const handleDownload = (note: SharedNote) => {
    if (note.permission === "view" && note.isIncoming) {
      showToast("⚠️ Download restricted by sender (View Only permission).");
      return;
    }
    try {
      const link = document.createElement("a");
      if (note.fileData && note.fileData.startsWith("data:")) {
        link.href = note.fileData;
      } else if (note.fileUrl) {
        link.href = note.fileUrl;
      } else {
        const blob = new Blob([note.content || note.title], { type: "application/octet-stream" });
        link.href = URL.createObjectURL(blob);
      }
      link.download = note.fileName || `${note.title.replace(/\s+/g, "_")}.${note.fileType}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`Downloading "${note.fileName || note.title}"...`);
    } catch {
      showToast("Started file download.");
    }
  };

  const getFileBadgeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return <FileText size={18} className="text-rose-500" />;
      case "image": return <ImageIcon size={18} className="text-emerald-500" />;
      case "video": return <Play size={18} className="text-purple-500" />;
      case "document": return <FileSpreadsheet size={18} className="text-blue-500" />;
      case "link": return <LinkIcon size={18} className="text-amber-500" />;
      default: return <FileCode size={18} className="text-gray-400" />;
    }
  };

  const activePartnerList = Array.from(new Set(sharedNotes.map(n => n.isIncoming ? n.senderName : n.receiverName).filter(Boolean)));

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 GOOGLE DRIVE / PHOTOS STYLE TOP HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card/90 to-emerald-500/5 border border-border shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold shadow-inner">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Friend Notes Cloud Gallery</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Lock size={12} className="text-emerald-500" />
                  <span>Strict Owner-Level Data Isolation • End-to-End Permission Protected</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Share2 size={16} />
              Share Document with Friend
            </button>
          </div>
        </div>

        {/* 📊 SUMMARY BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div onClick={() => setActiveCategory("all")} className={`p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${activeCategory === "all" ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm" : "bg-card/50 border-border hover:border-emerald-500/30"}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">All Shared</p>
              <p className="text-lg font-black text-foreground">{sharedNotes.length} Files</p>
            </div>
          </div>

          <div onClick={() => setActiveCategory("pdf")} className={`p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${activeCategory === "pdf" ? "bg-rose-500/10 border-rose-500/40 shadow-sm" : "bg-card/50 border-border hover:border-rose-500/30"}`}>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">PDF Docs</p>
              <p className="text-lg font-black text-foreground">{sharedNotes.filter(n => n.fileType === "pdf").length}</p>
            </div>
          </div>

          <div onClick={() => setActiveCategory("image")} className={`p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${activeCategory === "image" ? "bg-cyan-500/10 border-cyan-500/40 shadow-sm" : "bg-card/50 border-border hover:border-cyan-500/30"}`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center font-bold">
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Images</p>
              <p className="text-lg font-black text-foreground">{sharedNotes.filter(n => n.fileType === "image").length}</p>
            </div>
          </div>

          <div onClick={() => setDirectionFilter("incoming")} className={`p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${directionFilter === "incoming" ? "bg-blue-500/10 border-blue-500/40 shadow-sm" : "bg-card/50 border-border hover:border-blue-500/30"}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Received</p>
              <p className="text-lg font-black text-foreground">{sharedNotes.filter(n => n.isIncoming).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER TOOLBAR & CATEGORIES */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shared notes by title, file name, or friend name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card/60 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-medium backdrop-blur-md shadow-sm transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card/60 border border-border backdrop-blur-md overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: "All Media", icon: <Users size={13} /> },
              { key: "image", label: "Images", icon: <ImageIcon size={13} /> },
              { key: "pdf", label: "PDFs", icon: <FileText size={13} /> },
              { key: "document", label: "Docs", icon: <FileSpreadsheet size={13} /> },
              { key: "video", label: "Videos", icon: <Play size={13} /> },
              { key: "link", label: "Links", icon: <LinkIcon size={13} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.key
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Study Partners Quick Filter Pills */}
        {activePartnerList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-1">
              <UserCheck size={12} /> Study Partners:
            </span>
            <button
              onClick={() => setSelectedPartner(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                !selectedPartner ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              All Partners ({sharedNotes.length})
            </button>
            {activePartnerList.map(partner => {
              const count = sharedNotes.filter(n => n.senderName === partner || n.receiverName === partner).length;
              return (
                <button
                  key={partner}
                  onClick={() => setSelectedPartner(selectedPartner === partner ? null : partner)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedPartner === partner ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-sm" : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <span>👤 {partner}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-muted text-[10px] text-muted-foreground font-bold">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 🖼️ RESPONSIVE GALLERY GRID (4 COL DESKTOP, 3 COL TABLET, 2 COL MOBILE) */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-card/40 border border-border animate-pulse p-4 space-y-4">
              <div className="h-32 rounded-2xl bg-muted/60" />
              <div className="h-4 rounded bg-muted/60 w-3/4" />
              <div className="h-3 rounded bg-muted/60 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4 text-muted-foreground bg-card/30 border border-dashed border-border rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-md">
            <Users size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-lg text-foreground">No Shared Documents Found</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {search
                ? `No shared documents match "${search}".`
                : "Documents shared between you and your study partners with owner-level encryption will appear here."}
            </p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all cursor-pointer mt-2"
          >
            <Share2 size={15} />
            Share Document Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {filtered.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setPreviewNote(note);
                  setZoomLevel(1);
                  setRotation(0);
                  setPdfPage(1);
                  setIsFullScreen(false);
                }}
                className="group relative rounded-3xl bg-card/80 border border-border hover:border-emerald-500/40 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between backdrop-blur-xl"
              >
                {/* Top Badge Overlay */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                        {note.isIncoming ? note.senderAvatar : note.receiverAvatar}
                      </div>
                      <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                        {note.isIncoming ? note.senderName : `You ➔ ${note.receiverName}`}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${note.permission === "view" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                      {note.permission === "view" ? "View Only" : "Can Download"}
                    </span>
                  </div>

                  {/* Thumbnail Container */}
                  <div className="relative rounded-2xl overflow-hidden bg-muted/40 border border-border/50 h-36 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                    {note.fileType === "image" && (note.fileData || note.fileUrl) ? (
                      <img src={note.fileData || note.fileUrl || ""} alt={note.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : note.fileType === "pdf" ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-rose-500 p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold">
                          <FileText size={26} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PDF Document</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-emerald-500 p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold">
                          {getFileBadgeIcon(note.fileType)}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{note.fileType.toUpperCase()} Media</span>
                      </div>
                    )}

                    {/* Quick Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white/90 text-black text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Eye size={13} /> Instant Preview
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-foreground line-clamp-1 group-hover:text-emerald-500 transition-colors">{note.title}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{note.fileName || note.title} • {note.fileSize || "1.5 MB"}</p>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium flex items-center gap-1"><Clock size={10} />{note.timestamp}</span>
                  <span className="text-emerald-500 font-bold group-hover:underline flex items-center gap-1">
                    Preview ➔
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         🔎 FULLSCREEN INSTANT PREVIEW MODAL (ONE-CLICK EXPERIENCE)
         ══════════════════════════════════════════════════════════════════ */}
      {previewNote && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 ${isFullScreen ? "p-0" : "p-4 sm:p-6"}`}>
          <div className={`bg-card border border-border flex flex-col relative transition-all duration-300 ${isFullScreen ? "w-screen h-screen max-w-none max-h-none rounded-none border-none" : "max-w-4xl w-full rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden"}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
                  {getFileBadgeIcon(previewNote.fileType)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground truncate max-w-md">{previewNote.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{previewNote.fileName}</span>
                    <span>•</span>
                    <span>{previewNote.isIncoming ? `Sent by ${previewNote.senderName}` : `Shared with ${previewNote.receiverName}`}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewer Controls */}
                {previewNote.fileType === "image" && (
                  <>
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))} className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))} className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
                    <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors" title="Rotate"><RotateCw size={16} /></button>
                  </>
                )}

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors"
                  title={isFullScreen ? "Exit Fullscreen Mode" : "Open in Fullscreen Mode"}
                >
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Open in New Tab */}
                <button
                  onClick={() => {
                    const src = (() => {
                      if (previewNote.fileData) {
                        if (previewNote.fileData.startsWith("data:")) return previewNote.fileData;
                        const isPdf = previewNote.fileType === "pdf" || (previewNote.fileName && previewNote.fileName.toLowerCase().endsWith(".pdf"));
                        const mime = previewNote.fileMimeType || (isPdf ? "application/pdf" : "image/jpeg");
                        return `data:${mime};base64,${previewNote.fileData}`;
                      }
                      return previewNote.fileUrl || null;
                    })();
                    if (src) window.open(src, "_blank");
                  }}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors"
                  title="Open in New Window Tab"
                >
                  <ExternalLink size={16} />
                </button>

                <button onClick={() => setPreviewNote(null)} className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors" title="Close"><X size={18} /></button>
              </div>
            </div>

            {/* Modal Viewer Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-black/40 flex items-center justify-center min-h-[400px]">
              {(() => {
                const src = (() => {
                  if (previewNote.fileData) {
                    if (previewNote.fileData.startsWith("data:")) return previewNote.fileData;
                    const isPdf = previewNote.fileType === "pdf" || (previewNote.fileName && previewNote.fileName.toLowerCase().endsWith(".pdf"));
                    const mime = previewNote.fileMimeType || (isPdf ? "application/pdf" : "image/jpeg");
                    return `data:${mime};base64,${previewNote.fileData}`;
                  }
                  return previewNote.fileUrl || null;
                })();

                const isPdf = previewNote.fileType === "pdf" || (previewNote.fileName && previewNote.fileName.toLowerCase().endsWith(".pdf"));
                const isImage = previewNote.fileType === "image" || (previewNote.fileName && /\.(png|jpg|jpeg|webp|gif)$/i.test(previewNote.fileName));

                if (isImage) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center overflow-auto p-2 space-y-3">
                      {src ? (
                        <img
                          src={src}
                          alt={previewNote.title}
                          style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)`, transition: "transform 0.2s ease" }}
                          className={`${isFullScreen ? "max-h-[85vh]" : "max-h-[60vh]"} max-w-full object-contain rounded-2xl shadow-2xl`}
                        />
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-40" />
                          <p className="text-sm font-bold">Image Preview Unavailable</p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (isPdf) {
                  return (
                    <div className="w-full h-full flex flex-col space-y-3">
                      {src ? (
                        <div className={`w-full ${isFullScreen ? "h-[86vh]" : "h-[62vh]"} rounded-2xl overflow-hidden border border-border bg-white shadow-2xl`}>
                          <iframe
                            src={`${src}#toolbar=1`}
                            className="w-full h-full rounded-2xl border-none"
                            title={previewNote.title}
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4 mx-auto">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5"><FileText size={16} /> PDF Preview</span>
                          </div>
                          <div className="p-6 bg-muted/20 border border-border rounded-xl font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-[45vh] overflow-y-auto">
                            {previewNote.content || `PDF Document: ${previewNote.title}`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4 mx-auto">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      {getFileBadgeIcon(previewNote.fileType)}
                      <h4 className="font-bold text-sm">{previewNote.title} Preview</h4>
                    </div>
                    <div className="p-6 bg-muted/20 border border-border rounded-xl font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-[45vh] overflow-y-auto">
                      {previewNote.content || `Content preview for ${previewNote.fileName || previewNote.title}.`}
                    </div>
                  </div>
                );
              })()}
            </div>



            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/80 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className={`px-2.5 py-1 rounded-full border font-bold ${previewNote.permission === "view" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                  Permission: {previewNote.permission === "view" ? "View Only" : "Can Download"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(previewNote)}
                  disabled={previewNote.permission === "view" && previewNote.isIncoming}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    previewNote.permission === "view" && previewNote.isIncoming
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  }`}
                >
                  <Download size={14} /> Download File
                </button>
                <Button variant="outline" onClick={() => setPreviewNote(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         📤 SHARE NEW DOCUMENT MODAL (WIDE LANDSCAPE RECTANGLE UX)
         ══════════════════════════════════════════════════════════════════ */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-3xl w-full bg-card border border-border/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Share Document / Note</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Select a study partner & assign file permissions.</p>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendShare} className="space-y-6">
              {/* 2-Column Wide Landscape Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Partner, Category & Permission */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Select Study Partner *</label>
                    <select
                      value={shareReceiverId}
                      onChange={(e) => setShareReceiverId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      required
                    >
                      {myFriends.length === 0 ? (
                        <option value="">No friends added yet</option>
                      ) : (
                        myFriends.map(f => (
                          <option key={f.id} value={f.id}>
                            👤 {f.fullName} ({f.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Document Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "pdf", label: "📄 PDF File" },
                        { key: "image", label: "🖼️ Image Scan" },
                        { key: "document", label: "📝 Document" },
                        { key: "video", label: "🎥 Video Note" }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setShareFileType(cat.key as any)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            shareFileType === cat.key
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/50 shadow-sm"
                              : "bg-muted/20 text-muted-foreground border-border hover:border-emerald-500/30"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Permission Policy</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSharePermission("view")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          sharePermission === "view"
                            ? "bg-amber-500/15 text-amber-500 border-amber-500/50 shadow-sm"
                            : "bg-muted/20 text-muted-foreground border-border hover:border-amber-500/30"
                        }`}
                      >
                        🔒 View Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setSharePermission("download")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          sharePermission === "download"
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/50 shadow-sm"
                            : "bg-muted/20 text-muted-foreground border-border hover:border-emerald-500/30"
                        }`}
                      >
                        📥 Allow Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Title, Attachment & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>Import Saved Note</span>
                      <span className="text-[10px] text-emerald-500 font-normal">Auto-fills title & content</span>
                    </label>
                    <select
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;
                        const allSavedNotes = [...seedNotes, ...seedAINotes];
                        const found = allSavedNotes.find(n => n.id === selectedId);
                        if (found) {
                          setShareTitle(found.title);
                          setShareContent(found.content);
                          if (found.subject) setShareSubject(found.subject);
                          setShareFileType("document");
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="" className="text-foreground">✨ Select from My Notes or AI Notes...</option>
                      <optgroup label="📝 My Notes">
                        {seedNotes.map(n => (
                          <option key={n.id} value={n.id} className="text-foreground">
                            {n.title} ({n.subject})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🤖 AI Generated Notes">
                        {seedAINotes.map(n => (
                          <option key={n.id} value={n.id} className="text-foreground">
                            🤖 {n.title} ({n.subject})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. GATE Electrical Engineering Formula Sheet"
                      value={shareTitle}
                      onChange={(e) => setShareTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Upload File Attachment (Optional)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">Note Content / Description</label>
                    <textarea
                      rows={4}
                      placeholder="Summary or note text..."
                      value={shareContent}
                      onChange={(e) => setShareContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharingLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {sharingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Send {shareFileType.toUpperCase()} Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════ MAIN ═══════ */
const TABS: { key: NoteTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "my-notes",     label: "My Notes",        icon: <FileText size={16}/>,    desc: "Personal study notes" },
  { key: "ai-notes",    label: "AI Notes",         icon: <Bot size={16}/>,         desc: "AI-generated notes"   },
  { key: "highlights",  label: "Saved Highlights", icon: <Highlighter size={16}/>, desc: "Key text excerpts"    },
  { key: "bookmarks",   label: "Bookmarks",        icon: <Bookmark size={16}/>,    desc: "Saved resources"      },
  { key: "shared-notes", label: "Friend Notes",    icon: <Users size={16}/>,       desc: "Exchanged notes in chats" },
];

export default function Notes() {
  const [activeTab, setActiveTab] = useState<NoteTab>("my-notes");
  const [prefillShare, setPrefillShare] = useState<{ title: string; content: string; subject?: string; fileType?: any } | null>(null);

  const handleShareFromNote = (payload: { title: string; content: string; subject?: string; fileType?: any }) => {
    setPrefillShare(payload);
    setActiveTab("shared-notes");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Notes</h1>
              <p className="text-xs text-muted-foreground mt-0.5">My notes · AI notes · Highlights · Bookmarks · Friend notes</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles size={13} className="text-primary"/>
              <span className="text-xs font-semibold text-primary">Smart Notes</span>
            </div>
          </div>

          <div className="flex gap-0.5 overflow-x-auto no-scrollbar pb-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${activeTab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {activeTab === "my-notes"     && <MyNotes onShareNote={handleShareFromNote} />}
            {activeTab === "ai-notes"     && <AINotes onShareNote={handleShareFromNote} />}
            {activeTab === "highlights"   && <SavedHighlights/>}
            {activeTab === "bookmarks"    && <Bookmarks/>}
            {activeTab === "shared-notes" && <FriendNotes prefillShare={prefillShare} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
