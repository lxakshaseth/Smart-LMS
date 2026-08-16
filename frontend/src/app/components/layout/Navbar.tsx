import { useState, useEffect, useRef } from "react";
import { Search, Bell, Moon, Sun, LogOut, Settings, User, ChevronDown, BookOpen, Glasses, Check, Sparkles } from "lucide-react";
import { useTheme, Theme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { useNavigate, Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";

export function Navbar() {
  const { theme, setThemeMode, toggleTheme } = useTheme();
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [showMenu, setShowMenu]   = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [query, setQuery]         = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Clear query when navigating away from youtube
  useEffect(() => {
    if (!location.pathname.includes("youtube")) {
      setQuery("");
    }
  }, [location.pathname]);

  // Handle clicking anywhere on the page to close popups
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setShowNotifs(false);
        setShowThemeMenu(false);
      }
    };

    if (showMenu || showNotifs || showThemeMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu, showNotifs, showThemeMenu]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      navigate(`/youtube?q=${encodeURIComponent(val.trim())}`, { replace: location.pathname === "/youtube" });
    } else if (location.pathname === "/youtube") {
      navigate("/youtube", { replace: true });
    }
  };

  const doLogout = () => { logout(); navigate("/login"); };

  const themeOptions: { id: Theme; label: string; icon: React.ElementType; desc: string; badge?: string }[] = [
    { id: "eye-care", label: "Eye-Care Warm", icon: Glasses, desc: "Warm paper tone · 0 Glare", badge: "Recommended" },
    { id: "dark",     label: "Midnight Slate",icon: Moon,    desc: "Low-light night study" },
    { id: "light",    label: "Soft Daylight", icon: Sun,     desc: "Soft light mode" },
  ];

  const currentThemeIcon = theme === "eye-care" ? Glasses : theme === "dark" ? Moon : Sun;
  const CurrentIcon = currentThemeIcon;

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pl-14 sm:pl-16 pr-3 sm:pr-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 lg:px-6">
      {/* search */}
      <div className="flex-1 max-w-xl min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/>
          <input
            type="text"
            placeholder="Search courses, topics…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-xl bg-input-background text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs sm:text-sm truncate transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* right actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Eye-Care & Theme Switcher Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => {
              setShowThemeMenu(v => !v);
              setShowMenu(false);
              setShowNotifs(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
              theme === "eye-care"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "hover:bg-muted border-border text-foreground"
            }`}
            aria-label="Eye Comfort & Theme"
            title="Eye Comfort & Theme Settings"
          >
            <CurrentIcon size={16} />
            <span className="hidden md:inline text-xs font-semibold">
              {theme === "eye-care" ? "Eye Care" : theme === "dark" ? "Dark" : "Light"}
            </span>
            <ChevronDown size={12} className={`text-muted-foreground transition-transform ${showThemeMenu ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Visual Comfort Modes</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Protect student eyes during long study hours</p>
                </div>

                <div className="space-y-1">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setThemeMode(opt.id);
                          setShowThemeMenu(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            opt.id === "eye-care" ? "bg-amber-500/15 text-amber-600" : isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{opt.label}</span>
                              {opt.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifs(v => !v);
              setShowMenu(false);
            }}
            className="relative p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18}/>
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"/>
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
                transition={{ duration:0.15 }}
                className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="font-bold text-sm text-foreground">Notifications</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">New</span>
                </div>
                <div className="py-4 text-center text-xs text-muted-foreground space-y-1">
                  <Bell size={24} className="mx-auto text-muted-foreground/40 mb-1" />
                  <p className="font-medium text-foreground">All caught up!</p>
                  <p className="text-[11px]">No new notifications at the moment.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* user avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowMenu(v => !v);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold select-none">
              {user?.avatar ?? "?"}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
              {user?.fullName?.split(" ")[0] ?? "User"}
            </span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showMenu ? "rotate-180" : ""}`}/>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
                transition={{ duration:0.15 }}
                className="absolute right-0 top-12 z-50 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* user info */}
                <div className="px-4 py-3.5 border-b border-border">
                  <p className="font-semibold text-sm truncate text-foreground">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    🎯 {getCurrentTargetExam(user)}
                  </span>
                </div>
                {/* links */}
                <div className="py-1.5">
                  <Link to="/settings" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground">
                    <User size={15} className="text-muted-foreground"/> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground">
                    <Settings size={15} className="text-muted-foreground"/> Settings
                  </Link>
                </div>
                <div className="border-t border-border py-1.5">
                  <button onClick={doLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer">
                    <LogOut size={15}/> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

