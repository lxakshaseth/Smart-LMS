import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Bot, Highlighter, Bookmark, Plus, Search, Trash2,
  Tag, Clock, Star, StarOff, Download, Copy, Check, X, Edit3,
  BookOpen, Youtube, Brain, ChevronRight, Filter, SortAsc,
  Sparkles, Hash, AlignLeft,
} from "lucide-react";
import { apiRequest } from "../../lib/api";

/* ═══════ TYPES ═══════ */
type NoteTab = "my-notes" | "ai-notes" | "highlights" | "bookmarks";

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

/* ═══════ SEED DATA ═══════ */
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

/* ═══════ HELPERS ═══════ */
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
function NoteEditor({ note, onSave, onClose }: {
  note: Partial<Note>; onSave: (n: Note) => void; onClose: () => void;
}) {
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
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h3 className="font-bold">{note.id ? "Edit Note" : "New Note"}</h3>
          <div className="flex gap-2">
            {/* color picker */}
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c, i) => (
                <button key={i} onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${c.split(" ")[0].replace("/10", "/60")} ${color === c ? "scale-125 border-foreground" : "border-transparent"}`}/>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X size={15}/></button>
          </div>
        </div>

        {/* body */}
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

        {/* footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={save}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            Save Note
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-border hover:bg-muted transition-all text-sm">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════ MY NOTES TAB ═══════ */
function MyNotes() {
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
      {/* toolbar */}
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

      {/* notes grid */}
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
                {/* actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); star(note.id); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-muted transition-colors">
                    {note.starred ? <Star size={13} className="text-amber-400 fill-amber-400"/> : <StarOff size={13} className="text-muted-foreground"/>}
                  </button>
                  <button onClick={e => { e.stopPropagation(); copy(note); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-muted transition-colors">
                    {copied === note.id ? <Check size={13} className="text-emerald-500"/> : <Copy size={13} className="text-muted-foreground"/>}
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(note.id); }}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-destructive hover:text-white transition-colors">
                    <Trash2 size={13} className="text-muted-foreground"/>
                  </button>
                </div>

                {note.starred && <Star size={12} className="text-amber-400 fill-amber-400 absolute top-3 left-4"/>}

                <h3 className="font-bold text-sm leading-snug mb-2 mt-1 pr-20 line-clamp-2">{note.title}</h3>
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
function AINotes() {
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
          <p className="text-xs text-muted-foreground mt-0.5">Automatically saved from Learning Hub generation and AI Mentor conversations. Review and move to My Notes to edit.</p>
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
                <button onClick={e => { e.stopPropagation(); copy(note); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {copied === note.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                </button>
                <button onClick={e => { e.stopPropagation(); download(note); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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

/* ═══════ MAIN ═══════ */
const TABS: { key: NoteTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "my-notes",   label: "My Notes",        icon: <FileText size={16}/>,    desc: "Personal study notes" },
  { key: "ai-notes",  label: "AI Notes",         icon: <Bot size={16}/>,         desc: "AI-generated notes"   },
  { key: "highlights", label: "Saved Highlights", icon: <Highlighter size={16}/>, desc: "Key text excerpts"    },
  { key: "bookmarks",  label: "Bookmarks",        icon: <Bookmark size={16}/>,    desc: "Saved resources"      },
];

export default function Notes() {
  const [activeTab, setActiveTab] = useState<NoteTab>("my-notes");

  return (
    <div className="min-h-screen bg-background">
      {/* sticky header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Notes</h1>
              <p className="text-xs text-muted-foreground mt-0.5">My notes · AI notes · Highlights · Bookmarks</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles size={13} className="text-primary"/>
              <span className="text-xs font-semibold text-primary">Smart Notes</span>
            </div>
          </div>

          {/* tabs */}
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {activeTab === "my-notes"   && <MyNotes/>}
            {activeTab === "ai-notes"   && <AINotes/>}
            {activeTab === "highlights" && <SavedHighlights/>}
            {activeTab === "bookmarks"  && <Bookmarks/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
