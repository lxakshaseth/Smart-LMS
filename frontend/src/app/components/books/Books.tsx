import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  BookOpen, Star, GraduationCap, Rocket, ExternalLink,
  ArrowLeft, Shield, Brain, ChevronRight, Download, FileText, Calendar,
} from "lucide-react";

/* ─────────────── types ─────────────── */
interface RealBook {
  id: number;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  edition: string;
  rating: number;
  emoji: string;
  officialUrl: string;
  tags: string[]; // exact sub-category keys that show this book
  category: BookCategory;
}

interface PYQPaper {
  id: number;
  exam: string;
  year: string;
  subject: string;
  emoji: string;
  downloadUrl: string;
  category: BookCategory;
  tag: string;
}

type BookCategory = "school" | "competitive" | "government" | "subject";

/* ─────────────── books data ─────────────── */
const allBooks: RealBook[] = [
  /* ── SCHOOL – Nursery–LKG ── */
  {
    id: 1, title: "Jolly Phonics Pupil Book 1", author: "Sara Wernham & Sue Lloyd", publisher: "Jolly Learning",
    subject: "English/Phonics", edition: "Pre-School", rating: 4.8, emoji: "🔤", category: "school",
    officialUrl: "https://www.jollylearning.co.uk/pupil-book-1/", tags: ["Nursery–LKG"],
  },
  {
    id: 2, title: "My First Learning Library (10 Books)", author: "Roger Priddy", publisher: "Priddy Books",
    subject: "General Learning", edition: "Board Books", rating: 4.9, emoji: "📚", category: "school",
    officialUrl: "https://www.priddybooks.com", tags: ["Nursery–LKG"],
  },
  {
    id: 3, title: "Blossom Pre-School Books Set", author: "Editorial Board", publisher: "Rachna Sagar",
    subject: "Nursery Activity", edition: "Pre-Primary", rating: 4.6, emoji: "🌸", category: "school",
    officialUrl: "https://www.rachnasagar.in", tags: ["Nursery–LKG"],
  },
  {
    id: 4, title: "Early Learning Library – Numbers & Shapes", author: "Miles Kelly", publisher: "Miles Kelly Publishing",
    subject: "Mathematics", edition: "Pre-School", rating: 4.7, emoji: "🔢", category: "school",
    officialUrl: "https://www.mileskelly.net", tags: ["Nursery–LKG"],
  },

  /* ── SCHOOL – Class 1–5 ── */
  {
    id: 5, title: "NCERT Mathematics Textbook", author: "NCERT", publisher: "NCERT",
    subject: "Mathematics", edition: "Class 1–5", rating: 4.8, emoji: "📐", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 1–5"],
  },
  {
    id: 6, title: "NCERT EVS – Looking Around", author: "NCERT", publisher: "NCERT",
    subject: "EVS", edition: "Class 3–5", rating: 4.7, emoji: "🌿", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 1–5"],
  },
  {
    id: 7, title: "NCERT English – Marigold", author: "NCERT", publisher: "NCERT",
    subject: "English", edition: "Class 1–5", rating: 4.8, emoji: "📖", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 1–5"],
  },
  {
    id: 8, title: "NCERT Hindi – Rimjhim", author: "NCERT", publisher: "NCERT",
    subject: "Hindi", edition: "Class 1–5", rating: 4.7, emoji: "✍️", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 1–5"],
  },

  /* ── SCHOOL – Class 6–10 ── */
  {
    id: 9, title: "NCERT Science Textbook", author: "NCERT", publisher: "NCERT",
    subject: "Science", edition: "Class 6–10", rating: 4.9, emoji: "🔬", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 6–10"],
  },
  {
    id: 10, title: "NCERT Mathematics – Class 9 & 10", author: "NCERT", publisher: "NCERT",
    subject: "Mathematics", edition: "Class 9–10", rating: 4.8, emoji: "📏", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 6–10"],
  },
  {
    id: 11, title: "RD Sharma – Class 10 Mathematics", author: "R.D. Sharma", publisher: "Dhanpat Rai",
    subject: "Mathematics", edition: "Class 10", rating: 4.7, emoji: "📘", category: "school",
    officialUrl: "https://www.dhanpatrai.com", tags: ["Class 6–10"],
  },
  {
    id: 12, title: "NCERT Social Science – Our Pasts", author: "NCERT", publisher: "NCERT",
    subject: "History/SST", edition: "Class 6–8", rating: 4.7, emoji: "🌍", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 6–10"],
  },

  /* ── SCHOOL – Class 11–12 ── */
  {
    id: 13, title: "NCERT Physics Part 1 & 2", author: "NCERT", publisher: "NCERT",
    subject: "Physics", edition: "Class 11–12", rating: 4.9, emoji: "⚛️", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 11–12"],
  },
  {
    id: 14, title: "NCERT Chemistry Part 1 & 2", author: "NCERT", publisher: "NCERT",
    subject: "Chemistry", edition: "Class 11–12", rating: 4.8, emoji: "🧪", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 11–12"],
  },
  {
    id: 15, title: "NCERT Biology Textbook", author: "NCERT", publisher: "NCERT",
    subject: "Biology", edition: "Class 11–12", rating: 4.8, emoji: "🧬", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 11–12"],
  },
  {
    id: 16, title: "NCERT Mathematics – Class 11 & 12", author: "NCERT", publisher: "NCERT",
    subject: "Mathematics", edition: "Class 11–12", rating: 4.8, emoji: "📊", category: "school",
    officialUrl: "https://ncert.nic.in/textbook.php", tags: ["Class 11–12"],
  },

  /* ── COMPETITIVE – JEE ── */
  {
    id: 17, title: "Concepts of Physics Vol. 1 & 2", author: "H.C. Verma", publisher: "Bharati Bhawan",
    subject: "Physics", edition: "Latest", rating: 4.9, emoji: "⚡", category: "competitive",
    officialUrl: "https://www.bharatibhawan.org", tags: ["JEE"],
  },
  {
    id: 18, title: "Organic Chemistry (JEE)", author: "O.P. Tandon", publisher: "GRB Publications",
    subject: "Chemistry", edition: "Latest", rating: 4.7, emoji: "🧪", category: "competitive",
    officialUrl: "https://www.grbpublications.com", tags: ["JEE"],
  },
  {
    id: 19, title: "Problems in General Physics", author: "I.E. Irodov", publisher: "CBS Publishers",
    subject: "Physics", edition: "2nd Ed.", rating: 4.8, emoji: "🔭", category: "competitive",
    officialUrl: "https://www.cbspd.com", tags: ["JEE"],
  },
  {
    id: 20, title: "Maths for JEE Main & Advanced", author: "S.L. Loney / Arihant", publisher: "Arihant",
    subject: "Mathematics", edition: "Latest", rating: 4.7, emoji: "📐", category: "competitive",
    officialUrl: "https://arihantbooks.com", tags: ["JEE"],
  },

  /* ── COMPETITIVE – NEET ── */
  {
    id: 21, title: "Trueman's Biology Vol. 1 & 2", author: "K.N. Bhatia", publisher: "Trueman",
    subject: "Biology", edition: "Latest", rating: 4.8, emoji: "🌿", category: "competitive",
    officialUrl: "https://www.truemanbookcompany.com", tags: ["NEET"],
  },
  {
    id: 22, title: "NCERT at Your Fingertips – Biology", author: "MTG Editorial", publisher: "MTG Learning Media",
    subject: "Biology", edition: "Latest", rating: 4.9, emoji: "🧬", category: "competitive",
    officialUrl: "https://mtg.in", tags: ["NEET"],
  },
  {
    id: 23, title: "Objective Physics for NEET", author: "DC Pandey", publisher: "Arihant",
    subject: "Physics", edition: "Latest", rating: 4.7, emoji: "⚛️", category: "competitive",
    officialUrl: "https://arihantbooks.com", tags: ["NEET"],
  },
  {
    id: 24, title: "Objective Chemistry for NEET", author: "VK Jaiswal", publisher: "Arihant",
    subject: "Chemistry", edition: "Latest", rating: 4.6, emoji: "🧪", category: "competitive",
    officialUrl: "https://arihantbooks.com", tags: ["NEET"],
  },

  /* ── COMPETITIVE – GATE ── */
  {
    id: 25, title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest", publisher: "MIT Press",
    subject: "Algorithms", edition: "4th Ed.", rating: 4.9, emoji: "💻", category: "competitive",
    officialUrl: "https://mitpress.mit.edu/9780262046305", tags: ["GATE"],
  },
  {
    id: 26, title: "GATE 2025 CS & IT – Topic-wise Solved Papers", author: "Arihant Experts", publisher: "Arihant",
    subject: "GATE CS", edition: "2025", rating: 4.6, emoji: "🖥️", category: "competitive",
    officialUrl: "https://arihantbooks.com", tags: ["GATE"],
  },

  /* ── COMPETITIVE – CAT ── */
  {
    id: 27, title: "Quantitative Aptitude for CAT", author: "Arun Sharma", publisher: "McGraw Hill",
    subject: "Aptitude", edition: "10th Ed.", rating: 4.8, emoji: "🎯", category: "competitive",
    officialUrl: "https://www.mheducation.co.in", tags: ["CAT"],
  },
  {
    id: 28, title: "How to Prepare for Verbal Ability & RC", author: "Arun Sharma", publisher: "McGraw Hill",
    subject: "English/VA", edition: "Latest", rating: 4.7, emoji: "📝", category: "competitive",
    officialUrl: "https://www.mheducation.co.in", tags: ["CAT"],
  },

  /* ── GOVERNMENT – Defence ── */
  {
    id: 29, title: "Pathfinder CDS Entrance Examination", author: "Arihant Experts", publisher: "Arihant",
    subject: "CDS/Defence", edition: "2025", rating: 4.7, emoji: "🎖️", category: "government",
    officialUrl: "https://arihantbooks.com", tags: ["Defence"],
  },
  {
    id: 30, title: "NDA / NA Examination Guide", author: "RPH Editorial Board", publisher: "Ramesh Publishing",
    subject: "NDA", edition: "2025", rating: 4.6, emoji: "🛡️", category: "government",
    officialUrl: "https://www.rameshpublishinghouse.com", tags: ["Defence"],
  },
  {
    id: 31, title: "Lucent's General Knowledge", author: "Dr. Binay Karna", publisher: "Lucent Publications",
    subject: "GK", edition: "Latest", rating: 4.9, emoji: "🌐", category: "government",
    officialUrl: "https://www.lucentpublication.com", tags: ["Defence", "UPSC", "SSC", "Banking", "Railway"],
  },

  /* ── GOVERNMENT – UPSC ── */
  {
    id: 32, title: "Indian Polity", author: "M. Laxmikanth", publisher: "McGraw Hill",
    subject: "Polity", edition: "7th Ed.", rating: 4.9, emoji: "🏛️", category: "government",
    officialUrl: "https://www.mheducation.co.in", tags: ["UPSC"],
  },
  {
    id: 33, title: "Certificate Physical & Human Geography", author: "Goh Cheng Leong", publisher: "Oxford",
    subject: "Geography", edition: "Latest", rating: 4.7, emoji: "🌏", category: "government",
    officialUrl: "https://global.oup.com", tags: ["UPSC"],
  },

  /* ── GOVERNMENT – SSC ── */
  {
    id: 34, title: "Kiran's SSC CGL Tier 1 & 2", author: "Kiran Prakashan", publisher: "Kiran Prakashan",
    subject: "SSC CGL", edition: "2025", rating: 4.6, emoji: "📋", category: "government",
    officialUrl: "https://www.kiranprakashan.com", tags: ["SSC"],
  },
  {
    id: 35, title: "Quantitative Aptitude", author: "R.S. Aggarwal", publisher: "S. Chand",
    subject: "Mathematics", edition: "Latest", rating: 4.9, emoji: "🔢", category: "government",
    officialUrl: "https://www.schandpublishing.com", tags: ["SSC", "Banking", "Railway"],
  },

  /* ── GOVERNMENT – Banking ── */
  {
    id: 36, title: "IBPS PO / Clerk 15 Practice Sets", author: "Arihant Experts", publisher: "Arihant",
    subject: "Banking", edition: "2025", rating: 4.5, emoji: "🏦", category: "government",
    officialUrl: "https://arihantbooks.com", tags: ["Banking"],
  },
  {
    id: 37, title: "A Modern Approach to Verbal Reasoning", author: "R.S. Aggarwal", publisher: "S. Chand",
    subject: "Reasoning", edition: "Latest", rating: 4.8, emoji: "🧠", category: "government",
    officialUrl: "https://www.schandpublishing.com", tags: ["Banking", "SSC"],
  },

  /* ── GOVERNMENT – Railway ── */
  {
    id: 38, title: "Railway RRB NTPC Study Guide", author: "Kiran Prakashan", publisher: "Kiran Prakashan",
    subject: "Railway", edition: "2025", rating: 4.6, emoji: "🚂", category: "government",
    officialUrl: "https://www.kiranprakashan.com", tags: ["Railway"],
  },

  /* ── SUBJECT WISE ── */
  {
    id: 39, title: "Objective General Knowledge", author: "S.B. Singh", publisher: "Upkar Prakashan",
    subject: "GK", edition: "Latest", rating: 4.7, emoji: "📖", category: "subject",
    officialUrl: "https://www.upkarprakashan.com", tags: ["General Knowledge"],
  },
  {
    id: 40, title: "Word Power Made Easy", author: "Norman Lewis", publisher: "Penguin",
    subject: "English", edition: "Revised", rating: 4.9, emoji: "📝", category: "subject",
    officialUrl: "https://www.penguinrandomhouse.com", tags: ["English"],
  },
  {
    id: 41, title: "High School English Grammar", author: "Wren & Martin", publisher: "S. Chand",
    subject: "English", edition: "Revised", rating: 4.8, emoji: "✍️", category: "subject",
    officialUrl: "https://www.schandpublishing.com", tags: ["English"],
  },
  {
    id: 42, title: "Quantitative Aptitude (Subject)", author: "Arun Sharma", publisher: "McGraw Hill",
    subject: "Mathematics", edition: "9th Ed.", rating: 4.8, emoji: "➕", category: "subject",
    officialUrl: "https://www.mheducation.co.in", tags: ["Mathematics"],
  },
  {
    id: 43, title: "NCERT Exemplar Science Problems", author: "NCERT", publisher: "NCERT",
    subject: "Science", edition: "Latest", rating: 4.8, emoji: "🔬", category: "subject",
    officialUrl: "https://ncert.nic.in/exemplar-problems.php", tags: ["Science"],
  },
];

