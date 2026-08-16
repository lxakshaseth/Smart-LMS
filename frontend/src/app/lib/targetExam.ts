import { User } from "../context/AuthContext";

export const DEFAULT_TARGET_EXAM = "Class 10 Boards";

export const EXAM_OPTIONS = [
  "Engineering",
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "GATE",
  "CAT",
  "UPSC",
  "SSC CGL",
  "IBPS PO",
  "NDA/CDS",
  "Railway RRB",
  "Class 10 Boards",
  "Class 12 Boards",
  "Other"
];

/**
 * Single source of truth helper to retrieve the user's active Target Exam.
 * Priority:
 * 1. Logged-in user's profile (user.exam)
 * 2. Database / Auth State
 * 3. localStorage ("targetExam" or "user")
 * 4. Fallback default ("Class 10 Boards")
 */
export function getCurrentTargetExam(user?: Partial<User> | null): string {
  // 1 & 2. Check active user object from AuthContext
  if (user?.exam && typeof user.exam === "string" && user.exam.trim().length > 0) {
    return user.exam.trim();
  }

  // 3. Check localStorage
  if (typeof window !== "undefined") {
    try {
      const storedExam = localStorage.getItem("targetExam");
      if (storedExam && storedExam.trim().length > 0) {
        return storedExam.trim();
      }

      const storedUserRaw = localStorage.getItem("user");
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed?.exam && typeof parsed.exam === "string" && parsed.exam.trim().length > 0) {
          return parsed.exam.trim();
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  // 4. Default fallback
  return DEFAULT_TARGET_EXAM;
}

/**
 * Update the stored target exam in localStorage
 */
export function setCurrentTargetExam(exam: string): void {
  if (typeof window !== "undefined" && exam && exam.trim().length > 0) {
    try {
      localStorage.setItem("targetExam", exam.trim());
    } catch {
      // Ignore storage errors
    }
  }
}

export interface ExamPromptItem {
  iconType: string;
  text: string;
}

export const EXAM_PROMPTS_MAP: Record<string, ExamPromptItem[]> = {
  "Engineering": [
    { iconType: "Lightbulb", text: "Explain Newton's Laws & classical mechanics with applications" },
    { iconType: "Code", text: "Build a MERN stack authentication & REST API system" },
    { iconType: "Cpu", text: "Explain Fourier Transform & Signals and Systems basics" },
    { iconType: "Terminal", text: "Difference between Machine Learning and Deep Learning" },
    { iconType: "BookOpen", text: "Solve partial differential equations & multivariable calculus" },
    { iconType: "FileText", text: "Summarize my uploaded PDF lecture slides or research paper" },
    { iconType: "HelpCircle", text: "Prepare me for Core Engineering & Tech interview questions" },
    { iconType: "Cpu", text: "Explain Operating Systems, Process Management & Paging" }
  ],
  "JEE Main": [
    { iconType: "Sparkles", text: "Explain Rotational Dynamics & Torque numerical tricks for JEE Main" },
    { iconType: "FlaskConical", text: "How to master Reaction Mechanisms in Organic Chemistry for JEE Main" },
    { iconType: "Calculator", text: "Shortcut techniques to solve Integration & Differential Calculus in JEE Main" },
    { iconType: "Sparkles", text: "10-Month high-yield study plan & mock test strategy for JEE Main" },
    { iconType: "Atom", text: "Important formulas & rapid revision for Thermodynamics & Electrostatics" },
    { iconType: "BookOpen", text: "Solve a sample JEE Main level physics numerical step-by-step" },
    { iconType: "FileText", text: "Summarize my JEE chemistry revision notes & NCERT key points" },
    { iconType: "HelpCircle", text: "How to manage time & avoid negative marking in JEE Main CBT exam" }
  ],
  "JEE Advanced": [
    { iconType: "Atom", text: "Solve a multi-concept JEE Advanced Physics problem on Electromagnetism" },
    { iconType: "FlaskConical", text: "Explain Organic Synthesis & Named Reactions mechanism for JEE Advanced" },
    { iconType: "Calculator", text: "Tough coordinate geometry & complex numbers problem solving strategy" },
    { iconType: "Sparkles", text: "How to build deep problem-solving intuition for JEE Advanced rank under 1000" },
    { iconType: "BookOpen", text: "Analyze physical chemistry numericals with graphical interpretation" },
    { iconType: "Cpu", text: "Error analysis & experimental physics conceptual questions for JEE Advanced" },
    { iconType: "FileText", text: "Summarize key derivations & advanced problem patterns" },
    { iconType: "HelpCircle", text: "How to attempt multiple-choice questions with multiple correct options" }
  ],
  "NEET": [
    { iconType: "Dna", text: "High-yield NCERT Biology revision for Genetics & Molecular Basis of Inheritance" },
    { iconType: "FlaskConical", text: "Important reactions & memory tricks for Inorganic Chemistry NEET questions" },
    { iconType: "Atom", text: "Step-by-step numerical solving method for NEET Physics Optics & Mechanics" },
    { iconType: "Sparkles", text: "Daily schedule to score 680+ in NEET UG exam with NCERT focus" },
    { iconType: "Dna", text: "Explain Human Physiology & Plant Physiology key diagrams & processes" },
    { iconType: "BookOpen", text: "Solve a NEET level assertion-reason & statement-based biology question" },
    { iconType: "FileText", text: "Summarize my NEET biology chapter notes into concise flashcard points" },
    { iconType: "HelpCircle", text: "How to master NCERT line-by-line reading for 360/360 in NEET Biology" }
  ],
  "GATE": [
    { iconType: "Code", text: "Explain Time Complexity analysis & Dynamic Programming tricks for GATE CS" },
    { iconType: "Cpu", text: "Operating Systems Virtual Memory & CPU Scheduling numericals for GATE" },
    { iconType: "Terminal", text: "Database Normalization (1NF to BCNF) & SQL query solving for GATE" },
    { iconType: "Sparkles", text: "6-Month preparation strategy & high-weightage topics breakdown for GATE" },
    { iconType: "Calculator", text: "Engineering Mathematics Probability & Linear Algebra shortcuts for GATE" },
    { iconType: "Code", text: "Explain Compiler Design Parsing & Computer Architecture Pipelining" },
    { iconType: "FileText", text: "Summarize GATE past year question patterns and formula handbook" },
    { iconType: "HelpCircle", text: "How to maximize accuracy and speed in GATE Virtual Calculator usage" }
  ],
  "CAT": [
    { iconType: "BarChart3", text: "How to solve complex Data Interpretation & Logical Reasoning (DILR) sets" },
    { iconType: "Calculator", text: "Quantitative Aptitude speed techniques for Arithmetic, Algebra & Modern Math" },
    { iconType: "BookOpen", text: "Reading Comprehension (VARC) strategies to improve accuracy & speed in CAT" },
    { iconType: "Sparkles", text: "Targeting 99+ percentile in CAT: Sectional time management & attempt strategy" },
    { iconType: "Calculator", text: "Shortcut methods for Permutations, Combinations & Probability in CAT" },
    { iconType: "HelpCircle", text: "How to analyze CAT mock tests and eliminate repeat mistakes" },
    { iconType: "FileText", text: "Summarize key vocabulary & passage comprehension techniques for VARC" },
    { iconType: "BarChart3", text: "Daily percentile-booster routine for CAT Quantitative Aptitude" }
  ],
  "UPSC": [
    { iconType: "BookOpen", text: "Explain Indian Polity: Fundamental Rights vs Directive Principles of State Policy" },
    { iconType: "FileText", text: "Key events & timeline of Modern Indian History from 1857 to 1947" },
    { iconType: "BarChart3", text: "Indian Economy & Budget analysis: Inflation, Monetary Policy & RBI measures" },
    { iconType: "Sparkles", text: "UPSC CSE Prelims strategy & Mains Answer Writing framework (GS1 to GS4)" },
    { iconType: "BookOpen", text: "Geography & Environment: Climate Change, Conventions & Biodiversity Hotspots" },
    { iconType: "HelpCircle", text: "How to structure a high-scoring GS Mains Answer with intro, body & conclusion" },
    { iconType: "FileText", text: "Summarize current affairs, editorial highlights & government schemes" },
    { iconType: "Calculator", text: "CSAT Paper II strategy: Comprehension, Reasoning & Quantitative Skills" }
  ],
  "SSC CGL": [
    { iconType: "Calculator", text: "Quantitative Aptitude tricks for Trigonometry, Geometry & Mensuration" },
    { iconType: "Sparkles", text: "Reasoning Ability shortcut techniques for Coding-Decoding & Syllogisms" },
    { iconType: "BookOpen", text: "English Language & Comprehension rules for Error Spotting & Cloze Test" },
    { iconType: "HelpCircle", text: "SSC CGL Tier-1 & Tier-2 complete preparation strategy & speed hacks" },
    { iconType: "FileText", text: "General Awareness: History, Polity, Geography & Science one-liners" },
    { iconType: "BarChart3", text: "How to solve 100 questions in 60 minutes with high accuracy in SSC CGL" },
    { iconType: "FileText", text: "Summarize important static GK facts and monthly current affairs" },
    { iconType: "Cpu", text: "Computer Knowledge module quick notes & practice questions for Tier-2" }
  ],
  "IBPS PO": [
    { iconType: "Calculator", text: "Quantitative Aptitude speed math: Data Interpretation & Quadratic Equations" },
    { iconType: "Sparkles", text: "Reasoning Ability: High-level Puzzles & Seating Arrangement solving techniques" },
    { iconType: "BookOpen", text: "English Language: Reading Comprehension, Error Detection & Sentence Rearrangement" },
    { iconType: "HelpCircle", text: "IBPS/SBI PO Prelims & Mains strategy to clear sectional & overall cutoffs" },
    { iconType: "FileText", text: "Banking Awareness, Financial Institutions & RBI Monetary Policy key notes" },
    { iconType: "FileText", text: "Descriptive English: Essay & Letter Writing formats for Bank PO Mains" },
    { iconType: "BarChart3", text: "Time management hacks for 20-minute sectional timers in Bank Exams" },
    { iconType: "Sparkles", text: "Summarize recent banking current affairs, mergers & economic updates" }
  ],
  "NDA/CDS": [
    { iconType: "Calculator", text: "Mathematics strategy for NDA: Trigonometry, Calculus & Probability key formulas" },
    { iconType: "Shield", text: "General Knowledge (GAT): Physics, Chemistry, History & Geography for NDA/CDS" },
    { iconType: "BookOpen", text: "English Language & Grammar rules for NDA/CDS written examination" },
    { iconType: "Sparkles", text: "Complete preparation roadmap for NDA/CDS & SSB Interview preparation" },
    { iconType: "Shield", text: "Defense Current Affairs, Military Exercises & Weapon Systems revision" },
    { iconType: "HelpCircle", text: "SSB Interview: OIR Test, PPDT, WAT, SRT & Personal Interview guidance" },
    { iconType: "FileText", text: "Summarize past year NDA/CDS question trends and high-yield topics" },
    { iconType: "Atom", text: "Strategy for General Science questions in CDS Examination" }
  ],
  "Railway RRB": [
    { iconType: "Calculator", text: "Mathematics speed tricks for Railway RRB NTPC & Group D exams" },
    { iconType: "Atom", text: "General Science: Physics, Chemistry & Biology NCERT concepts for Railway RRB" },
    { iconType: "Sparkles", text: "General Intelligence & Reasoning solving methods for Railway exams" },
    { iconType: "Train", text: "Railway RRB CBT-1 & CBT-2 preparation roadmap & score maximization" },
    { iconType: "Train", text: "General Awareness: Railway history, current affairs & static GK for RRB" },
    { iconType: "HelpCircle", text: "How to attempt CBT online test efficiently with high accuracy" },
    { iconType: "FileText", text: "Summarize important formulas and science one-liners for RRB exam" },
    { iconType: "BarChart3", text: "Daily mock test practice strategy & mock analysis for RRB" }
  ],
  "Class 10 Boards": [
    { iconType: "Atom", text: "Explain Class 10 Science: Chemical Reactions, Acids Bases & Electricity" },
    { iconType: "Calculator", text: "Class 10 Maths: Real Numbers, Quadratic Equations & Triangles theorems" },
    { iconType: "BookOpen", text: "Class 10 English Literature & Grammar sample answers for Board exams" },
    { iconType: "Sparkles", text: "CBSE/State Class 10 Board exam strategy to score 95%+ overall" },
    { iconType: "FileText", text: "Class 10 Social Science: Nationalism in Europe, Power Sharing & Agriculture" },
    { iconType: "HelpCircle", text: "How to write clear, step-by-step answers & draw diagrams in Science Board exam" },
    { iconType: "FileText", text: "Summarize my Class 10 chapter notes & NCERT exercise solutions" },
    { iconType: "Calculator", text: "Sample paper solving technique & time management for 3-hour Board exams" }
  ],
  "Class 12 Boards": [
    { iconType: "Atom", text: "Class 12 Physics: Electrostatics, Optics & Modern Physics key derivations" },
    { iconType: "FlaskConical", text: "Class 12 Chemistry: Organic Mechanisms, Electrochemistry & Coordination Compounds" },
    { iconType: "Calculator", text: "Class 12 Maths: Calculus (Integration & Differentiation), Vectors & 3D Geometry" },
    { iconType: "Sparkles", text: "CBSE Class 12 Board exam preparation plan to score 90%+ with NCERT" },
    { iconType: "Dna", text: "Class 12 Biology: Genetics, Biotechnology & Human Welfare key diagrams" },
    { iconType: "HelpCircle", text: "How to present answers, write steps & format numerical solutions in Board exams" },
    { iconType: "FileText", text: "Summarize Class 12 NCERT chapters into quick 1-page revision notes" },
    { iconType: "BookOpen", text: "3-Month revision timetable balancing Board exams and competitive entrance tests" }
  ],
  "Other": [
    { iconType: "Lightbulb", text: "Explain complex concepts in simple terms with real-world examples" },
    { iconType: "Code", text: "Help me learn programming, web development, or data science" },
    { iconType: "BookOpen", text: "Provide a step-by-step explanation for a math or science problem" },
    { iconType: "FileText", text: "Summarize my uploaded notes, PDF, or study document" },
    { iconType: "HelpCircle", text: "Prepare me for job interviews, aptitude tests, or career guidance" },
    { iconType: "Sparkles", text: "Help me build a personalized daily study schedule & goal tracker" },
    { iconType: "FileText", text: "Help me write essays, reports, or research summaries" },
    { iconType: "Cpu", text: "Explain effective study techniques like Spaced Repetition & Active Recall" }
  ]
};

export function getExamPrompts(targetExam?: string): ExamPromptItem[] {
  if (!targetExam) return EXAM_PROMPTS_MAP["Class 10 Boards"];

  const trimmed = targetExam.trim().toLowerCase();
  for (const key of Object.keys(EXAM_PROMPTS_MAP)) {
    if (key.toLowerCase() === trimmed || trimmed.includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed)) {
      return EXAM_PROMPTS_MAP[key];
    }
  }

  if (trimmed.includes("10th") || trimmed.includes("class 10")) return EXAM_PROMPTS_MAP["Class 10 Boards"];
  if (trimmed.includes("12th") || trimmed.includes("class 12")) return EXAM_PROMPTS_MAP["Class 12 Boards"];
  if (trimmed.includes("jee main")) return EXAM_PROMPTS_MAP["JEE Main"];
  if (trimmed.includes("jee adv")) return EXAM_PROMPTS_MAP["JEE Advanced"];
  if (trimmed.includes("jee")) return EXAM_PROMPTS_MAP["JEE Main"];
  if (trimmed.includes("neet")) return EXAM_PROMPTS_MAP["NEET"];
  if (trimmed.includes("gate")) return EXAM_PROMPTS_MAP["GATE"];
  if (trimmed.includes("cat")) return EXAM_PROMPTS_MAP["CAT"];
  if (trimmed.includes("upsc")) return EXAM_PROMPTS_MAP["UPSC"];
  if (trimmed.includes("ssc")) return EXAM_PROMPTS_MAP["SSC CGL"];
  if (trimmed.includes("ibps") || trimmed.includes("bank") || trimmed.includes("sbi")) return EXAM_PROMPTS_MAP["IBPS PO"];
  if (trimmed.includes("nda") || trimmed.includes("cds")) return EXAM_PROMPTS_MAP["NDA/CDS"];
  if (trimmed.includes("railway") || trimmed.includes("rrb")) return EXAM_PROMPTS_MAP["Railway RRB"];
  if (trimmed.includes("eng")) return EXAM_PROMPTS_MAP["Engineering"];

  return EXAM_PROMPTS_MAP["Other"];
}

