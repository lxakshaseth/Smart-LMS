/**
 * Universal Educational Category Mapping Utility (Backend)
 */

const UNIVERSAL_CATEGORIES = [
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

const UNIVERSAL_RECOMMENDED_QUERIES = [
  "Full Stack Web Development MERN Tutorial",
  "Data Structures & Algorithms Complete Course",
  "Machine Learning & Artificial Intelligence Crash Course",
  "System Design & Coding Interview Preparation",
  "Python for Beginners to Advanced Full Course",
  "Calculus & Higher Mathematics Tutorials",
  "Operating Systems & Computer Networks Deep Dive"
];

function getExamMapping(targetExam) {
  return {
    examName: "Universal Learning",
    categories: UNIVERSAL_CATEGORIES,
    defaultQuery: "Educational Tutorials Courses & Skills",
    recommendedQueries: UNIVERSAL_RECOMMENDED_QUERIES,
    searchPrefix: ""
  };
}

module.exports = {
  getExamMapping,
  UNIVERSAL_CATEGORIES,
  UNIVERSAL_RECOMMENDED_QUERIES
};
