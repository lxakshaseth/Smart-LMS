const DEFAULT_TARGET_EXAM = "Class 10 Boards";

/**
 * Reusable backend helper to resolve the active Target Exam.
 * Priority:
 * 1. Explicit payload value passed in request (fallbackExam)
 * 2. Logged-in user profile from Database (user.exam)
 * 3. Default fallback ("Class 10 Boards")
 *
 * @param {Object} [user] - Mongoose User document or user object
 * @param {string} [fallbackExam] - Optional exam string passed from client request
 * @returns {string} Target Exam string
 */
function getCurrentTargetExam(user, fallbackExam = "") {
  if (fallbackExam && typeof fallbackExam === "string" && fallbackExam.trim().length > 0) {
    return fallbackExam.trim();
  }

  if (user && user.exam && typeof user.exam === "string" && user.exam.trim().length > 0) {
    return user.exam.trim();
  }

  return DEFAULT_TARGET_EXAM;
}

module.exports = {
  DEFAULT_TARGET_EXAM,
  getCurrentTargetExam,
};
