import { useState, useEffect } from "react";
import { Search, Bell, Moon, Sun, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { useNavigate, Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";

export function Navbar() {
  const { theme, toggleTheme }    = useTheme();
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [showMenu, setShowMenu]   = useState(false);
  const [query, setQuery]         = useState("");

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

  const doLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pl-14 sm:pl-16 pr-3 sm:pr-6 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 lg:px-6">
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
        <button onClick={toggleTheme} className="p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Toggle theme">
          {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
        </button>

        <button className="relative p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Notifications">
          <Bell size={18}/>
          <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"/>
        </button>

        {/* user avatar + dropdown */}
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors">
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
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}/>
                <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
                  transition={{ duration:0.15 }}
                  className="absolute right-0 top-12 z-50 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  {/* user info */}
                  <div className="px-4 py-3.5 border-b border-border">
                    <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      🎯 {getCurrentTargetExam(user)}
                    </span>
                  </div>
                  {/* links */}
                  <div className="py-1.5">
                    <Link to="/settings" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                      <User size={15} className="text-muted-foreground"/> My Profile
                    </Link>
                    <Link to="/settings" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                      <Settings size={15} className="text-muted-foreground"/> Settings
                    </Link>
                  </div>
                  <div className="border-t border-border py-1.5">
                    <button onClick={doLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
                      <LogOut size={15}/> Sign Out
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
