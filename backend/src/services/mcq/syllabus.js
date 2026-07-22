/**
 * Comprehensive Syllabus Registry for Smart AI LMS Practice Arena
 */

const SYLLABUS_MAP = {
  // Competitive Exams
  Engineering: [
    "Data Structures & Algorithms",
    "Database Management Systems (SQL, Normalization, Transactions)",
    "Operating Systems (Process Management, Memory, Threading)",
    "Computer Networks (TCP/IP, Routing, OSI Model)",
    "Java Programming & JVM Concepts",
    "C++ Object-Oriented Design & Pointers",
    "Software Engineering & Agile Methodologies",
    "System Design & Microservices Principles"
  ],
  JEE: [
    "Physics: Kinematics, Thermodynamics, Optics, Modern Physics, Electromagnetism",
    "Chemistry: Physical Chemistry, Organic Reaction Mechanisms, Inorganic Periodic Trends",
    "Mathematics: Calculus, Coordinate Geometry, Algebra, Vectors & 3D Geometry, Trigonometry"
  ],
  NEET: [
    "Physics: Mechanics, Waves, Electricity & Magnetism, Optics, Dual Nature of Matter",
    "Chemistry: Chemical Bonding, Thermodynamics, Organic Chemistry, Biomolecules, Coordination Compounds",
    "Biology: Human Physiology, Plant Anatomy, Genetics & Evolution, Biotechnology, Ecology & Environment"
  ],
  GATE: [
    "Computer Science: Discrete Mathematics, Theory of Computation, Compiler Design, DSA, OS, DBMS, Networks",
    "Engineering Mathematics: Linear Algebra, Calculus, Probability & Statistics, Differential Equations",
    "General Aptitude: Quantitative Aptitude, Analytical Reasoning, Verbal Ability"
  ],
  CAT: [
    "Quantitative Aptitude: Number Systems, Algebra, Arithmetic, Geometry, Mensuration",
    "Verbal Ability & Reading Comprehension: RC Passages, Para Jumbles, Critical Reasoning, Sentence Correction",
    "Data Interpretation & Logical Reasoning: Charts, Tables, Caselets, Seating Arrangement, Puzzles"
  ],

  // Government Exams
  UPSC: [
    "Indian Polity & Governance: Constitution, Preamble, Fundamental Rights, Judiciary",
    "Indian History: Ancient, Medieval, Modern Freedom Movement, Art & Culture",
    "Geography: Indian & World Physical Geography, Climate Systems, Resources",
    "Indian Economy: Macroeconomics, Budgeting, Inflation, Banking & Financial Sector",
    "General Science & Current Affairs: Environment, Biodiversity, Science & Tech Innovations"
  ],
  SSC: [
    "Quantitative Aptitude: Percentage, Profit & Loss, Ratio, Time & Work, Algebra, Geometry",
    "General Intelligence & Reasoning: Analogy, Coding-Decoding, Blood Relations, Non-Verbal",
    "English Language: Grammar Rules, Error Spotting, Vocabulary, Synonyms/Antonyms, Cloze Test",
    "General Awareness: Indian History, Geography, Polity, Science, Current Events"
  ],
  Banking: [
    "Reasoning Ability: Puzzles, Seating Arrangement, Syllogism, Inequality, Input-Output",
    "Quantitative Aptitude: Data Interpretation, Number Series, Quadratic Equations, Simplification",
    "English Language: Reading Comprehension, Error Detection, Para Completion, Vocabulary",
    "Computer & General Awareness: Banking Awareness, Financial Terms, Current Affairs, IT Fundamentals"
  ],
  Railway: [
    "Mathematics: Number System, BODMAS, Decimals, Fractions, LCM-HCF, Ratio, Algebra",
    "General Intelligence & Reasoning: Analogies, Venn Diagrams, Mathematical Operations, Syllogism",
    "General Science: Physics, Chemistry, Life Sciences up to 10th Standard CBSE level",
    "General Awareness: Current Affairs, Indian Geography, History, Culture, Sports"
  ],
  Defence: [
    "General Ability: World & Indian History, Geography, Indian Constitution, Basic Physics & Chemistry",
    "Mathematics: Algebra, Trigonometry, Matrices, Differential Calculus, Vector Algebra",
    "English Language: Comprehension, Idioms & Phrases, Spotting Errors, Sentence Rearrangement"
  ],

  // Core Subjects
  Mathematics: [
    "Arithmetic & Commercial Math (Percentage, Interest, Ratio, Profit & Loss)",
    "Algebra (Linear Equations, Quadratic Equations, Polynomials, Inequalities)",
    "Geometry & Mensuration (Triangles, Circles, Quadrilaterals, 2D & 3D Volumes)",
    "Trigonometry & Calculus (Identities, Limits, Derivatives, Integrals, Differential Equations)"
  ],
  Science: [
    "Physics (Motion, Forces, Work & Energy, Gravitation, Electricity, Optics)",
    "Chemistry (Atomic Structure, Periodic Table, Chemical Reactions, Acids & Bases, Organic Chem)",
    "Biology (Cell Biology, Genetics, Human Systems, Ecosystems, Microorganisms)"
  ],
  English: [
    "Grammar & Usage (Tenses, Articles, Prepositions, Subject-Verb Agreement, Active-Passive)",
    "Vocabulary (Synonyms, Antonyms, Idioms, One-word Substitutions, Spelling Errors)",
    "Reading Comprehension & Critical Analysis (Passage Comprehension, Main Idea, Inference)"
  ],
  "General Knowledge": [
    "Indian & World History (Ancient, Medieval, Modern, World Events)",
    "Geography & Environment (Physical Geography, Maps, National Parks, Climate)",
    "Sports, Awards & Culture (International Sports, Books & Authors, Cultural Heritage)",
    "Current Affairs & Science (Recent Inventions, Summit Meetings, Government Schemes)"
  ],

  // School Levels
  "Nursery-LKG": [
    "Basic Alphabets & Letters (Identification, Phonics, First Letter of Words)",
    "Numbers & Counting (Counting 1-20, Basic Addition with Visual Objects)",
    "Shapes, Colors & Patterns (Identifying Circles, Squares, Primary Colors)",
    "Animals, Fruits & Vegetables (Identifying Common Animals, Fruits, Vegetables)"
  ],
  "Class 1-5": [
    "Elementary Mathematics (Addition, Subtraction, Multiplication Tables, Basic Geometry)",
    "General Science (Plants, Animals, Human Body Basics, Water, Air & Weather)",
    "English Basics (Nouns, Verbs, Simple Sentences, Opposite Words, Plurals)",
    "Environmental Studies & Social Basics (Family, School, Helpers, Safety Rules)"
  ],
  "Class 6-10": [
    "Mathematics (Algebra, Geometry, Coordinate Geometry, Mensuration, Statistics, Probability)",
    "Physics & Chemistry (Force, Motion, Light, Sound, Atoms, Chemical Equations, Metals & Non-Metals)",
    "Biology (Life Processes, Control & Coordination, Reproduction, Heredity, Environment)",
    "Social Science (History, Geography, Democratic Politics, Economics Basics)"
  ],
  "Class 11-12": [
    "Physics (Mechanics, Electromagnetism, Optics, Modern Physics, Semiconductor Electronics)",
    "Chemistry (Physical Chemistry, Organic Mechanisms, Coordination Compounds, Electrochemistry)",
    "Mathematics (Relations & Functions, Calculus, Vectors, 3D Geometry, Linear Programming)",
    "Biology (Reproduction, Genetics, Biotechnology, Biology in Human Welfare, Ecology)"
  ]
};

/**
 * Gets syllabus sub-topics for a given category.
 * Fallback to general academic topics if category is unknown.
 */
function getSyllabusForCategory(category) {
  if (!category) return ["General Academic & Problem Solving Topics"];

  if (SYLLABUS_MAP[category]) {
    return SYLLABUS_MAP[category];
  }

  const lower = category.toLowerCase();
  for (const [key, topics] of Object.entries(SYLLABUS_MAP)) {
    if (key.toLowerCase() === lower) {
      return topics;
    }
  }

  return [
    `${category} Core Concepts`,
    `${category} Applied Problem Solving`,
    `${category} Theoretical Principles`
  ];
}

module.exports = {
  SYLLABUS_MAP,
  getSyllabusForCategory
};