/* ─────────────── PYQ papers ─────────────── */
const pyqPapers: PYQPaper[] = [
  /* JEE */
  { id: 1, exam: "JEE Main 2024", year: "2024", subject: "Physics, Chemistry, Maths", emoji: "⚡", tag: "JEE", category: "competitive", downloadUrl: "https://jeemain.nta.nic.in" },
  { id: 2, exam: "JEE Main 2023", year: "2023", subject: "Physics, Chemistry, Maths", emoji: "⚡", tag: "JEE", category: "competitive", downloadUrl: "https://jeemain.nta.nic.in" },
  { id: 3, exam: "JEE Advanced 2024", year: "2024", subject: "Physics, Chemistry, Maths", emoji: "🏆", tag: "JEE", category: "competitive", downloadUrl: "https://jeeadv.ac.in/past_qps.html" },
  { id: 4, exam: "JEE Advanced 2023", year: "2023", subject: "Physics, Chemistry, Maths", emoji: "🏆", tag: "JEE", category: "competitive", downloadUrl: "https://jeeadv.ac.in/past_qps.html" },
  /* NEET */
  { id: 5, exam: "NEET UG 2024", year: "2024", subject: "Physics, Chemistry, Biology", emoji: "🧬", tag: "NEET", category: "competitive", downloadUrl: "https://neet.nta.nic.in" },
  { id: 6, exam: "NEET UG 2023", year: "2023", subject: "Physics, Chemistry, Biology", emoji: "🧬", tag: "NEET", category: "competitive", downloadUrl: "https://neet.nta.nic.in" },
  { id: 7, exam: "NEET UG 2022", year: "2022", subject: "Physics, Chemistry, Biology", emoji: "🧬", tag: "NEET", category: "competitive", downloadUrl: "https://neet.nta.nic.in" },
  /* GATE */
  { id: 8, exam: "GATE CS 2024", year: "2024", subject: "Computer Science", emoji: "🖥️", tag: "GATE", category: "competitive", downloadUrl: "https://gate2024.iisc.ac.in/question-papers" },
  { id: 9, exam: "GATE CS 2023", year: "2023", subject: "Computer Science", emoji: "🖥️", tag: "GATE", category: "competitive", downloadUrl: "https://gate2023.iisc.ac.in/question-papers" },
  /* CAT */
  { id: 10, exam: "CAT 2024", year: "2024", subject: "QA, VARC, DILR", emoji: "🎯", tag: "CAT", category: "competitive", downloadUrl: "https://iimcat.ac.in" },
  { id: 11, exam: "CAT 2023", year: "2023", subject: "QA, VARC, DILR", emoji: "🎯", tag: "CAT", category: "competitive", downloadUrl: "https://iimcat.ac.in" },
  /* Defence */
  { id: 12, exam: "CDS I 2024", year: "2024", subject: "English, GK, Maths", emoji: "🎖️", tag: "Defence", category: "government", downloadUrl: "https://upsc.gov.in/examinations/previous-question-papers" },
  { id: 13, exam: "NDA I 2024", year: "2024", subject: "Maths, General Ability", emoji: "🛡️", tag: "Defence", category: "government", downloadUrl: "https://upsc.gov.in/examinations/previous-question-papers" },
  { id: 14, exam: "CDS II 2023", year: "2023", subject: "English, GK, Maths", emoji: "🎖️", tag: "Defence", category: "government", downloadUrl: "https://upsc.gov.in/examinations/previous-question-papers" },
  /* UPSC */
  { id: 15, exam: "UPSC Prelims 2024", year: "2024", subject: "GS Paper 1 & 2 (CSAT)", emoji: "🏛️", tag: "UPSC", category: "government", downloadUrl: "https://upsc.gov.in/examinations/previous-question-papers" },
  { id: 16, exam: "UPSC Prelims 2023", year: "2023", subject: "GS Paper 1 & 2 (CSAT)", emoji: "🏛️", tag: "UPSC", category: "government", downloadUrl: "https://upsc.gov.in/examinations/previous-question-papers" },
  /* SSC */
  { id: 17, exam: "SSC CGL Tier 1 2024", year: "2024", subject: "GK, Maths, English, Reasoning", emoji: "📋", tag: "SSC", category: "government", downloadUrl: "https://ssc.gov.in/candidate-corner/old-question-papers" },
  { id: 18, exam: "SSC CHSL 2024", year: "2024", subject: "GK, Maths, English, Reasoning", emoji: "📋", tag: "SSC", category: "government", downloadUrl: "https://ssc.gov.in/candidate-corner/old-question-papers" },
  /* Banking */
  { id: 19, exam: "IBPS PO 2024", year: "2024", subject: "Reasoning, Quant, English, GK", emoji: "🏦", tag: "Banking", category: "government", downloadUrl: "https://www.ibps.in" },
  { id: 20, exam: "SBI PO 2024", year: "2024", subject: "Reasoning, Quant, English, GK", emoji: "🏦", tag: "Banking", category: "government", downloadUrl: "https://sbi.co.in/web/careers" },
  /* Railway */
  { id: 21, exam: "RRB NTPC 2024", year: "2024", subject: "Mathematics, GI & Reasoning, GK", emoji: "🚂", tag: "Railway", category: "government", downloadUrl: "https://www.rrbcdg.gov.in" },
  { id: 22, exam: "RRB Group D 2024", year: "2024", subject: "Mathematics, GI & Reasoning, GK, Science", emoji: "🚂", tag: "Railway", category: "government", downloadUrl: "https://www.rrbcdg.gov.in" },
  /* CBSE Board */
  { id: 23, exam: "CBSE Class 10 Board 2024", year: "2024", subject: "All Subjects", emoji: "📘", tag: "Class 6–10", category: "school", downloadUrl: "https://cbseacademic.nic.in/SQP_MAINEXAM_2024-25.html" },
  { id: 24, exam: "CBSE Class 12 Board 2024", year: "2024", subject: "All Subjects", emoji: "📗", tag: "Class 11–12", category: "school", downloadUrl: "https://cbseacademic.nic.in/SQP_MAINEXAM_2024-25.html" },
  { id: 25, exam: "CBSE Class 10 Board 2023", year: "2023", subject: "All Subjects", emoji: "📘", tag: "Class 6–10", category: "school", downloadUrl: "https://cbseacademic.nic.in" },
  { id: 26, exam: "CBSE Class 12 Board 2023", year: "2023", subject: "All Subjects", emoji: "📗", tag: "Class 11–12", category: "school", downloadUrl: "https://cbseacademic.nic.in" },
];

