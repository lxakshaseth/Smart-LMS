import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, CheckCircle2, ChevronRight, BookOpen, Sparkles, Terminal, Code2, Cpu, Server, Layout } from "lucide-react";

const roadmaps = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    desc: "Master arrays, trees, graphs, DP & competitive coding",
    nodes: [
      { step: 1, title: "Time & Space Complexity (Big O)", status: "Completed" },
      { step: 2, title: "Arrays & String Manipulation", status: "Completed" },
      { step: 3, title: "Two Pointers & Sliding Window", status: "In Progress" },
      { step: 4, title: "Linked Lists, Stacks & Queues", status: "Locked" },
      { step: 5, title: "Trees, BST & Heaps", status: "Locked" },
      { step: 6, title: "Graph Algorithms (BFS/DFS/Dijkstra)", status: "Locked" },
      { step: 7, title: "Dynamic Programming & Memoization", status: "Locked" }
    ]
  },
  {
    id: "java",
    title: "Java Full Stack Masterclass",
    desc: "Java 21, Spring Boot, Microservices & Hibernate",
    nodes: [
      { step: 1, title: "Java OOPs & Memory Model", status: "Completed" },
      { step: 2, title: "Collections Framework & Streams", status: "In Progress" },
      { step: 3, title: "Spring Boot REST APIs", status: "Locked" },
      { step: 4, title: "Spring Security & JWT", status: "Locked" },
      { step: 5, title: "Microservices & Docker", status: "Locked" }
    ]
  },
  {
    id: "python",
    title: "Python & Data Science",
    desc: "Python fundamentals, NumPy, Pandas & ML foundations",
    nodes: [
      { step: 1, title: "Python Syntax & Data Types", status: "Completed" },
      { step: 2, title: "NumPy & Pandas Dataframes", status: "Completed" },
      { step: 3, title: "Matplotlib & Visualization", status: "In Progress" }
    ]
  },
  {
    id: "cpp",
    title: "C++ Competitive Programming",
    desc: "STL containers, pointers, template meta-programming",
    nodes: [
      { step: 1, title: "C++ Pointers & Memory Management", status: "Completed" },
      { step: 2, title: "C++ STL Vectors, Maps & Sets", status: "In Progress" }
    ]
  },
  {
    id: "frontend",
    title: "Frontend Architecture",
    desc: "React 19, TypeScript, Next.js, Tailwind & State",
    nodes: [
      { step: 1, title: "HTML5, CSS3 & Responsive Design", status: "Completed" },
      { step: 2, title: "Modern JavaScript (ES6+)", status: "Completed" },
      { step: 3, title: "React Components & Hooks", status: "Completed" },
      { step: 4, title: "TypeScript & State Management", status: "In Progress" }
    ]
  },
  {
    id: "backend",
    title: "Backend & Distributed Systems",
    desc: "Node.js, Express, PostgreSQL, Redis & System Design",
    nodes: [
      { step: 1, title: "Node.js Event Loop & Express REST", status: "Completed" },
      { step: 2, title: "SQL vs NoSQL Databases (Postgres & Mongo)", status: "In Progress" }
    ]
  },
  {
    id: "fullstack",
    title: "Full Stack Web Development",
    desc: "End-to-end web apps with MERN & Next.js stack",
    nodes: [
      { step: 1, title: "Frontend UI Foundations", status: "Completed" },
      { step: 2, title: "Backend API & Authentication", status: "In Progress" }
    ]
  },
  {
    id: "cp",
    title: "Competitive Programming",
    desc: "Codeforces & CodeChef rating advancement roadmap",
    nodes: [
      { step: 1, title: "Basic Math & Number Theory", status: "Completed" },
      { step: 2, title: "Binary Search & Bit Manipulation", status: "In Progress" }
    ]
  },
  {
    id: "ml",
    title: "Machine Learning Engineer",
    desc: "Scikit-Learn, PyTorch, Model Training & Evaluation",
    nodes: [
      { step: 1, title: "Linear Algebra & Statistics", status: "Completed" },
      { step: 2, title: "Supervised Learning Algorithms", status: "In Progress" }
    ]
  },
  {
    id: "genai",
    title: "Generative AI & LLM Engineering",
    desc: "LangChain, RAG Systems, Fine-Tuning & Prompt Engineering",
    nodes: [
      { step: 1, title: "Transformer Architectures & Attention", status: "Completed" },
      { step: 2, title: "Prompt Engineering & Few-Shot Learning", status: "Completed" },
      { step: 3, title: "Vector Databases & RAG Pipelines", status: "In Progress" }
    ]
  }
];

export default function LearningRoadmaps() {
  const [selectedId, setSelectedId] = useState("dsa");
  const selectedRoadmap = roadmaps.find((r) => r.id === selectedId) || roadmaps[0];

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="text-purple-400" size={20} />
          Interactive Tech Learning Roadmaps (10 Domains)
        </h2>
        <p className="text-xs text-muted-foreground">Structured step-by-step career path guides with milestone progress</p>
      </div>

      {/* Domain Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {roadmaps.map((r) => {
          const isSelected = selectedId === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-md"
                  : "bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="truncate">{r.title}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Roadmap Timeline View */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 lg:p-8 shadow-xl space-y-6 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-black text-foreground">{selectedRoadmap.title}</h3>
          <p className="text-xs text-muted-foreground">{selectedRoadmap.desc}</p>
        </div>

        {/* Interactive Milestone Nodes */}
        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-500/30">
          {selectedRoadmap.nodes.map((node) => (
            <motion.div
              key={node.step}
              whileHover={{ x: 4 }}
              className="relative pl-10 flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-purple-500/40 transition-all"
            >
              {/* Node Bullet Icon */}
              <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                node.status === "Completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : node.status === "In Progress"
                  ? "bg-purple-500 border-purple-500 animate-pulse"
                  : "bg-muted border-border"
              }`}>
                {node.status === "Completed" && <CheckCircle2 size={12} />}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Step {node.step}</span>
                <h4 className="text-sm font-bold text-foreground">{node.title}</h4>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                node.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                node.status === "In Progress" ? "bg-purple-500/10 text-purple-300 border border-purple-500/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {node.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
