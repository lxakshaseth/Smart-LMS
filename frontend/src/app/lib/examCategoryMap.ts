/**
 * Exam & Subject Category Mapping Utility (Frontend)
 * Preserves personalized default queries and recommendations for user's profile / target exam
 * while enabling completely unrestricted global searches when a search term is entered.
 */

export interface ExamMapping {
  examName: string;
  categories: string[];
  defaultQuery: string;
  recommendedQueries: string[];
  searchPrefix: string;
}

export const UNIVERSAL_CATEGORIES = [
  "All",
  "Programming & Tech",
  "AI & Data Science",
  "Core Computer Science",
  "Interview Prep",
  "Academics & Science",
  "Competitive Exams",
  "Design & Creative",
  "Business & Career"
];

export const EXAM_MAP: Record<string, ExamMapping> = {
  "Engineering": {
    examName: "Engineering",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "Engineering Physics Mathematics Computer Science Mechanics",
    recommendedQueries: [
      "Engineering Physics & Mechanics Full Course",
      "Data Structures & Algorithms in Engineering",
      "Engineering Mathematics Calculus & Linear Algebra",
      "Electrical & Electronics Engineering Basics"
    ],
    searchPrefix: "Engineering"
  },
  "Class 10 Boards": {
    examName: "Class 10 Boards",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "Class 10 Science Mathematics NCERT CBSE Boards",
    recommendedQueries: [
      "Class 10 Mathematics Full Course",
      "Class 10 Science Chapter Wise Revision",
      "Class 10 English Grammar & Literature",
      "CBSE Class 10 Board Exam Strategy & Sample Papers"
    ],
    searchPrefix: "Class 10"
  },
  "Class 12 Boards": {
    examName: "Class 12 Boards",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "Class 12 Physics Chemistry Mathematics CBSE Boards",
    recommendedQueries: [
      "Class 12 Physics CBSE Board Preparation",
      "Class 12 Chemistry One Shot Revision",
      "Class 12 Mathematics Calculus & Vectors",
      "Class 12 Board Exam Sample Papers"
    ],
    searchPrefix: "Class 12"
  },
  "JEE Main": {
    examName: "JEE Main",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "JEE Main Physics Chemistry Mathematics Full Course",
    recommendedQueries: [
      "JEE Main Physics One Shot",
      "JEE Organic & Inorganic Chemistry",
      "JEE Mathematics Calculus & Algebra",
      "JEE Main Past 10 Years Question Solving"
    ],
    searchPrefix: "JEE Main"
  },
  "JEE Advanced": {
    examName: "JEE Advanced",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "JEE Advanced Physics Chemistry Mathematics Problem Solving",
    recommendedQueries: [
      "JEE Advanced Physics Mechanics & Electrodynamics",
      "JEE Advanced Organic Reaction Mechanisms",
      "JEE Advanced Calculus & Coordinate Geometry",
      "JEE Advanced Tough Problem Solving"
    ],
    searchPrefix: "JEE Advanced"
  },
  "NEET": {
    examName: "NEET",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "NEET Biology Physics Chemistry NCERT Coverage",
    recommendedQueries: [
      "NEET Biology Full NCERT Coverage",
      "NEET Physics Important Numericals",
      "NEET Organic Chemistry Mechanisms",
      "NEET Top Priority Chapter Revisions"
    ],
    searchPrefix: "NEET"
  },
  "GATE": {
    examName: "GATE",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "GATE Computer Science Data Structures Algorithms OS DBMS",
    recommendedQueries: [
      "GATE CS Algorithms & Data Structures",
      "GATE Operating Systems & Computer Networks",
      "GATE DBMS & Theory of Computation",
      "GATE Engineering Mathematics Shortcuts"
    ],
    searchPrefix: "GATE"
  },
  "CAT": {
    examName: "CAT",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "CAT Quantitative Aptitude DILR VARC Preparation",
    recommendedQueries: [
      "CAT Quantitative Aptitude Shortcuts & Concepts",
      "CAT Data Interpretation & Logical Reasoning",
      "CAT Verbal Ability & Reading Comprehension",
      "CAT Mock Test Solving Strategy"
    ],
    searchPrefix: "CAT"
  },
  "UPSC": {
    examName: "UPSC",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "UPSC Indian Polity History Geography Economy Current Affairs",
    recommendedQueries: [
      "UPSC Indian Polity & Constitution",
      "UPSC Modern Indian History",
      "UPSC Indian Economy & Budget",
      "UPSC Geography & Environment"
    ],
    searchPrefix: "UPSC"
  }
};

export function getExamMapping(targetExam?: string): ExamMapping {
  if (!targetExam) {
    return EXAM_MAP["Class 12 Boards"];
  }

  for (const key of Object.keys(EXAM_MAP)) {
    if (targetExam.toLowerCase() === key.toLowerCase() || targetExam.toLowerCase().includes(key.toLowerCase())) {
      return EXAM_MAP[key];
    }
  }

  if (targetExam.toLowerCase().includes("class 10") || targetExam.toLowerCase().includes("10th")) {
    return EXAM_MAP["Class 10 Boards"];
  }
  if (targetExam.toLowerCase().includes("class 12") || targetExam.toLowerCase().includes("12th")) {
    return EXAM_MAP["Class 12 Boards"];
  }
  if (targetExam.toLowerCase().includes("jee")) {
    return EXAM_MAP["JEE Main"];
  }
  if (targetExam.toLowerCase().includes("neet")) {
    return EXAM_MAP["NEET"];
  }
  if (targetExam.toLowerCase().includes("gate")) {
    return EXAM_MAP["GATE"];
  }
  if (targetExam.toLowerCase().includes("upsc")) {
    return EXAM_MAP["UPSC"];
  }

  return {
    examName: targetExam,
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: `${targetExam} Full Course Tutorials`,
    recommendedQueries: [
      `${targetExam} Full Course`,
      `${targetExam} Problem Solving`,
      `${targetExam} Strategy & Tips`
    ],
    searchPrefix: targetExam
  };
}

/**
 * Builds search query:
 * - If user types rawQuery: returns rawQuery EXACTLY AS IS (global search across all YouTube content)
 * - If rawQuery is empty & category selected: returns `${category} course tutorial`
 * - If rawQuery is empty & no category selected: returns personalized default query based on targetExam
 */
export function buildSanitizedSearchQuery(
  rawQuery: string,
  category: string,
  targetExam?: string,
  weakSubject?: string
): string {
  const cleanQuery = rawQuery.trim();
  if (cleanQuery) return cleanQuery;
  if (category && category !== "All") return `${category} course tutorial`;
  if (weakSubject && weakSubject !== "None" && weakSubject !== "All Subjects Good") return `${weakSubject} tutorial`;
  
  const mapping = getExamMapping(targetExam);
  return mapping.defaultQuery;
}
