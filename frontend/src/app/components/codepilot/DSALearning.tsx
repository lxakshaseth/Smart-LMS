import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Play, CheckCircle2, FileText, HelpCircle, ArrowRight, Sparkles, Layers } from "lucide-react";

export default function DSALearning() {
  const [activeTab, setActiveTab] = useState<"theory" | "animation" | "quiz" | "practice" | "cheatsheet">("animation");
  const [arrayElements, setArrayElements] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [sortingStep, setSortingStep] = useState(0);

  const handleNextSortStep = () => {
    const arr = [...arrayElements];
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArrayElements(arr);
          setSortingStep((prev) => prev + 1);
          return;
        }
      }
    }
  };

  const handleResetSort = () => {
    setArrayElements([64, 34, 25, 12, 22, 11, 90]);
    setSortingStep(0);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <BookOpen className="text-purple-400" size={20} />
          DSA Interactive Visualizer & Topic Lessons
        </h2>
        <p className="text-xs text-muted-foreground">Master Data Structures through step-by-step visual animations and practice quizzes</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(["animation", "theory", "quiz", "practice", "cheatsheet"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Animation / Visualizer View */}
      {activeTab === "animation" && (
        <div className="rounded-3xl bg-card/80 border border-border p-6 lg:p-8 shadow-xl space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">Bubble Sort Animation & Pointer Tracing</h3>
              <p className="text-xs text-muted-foreground">Swapping adjacent elements if they are in wrong order. Step count: {sortingStep}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNextSortStep}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-purple-500"
              >
                <Play size={14} className="fill-white" /> Next Swap Step
              </button>
              <button
                onClick={handleResetSort}
                className="px-3 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground hover:text-foreground"
              >
                Reset Array
              </button>
            </div>
          </div>

          {/* Visual Array Bars */}
          <div className="h-64 flex items-end justify-center gap-3 p-6 rounded-2xl bg-black/60 border border-border">
            {arrayElements.map((val, idx) => (
              <motion.div
                key={idx}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-12 rounded-t-xl bg-gradient-to-t from-purple-600 to-blue-400 flex items-center justify-center font-mono font-bold text-white text-xs shadow-lg"
                style={{ height: `${val * 2.2}px` }}
              >
                {val}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Theory View */}
      {activeTab === "theory" && (
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 text-xs text-foreground leading-relaxed backdrop-blur-xl">
          <h3 className="text-base font-bold text-purple-400">Bubble Sort Theory & Intuition</h3>
          <p>
            Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping adjacent elements if they are in the wrong order.
            After each pass, the largest element "bubbles up" to its correct position at the end of the array.
          </p>
          <div className="p-4 rounded-2xl bg-muted/40 font-mono text-[11px]">
            <div>Time Complexity: Best O(N), Average O(N^2), Worst O(N^2)</div>
            <div>Space Complexity: O(1) Auxiliary Space (In-place sort)</div>
          </div>
        </div>
      )}

      {/* Quiz & Practice Fallback Cards */}
      {activeTab === "quiz" && (
        <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 text-xs text-foreground backdrop-blur-xl">
          <h3 className="text-base font-bold">Bubble Sort Checkup Quiz</h3>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
            <p className="font-semibold">Q1. What is the worst case time complexity of Bubble Sort?</p>
            <div className="space-y-1.5">
              <label className="block p-2 rounded-xl bg-background border border-border cursor-pointer hover:border-purple-500">
                <input type="radio" name="q1" className="mr-2" /> O(N log N)
              </label>
              <label className="block p-2 rounded-xl bg-background border border-border cursor-pointer hover:border-purple-500">
                <input type="radio" name="q1" className="mr-2" /> O(N^2) (Correct)
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
