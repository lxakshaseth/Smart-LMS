/**
 * Exam & Subject Category Mapping Utility (Backend)
 * Provides personalized default queries and recommendations per target exam
 * while allowing global search queries to run cleanly without forced prefixing.
 */

const EXAM_MAP = {
  "Class 10 Boards": {
    examName: "Class 10 Boards",
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

function getExamMapping(targetExam) {
  if (!targetExam) {
    return {
      examName: "Class 12 Boards",
      categories: UNIVERSAL_CATEGORIES,
      defaultQuery: "Class 12 Physics Chemistry Mathematics CBSE Boards",
      recommendedQueries: EXAM_MAP["Class 12 Boards"].recommendedQueries,
      searchPrefix: "Class 12"
    };
  }

  for (const key of Object.keys(EXAM_MAP)) {
    if (targetExam.toLowerCase() === key.toLowerCase() || targetExam.toLowerCase().includes(key.toLowerCase())) {
      return {
        ...EXAM_MAP[key],
        categories: UNIVERSAL_CATEGORIES
      };
    }
  }

  if (targetExam.toLowerCase().includes("class 10") || targetExam.toLowerCase().includes("10th")) {
    return { ...EXAM_MAP["Class 10 Boards"], categories: UNIVERSAL_CATEGORIES };
  }
  if (targetExam.toLowerCase().includes("class 12") || targetExam.toLowerCase().includes("12th")) {
    return { ...EXAM_MAP["Class 12 Boards"], categories: UNIVERSAL_CATEGORIES };
  }
  if (targetExam.toLowerCase().includes("jee")) {
    return { ...EXAM_MAP["JEE Main"], categories: UNIVERSAL_CATEGORIES };
  }
  if (targetExam.toLowerCase().includes("neet")) {
    return { ...EXAM_MAP["NEET"], categories: UNIVERSAL_CATEGORIES };
  }
  if (targetExam.toLowerCase().includes("gate")) {
    return { ...EXAM_MAP["GATE"], categories: UNIVERSAL_CATEGORIES };
  }
  if (targetExam.toLowerCase().includes("upsc")) {
    return { ...EXAM_MAP["UPSC"], categories: UNIVERSAL_CATEGORIES };
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

module.exports = {
  getExamMapping,
  UNIVERSAL_CATEGORIES,
  EXAM_MAP
};
