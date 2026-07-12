import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import AITutor from "./components/tutor/AITutor";
import StudyMode from "./components/study/StudyMode";
import Quiz from "./components/quiz/Quiz";
import Planner from "./components/planner/Planner";
import Analytics from "./components/analytics/Analytics";
import Books from "./components/books/Books";
import YouTube from "./components/youtube/YouTube";
import Settings from "./components/settings/Settings";
import UploadMaterial from "./components/upload/UploadMaterial";
import CriticalThinking from "./components/critical/CriticalThinking";
import Notes from "./components/notes/Notes";
import FocusTimer from "./components/focus/FocusTimer";
import Friends from "./components/friends/Friends";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "ai-tutor", element: <AITutor /> },
      { path: "study", element: <StudyMode /> },
      { path: "quiz", element: <Quiz /> },
      { path: "planner", element: <Planner /> },
      { path: "analytics", element: <Analytics /> },
      { path: "books", element: <Books /> },
      { path: "youtube", element: <YouTube /> },
      { path: "settings", element: <Settings /> },
      { path: "upload", element: <UploadMaterial /> },
      { path: "critical", element: <CriticalThinking /> },
      { path: "notes",    element: <Notes /> },
      { path: "focus",    element: <FocusTimer /> },
      { path: "friends",  element: <Friends /> },
    ],
  },
]);
