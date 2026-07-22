import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, Bot, BookOpen, ClipboardList, Calendar,
  BarChart3, Library, Youtube, Settings, Menu, X, Upload,
  ChevronLeft, ChevronRight, Brain, FileText, Timer, Users,
  Sparkles, Crown, Award, CheckSquare
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { path: "/",          icon: LayoutDashboard, label: "Dashboard"         },
  { path: "/ai-tutor",  icon: Bot,             label: "AI Mentor",       badge: "AI" },
  { path: "/study",     icon: BookOpen,        label: "Learning Hub"      },
  { path: "/quiz",      icon: ClipboardList,   label: "Practice Arena"    },
  { path: "/planner",   icon: Calendar,        label: "Study Planner"     },
  { path: "/quiz?tab=mock", icon: Award,       label: "Mock Tests"        },
  { path: "/books",     icon: Library,         label: "Library"           },
  { path: "/youtube",   icon: Youtube,         label: "Learning Videos"   },
  { path: "/notes",     icon: FileText,        label: "Notes"             },
  { path: "/analytics", icon: BarChart3,       label: "Progress"          },
  { path: "/friends",   icon: Users,           label: "Friends"           },
  { path: "/focus",     icon: Timer,           label: "Focus Timer"       },
  { path: "/critical",  icon: Brain,           label: "Critical Thinking" },
  { path: "/upload",    icon: Upload,          label: "Upload Material font-medium" },
  { path: "/settings",  icon: Settings,        label: "Settings"          },
];

/* ── Premium Logo Mark ── */
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5B5CEB" />
          <stop offset="100%" stopColor="#7C6BFF" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#36CFC9" />
          <stop offset="100%" stopColor="#A5F3FC" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lg1)" />
      <rect x="7" y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.25" />
      <rect x="8.5" y="13" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.7" />
      <rect x="8.5" y="16" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />
      <rect x="8.5" y="19" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />
      <rect x="8.5" y="22" width="5" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
      <rect x="18.5" y="11" width="2" height="19" rx="1" fill="white" fillOpacity="0.5" />
      <rect x="21" y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.18" />
      <rect x="22.5" y="13" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.7" />
      <rect x="22.5" y="16" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />
      <rect x="22.5" y="19" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />
      <rect x="22.5" y="22" width="5" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
      <circle cx="31" cy="10" r="6" fill="#1E1B4B" />
      <path d="M31 6.5 L31.6 9.4 L34.5 10 L31.6 10.6 L31 13.5 L30.4 10.6 L27.5 10 L30.4 9.4 Z" fill="url(#lg2)" />
    </svg>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const W_FULL = 260;
  const W_ICON = 72;

  return (
    <>
      {/* ── Mobile Hamburger Button ── */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2.5 rounded-2xl bg-card shadow-xl border border-border/80 text-foreground hover:bg-muted transition-all"
        aria-label="Toggle Navigation Menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Sidebar Container ── */}
      <motion.aside
        animate={{ width: collapsed ? W_ICON : W_FULL }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-sidebar border-r border-sidebar-border/80
          flex flex-col overflow-hidden z-40 flex-shrink-0
          transition-transform duration-300 shadow-sm
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Logo Header Row ── */}
        <div className={`flex items-center pt-5 pb-4 border-b border-sidebar-border/60 ${collapsed ? "flex-col gap-3 px-0" : "px-4 gap-3"}`}>
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${collapsed ? "justify-center flex-col" : ""}`}>
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex-shrink-0 group">
              <LogoMark size={40} />
            </Link>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex-1 min-w-0"
                >
                  <Link to="/" onClick={() => setMobileOpen(false)} className="block group">
                    <h1 className="text-sm font-black tracking-tight leading-tight whitespace-nowrap group-hover:text-primary transition-colors flex items-center gap-1.5">
                      Smart AI LMS
                      <Sparkles size={13} className="text-amber-400 fill-amber-400" />
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-tight whitespace-nowrap uppercase tracking-wider">
                      Learn · Practice · Excel
                    </p>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex-shrink-0 w-7 h-7 rounded-xl border border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center shadow-xs"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* ── Navigation Items List ── */}
        <nav className={`flex flex-col gap-1 flex-1 overflow-y-auto py-4 scrollbar-none ${collapsed ? "px-2" : "px-3"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.includes("?") && location.pathname + location.search === item.path);

            return (
              <div key={item.path} className="relative group/tip">
                
                {/* Active Indicator Pill */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className={`
                      absolute z-10 rounded-full bg-primary pointer-events-none shadow-md shadow-primary/40
                      ${collapsed
                        ? "bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5"
                        : "right-2.5 top-1/2 -translate-y-1/2 w-2 h-2"
                      }
                    `}
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}

                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center rounded-2xl transition-all duration-200 overflow-hidden font-medium text-xs
                    ${collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"}
                    ${isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25 font-bold"
                      : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    }
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />

                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="whitespace-nowrap truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wider ${
                            isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>

                {/* Tooltip when Collapsed */}
                {collapsed && (
                  <div className="
                    pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                    bg-popover border border-border text-foreground text-xs font-semibold
                    px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap
                    opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150
                  ">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Premium Upgrade Banner (Bottom) ── */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 m-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-primary/20 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-bold text-primary">
                <Crown size={14} className="text-amber-500 fill-amber-500" />
                <span>Smart LMS Pro</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 leading-tight">
                Unlock 1-on-1 AI Mentorship & Unlimited Mock Tests
              </p>
              <Link
                to="/settings"
                className="block w-full py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold shadow-md hover:brightness-110 transition-all"
              >
                Upgrade Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