/* ─────────────── category config ─────────────── */
const categoryConfig = [
  {
    key: "school" as BookCategory,
    label: "School Level",
    subtitle: "NCERT & reference books from Nursery to Class 12",
    icon: <GraduationCap size={36} className="text-white" />,
    gradient: "from-indigo-500 to-blue-500",
    hoverBorder: "hover:border-indigo-400",
    bg: "from-indigo-500/5 to-blue-500/5",
    subCategories: ["Nursery–LKG", "Class 1–5", "Class 6–10", "Class 11–12"],
  },
  {
    key: "competitive" as BookCategory,
    label: "Competitive Exams",
    subtitle: "JEE, NEET, Engineering, GATE & CAT preparation books",
    icon: <Rocket size={36} className="text-white" />,
    gradient: "from-amber-500 to-orange-500",
    hoverBorder: "hover:border-amber-400",
    bg: "from-amber-500/5 to-orange-500/5",
    subCategories: ["JEE", "NEET", "GATE", "CAT"],
  },
  {
    key: "government" as BookCategory,
    label: "Government Jobs",
    subtitle: "Defence, UPSC, SSC, Banking & Railway exam books",
    icon: <Shield size={36} className="text-white" />,
    gradient: "from-rose-500 to-pink-500",
    hoverBorder: "hover:border-rose-400",
    bg: "from-rose-500/5 to-pink-500/5",
    subCategories: ["Defence", "UPSC", "SSC", "Banking", "Railway"],
  },
  {
    key: "subject" as BookCategory,
    label: "Subject Wise",
    subtitle: "General Knowledge, English, Mathematics & Science books",
    icon: <Brain size={36} className="text-white" />,
    gradient: "from-green-500 to-teal-500",
    hoverBorder: "hover:border-green-400",
    bg: "from-green-500/5 to-teal-500/5",
    subCategories: ["General Knowledge", "English", "Mathematics", "Science"],
  },
];

