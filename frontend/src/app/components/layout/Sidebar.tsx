import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, Bot, BookOpen, ClipboardList, Calendar,
  BarChart3, Library, Youtube, Settings, Menu, X, Upload,
  ChevronLeft, ChevronRight, Brain, FileText, Timer, Users,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { path: "/",          icon: LayoutDashboard, label: "Dashboard"        },
  { path: "/ai-tutor",  icon: Bot,             label: "AI Mentor"        },
  { path: "/study",     icon: BookOpen,        label: "Learning Hub"     },
  { path: "/quiz",      icon: ClipboardList,   label: "Practice Arena"   },
  { path: "/planner",   icon: Calendar,        label: "Study Planner"    },
  { path: "/analytics", icon: BarChart3,       label: "Progress"         },
  { path: "/books",     icon: Library,         label: "Library"          },
  { path: "/youtube",   icon: Youtube,         label: "Learning Videos"  },
  { path: "/notes",     icon: FileText,        label: "Notes"            },
  { path: "/focus",     icon: Timer,           label: "Focus Timer"      },
  { path: "/critical",  icon: Brain,           label: "Critical Thinking"},
  { path: "/upload",    icon: Upload,          label: "Upload Material"  },
  { path: "/friends",   icon: Users,           label: "Friends"          },
  { path: "/settings",  icon: Settings,        label: "Settings"         },
];

/* ── Logo SVG ── */
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A5F3FC"/>
          <stop offset="100%" stopColor="#818CF8"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg1)"/>
      <rect x="7"    y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.25"/>
      <rect x="8.5"  y="13" width="8"  height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
      <rect x="8.5"  y="16" width="6"  height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
      <rect x="8.5"  y="19" width="7"  height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
      <rect x="8.5"  y="22" width="5"  height="1.5" rx="0.75" fill="white" fillOpacity="0.35"/>
      <rect x="18.5" y="11" width="2"  height="19" rx="1"    fill="white" fillOpacity="0.5"/>
      <rect x="21"   y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.18"/>
      <rect x="22.5" y="13" width="8"  height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
      <rect x="22.5" y="16" width="6"  height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
      <rect x="22.5" y="19" width="7"  height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
      <rect x="22.5" y="22" width="5"  height="1.5" rx="0.75" fill="white" fillOpacity="0.35"/>
      <circle cx="31" cy="10" r="6" fill="#1E1B4B"/>
      <path d="M31 6.5 L31.6 9.4 L34.5 10 L31.6 10.6 L31 13.5 L30.4 10.6 L27.5 10 L30.4 9.4 Z" fill="url(#lg2)"/>
    </svg>
  );
}

export function Sidebar() {
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);

  const W_FULL = 256;
  const W_ICON = 68;

  return (
    <>
      {/* ── mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        className="lg:hidden fixed top-2.5 sm:top-3.5 left-2.5 sm:left-4 z-50 p-1.5 sm:p-2 rounded-xl bg-card shadow-lg border border-border"
        aria-label="Toggle Navigation Menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? W_ICON : W_FULL }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-sidebar border-r border-sidebar-border
          flex flex-col overflow-hidden z-40 flex-shrink-0
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── logo row ── */}
        <div className={`flex items-center pt-5 pb-4 border-b border-sidebar-border ${collapsed ? "flex-col gap-3 px-0" : "px-4 gap-3"}`}>
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
                    <h1 className="text-base font-bold leading-tight whitespace-nowrap group-hover:text-primary transition-colors">
                      Smart AI LMS
                    </h1>
                    <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap">
                      Learn · Practice · Excel
                    </p>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex-shrink-0 w-7 h-7 rounded-lg border border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* ── nav items ── */}
        <nav className={`flex flex-col gap-0.5 flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
          {navItems.map(item => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div key={item.path} className="relative group/tip">

                {/* ── animated active dot — OUTSIDE the link so overflow-hidden never clips it ── */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className={`
                      absolute z-10 rounded-full bg-primary pointer-events-none
                      ${collapsed
                        ? "bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5"
                        : "right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5"
                      }
                    `}
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}

                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center rounded-xl transition-all duration-200 overflow-hidden
                    ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"}
                    ${isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                    }
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />

                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                {/* tooltip when collapsed */}
                {collapsed && (
                  <div className="
                    pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                    bg-popover border border-border text-foreground text-xs font-medium
                    px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap
                    opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150
                  ">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border"/>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="pb-4" />
      </motion.aside>

      {/* ── mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
