import { User } from "../context/AuthContext";

export const DEFAULT_TARGET_EXAM = "Class 10 Boards";

export const EXAM_OPTIONS = [
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

  // 4. Default fallback (Never hardcoded Nursery-LKG)
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