/* ─────────────── main component ─────────────── */
export default function Books() {
  const [activeCategory, setActiveCategory] = useState<BookCategory | null>(null);
  const [activeSub, setActiveSub] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"books" | "pyq">("books");

  const cfg = categoryConfig.find((c) => c.key === activeCategory);

  const filteredBooks = allBooks.filter((b) => {
    if (b.category !== activeCategory) return false;
    if (activeSub === "All") return true;
    return b.tags.includes(activeSub);
  });

  const filteredPYQ = pyqPapers.filter((p) => {
    if (p.category !== activeCategory) return false;
    if (activeSub === "All") return true;
    return p.tag === activeSub;
  });

  /* ── landing ── */
  if (!activeCategory) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground mt-1">Choose your learning category</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryConfig.map((cat) => {
            const bookCount = allBooks.filter((b) => b.category === cat.key).length;
            const pyqCount = pyqPapers.filter((p) => p.category === cat.key).length;
            return (
              <Card
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setActiveSub("All"); setActiveTab("books"); }}
                className={`p-8 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br ${cat.bg} border-2 border-transparent ${cat.hoverBorder}`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{cat.label}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{cat.subtitle}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{bookCount} books</span>
                    <span>•</span>
                    <span>{pyqCount} PYQs</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {cat.subCategories.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── detail view ── */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveCategory(null); setActiveSub("All"); }}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{cfg?.label}</h1>
            <p className="text-muted-foreground text-sm">{cfg?.subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => { setActiveCategory(null); setActiveSub("All"); }}>
          All Categories
        </Button>
      </div>

      {/* sub-category filter */}
      <div className="flex gap-2 flex-wrap">
        <FilterChip label="All" active={activeSub === "All"} onClick={() => setActiveSub("All")} />
        {cfg?.subCategories.map((s) => (
          <FilterChip key={s} label={s} active={activeSub === s} onClick={() => setActiveSub(s)} />
        ))}
      </div>

      {/* tab switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        <TabBtn label="📚 Books" active={activeTab === "books"} onClick={() => setActiveTab("books")} />
        <TabBtn label="📄 Previous Year Papers" active={activeTab === "pyq"} onClick={() => setActiveTab("pyq")} />
      </div>

      {/* ── BOOKS tab ── */}
      {activeTab === "books" && (
        <div className="space-y-8">
          {/* books */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-primary" />
              Books
              <span className="text-sm font-normal text-muted-foreground">({filteredBooks.length})</span>
            </h2>
            {filteredBooks.length === 0 ? (
              <EmptyState label="No books available for this filter." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBooks.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── PYQ tab ── */}
      {activeTab === "pyq" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <FileText size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              All papers open the <strong>official exam authority website</strong> in a new tab. Download the question papers directly from there for free.
            </p>
          </div>

          {filteredPYQ.length === 0 ? (
            <EmptyState label="No previous year papers for this filter." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPYQ.map((paper) => <PYQCard key={paper.id} paper={paper} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ─────────────── sub-components ─────────────── */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
          : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function BookCard({ book }: { book: RealBook }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
          {book.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold leading-snug line-clamp-2 text-sm">{book.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Star className="text-amber-400 fill-amber-400 flex-shrink-0" size={13} />
        <span className="text-xs font-medium">{book.rating}</span>
        <span className="text-xs text-muted-foreground truncate">• {book.publisher}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{book.subject}</span>
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{book.edition}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {book.tags.slice(0, 3).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full border border-border text-xs text-muted-foreground">{t}</span>
        ))}
      </div>

      <div className="mt-auto">
        <a
          href={book.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
        >
          <ExternalLink size={14} />
          Official Page
        </a>
      </div>
    </Card>
  );
}

function PYQCard({ paper }: { paper: PYQPaper }) {
  return (
    <a
      href={paper.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group-hover:scale-[1.01]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {paper.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-snug">{paper.exam}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{paper.subject}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} />{paper.year}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{paper.tag}</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
            <Download size={15} />
          </div>
        </div>
      </Card>
    </a>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
      <p>{label}</p>
    </div>
  );
}
