import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RadioGroup } from "../ui/radio-group";
import {
  CheckCircle, XCircle, Trophy, Zap, GraduationCap, Rocket, Baby, BookOpen,
  Shield, Brain, School, Users, Briefcase, Globe, Award, Landmark,
  Train, Banknote, ChevronLeft, ChevronRight, Atom, Calculator, Languages,
  Clock, RotateCcw, Check, HelpCircle, AlertCircle, Sparkles, Filter, Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../ui/utils";
import { apiRequest } from "../../lib/api";
// @ts-ignore
import confetti from "canvas-confetti";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export type CategoryKey =
  | "Nursery-LKG" | "Class 1-5" | "Class 6-10" | "Class 11-12"
  | "JEE" | "NEET" | "Engineering" | "GATE" | "CAT"
  | "Defence" | "UPSC" | "SSC" | "Banking" | "Railway"
  | "General Knowledge" | "English" | "Mathematics" | "Science";

export type DifficultyLevel = "Easy" | "Medium" | "Hard" | "Mixed";
export type QuestionCount = 5 | 10 | 20 | 30;

/* ═══════════════════════════════════
   HELPERS
   ═══════════════════════════════════ */
function formatTimeHHMMSS(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function calculateTestDuration(difficulty: DifficultyLevel, count: number): number {
  let secondsPerQuestion = 75; // Medium default
  if (difficulty === "Easy") secondsPerQuestion = 45;
  if (difficulty === "Hard") secondsPerQuestion = 120;
  if (difficulty === "Mixed") secondsPerQuestion = 80;
  return count * secondsPerQuestion;
}

function useCounter(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMs = duration;
    const incrementTime = Math.abs(Math.floor(totalMs / (end || 1)));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime || 15);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

/* ═══════════════════════════════════
   SETUP MODAL COMPONENT
   ═══════════════════════════════════ */
function TestSetupModal({
  category,
  onClose,
  onStart,
}: {
  category: CategoryKey;
  onClose: () => void;
  onStart: (difficulty: DifficultyLevel, count: QuestionCount) => void;
}) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);

  const durationSec = calculateTestDuration(difficulty, questionCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 space-y-6 shadow-2xl border-border bg-card relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Configure Examination</span>
            <h2 className="text-2xl font-black text-foreground mt-0.5">{category}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-primary" />
            Select Difficulty Level
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(["Easy", "Medium", "Hard", "Mixed"] as DifficultyLevel[]).map((level) => {
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "p-3 rounded-xl border font-bold text-sm transition-all duration-200 text-left flex items-center justify-between",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-sm"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span>{level}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Number of Questions
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([5, 10, 20, 30] as QuestionCount[]).map((num) => {
              const isSelected = questionCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={cn(
                    "py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 text-center",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-sm"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  {num} Qs
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimated Info */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Estimated Duration: <strong>{formatTimeHHMMSS(durationSec)}</strong></span>
          </div>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Groq AI Powered</span>
        </div>

        {/* Start Button */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-2.5 rounded-xl">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onStart(difficulty, questionCount)}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <Play className="w-4 h-4 fill-white" />
            Generate Test
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════
   SUB-COMPONENTS FOR EXAM VIEW
   ═══════════════════════════════════ */
function OptionItem({
  label,
  text,
  selected,
  disabled,
}: {
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left",
        selected
          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 shadow-sm"
          : "border-border hover:bg-muted/50 text-foreground",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
          selected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {label}
      </div>
      <span className="font-medium text-sm md:text-base leading-relaxed flex-1">{text}</span>
    </div>
  );
}

function QuestionPalette({
  total,
  current,
  selectedAnswers,
  visitedQuestions,
  markedForReview,
  onSelect,
}: {
  total: number;
  current: number;
  selectedAnswers: Record<number, number>;
  visitedQuestions: number[];
  markedForReview: number[];
  onSelect: (index: number) => void;
}) {
  return (
    <Card className="p-5 space-y-4 border-border bg-card">
      <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const isCurrent = idx === current;
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isMarked = markedForReview.includes(idx);
          const isVisited = visitedQuestions.includes(idx);

          let bgClass = "bg-muted text-muted-foreground hover:bg-muted/80";
          let borderClass = "border-2 border-transparent";

          if (isMarked) {
            bgClass = "bg-amber-500 text-white hover:bg-amber-600";
          } else if (isAnswered) {
            bgClass = "bg-emerald-500 text-white hover:bg-emerald-600";
          } else if (isVisited) {
            bgClass = "bg-blue-500 text-white hover:bg-blue-600";
          }

          if (isCurrent) {
            borderClass = "border-primary shadow-md ring-2 ring-primary/40";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "w-9 h-9 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                bgClass,
                borderClass
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-border text-[11px] font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-muted flex-shrink-0" />
          <span>Unvisited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500 flex-shrink-0" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 flex-shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500 flex-shrink-0" />
          <span>Marked</span>
        </div>
      </div>
    </Card>
  );
}

function ResultSummary({
  total,
  correct,
  wrong,
  skipped,
  percentage,
  xpEarned,
  timeTaken,
  category,
  difficulty,
  onRetake,
  onChangeCategory,
}: {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  xpEarned: number;
  timeTaken: number;
  category: CategoryKey;
  difficulty: DifficultyLevel;
  onRetake: () => void;
  onChangeCategory: () => void;
}) {
  const animatedScore = useCounter(correct);
  const animatedPercent = useCounter(percentage);
  const animatedXp = useCounter(xpEarned, 1200);

  let rating = "Needs Improvement";
  let badgeColor = "from-red-500 to-orange-500 shadow-red-500/20";
  if (percentage >= 90) {
    rating = "Outstanding";
    badgeColor = "from-violet-600 to-fuchsia-600 shadow-violet-500/20";
  } else if (percentage >= 75) {
    rating = "Excellent";
    badgeColor = "from-emerald-500 to-teal-500 shadow-emerald-500/20";
  } else if (percentage >= 60) {
    rating = "Good";
    badgeColor = "from-blue-500 to-indigo-500 shadow-blue-500/20";
  } else if (percentage >= 40) {
    rating = "Average";
    badgeColor = "from-amber-500 to-orange-500 shadow-amber-500/20";
  }

  useEffect(() => {
    if (percentage >= 80) {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [percentage]);

  return (
    <Card className="p-8 text-center bg-card border border-border max-w-3xl mx-auto space-y-8 shadow-xl">
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
          <Trophy className="text-white w-10 h-10 animate-bounce" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{category} · {difficulty}</span>
          <h2 className="text-3xl font-black text-foreground mt-1">Examination Completed!</h2>
        </div>
      </div>

      {/* Rating Badge */}
      <div className={cn(
        "inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-extrabold text-base bg-gradient-to-r shadow-lg",
        badgeColor
      )}>
        <Award className="w-5 h-5" />
        {rating}
      </div>

      {/* Main Score Board */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        <div className="bg-muted/30 border border-border p-4 rounded-2xl">
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Correct Answers</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">
            {animatedScore} <span className="text-xs font-medium text-muted-foreground">/ {total}</span>
          </p>
        </div>
        <div className="bg-muted/30 border border-border p-4 rounded-2xl">
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Accuracy</p>
          <p className="text-3xl font-black text-primary mt-1">{animatedPercent}%</p>
        </div>
        <div className="bg-muted/30 border border-border p-4 rounded-2xl col-span-2 md:col-span-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Time Taken</p>
          <p className="text-3xl font-black text-foreground mt-1">{formatTimeHHMMSS(timeTaken)}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Wrong</p>
          <p className="text-xl font-bold text-destructive">{wrong}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Skipped</p>
          <p className="text-xl font-bold text-muted-foreground">{skipped}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">XP Earned</p>
          <p className="text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 fill-amber-500/20" />
            {animatedXp}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Completion</p>
          <p className="text-xl font-bold text-teal-500">{Math.round(((correct + wrong) / total) * 100)}%</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Button onClick={onRetake} variant="primary" className="flex items-center gap-2 px-6 py-2.5 font-bold shadow-md shadow-primary/20">
          <RotateCcw className="w-4 h-4" />
          Retake Test (New Questions)
        </Button>
        <Button onClick={onChangeCategory} variant="secondary" className="px-6 py-2.5 font-bold">
          Choose Another Category
        </Button>
      </div>
    </Card>
  );
}

function AnswerReview({
  questions,
  selectedAnswers,
}: {
  questions: Question[];
  selectedAnswers: Record<number, number>;
}) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pt-8">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl font-black text-foreground">Detailed Question Review</h3>
        <span className="text-xs font-semibold text-muted-foreground">Solutions & AI Explanations</span>
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[idx];
          const isCorrect = selected === q.correctAnswer;
          const isSkipped = selected === undefined;

          let statusIcon = <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
          let statusText = "Correct";
          let cardBorder = "border-emerald-500/20 bg-emerald-500/5";

          if (isSkipped) {
            statusIcon = <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
            statusText = "Skipped";
            cardBorder = "border-border bg-muted/10";
          } else if (!isCorrect) {
            statusIcon = <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
            statusText = "Incorrect";
            cardBorder = "border-destructive/20 bg-destructive/5";
          }

          return (
            <Card key={idx} className={cn("p-6 border text-left space-y-4 shadow-sm", cardBorder)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Question {idx + 1} · {statusText}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-foreground text-base leading-relaxed">{q.question}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {q.options.map((opt, oIdx) => {
                  const isOptionSelected = selected === oIdx;
                  const isOptionCorrect = oIdx === q.correctAnswer;

                  let optBorder = "border-border";
                  let optBg = "bg-card";
                  let optIcon = null;

                  if (isOptionCorrect) {
                    optBorder = "border-emerald-500";
                    optBg = "bg-emerald-500/10 text-emerald-950 dark:text-emerald-200";
                    optIcon = <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
                  } else if (isOptionSelected) {
                    optBorder = "border-destructive";
                    optBg = "bg-destructive/10 text-destructive-950 dark:text-destructive-200";
                    optIcon = <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
                  }

                  return (
                    <div
                      key={oIdx}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-colors",
                        optBorder,
                        optBg
                      )}
                    >
                      <div className="w-5 h-5 rounded-md flex items-center justify-center border border-muted-foreground/30 flex-shrink-0 bg-background text-[11px] font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className="flex-1 text-xs md:text-sm">{opt}</span>
                      {optIcon}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-muted/40 border border-border rounded-xl text-xs leading-relaxed text-muted-foreground space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  AI Tutor Explanation:
                </p>
                <p>{q.explanation || `Option ${String.fromCharCode(65 + q.correctAnswer)} is the correct choice.`}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN PRACTICE ARENA COMPONENT
   ═══════════════════════════════════ */
export default function Quiz() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Test Execution State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([0]);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  const localStorageKey = useMemo(() => {
    return selectedCategory ? `smart_ai_lms_exam_${selectedCategory}` : "";
  }, [selectedCategory]);

  // Handle Category Card Click
  const handleCategoryClick = (category: CategoryKey) => {
    setSelectedCategory(category);
    setShowSetupModal(true);
  };

  // Generate Test Function
  const handleStartTest = async (diff: DifficultyLevel, count: QuestionCount) => {
    setDifficulty(diff);
    setQuestionCount(count);
    setShowSetupModal(false);
    setLoadingQuestions(true);
    setGenerationError(null);
    setIsSubmitted(false);
    setShowResult(false);
    setSelectedAnswers({});
    setVisitedQuestions([0]);
    setMarkedForReview([]);
    setCurrentQuestion(0);

    try {
      const response = await apiRequest<{
        success: boolean;
        questions: Question[];
      }>("/mocktest/generate", {
        method: "POST",
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: diff,
          questionCount: count
        })
      });

      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        const duration = calculateTestDuration(diff, response.questions.length);
        setTimeLeft(duration);
        setStartTime(Date.now());
      } else {
        throw new Error("Invalid response format received from test generation server.");
      }
    } catch (err: any) {
      console.error("❌ Test Generation Error:", err);
      setGenerationError(err.message || "Failed to generate test. Please try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!selectedCategory || questions.length === 0 || isSubmitted || showResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time expiry
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedCategory, questions.length, isSubmitted, showResult, timeLeft > 0]);

  // Answer Select Handler
  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQuestion)
        ? prev.filter(i => i !== currentQuestion)
        : [...prev, currentQuestion]
    );
  };

  // Clear Option Answer
  const handleClearAnswer = () => {
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion];
      return next;
    });
  };

  // Navigation Handlers
  const handleJumpToQuestion = (idx: number) => {
    setCurrentQuestion(idx);
    setVisitedQuestions(prev => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      handleJumpToQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      handleJumpToQuestion(currentQuestion - 1);
    }
  };

  // Keyboard Shortcuts (Arrow Left/Right, M for Mark)
  useEffect(() => {
    if (!questions.length || isSubmitted || showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "m" || e.key === "M") toggleMarkForReview();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions.length, isSubmitted, showResult, currentQuestion]);

  // Submit Test Function
  const handleSubmitTest = async () => {
    if (isSubmitted) return;

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTimeTaken(elapsed > 0 ? elapsed : 1);

    setIsSubmitted(true);
    setShowResult(true);

    // Calculate metrics
    const correctCount = questions.reduce(
      (acc, q, idx) => acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0),
      0
    );

    try {
      await apiRequest("/mocktest/submit", {
        method: "POST",
        body: JSON.stringify({
          category: selectedCategory,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          timeTaken: elapsed
        })
      });
    } catch (err) {
      console.error("Failed to post test evaluation to backend database:", err);
    }
  };

  // Compute Current Metrics
  const total = questions.length;
  const correct = questions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0), 0);
  const wrong = questions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correctAnswer ? 1 : 0), 0);
  const skipped = total - (correct + wrong);
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpEarned = correct * 5;

  const currentQ = questions[currentQuestion];

  // 1. CATEGORY SELECTION VIEW
  if (!selectedCategory || (!loadingQuestions && questions.length === 0 && !generationError)) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Practice Arena
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Select an examination category to generate a fresh, AI-powered question paper powered by Groq.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            AI Question Generator V2
          </div>
        </div>

        {/* School Level */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <School className="w-5 h-5 text-primary" />
            School Level
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "Nursery-LKG", desc: "Colors, Shapes & Basic Numbers", icon: Baby, color: "from-pink-500 to-rose-500" },
              { key: "Class 1-5", desc: "Primary Elementary Concepts", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
              { key: "Class 6-10", desc: "Middle & High School Subjects", icon: School, color: "from-indigo-500 to-blue-600" },
              { key: "Class 11-12", desc: "Senior Secondary Streams", icon: Users, color: "from-violet-500 to-purple-600" }
            ].map(item => (
              <Card
                key={item.key}
                onClick={() => handleCategoryClick(item.key as CategoryKey)}
                className="p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-border hover:border-primary/50 bg-card group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", item.color)}>
                    <item.icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{item.key}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Competitive Exams */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <GraduationCap className="w-5 h-5 text-primary" />
            Competitive Entrance Exams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: "JEE", desc: "Engineering Entrance (Physics, Chem, Math)", icon: GraduationCap, color: "from-primary to-secondary" },
              { key: "NEET", desc: "Medical Entrance (Physics, Chem, Biology)", icon: Atom, color: "from-emerald-500 to-teal-600" },
              { key: "Engineering", desc: "Computer Science, DSA, OS, DBMS", icon: Rocket, color: "from-accent to-purple-600" },
              { key: "GATE", desc: "Advanced Engineering Aptitude", icon: Award, color: "from-purple-600 to-pink-600" },
              { key: "CAT", desc: "Quant, VARC & Data Interpretation", icon: Briefcase, color: "from-amber-500 to-orange-600" }
            ].map(item => (
              <Card
                key={item.key}
                onClick={() => handleCategoryClick(item.key as CategoryKey)}
                className="p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-border hover:border-primary/50 bg-card group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", item.color)}>
                    <item.icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{item.key}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Government Jobs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Landmark className="w-5 h-5 text-primary" />
            Government Examinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: "UPSC", desc: "Civil Services Prelims & Mains", icon: Landmark, color: "from-red-600 to-orange-600" },
              { key: "SSC", desc: "Staff Selection Commission Exams", icon: Globe, color: "from-teal-500 to-emerald-600" },
              { key: "Banking", desc: "IBPS, SBI PO & Clerk Preparation", icon: Banknote, color: "from-sky-500 to-blue-600" },
              { key: "Railway", desc: "RRB NTPC, Group D & Assistant Loco", icon: Train, color: "from-amber-600 to-yellow-600" },
              { key: "Defence", desc: "NDA, CDS, AFCAT Armed Forces", icon: Shield, color: "from-green-600 to-emerald-700" }
            ].map(item => (
              <Card
                key={item.key}
                onClick={() => handleCategoryClick(item.key as CategoryKey)}
                className="p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-border hover:border-primary/50 bg-card group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", item.color)}>
                    <item.icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{item.key}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Core Subjects */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Core Academic Subjects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "Mathematics", desc: "Arithmetic, Algebra & Geometry", icon: Calculator, color: "from-blue-600 to-indigo-600" },
              { key: "Science", desc: "Physics, Chemistry & Biology", icon: Atom, color: "from-purple-600 to-violet-600" },
              { key: "English", desc: "Grammar, Vocab & Comprehension", icon: Languages, color: "from-pink-600 to-rose-600" },
              { key: "General Knowledge", desc: "History, Polity & Current Affairs", icon: Globe, color: "from-teal-600 to-emerald-600" }
            ].map(item => (
              <Card
                key={item.key}
                onClick={() => handleCategoryClick(item.key as CategoryKey)}
                className="p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-border hover:border-primary/50 bg-card group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", item.color)}>
                    <item.icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{item.key}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Setup Modal */}
        {showSetupModal && selectedCategory && (
          <TestSetupModal
            category={selectedCategory}
            onClose={() => setShowSetupModal(false)}
            onStart={handleStartTest}
          />
        )}
      </div>
    );
  }

  // 2. LOADING STATE
  if (loadingQuestions) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-300 my-16">
        <Card className="p-10 border-border bg-card shadow-2xl space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-pulse">
            <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: "4s" }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Generating Examination Paper...</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Generating <span className="text-primary font-bold">{questionCount} fresh MCQs</span> for{" "}
              <span className="text-foreground font-bold">{selectedCategory}</span> ({difficulty} Difficulty).
            </p>
          </div>
          <div className="w-full max-w-md mx-auto space-y-2">
            <Progress value={65} className="h-2" />
            <span className="text-xs font-semibold text-muted-foreground">Querying Groq AI Model & Shuffling Answers...</span>
          </div>
        </Card>
      </div>
    );
  }

  // 3. GENERATION ERROR STATE
  if (generationError) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center my-16 animate-in fade-in duration-300">
        <Card className="p-8 border-destructive/30 bg-destructive/5 space-y-6 shadow-xl">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Generation Failed</h3>
            <p className="text-sm text-muted-foreground">{generationError}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setSelectedCategory(null)}>
              Back to Arena
            </Button>
            <Button variant="primary" onClick={() => handleStartTest(difficulty, questionCount)}>
              Retry Generation
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. RESULTS & REVIEW VIEW
  if (showResult) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        <ResultSummary
          total={total}
          correct={correct}
          wrong={wrong}
          skipped={skipped}
          percentage={percentage}
          xpEarned={xpEarned}
          timeTaken={timeTaken}
          category={selectedCategory}
          difficulty={difficulty}
          onRetake={() => handleStartTest(difficulty, questionCount)}
          onChangeCategory={() => setSelectedCategory(null)}
        />
        <AnswerReview questions={questions} selectedAnswers={selectedAnswers} />
      </div>
    );
  }

  // 5. LIVE EXAM TEST VIEW
  const isTimeWarning = timeLeft < 300;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-primary tracking-wider">{selectedCategory}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">{difficulty}</span>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-0.5">Online Examination Session</h2>
        </div>

        {/* Live Timer */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base transition-colors",
          isTimeWarning
            ? "bg-destructive/10 text-destructive border border-destructive/30 animate-pulse"
            : "bg-muted text-foreground border border-border"
        )}>
          <Clock className="w-5 h-5" />
          <span>{formatTimeHHMMSS(timeLeft)}</span>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 md:p-8 space-y-6 border-border bg-card shadow-sm">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-xs font-black text-primary uppercase tracking-widest">
                Question {currentQuestion + 1} of {total}
              </span>
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors",
                  markedForReview.includes(currentQuestion)
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Award className="w-4 h-4" />
                {markedForReview.includes(currentQuestion) ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-base md:text-lg font-bold text-foreground leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => (
                <div key={optIdx} onClick={() => handleSelectOption(optIdx)}>
                  <OptionItem
                    label={String.fromCharCode(65 + optIdx)}
                    text={optionText}
                    selected={selectedAnswers[currentQuestion] === optIdx}
                    disabled={isSubmitted}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Question Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAnswer}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="text-xs font-bold"
              >
                Clear Answer
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-1.5 font-bold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentQuestion === total - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmitTest}
                    className="flex items-center gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Examination
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 font-bold text-xs"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar / Question Palette */}
        <div className="space-y-6">
          <QuestionPalette
            total={total}
            current={currentQuestion}
            selectedAnswers={selectedAnswers}
            visitedQuestions={visitedQuestions}
            markedForReview={markedForReview}
            onSelect={handleJumpToQuestion}
          />

          <Button
            type="button"
            variant="accent"
            onClick={handleSubmitTest}
            className="w-full py-3 font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Submit Test Now
          </Button>
        </div>
      </div>
    </div>
  );
}
