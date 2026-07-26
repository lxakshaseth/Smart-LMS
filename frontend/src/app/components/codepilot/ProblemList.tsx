import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, ThumbsUp, ThumbsDown, CheckCircle, ArrowRight, Building, Sparkles, Star, Loader2 } from "lucide-react";
import { getAuthToken } from "../../lib/api";

interface ProblemListProps {
  onSelectProblem: (id: string) => void;
}

const topics = [
  "All", "Arrays", "Strings", "Linked List", "Stack", "Queue", "Tree", "BST", "Heap",
  "Graph", "Trie", "DP", "Greedy", "Bit Manipulation", "Backtracking", "Sorting",
  "Searching", "Binary Search", "Sliding Window", "Two Pointer", "HashMap", "Prefix Sum", "Math", "Recursion"
];

const companies = [
  "All", "Google", "Microsoft", "Amazon", "Adobe", "Oracle", "Atlassian", "Uber", "Netflix", "Meta", "Goldman Sachs"
];

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  acceptance: string;
  likes: number;
  dislikes: number;
  company: string;
  frequency: string;
}

export default function ProblemList({ onSelectProblem }: ProblemListProps) {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");

  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedTopic, selectedCompany]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const query = new URLSearchParams({
        difficulty: selectedDifficulty,
        topic: selectedTopic,
        company: selectedCompany,
        search
      }).toString();

      const res = await fetch(`/api/codepilot/problems?${query}`, { headers });
      const data = await res.json();

      if (data.success && data.problems) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = problems.filter((p) => {
    return p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">

      {/* Header & Filter Controls */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              LeetCode & HackerRank Problem Bank
            </h2>
            <p className="text-xs text-muted-foreground">Filter by 23 algorithm topics & top 10 target companies</p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProblems()}
              placeholder="Search problem title..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Multi-Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">

          {/* Difficulty Filter */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Algorithm Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500"
            >
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Target Company Filter */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Company Tag
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground outline-none focus:border-purple-500"
            >
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problem Cards Table */}
      <div className="rounded-3xl bg-card/80 border border-border shadow-xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-purple-400 font-bold flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Loading problem database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No problems found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Problem Title</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Topic</th>
                  <th className="py-3.5 px-6">Acceptance</th>
                  <th className="py-3.5 px-6">Company Tag</th>
                  <th className="py-3.5 px-6 text-right">Interview Freq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProblem(p.id)}
                    className="hover:bg-purple-500/5 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <CheckCircle size={16} className="text-muted-foreground/40 group-hover:text-green-400" />
                    </td>

                    <td className="py-4 px-6 font-bold text-foreground group-hover:text-purple-400 transition-colors">
                      {p.title}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                        p.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" :
                        "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {p.difficulty}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground font-medium">
                      {p.category}
                    </td>

                    <td className="py-4 px-6 text-foreground font-mono">
                      {p.acceptance}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                        <Building size={12} /> {p.company}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono text-purple-400 font-bold">
                      {p.frequency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
