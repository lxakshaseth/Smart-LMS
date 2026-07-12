import { Outlet, Navigate } from "react-router";
import { Sidebar } from "./layout/Sidebar";
import { Navbar } from "./layout/Navbar";
import { FloatingAssistant } from "./layout/FloatingAssistant";
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"/>
    </div>
  );
}

export default function Root() {
  const { isAuthenticated, isLoading } = useAuth();

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
