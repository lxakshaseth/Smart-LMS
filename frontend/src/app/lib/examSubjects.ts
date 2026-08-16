export const EXAM_SUBJECTS_MAP: Record<string, string[]> = {
  "Class 10 Boards": ["Physics", "Chemistry", "Biology", "Mathematics"],
  "Class 12 Boards": ["Physics", "Chemistry", "Mathematics", "Biology"],
  "NEET":            ["Biology", "Physics", "Chemistry"],
  "JEE Main":        ["Physics", "Chemistry", "Mathematics"],
  "JEE Advanced":    ["Physics", "Chemistry", "Mathematics"],
  "GATE":            ["Computer Science", "Electronics", "Mechanical", "Electrical", "Civil"],
  "CAT":             ["Data Interpretation", "Logical Reasoning", "Quantitative Aptitude", "VARC"],
  "UPSC":            ["GS1 - History & Geography", "GS2 - Polity & Governance", "GS3 - Economy & Environment", "GS4 - Ethics"],
  "SSC CGL":         ["Quantitative Aptitude", "General Intelligence & Reasoning", "General Awareness", "English Language"],
  "IBPS PO":         ["Reasoning Ability", "Quantitative Aptitude", "Banking Awareness", "English Language"],
  "NDA/CDS":         ["Mathematics", "General Ability Test (GAT)", "Defense Awareness", "English"],
  "Railway RRB":     ["General Science", "Reasoning", "Mathematics", "General Awareness"],
  "Engineering":     ["Computer Science", "Data Structures & Algorithms", "Full Stack Web Dev", "System Design"],
  "Other":           ["General Aptitude", "Logical Reasoning", "Science & Mathematics"]
};

export const getSubjectsForExam = (exam: string): string[] => {
  if (EXAM_SUBJECTS_MAP[exam]) return EXAM_SUBJECTS_MAP[exam];
  for (const k of Object.keys(EXAM_SUBJECTS_MAP)) {
    if (exam.toLowerCase().includes(k.toLowerCase())) return EXAM_SUBJECTS_MAP[k];
  }
  return ["General Science", "Mathematics", "Aptitude"];
};
