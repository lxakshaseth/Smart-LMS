import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Label } from "../ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import {
  CheckCircle, XCircle, Trophy, Zap, GraduationCap, Rocket, Baby, BookOpen,
  Shield, Brain, School, Users, Briefcase, Globe, Calculator, Award, Landmark,
  Train, Banknote, Languages, Atom, FlaskConical, ChevronLeft, ChevronRight,
  Clock, Eye, RotateCcw, AlertTriangle, Check, HelpCircle
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
}

type QuizMode =
  | "nursery-lkg" | "class-1-5" | "class-6-10" | "class-11-12"
  | "jee-neet" | "engineering" | "gate" | "cat"
  | "defence" | "upsc" | "ssc" | "banking" | "railway"
  | "general-knowledge" | "english" | "mathematics" | "science";


/* ═══════════════════════════════════
   HELPERS & HOOKS
   ═══════════════════════════════════ */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
    const incrementTime = Math.abs(Math.floor(totalMs / end));

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

function useQuizState(quizMode: QuizMode | null, totalQuestions: number) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([]);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const localStorageKey = `smart_ai_lms_quiz_state_${quizMode}`;

  // Initial load or mode change
  useEffect(() => {
    if (!quizMode || totalQuestions === 0) return;
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentQuestion(parsed.currentQuestion ?? 0);
        setSelectedAnswers(parsed.selectedAnswers ?? {});
        setVisitedQuestions(parsed.visitedQuestions ?? [0]);
        setMarkedForReview(parsed.markedForReview ?? []);
        setIsSubmitted(parsed.isSubmitted ?? false);
        setTimeLeft(parsed.timeLeft ?? totalQuestions * 60);
        setShowResult(parsed.isSubmitted ?? false);
      } catch (e) {
        console.error("Failed to parse saved quiz state", e);
      }
    } else {
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setVisitedQuestions([0]);
      setMarkedForReview([]);
      setIsSubmitted(false);
      setTimeLeft(totalQuestions * 60);
      setShowResult(false);
    }
  }, [quizMode, totalQuestions, localStorageKey]);

  // Sync state to local storage
  useEffect(() => {
    if (!quizMode || isSubmitted) return;
    const state = {
      currentQuestion,
      selectedAnswers,
      visitedQuestions,
      markedForReview,
      isSubmitted,
      timeLeft,
    };
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [quizMode, currentQuestion, selectedAnswers, visitedQuestions, markedForReview, isSubmitted, timeLeft, localStorageKey]);

  // Timer countdown
  useEffect(() => {
    if (!quizMode || isSubmitted || showResult || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit
          setIsSubmitted(true);
          setShowResult(true);
          localStorage.removeItem(localStorageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizMode, isSubmitted, showResult, localStorageKey, timeLeft > 0]);

  const handleSelectAnswer = useCallback((qIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
    setVisitedQuestions((prev) => {
      if (!prev.includes(qIndex)) return [...prev, qIndex];
      return prev;
    });
  }, [isSubmitted]);

  const toggleMarkForReview = useCallback((qIndex: number) => {
    if (isSubmitted) return;
    setMarkedForReview((prev) => {
      if (prev.includes(qIndex)) {
        return prev.filter((i) => i !== qIndex);
      } else {
        return [...prev, qIndex];
      }
    });
  }, [isSubmitted]);

  const jumpToQuestion = useCallback((qIndex: number) => {
    setCurrentQuestion(qIndex);
    setVisitedQuestions((prev) => {
      if (!prev.includes(qIndex)) return [...prev, qIndex];
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      jumpToQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, totalQuestions, jumpToQuestion]);

  const handlePrev = useCallback(() => {
    if (currentQuestion > 0) {
      jumpToQuestion(currentQuestion - 1);
    }
  }, [currentQuestion, jumpToQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setVisitedQuestions([0]);
    setMarkedForReview([]);
    setIsSubmitted(false);
    setShowResult(false);
    setTimeLeft(totalQuestions * 60);
    localStorage.removeItem(localStorageKey);
  }, [totalQuestions, localStorageKey]);

  return {
    currentQuestion,
    selectedAnswers,
    visitedQuestions,
    markedForReview,
    isSubmitted,
    isSubmitting,
    timeLeft,
    showResult,
    handleSelectAnswer,
    toggleMarkForReview,
    jumpToQuestion,
    handleNext,
    handlePrev,
    handleRestart,
    setIsSubmitted,
    setShowResult,
    setIsSubmitting,
    localStorageKey,
  };
}

/* ═══════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════ */
function QuizProgress({ total, answeredCount }: { total: number; answeredCount: number }) {
  const percentage = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const remaining = total - answeredCount;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Progress</span>
        <span className="text-lg font-bold text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span>Answered: <strong>{answeredCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-muted flex-shrink-0" />
          <span>Remaining: <strong>{remaining}</strong></span>
        </div>
      </div>
    </Card>
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
    <Card className="p-5 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Question Navigator</h3>
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
            borderClass = "border-primary shadow-sm ring-1 ring-primary/40";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "w-9 h-9 rounded-lg font-bold text-sm transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-muted flex-shrink-0" />
          <span>Not visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 flex-shrink-0" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500 flex-shrink-0" />
          <span>Review</span>
        </div>
      </div>
    </Card>
  );
}

function OptionItem({
  value,
  label,
  text,
  selected,
  disabled,
}: {
  value: string;
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "group w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer",
        selected
          ? "border-primary bg-primary/5 shadow-xs"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-75 cursor-not-allowed"
      )}
    >
      {/* Circle indicator */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: selected ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-2.5 h-2.5 bg-white rounded-full"
        />
      </div>

      <div className="flex gap-2 items-start text-sm select-none">
        <span className="font-bold text-muted-foreground">{label}.</span>
        <span className="font-medium text-foreground">{text}</span>
      </div>
    </RadioGroupPrimitive.Item>
  );
}

function QuestionCard({
  question,
  selectedOption,
  onSelect,
  isMarked,
  onToggleMark,
  disabled,
  questionNumber,
  totalQuestions,
  hasError,
}: {
  question: Question;
  selectedOption?: number;
  onSelect: (index: number) => void;
  isMarked: boolean;
  onToggleMark: () => void;
  disabled: boolean;
  questionNumber: number;
  totalQuestions: number;
  hasError?: boolean;
}) {
  return (
    <Card className={cn(
      "p-6 md:p-8 space-y-6 relative overflow-hidden border transition-all duration-200",
      hasError ? "border-destructive ring-1 ring-destructive/20 bg-destructive/5" : "border-border"
    )}>
      {/* Card Header Info */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h2 className="text-xl font-bold text-foreground mt-1">Practice Exam</h2>
        </div>

        {/* Mark for Review Button */}
        <button
          type="button"
          onClick={onToggleMark}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200",
            isMarked
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
              : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className={cn("w-4 h-4", isMarked && "fill-amber-500")} />
          {isMarked ? "Marked for Review" : "Mark for Review"}
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-bold text-foreground leading-relaxed">
        {question.question}
      </h3>

      {/* Options List */}
      <RadioGroup
        value={selectedOption !== undefined ? String(selectedOption) : ""}
        onValueChange={(val) => onSelect(parseInt(val))}
        className="space-y-3"
      >
        {question.options.map((option, index) => (
          <OptionItem
            key={index}
            value={String(index)}
            label={String.fromCharCode(65 + index)}
            text={option}
            selected={selectedOption === index}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </Card>
  );
}

function QuizNavigation({
  currentQuestion,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  disabled,
}: {
  currentQuestion: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === totalQuestions - 1;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={isFirst || disabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {isLast ? (
        <Button
          variant="accent"
          onClick={onSubmit}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-violet-500/20"
        >
          <CheckCircle className="w-4 h-4" />
          Submit Quiz
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={disabled}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function ResultSummary({
  total,
  correct,
  wrong,
  skipped,
  percentage,
  score,
  onRetry,
  onChangeMode,
}: {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  score: number;
  onRetry: () => void;
  onChangeMode: () => void;
}) {
  const animatedScore = useCounter(correct);
  const animatedPercent = useCounter(percentage);
  const animatedXp = useCounter(score, 1200);

  let rating = "Needs Improvement";
  let badgeColor = "from-red-500 to-orange-500 shadow-red-500/20";
  if (percentage >= 95) {
    rating = "Outstanding";
    badgeColor = "from-violet-600 to-fuchsia-600 shadow-violet-500/20";
  } else if (percentage >= 80) {
    rating = "Excellent";
    badgeColor = "from-emerald-500 to-teal-500 shadow-emerald-500/20";
  } else if (percentage >= 70) {
    rating = "Good";
    badgeColor = "from-blue-500 to-indigo-500 shadow-blue-500/20";
  } else if (percentage >= 50) {
    rating = "Average";
    badgeColor = "from-amber-500 to-orange-500 shadow-amber-500/20";
  }

  // Trigger confetti if score is high
  useEffect(() => {
    if (percentage >= 90) {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [percentage]);

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/20 border border-border max-w-2xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
          <Trophy className="text-white w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Quiz Completed!</h2>
        <p className="text-sm text-muted-foreground font-medium">Here is how you performed in this practice test</p>
      </div>

      {/* Large Rating Badge */}
      <div className={cn(
        "inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-extrabold text-lg bg-gradient-to-r shadow-lg",
        badgeColor
      )}>
        <Award className="w-5 h-5" />
        {rating}
      </div>

      {/* Main Score Board */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="bg-card border border-border p-5 rounded-2xl">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Correct Answers</p>
          <p className="text-4xl font-extrabold text-emerald-500 mt-2">
            {animatedScore} <span className="text-sm font-medium text-muted-foreground">/ {total}</span>
          </p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Percentage</p>
          <p className="text-4xl font-extrabold text-primary mt-2">
            {animatedPercent}%
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Wrong Answers</p>
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
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Success Rate</p>
          <p className="text-xl font-bold text-teal-500">{percentage}%</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Button onClick={onRetry} variant="primary" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Retry Quiz
        </Button>
        <Button onClick={onChangeMode} variant="secondary">
          Change Mode
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
    <div className="space-y-6 max-w-2xl mx-auto pt-8">
      <h3 className="text-lg font-bold text-foreground">Review Questions & Solutions</h3>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[idx];
          const isCorrect = selected === q.correctAnswer;
          const isSkipped = selected === undefined;

          let statusIcon = <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />;
          let statusText = "Correct Answer";
          let cardBorder = "border-emerald-500/20 bg-emerald-50/5";

          if (isSkipped) {
            statusIcon = <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />;
            statusText = "Skipped Question";
            cardBorder = "border-border bg-muted/10";
          } else if (!isCorrect) {
            statusIcon = <XCircle className="w-5 h-5 text-destructive mt-0.5" />;
            statusText = "Incorrect Answer";
            cardBorder = "border-destructive/20 bg-destructive/5";
          }

          return (
            <Card key={idx} className={cn("p-6 border text-left", cardBorder)}>
              <div className="flex gap-3">
                {statusIcon}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Question {idx + 1} · {statusText}
                    </span>
                    <h4 className="font-bold text-foreground text-base">{q.question}</h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === oIdx;
                      const isOptionCorrect = oIdx === q.correctAnswer;

                      let optBorder = "border-border";
                      let optBg = "bg-card";
                      let optIcon = null;

                      if (isOptionCorrect) {
                        optBorder = "border-emerald-500";
                        optBg = "bg-emerald-500/5";
                        optIcon = <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />;
                      } else if (isOptionSelected) {
                        optBorder = "border-destructive";
                        optBg = "bg-destructive/5";
                        optIcon = <XCircle className="w-4 h-4 text-destructive" />;
                      }

                      return (
                        <div
                          key={oIdx}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-sm",
                            optBorder,
                            optBg
                          )}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center border border-muted-foreground/30 flex-shrink-0 bg-background text-[11px] font-bold">
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1 font-medium">{opt}</span>
                          {optIcon}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Alert */}
                  <div className="mt-3 p-4 bg-muted/30 border border-border rounded-xl text-xs leading-relaxed text-muted-foreground">
                    <p className="font-bold text-foreground mb-1">Explanation:</p>
                    {q.explanation || `Option ${String.fromCharCode(65 + q.correctAnswer)} is the correct answer because it satisfies the question requirements.`}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
export default function Quiz() {
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [seenQuestionTexts, setSeenQuestionTexts] = useState<string[]>([]);
  
  // Sync seen questions list on category change
  useEffect(() => {
    if (!quizMode) {
      setSeenQuestionTexts([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`smart_ai_lms_seen_questions_${quizMode}`);
      setSeenQuestionTexts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setSeenQuestionTexts([]);
    }
  }, [quizMode]);

  const getQuizTopic = (mode: QuizMode): string => {
    const topics: Record<QuizMode, string> = {
      "nursery-lkg": "Colors, Numbers, and Basic Shapes",
      "class-1-5": "Arithmetic, Basic Science, and General Trivia",
      "class-6-10": "Algebra, General Physics, and World History",
      "class-11-12": "Calculus, Chemistry Reactions, and Mechanics",
      "jee-neet": "Electrochemistry, Newton Laws, and Cell Biology",
      "engineering": "Time Complexity, Database Management, and Operating Systems",
      "gate": "Linear Algebra, Graph Theory, and Computer Networks",
      "cat": "Quantitative Ability and Data Interpretation",
      "defence": "Indian Armed Forces History and Aptitude",
      "upsc": "Constitution Articles and Geography",
      "ssc": "Indian History and Quantitative Aptitude",
      "banking": "Monetary Policy and Logical Reasoning",
      "railway": "General Science and Arithmetic Questions",
      "general-knowledge": "Current Affairs and International Relations",
      "english": "Synonyms, Antonyms, and Sentence Correction",
      "mathematics": "Algebra, Trigonometry, and Statistics",
      "science": "Chemical Symbols, Anatomy, and Physics Units",
    };
    return topics[mode] || "General Knowledge";
  };

  // Fetch questions from Backend using Groq
  useEffect(() => {
    if (!quizMode) {
      setQuestions([]);
      return;
    }

    const fetchAIQuestions = async () => {
      setLoadingQuestions(true);
      setGenerationError(null);
      try {
        const savedSeenStr = localStorage.getItem(`smart_ai_lms_seen_questions_${quizMode}`);
        const currentSeen: string[] = savedSeenStr ? JSON.parse(savedSeenStr) : [];

        const response = await apiRequest<{ questions: any[] }>("/mocktest/generate", {
          method: "POST",
          body: JSON.stringify({
            subject: getQuizTitle(),
            topic: getQuizTopic(quizMode),
            excludeQuestions: currentSeen
          })
        });

        if (response && response.questions && response.questions.length > 0) {
          const normalized = response.questions.map((q: any, index: number) => {
            let correctAnswerIdx = 0;
            if (q.correctAnswer !== undefined) {
              correctAnswerIdx = typeof q.correctAnswer === "number"
                ? q.correctAnswer
                : parseInt(q.correctAnswer) || 0;
            } else if (q.answer !== undefined) {
              correctAnswerIdx = q.options.indexOf(q.answer);
              if (correctAnswerIdx === -1) {
                correctAnswerIdx = q.options.findIndex(
                  (opt: string) => opt.trim().toLowerCase() === q.answer?.trim().toLowerCase()
                );
              }
              if (correctAnswerIdx === -1) {
                // Also check if they sent choice letter (A, B, C, D)
                const charCode = q.answer.trim().toUpperCase().charCodeAt(0);
                if (charCode >= 65 && charCode <= 68) {
                  correctAnswerIdx = charCode - 65;
                } else {
                  correctAnswerIdx = 0;
                }
              }
            }

            return {
              id: index + 1,
              question: q.question,
              options: q.options,
              correctAnswer: correctAnswerIdx,
              explanation: q.explanation || `Option ${String.fromCharCode(65 + correctAnswerIdx)} is correct.`
            };
          });

          setQuestions(normalized);

          // Append newly generated questions to seen list
          const loadedQuestions = normalized.map(q => q.question);
          const updatedSeen = [...currentSeen, ...loadedQuestions];
          if (updatedSeen.length > 40) {
            updatedSeen.splice(0, updatedSeen.length - 40);
          }
          setSeenQuestionTexts(updatedSeen);
          localStorage.setItem(`smart_ai_lms_seen_questions_${quizMode}`, JSON.stringify(updatedSeen));
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
        console.error("AI Question generation failed:", err);
        setQuestions([]);
        setGenerationError("AI Engine Offline. Could not generate practice questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchAIQuestions();
  }, [quizMode]);

  const {
    currentQuestion,
    selectedAnswers,
    visitedQuestions,
    markedForReview,
    isSubmitted,
    isSubmitting,
    timeLeft,
    showResult,
    handleSelectAnswer,
    toggleMarkForReview,
    jumpToQuestion,
    handleNext,
    handlePrev,
    handleRestart,
    setIsSubmitted,
    setShowResult,
    setIsSubmitting,
    localStorageKey,
  } = useQuizState(quizMode, questions.length);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const question = questions[currentQuestion];
  const total = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSubmitClick = () => {
    setValidationError(null);
    
    // Check if unanswered questions exist
    const unanswered: number[] = [];
    for (let i = 0; i < total; i++) {
      if (selectedAnswers[i] === undefined) {
        unanswered.push(i);
      }
    }

    if (unanswered.length > 0) {
      setValidationError(`You still have ${unanswered.length} unanswered questions.`);
      // Automatically jump to the first unanswered question
      jumpToQuestion(unanswered[0]);
      return;
    }

    // Open confirmation dialog
    setIsAlertOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsAlertOpen(false);
    setIsSubmitting(true);

    try {
      await apiRequest("/mocktest/submit", {
        method: "POST",
        body: JSON.stringify({
          subject: getQuizTitle(),
          topic: getQuizTopic(quizMode!),
          totalQuestions: total,
          correctAnswers: correct,
          weakAreas: wrong > 0 ? ["Practice Review"] : []
        })
      });
    } catch (err) {
      console.error("Failed to submit quiz to backend database:", err);
    } finally {
      setIsSubmitted(true);
      setShowResult(true);
      setIsSubmitting(false);
      localStorage.removeItem(localStorageKey);
    }
  };

  const handleRestartQuiz = () => {
    handleRestart();
    setValidationError(null);
  };

  const handleModeSelect = (mode: QuizMode) => {
    setQuizMode(mode);
    setValidationError(null);
  };

  const getQuizTitle = () => {
    const titles: Record<QuizMode, string> = {
      "nursery-lkg": "Nursery - LKG Quiz",
      "class-1-5": "Class 1-5 Quiz",
      "class-6-10": "Class 6-10 Quiz",
      "class-11-12": "Class 11-12 Quiz",
      "jee-neet": "JEE/NEET Quiz",
      "engineering": "Engineering Quiz",
      "gate": "GATE Quiz",
      "cat": "CAT Quiz",
      "defence": "Defence Preparation Quiz",
      "upsc": "UPSC Quiz",
      "ssc": "SSC Quiz",
      "banking": "Banking Quiz",
      "railway": "Railway Quiz",
      "general-knowledge": "General Knowledge Quiz",
      "english": "English Quiz",
      "mathematics": "Mathematics Quiz",
      "science": "Science Quiz",
    };
    return quizMode ? titles[quizMode] : "";
  };

  // Compute metrics
  const correct = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);
  const wrong = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correctAnswer ? 1 : 0);
  }, 0);
  const skipped = total - (correct + wrong);
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreXp = correct * 50;

  if (!quizMode) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Practice Arena</h1>
          <p className="text-muted-foreground mt-1 font-medium">Choose your quiz category to get started</p>
        </div>

        {/* School Level */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <School size={24} className="text-primary" />
            School Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card onClick={() => handleModeSelect("nursery-lkg")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-pink-500/5 to-pink-400/5 border border-transparent hover:border-pink-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center">
                  <Baby className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Nursery - LKG</h3>
                <p className="text-xs text-muted-foreground font-medium">Colors, Numbers, Basic Learning</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("class-1-5")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-transparent hover:border-blue-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Class 1-5</h3>
                <p className="text-xs text-muted-foreground font-medium">Primary School Level</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("class-6-10")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border border-transparent hover:border-indigo-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <School className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Class 6-10</h3>
                <p className="text-xs text-muted-foreground font-medium">Middle & High School</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("class-11-12")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-transparent hover:border-violet-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Class 11-12</h3>
                <p className="text-xs text-muted-foreground font-medium">Senior Secondary</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Competitive Exams */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <GraduationCap size={24} className="text-primary" />
            Competitive Exams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card onClick={() => handleModeSelect("jee-neet")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-primary/5 to-secondary/5 border border-transparent hover:border-primary/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <GraduationCap className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">JEE / NEET</h3>
                <p className="text-xs text-muted-foreground font-medium">Engineering & Medical</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("engineering")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-accent/5 to-purple-500/5 border border-transparent hover:border-accent/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <Rocket className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Engineering</h3>
                <p className="text-xs text-muted-foreground font-medium">CS, DSA, DBMS</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("gate")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-600/5 to-pink-500/5 border border-transparent hover:border-purple-600/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <Award className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">GATE</h3>
                <p className="text-xs text-muted-foreground font-medium">Engineering Entrance</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("cat")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-transparent hover:border-amber-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Briefcase className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">CAT</h3>
                <p className="text-xs text-muted-foreground font-medium">MBA Entrance</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Government Jobs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Landmark size={24} className="text-primary" />
            Government Jobs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card onClick={() => handleModeSelect("defence")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-green-600/5 to-green-500/5 border border-transparent hover:border-green-600/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Defence</h3>
                <p className="text-xs text-muted-foreground font-medium">NDA, CDS, AFCAT</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("upsc")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-red-600/5 to-orange-600/5 border border-transparent hover:border-red-600/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                  <Landmark className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">UPSC</h3>
                <p className="text-xs text-muted-foreground font-medium">Civil Services</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("ssc")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-transparent hover:border-teal-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <Globe className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">SSC</h3>
                <p className="text-xs text-muted-foreground font-medium">Staff Selection</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("banking")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-sky-500/5 to-blue-600/5 border border-transparent hover:border-sky-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Banknote className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Banking</h3>
                <p className="text-xs text-muted-foreground font-medium">IBPS, SBI, RBI</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("railway")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-slate-600/5 to-gray-600/5 border border-transparent hover:border-slate-600/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-gray-600 flex items-center justify-center">
                  <Train className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Railway</h3>
                <p className="text-xs text-muted-foreground font-medium">RRB, ALP, Group D</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Subject Wise */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Brain size={24} className="text-primary" />
            Subject Wise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card onClick={() => handleModeSelect("general-knowledge")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-transparent hover:border-orange-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Brain className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">General Knowledge</h3>
                <p className="text-xs text-muted-foreground font-medium">History, Geography, GK</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("english")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-rose-500/5 to-pink-500/5 border border-transparent hover:border-rose-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Languages className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">English</h3>
                <p className="text-xs text-muted-foreground font-medium">Grammar, Vocabulary</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("mathematics")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-transparent hover:border-cyan-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Calculator className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Mathematics</h3>
                <p className="text-xs text-muted-foreground font-medium">Arithmetic, Algebra</p>
              </div>
            </Card>

            <Card onClick={() => handleModeSelect("science")} className="p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-br from-lime-500/5 to-green-500/5 border border-transparent hover:border-lime-500/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center">
                  <FlaskConical className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-foreground">Science</h3>
                <p className="text-xs text-muted-foreground font-medium">Physics, Chemistry, Biology</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 pb-12">
        <ResultSummary
          total={total}
          correct={correct}
          wrong={wrong}
          skipped={skipped}
          percentage={percentage}
          score={scoreXp}
          onRetry={handleRestartQuiz}
          onChangeMode={() => setQuizMode(null)}
        />
        <AnswerReview
          questions={questions}
          selectedAnswers={selectedAnswers}
        />
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Brain className="text-primary w-8 h-8 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold text-foreground">Generating AI Practice Set</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm">
            Groq AI is assembling custom adaptive questions matching your syllabus for {getQuizTitle()}...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="text-destructive w-12 h-12" />
        <h2 className="text-xl font-extrabold text-foreground">Failed to Load Questions</h2>
        <p className="text-sm text-muted-foreground font-medium">Please check your network and try again.</p>
        <Button onClick={() => setQuizMode(null)} variant="primary">
          Back to Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24 lg:pb-6 relative">
      {/* Generation error warning banner */}
      {generationError && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{generationError}</span>
        </div>
      )}

      {/* Quiz Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{getQuizTitle()}</h1>
          <p className="text-sm text-muted-foreground font-medium">Practice Arena Test Session</p>
        </div>

        {/* Clock/Timer Component */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-sm transition-colors duration-300",
          timeLeft < 60
            ? "border-destructive/30 bg-destructive/10 text-destructive animate-pulse"
            : "border-border bg-card text-foreground"
        )}>
          <Clock className="w-4 h-4" />
          <span>Remaining: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold animate-in fade-in-50 duration-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Sub-layout: Sidebar Navigator & Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Question Card and Bottom buttons */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animated Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <QuestionCard
                question={question}
                selectedOption={selectedAnswers[currentQuestion]}
                onSelect={(optIdx) => handleSelectAnswer(currentQuestion, optIdx)}
                isMarked={markedForReview.includes(currentQuestion)}
                onToggleMark={() => toggleMarkForReview(currentQuestion)}
                disabled={isSubmitting}
                questionNumber={currentQuestion + 1}
                totalQuestions={total}
                hasError={validationError !== null && selectedAnswers[currentQuestion] === undefined}
              />
            </motion.div>
          </AnimatePresence>

          {/* Desktop Navigation */}
          <div className="hidden lg:block pt-2">
            <QuizNavigation
              currentQuestion={currentQuestion}
              totalQuestions={total}
              onPrev={handlePrev}
              onNext={handleNext}
              onSubmit={handleSubmitClick}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right Side: Progress Indicator and Navigator Grid */}
        <div className="space-y-6">
          <QuizProgress total={total} answeredCount={answeredCount} />
          <QuestionPalette
            total={total}
            current={currentQuestion}
            selectedAnswers={selectedAnswers}
            visitedQuestions={visitedQuestions}
            markedForReview={markedForReview}
            onSelect={jumpToQuestion}
          />
          <Button
            variant="ghost"
            onClick={() => setQuizMode(null)}
            disabled={isSubmitting}
            className="w-full border border-border rounded-xl text-xs py-2 hover:bg-muted font-bold"
          >
            Cancel Test Session
          </Button>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-40">
        <QuizNavigation
          currentQuestion={currentQuestion}
          totalQuestions={total}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleSubmitClick}
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered all {total} questions. Once submitted, your answers cannot be changed. Are you sure you want to finish the exam?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSubmit();
              }}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay when Submitting */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
          <p className="font-bold text-sm">Grading exam submission...</p>
        </div>
      )}
    </div>
  );
}
