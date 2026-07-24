/**
 * Comprehensive Fallback MCQ Generator for Smart AI LMS Practice Arena
 * Guarantees that every exam category works smoothly even if AI service is offline or rate-limited.
 */

const FALLBACK_QUESTION_BANK = {
  GATE: [
    {
      question: "Which of the following data structures is used for Depth First Search (DFS) traversal of a graph?",
      options: ["Stack", "Queue", "Priority Queue", "Array"],
      correctAnswer: 0,
      explanation: "Depth First Search uses a Stack data structure (either explicitly or via function call stack recursion)."
    },
    {
      question: "What is the time complexity of building a binary heap from an unsorted array of n elements?",
      options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
      correctAnswer: 1,
      explanation: "Building a binary heap using the bottom-up heapify algorithm takes O(n) linear time."
    },
    {
      question: "In relational database management systems, ACID properties ensure reliable processing of database transactions. What does 'I' stand for?",
      options: ["Isolation", "Integrity", "Index", "Immutability"],
      correctAnswer: 0,
      explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability."
    },
    {
      question: "Which CPU scheduling algorithm can lead to starvation if short processes keep arriving?",
      options: ["Shortest Job First (SJF)", "Round Robin", "First Come First Served (FCFS)", "Priority Scheduling without Aging"],
      correctAnswer: 0,
      explanation: "SJF (and Shortest Remaining Time First) can cause starvation for longer processes when short processes continuously enter the ready queue."
    },
    {
      question: "Which layer of the OSI reference model is responsible for end-to-end packet delivery and logical IP addressing?",
      options: ["Network Layer", "Transport Layer", "Data Link Layer", "Physical Layer"],
      correctAnswer: 0,
      explanation: "The Network Layer (Layer 3) handles IP addressing, routing, and end-to-end packet forwarding across network boundaries."
    },
    {
      question: "In Theory of Computation, which of the following languages is NOT regular?",
      options: ["L = {a^n b^n | n >= 0}", "L = {a^n | n >= 0}", "L = {a^n b^m | n, m >= 0}", "L = {w | w contains an even number of 1s}"],
      correctAnswer: 0,
      explanation: "The language {a^n b^n | n >= 0} requires memory to count the number of 'a's to match 'b's, making it context-free but not regular."
    },
    {
      question: "What is the result of evaluating the limit: lim_{x -> 0} (sin(x) / x)?",
      options: ["1", "0", "Infinity", "Undefined"],
      correctAnswer: 0,
      explanation: "Using L'Hopital's rule or standard trigonometric limits, lim_{x->0} (sin x / x) = 1."
    },
    {
      question: "Which deadlock prevention condition ensures that a process holding resources cannot request new resources without releasing current ones?",
      options: ["No Hold and Wait", "Mutual Exclusion", "No Preemption", "Circular Wait"],
      correctAnswer: 0,
      explanation: "No Hold and Wait prevents deadlocks by requiring a process to request all required resources at once or release held resources before requesting more."
    },
    {
      question: "What is the maximum number of nodes in a binary tree of height h (where height of root is 0)?",
      options: ["2^(h+1) - 1", "2^h - 1", "2^h", "2^(h-1)"],
      correctAnswer: 0,
      explanation: "A full binary tree of height h has 1 + 2 + 4 + ... + 2^h = 2^(h+1) - 1 nodes."
    },
    {
      question: "In 32-bit IPv4 addressing, how many host addresses are usable in a subnet with netmask 255.255.255.240 (/28)?",
      options: ["14", "16", "30", "62"],
      correctAnswer: 0,
      explanation: "A /28 subnet has 32 - 28 = 4 host bits. 2^4 = 16 total addresses minus 2 reserved (Network & Broadcast) = 14 usable host IPs."
    }
  ],

  JEE: [
    {
      question: "What is the SI unit of electric flux?",
      options: ["N m^2 / C", "N / C", "Weber", "Tesla m"],
      correctAnswer: 0,
      explanation: "Electric flux phi = E * A, so its unit is (N/C) * m^2 = N m^2 / C (or Volt-meter)."
    },
    {
      question: "Which of the following compounds exhibits optical isomerism?",
      options: ["Lactic acid", "Acetic acid", "Formic acid", "Glycine"],
      correctAnswer: 0,
      explanation: "Lactic acid contains a chiral carbon atom (attached to -H, -OH, -COOH, -CH3), making it optically active."
    },
    {
      question: "What is the derivative of f(x) = x * ln(x) with respect to x?",
      options: ["1 + ln(x)", "ln(x)", "1 / x", "x + ln(x)"],
      correctAnswer: 0,
      explanation: "Using the product rule: d/dx [x ln x] = (1)*ln(x) + x*(1/x) = ln(x) + 1."
    },
    {
      question: "If two vectors A and B are perpendicular to each other, what is their dot product A · B?",
      options: ["0", "1", "|A||B|", "-1"],
      correctAnswer: 0,
      explanation: "A · B = |A||B| cos(theta). For perpendicular vectors, theta = 90 degrees, so cos(90°) = 0."
    },
    {
      question: "Which fundamental force has the shortest range in nature?",
      options: ["Strong Nuclear Force", "Weak Nuclear Force", "Electromagnetic Force", "Gravitational Force"],
      correctAnswer: 1,
      explanation: "The weak nuclear force has an extremely short range of approximately 10^-18 meters (sub-atomic scale)."
    }
  ],

  NEET: [
    {
      question: "Which organelle is known as the 'powerhouse of the cell' due to ATP production via cellular respiration?",
      options: ["Mitochondrion", "Ribosome", "Golgi Apparatus", "Lysosome"],
      correctAnswer: 0,
      explanation: "Mitochondria produce ATP (adenosine triphosphate) through oxidative phosphorylation during cellular respiration."
    },
    {
      question: "Which blood group is considered the universal donor for red blood cells?",
      options: ["O Negative", "AB Positive", "A Positive", "B Negative"],
      correctAnswer: 0,
      explanation: "O Negative blood lacks A, B, and Rh antigens, making it safe for transfusion into recipients of any blood type."
    },
    {
      question: "What type of tissue connects bone to muscle in the human musculoskeletal system?",
      options: ["Tendon", "Ligament", "Cartilage", "Areolar Tissue"],
      correctAnswer: 0,
      explanation: "Tendons connect skeletal muscle to bone, while ligaments connect bone to bone."
    },
    {
      question: "In genetics, what is the phenotypic ratio of a classic Mendelian monohybrid cross in F2 generation?",
      options: ["3 : 1", "1 : 2 : 1", "9 : 3 : 3 : 1", "2 : 1"],
      correctAnswer: 0,
      explanation: "A monohybrid cross yields a phenotypic ratio of 3 dominant : 1 recessive in the F2 generation."
    },
    {
      question: "Which plant hormone is primarily responsible for fruit ripening?",
      options: ["Ethylene", "Auxin", "Gibberellin", "Cytokinin"],
      correctAnswer: 0,
      explanation: "Ethylene gas is a gaseous phytohormone that promotes fruit maturation and ripening."
    }
  ],

  Engineering: [
    {
      question: "Which design pattern ensures a class has only one instance and provides a global access point to it?",
      options: ["Singleton Pattern", "Factory Pattern", "Observer Pattern", "Strategy Pattern"],
      correctAnswer: 0,
      explanation: "The Singleton design pattern restricts instantiation of a class to a single object instance across the application."
    },
    {
      question: "What is the worst-case time complexity of QuickSort when bad pivot selection occurs?",
      options: ["O(n^2)", "O(n log n)", "O(n)", "O(2^n)"],
      correctAnswer: 0,
      explanation: "QuickSort degrades to O(n^2) when the pivot chosen is consistently the smallest or largest element."
    },
    {
      question: "In Object-Oriented Programming, what is Polymorphism?",
      options: ["Ability of a method to behave differently based on object context", "Hiding internal data representation", "Deriving new classes from existing ones", "Bundling data and methods into a single unit"],
      correctAnswer: 0,
      explanation: "Polymorphism allows objects of different classes to respond to the same method call in class-specific ways."
    },
    {
      question: "Which SQL command is used to remove a table structure along with all its data from a database permanently?",
      options: ["DROP TABLE", "DELETE FROM", "TRUNCATE TABLE", "REMOVE TABLE"],
      correctAnswer: 0,
      explanation: "DROP TABLE deletes the schema, metadata, and all records of a table permanently."
    },
    {
      question: "What does HTTP status code 404 signify?",
      options: ["Not Found", "Unauthorized", "Internal Server Error", "Forbidden"],
      correctAnswer: 0,
      explanation: "HTTP 404 indicates that the requested resource could not be found on the server."
    }
  ],

  CAT: [
    {
      question: "If a sum of money doubles itself in 5 years at simple interest, what is the annual rate of interest?",
      options: ["20%", "10%", "15%", "25%"],
      correctAnswer: 0,
      explanation: "Simple Interest SI = P. Since SI = P in 5 years, P = (P * R * 5) / 100 => R = 100 / 5 = 20% per annum."
    },
    {
      question: "Find the unit digit of 3^47.",
      options: ["7", "3", "9", "1"],
      correctAnswer: 0,
      explanation: "Powers of 3 have a cyclicity of 4 (3, 9, 7, 1). 47 mod 4 = 3, so unit digit is 3^3 = 27 -> 7."
    },
    {
      question: "A train 150 meters long crosses a pole in 9 seconds. What is the speed of the train in km/h?",
      options: ["60 km/h", "50 km/h", "72 km/h", "54 km/h"],
      correctAnswer: 0,
      explanation: "Speed in m/s = 150 / 9 = 50/3 m/s. In km/h = (50/3) * (18/5) = 60 km/h."
    }
  ],

  UPSC: [
    {
      question: "Which Article of the Indian Constitution empowers the President of India to promulgate Ordinances during recess of Parliament?",
      options: ["Article 123", "Article 213", "Article 356", "Article 72"],
      correctAnswer: 0,
      explanation: "Article 123 empowers the President to issue ordinances when Parliament is not in session."
    },
    {
      question: "The Preamble to the Constitution of India secures to all its citizens Liberty of:",
      options: ["Thought, Expression, Belief, Faith, and Worship", "Status and Opportunity", "Justice, Liberty, and Equality", "Fraternity and Dignity"],
      correctAnswer: 0,
      explanation: "The Preamble explicitly guarantees Liberty of thought, expression, belief, faith, and worship."
    }
  ],

  SSC: [
    {
      question: "If a worker completes 1/4th of a job in 5 days, how many days will he take to complete the remaining job?",
      options: ["15 days", "20 days", "10 days", "12 days"],
      correctAnswer: 0,
      explanation: "Full job takes 5 * 4 = 20 days. Remaining 3/4th takes 20 * 3/4 = 15 days."
    },
    {
      question: "Who among the following was the founder of the Maurya Empire in ancient India?",
      options: ["Chandragupta Maurya", "Ashoka the Great", "Bindusara", "Bimbisara"],
      correctAnswer: 0,
      explanation: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the assistance of Chanakya."
    }
  ],

  Banking: [
    {
      question: "What is the present Repo Rate authority body in India?",
      options: ["Monetary Policy Committee (MPC) of RBI", "Ministry of Finance", "SEBI", "NITI Aayog"],
      correctAnswer: 0,
      explanation: "The Monetary Policy Committee (MPC) of the Reserve Bank of India fixes policy interest rates including Repo Rate."
    },
    {
      question: "What does 'CTS' stand for in Indian banking cheque clearance system?",
      options: ["Cheque Truncation System", "Central Transfer Scheme", "Customer Tracking System", "Core Transaction Security"],
      correctAnswer: 0,
      explanation: "CTS stands for Cheque Truncation System, an electronic image-based cheque clearing process."
    }
  ],

  Railway: [
    {
      question: "What is the chemical formula of Common Salt?",
      options: ["NaCl", "NaHCO3", "Na2CO3", "NaOH"],
      correctAnswer: 0,
      explanation: "Sodium Chloride (NaCl) is common table salt."
    },
    {
      question: "What is the momentum of an object of mass m moving with velocity v?",
      options: ["m * v", "1/2 m v^2", "m * v^2", "m / v"],
      correctAnswer: 0,
      explanation: "Linear momentum p is defined as the product of mass and velocity (p = m * v)."
    }
  ],

  Defence: [
    {
      question: "Where is the National Defence Academy (NDA) located in India?",
      options: ["Khadakwasla, Pune", "Dehradun", "Dundigal, Hyderabad", "Ezhimala, Kerala"],
      correctAnswer: 0,
      explanation: "The NDA is located at Khadakwasla, near Pune, Maharashtra."
    }
  ],

  Mathematics: [
    {
      question: "What is the sum of interior angles of a convex polygon with n sides?",
      options: ["(n - 2) * 180°", "(n - 1) * 180°", "n * 180°", "(2n - 4) * 90°"],
      correctAnswer: 0,
      explanation: "The sum of interior angles of an n-sided polygon is given by (n - 2) * 180 degrees."
    },
    {
      question: "What is the value of log10(1000)?",
      options: ["3", "10", "100", "2"],
      correctAnswer: 0,
      explanation: "Since 10^3 = 1000, log10(1000) = 3."
    }
  ],

  Science: [
    {
      question: "What is the speed of light in vacuum approximately?",
      options: ["3 x 10^8 m/s", "3 x 10^6 m/s", "3 x 10^5 km/s", "Both A and C"],
      correctAnswer: 3,
      explanation: "The speed of light is ~3 x 10^8 meters per second, which equals 3 x 10^5 kilometers per second."
    }
  ],

  English: [
    {
      question: "Choose the correct synonym of the word 'BENEVOLENT':",
      options: ["Kind and generous", "Cruel and hostile", "Greedy", "Indifferent"],
      correctAnswer: 0,
      explanation: "Benevolent means well-meaning, kind, and charitable."
    }
  ],

  "General Knowledge": [
    {
      question: "Which is the largest ocean on Earth by surface area?",
      options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
      correctAnswer: 0,
      explanation: "The Pacific Ocean is the world's largest and deepest ocean."
    }
  ],

  "Nursery-LKG": [
    {
      question: "Which fruit is red in color and keeps the doctor away when eaten daily?",
      options: ["Apple", "Banana", "Grape", "Lemon"],
      correctAnswer: 0,
      explanation: "An apple is a red fruit. As the proverb says: 'An apple a day keeps the doctor away!'"
    },
    {
      question: "How many legs does a dog have?",
      options: ["4", "2", "6", "8"],
      correctAnswer: 0,
      explanation: "Dogs are quadrupeds with 4 legs."
    }
  ],

  "Class 1-5": [
    {
      question: "What is 12 multiplied by 8?",
      options: ["96", "84", "108", "72"],
      correctAnswer: 0,
      explanation: "12 * 8 = 96."
    }
  ],

  "Class 6-10": [
    {
      question: "Which gas do green plants absorb during photosynthesis?",
      options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
      correctAnswer: 0,
      explanation: "Plants take in carbon dioxide and water to produce glucose and oxygen in sunlight."
    }
  ],

  "Class 11-12": [
    {
      question: "What is the oxidation state of Chromium in Potassium Dichromate (K2Cr2O7)?",
      options: ["+6", "+3", "+7", "+2"],
      correctAnswer: 0,
      explanation: "In K2Cr2O7: 2(+1) + 2(Cr) + 7(-2) = 0 => 2Cr = 12 => Cr = +6."
    }
  ]
};

/**
 * Generates fallback questions for a given category if AI service is unavailable.
 */
function getFallbackQuestionsForCategory(category, questionCount = 10) {
  let pool = FALLBACK_QUESTION_BANK[category];

  if (!pool || pool.length === 0) {
    // Search case-insensitively or find matching group
    const catLower = String(category || "").toLowerCase();
    for (const [key, questions] of Object.entries(FALLBACK_QUESTION_BANK)) {
      if (key.toLowerCase() === catLower || catLower.includes(key.toLowerCase())) {
        pool = questions;
        break;
      }
    }
  }

  if (!pool || pool.length === 0) {
    pool = FALLBACK_QUESTION_BANK.GATE; // Universal high-standard fallback
  }

  // Duplicate or slice pool to reach questionCount
  const result = [];
  let index = 0;

  while (result.length < questionCount) {
    const original = pool[index % pool.length];
    result.push({
      id: result.length + 1,
      question: original.question,
      options: [...original.options],
      correctAnswer: original.correctAnswer,
      explanation: original.explanation
    });
    index++;
  }

  return result;
}

module.exports = {
  FALLBACK_QUESTION_BANK,
  getFallbackQuestionsForCategory
};
