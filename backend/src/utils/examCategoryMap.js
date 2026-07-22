/**
 * Backend Exam Category Mapping Utility
 * Enforces strict isolation per Target Exam for YouTube API requests.
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
    defaultQuery: "GATE Computer Science Operating System DBMS Networks",
    recommendedQueries: [
      "GATE CS Operating Systems & Architecture",
      "GATE Data Structures & Algorithms",
      "GATE Computer Networks & DBMS",
      "GATE Engineering Mathematics & General Aptitude"
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
  },
  "SSC CGL": {
    examName: "SSC CGL",
    defaultQuery: "SSC CGL Quantitative Aptitude Reasoning English General Awareness",
    recommendedQueries: [
      "SSC CGL Maths & Quant Tricks",
      "SSC CGL Logical Reasoning",
      "SSC CGL English Grammar & Vocab",
      "SSC CGL General Awareness & GK"
    ],
    searchPrefix: "SSC CGL"
  },
  "IBPS/SBI": {
    examName: "IBPS/SBI",
    defaultQuery: "IBPS SBI Banking Awareness Quant Reasoning English",
    recommendedQueries: [
      "Banking Awareness & Current Affairs",
      "SBI IBPS PO Quant & DI Shortcuts",
      "Bank Exam Puzzles & Reasoning",
      "Bank Exam English Grammar"
    ],
    searchPrefix: "Banking"
  },
  "Railway RRB": {
    examName: "Railway RRB",
    defaultQuery: "Railway RRB Mathematics Reasoning General Science",
    recommendedQueries: [
      "Railway RRB Maths Full Course",
      "Railway RRB Reasoning Tricks",
      "Railway RRB General Science Physics Chemistry Biology",
      "Railway RRB General Knowledge & Current Affairs"
    ],
    searchPrefix: "Railway RRB"
  },
  "NDA/CDS": {
    examName: "NDA/CDS",
    defaultQuery: "NDA CDS Mathematics English General Knowledge",
    recommendedQueries: [
      "NDA CDS Mathematics Tricks & Formulae",
      "NDA CDS English Grammar & Comprehension",
      "NDA CDS General Knowledge & Defense Awareness",
      "NDA CDS Past Year Paper Solutions"
    ],
    searchPrefix: "NDA CDS"
  }
};

function getExamMapping(targetExam) {
  if (!targetExam) {
    return {
      examName: "General",
      defaultQuery: "Educational Tutorials Courses",
      recommendedQueries: ["Programming Tutorials", "Mathematics Concepts", "Science Experiments"],
      searchPrefix: ""
    };
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
  EXAM_MAP,
  getExamMapping
};
