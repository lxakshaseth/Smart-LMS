/**
 * Universal Educational Video Category Mapping Utility
 * Provides clean, class-free educational categories, recommendations, and queries.
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

export const UNIVERSAL_RECOMMENDED_QUERIES = [
  "Full Stack Web Development MERN Tutorial",
  "Data Structures & Algorithms Complete Course",
  "Machine Learning & Artificial Intelligence Crash Course",
  "System Design & Coding Interview Preparation",
  "Python for Beginners to Advanced Full Course",
  "Calculus & Higher Mathematics Tutorials",
  "Operating Systems & Computer Networks Deep Dive"
];

export function getExamMapping(targetExam?: string): ExamMapping {
  return {
    examName: "Universal Learning",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "Educational Tutorials Courses & Skills",
    recommendedQueries: UNIVERSAL_RECOMMENDED_QUERIES,
    searchPrefix: ""
  };
}

/**
 * Builds sanitized search query without class/exam restrictions
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
  return "Educational Tutorials Courses";
}
