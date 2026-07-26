import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Code2, Bot, Trophy, FileText, Sparkles, BookOpen, Map, Mic, Terminal, Briefcase } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
}

const commands = [
  { id: "dashboard", name: "Home Dashboard", category: "Navigation", icon: Terminal },
  { id: "assistant", name: "AI Coding Assistant", category: "AI Tools", icon: Bot },
  { id: "editor", name: "Monaco Code Editor & Online Compiler", category: "Tools", icon: Code2 },
  { id: "problems", name: "Browse LeetCode Style Problems", category: "Practice", icon: BookOpen },
  { id: "roadmaps", name: "Interactive Tech Learning Roadmaps", category: "Learn", icon: Map },
  { id: "dsa", name: "DSA Animations & Visualizers", category: "Learn", icon: BookOpen },
  { id: "contests", name: "Weekly & Monthly Coding Contests", category: "Practice", icon: Trophy },
  { id: "mock_interview", name: "AI Voice Mock Interviewer", category: "Career", icon: Mic },
  { id: "resume", name: "AI Resume ATS Analyzer", category: "Career", icon: FileText },
  { id: "placements", name: "Company Wise Placement Preparation", category: "Exam", icon: Briefcase },
  { id: "ai_plan", name: "Generate AI Personalized Study Plan", category: "AI Tools", icon: Sparkles },
];

export default function CommandPalette({ isOpen, onClose, onSelectTab }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
            <Search size={18} className="text-purple-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search feature..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* Command List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No commands matching "{search}"
              </div>
            ) : (
              filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => onSelectTab(cmd.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-purple-500/20 text-purple-400">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground group-hover:text-purple-300">
                          {cmd.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{cmd.category}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      Jump →
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Navigation Shortcut</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[9px]">ESC</kbd> to close
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
