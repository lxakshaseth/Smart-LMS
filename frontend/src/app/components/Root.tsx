import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import { Sidebar } from "./layout/Sidebar";
import { Navbar } from "./layout/Navbar";
import { FloatingAssistant } from "./layout/FloatingAssistant";
import { useAuth } from "../context/AuthContext";

const pageTitles: Record<string, string> = {
  "/": "Dashboard · Smart AI LMS",
  "/ai-tutor": "AI Mentor · Smart AI LMS",
  "/youtube": "Learning Videos · Smart AI LMS",
  "/study": "Learning Hub · Smart AI LMS",
  "/notes": "Derivation Suite & Notes · Smart AI LMS",
  "/practical-lab": "3D Virtual Lab · Smart AI LMS",
  "/upload": "Upload & Process Material · Smart AI LMS",
  "/books": "Library · Smart AI LMS",
  "/analytics": "Progress & Analytics · Smart AI LMS",
  "/focus": "Focus Timer · Smart AI LMS",
  "/critical": "Critical Thinking · Smart AI LMS",
  "/friends": "Friends & Study Group · Smart AI LMS",
  "/settings": "Settings · Smart AI LMS",
  "/quiz": "Practice Quiz · Smart AI LMS",
  "/planner": "Study Planner · Smart AI LMS",
  "/codepilot": "CodePilot IDE · Smart AI LMS",
};

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"/>
    </div>
  );
}

export default function Root() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const title = pageTitles[location.pathname] || "Smart AI LMS · AI Mentor & Learning Platform";
    document.title = title;
  }, [location.pathname]);

  if (isLoading)        return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <FloatingAssistant />
    </div>
  );
}
