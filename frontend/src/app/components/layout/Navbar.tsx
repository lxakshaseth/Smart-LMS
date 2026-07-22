import { useState, useEffect, useRef } from "react";
import { Search, Bell, Moon, Sun, LogOut, Settings, User, ChevronDown, Command, Sparkles, X, BookOpen, Bot, FileText, Zap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { useNavigate, Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl + K or Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear query when navigating away from youtube
  useEffect(() => {
    if (!location.pathname.includes("youtube")) {
      setQuery("");
    }
  }, [location.pathname]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      navigate(`/youtube?q=${encodeURIComponent(val.trim())}`, { replace: location.pathname === "/youtube" });
    } else if (location.pathname === "/youtube") {
      navigate("/youtube", { replace: true });
    }
  };

  const quickSearchShortcuts = [
    { label: "AI Mentor", icon: Bot, path: "/ai-tutor" },
    { label: "Practice Quizzes", icon: Zap, path: "/quiz" },
    { label: "Learning Hub", icon: BookOpen, path: "/study" },
    { label: "Study Notes", icon: FileText, path: "/notes" },
  ];

  const notifications = [
    { id: 1, title: "Daily Goal Achieved! 🎉", time: "10m ago", desc: "You completed 3 study sessions today." },
    { id: 2, title: "New Weak Topic Detected 🧠", time: "1h ago", desc: "AI Mentor suggests reviewing Organic Chemistry." },
    { id: 3, title: "Study Partner Challenge ⚔️", time: "3h ago", desc: "Anil challenged you to a quick physics quiz." },
  ];

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60 pl-16 pr-4 py-3.5 flex items-center justify-between gap-4 lg:px-8 transition-colors duration-200">
      
      {/* ── Universal Search Bar ── */}
      <div className="flex-1 max-w-xl relative">
        <div className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
          isSearchFocused
            ? "bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            : "bg-muted/40 border-border/70 hover:border-border hover:bg-muted/60"
        }`}>
          <Search className="absolute left-3.5 text-muted-foreground transition-colors" size={17} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search courses, videos, notes, mock tests, topics... (Ctrl + K)"
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70 font-medium text-foreground"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/70 bg-background/80 px-2 py-0.5 rounded-lg border border-border/50 pointer-events-none select-none">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Quick Search Dropdown */}
        <AnimatePresence>
          {isSearchFocused && !query && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-13 z-50 p-2 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {quickSearchShortcuts.map((sc) => {
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.path}
                      onMouseDown={() => navigate(sc.path)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-xs font-medium text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Icon size={14} />
                      </div>
                      <span>{sc.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-2.5">
        
        {/* Exam Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles size={13} className="animate-pulse" />
          <span>🎯 {getCurrentTargetExam(user)}</span>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted text-foreground transition-all shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} className="text-slate-700" /> : <Sun size={18} className="text-amber-400" />}
        </motion.button>

        {/* Notifications Drawer Toggle */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowMenu(false);
            }}
            className="relative p-2.5 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted text-foreground transition-all shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-13 z-50 w-80 sm:w-96 bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                        3 New
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-foreground">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setShowMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md select-none">
              {user?.avatar ?? "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight max-w-[110px] truncate">
                {user?.fullName?.split(" ")[0] ?? "User"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight font-medium">
                Level {user?.level ?? 1}
              </span>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-13 z-50 w-60 bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-2"
                >
                  <div className="px-3 py-3 border-b border-border/70 rounded-xl bg-muted/30 mb-1">
                    <p className="font-bold text-xs truncate text-foreground">{user?.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                        🎯 {getCurrentTargetExam(user)}
                      </span>
                      <span className="text-amber-500 font-bold">🔥 {user?.streak ?? 0}d streak</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <User size={15} className="text-muted-foreground" /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Settings size={15} className="text-muted-foreground" /> Settings & Preferences
                    </Link>
                  </div>

                  <div className="border-t border-border/70 pt-1 mt-1">
                    <button
                      onClick={doLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
}
