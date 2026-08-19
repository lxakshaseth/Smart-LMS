# 🚀 Smart-LMS — AI-Powered Learning Management System

> **Next-Generation Full-Stack AI Learning Management, 3D Virtual Practical Laboratory, Code Execution & Exam Preparation Platform.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Groq AI](https://img.shields.io/badge/AI_Engine-Groq_LLaMA_3.1-FF4500?style=for-the-badge)](https://groq.com/)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

---

## 📌 Executive Summary

**Smart-LMS** is an enterprise-grade, full-stack AI-driven Learning Management System designed to modernize academic education, 3D practical lab experimentation, competitive exam preparation, and software engineering training. By synthesizing generative AI (LLaMA 3.1 & Gemini), optical character recognition (Tesseract.js), real-time WebSockets, Monaco code execution, interactive 3D/2.5D lab apparatus simulators, and gamified study analytics, Smart-LMS transforms traditional education into an adaptive, personalized experience for students and educators alike.

---

## 🌟 Core Feature Domains & Modules

Smart-LMS is structured into **12 core feature domains**:

```
                                      Smart-LMS Platform
                                              │
    ┌────────────────┬────────────────────────┼────────────────────────┬──────────────────────┐
    │                │                        │                        │                      │
🔬 3D Virtual Lab   🎯 Exam Tools           💻 CodePilot             🤖 AI Tutor            📄 OCR & Study
    │                │                        │                        │                      │
🧠 Gamification     📅 AI Planner            💬 WebSockets & WebRTC   📊 Analytics Hub       🎥 YouTube Engine
```

---

### 1. 🔬 3D Virtual Practical Laboratory & AI Doubt Solver
* **100% CBSE Syllabus Coverage**: Complete interactive lab simulator covering official CBSE Class 10 and Class 12 Science practicals (36 Class 12 + 16 Class 10 experiments across Physics, Chemistry, and Biology).
* **Interactive Visual Apparatus Workbenches**:
  * **Physics**: Meter Bridge 100cm wire board with sliding jockey, Potentiometer 4-meter wire board with Leclanche/Daniel cells, Galvanometer Half-Deflection & Voltmeter/Ammeter Conversion circuits, Logic Gate IC Trainer Board with live binary switches, Prism VIBGYOR rainbow spectrum, Optical bench $u\text{-}v$ rails, Sonometer AC mains resonance, p-n Diode & Zener Voltage Regulator.
  * **Chemistry**: Titration Burette & Flask with live pH color transition, 0-14 pH Paper Spectrum Chart, Qualitative Salt Analysis Cation/Anion Flame & Test Tube Matrix (Brown Ring test, $\text{PbI}_2$ yellow ppt, $\text{AgCl}$ white ppt), Organic Functional Group reaction diagrams (Tollen's Silver Mirror, Fehling's red ppt, Biuret test).
  * **Biology**: $400\times / 1000\times$ Compound Microscope Lens View (Onion Root Tip Mitosis, Stomata Guard Cells, Pollen Germination, Mammalian Gametes), $1\text{m}\times 1\text{m}$ Ecology Quadrat Grid, and Spooled Plant DNA threads.
* **Dynamic AI Practical Doubt Solver**: Pre-populated, experiment-tailored question chips and instant AI practical solutions rendered with markdown typography, bold badges, numbered steps, and equations.
* **Digital Laboratory Observation Table**: Adjustable real-time apparatus variable sliders, step-by-step procedure guides, and 1-click observation recording.

---

### 2. 🎯 Exam-Special Tools & Target Exam Suite
* **Comprehensive Competitive Exam Coverage**: Dedicated modules for **CBSE Board**, **JEE Main & Advanced**, **NEET**, **GATE**, **CUET**, **NDA/CDS**, **SSC/UPSC**, **Foundation/Olympiad**, and **State Boards**.
* **Target Exam Topic Store**: Custom topic mappings and subject selection (`Physics`, `Chemistry`, `Mathematics`, `Biology`, `Computer Science`, `General Studies`) tailored to target exam syllabi.
* **Formula Revision Cards**: Interactive digital formula cheat-sheets with LaTeX rendering and quick lookup.
* **Timed Mock Tests**: Customizable full-length and topic-wise mock examinations with instant automated scoring and weakness analysis.

---

### 3. 💻 CodePilot — Monaco IDE & Developer Suite
* **Interactive Monaco Code Editor**: Full-featured browser IDE with syntax highlighting, auto-completion, line numbers, and multi-language support (JavaScript, Python, C++, Java).
* **DSA Mastery & Problem Library**: Comprehensive Data Structures & Algorithms problem set categorised by difficulty (Easy, Medium, Hard) and topics (Arrays, Trees, Graphs, Dynamic Programming).
* **Personalized AI Roadmaps**: Generates custom step-by-step career and learning roadmaps tailored to student target roles (e.g., Full-Stack Engineer, AI/ML Specialist).
* **AI Technical Mock Interviews & Resume Analyzer**: Simulated AI-driven technical interviews with performance evaluation and automated resume ATS score feedback.
* **Placement & Competitive Coding**: Timed coding contest platform, engineering exam practice modules, and student portfolio generator with GitHub integration.

---

### 4. 🤖 AI Tutor & Automated Homework Solver
* **Step-by-Step Explanations**: Instant step-by-step problem breakdown across Mathematics, Physics, Chemistry, Computer Science, and Humanities.
* **Multi-Mode Assistance**: Toggle between **Hint Mode** (guided discovery), **Step-by-Step** (detailed walkthrough), and **Direct Answer** (full solution).
* **Rich Markdown & LaTeX**: Full rendering of mathematical formulas, code blocks with syntax highlighting, and chemical equations.
* **Adaptive XP Rewards**: Automatically updates study streaks and awards experience points (XP) based on query interaction.

---

### 5. 📄 Study Mode, Smart Uploads & OCR Engine
* **Multimodal Uploads**: Drag-and-drop support for images, PDFs, scanned lecture notes, and diagrams.
* **Client-Side & Server OCR**: Integrated **Tesseract.js** optical character recognition engine extracts plaintext from uploaded images or hand-written notes.
* **Smart Summaries & Flashcards**: Converts extracted text into concise study summaries and auto-generated interactive digital flashcard decks.

---

### 6. 🧠 Gamified Learning & Critical Thinking
* **Brain Puzzle Platform**: Interactive logic, pattern recognition, and math challenges to boost cognitive skills.
* **Gamification Engine**:
  * **XP & Leveling System**: Earn XP for solving problems, reading notes, completing quizzes, and lab experiments.
  * **Rank Tiers**: Automatic progression across 5 ranks (`Beginner` ➔ `Intermediate` ➔ `Advanced` ➔ `Master` ➔ `Grandmaster`).
  * **Daily Missions**: Dynamic daily goals (e.g., "Solve 3 CodePilot Problems", "Complete 1 Practical Lab Experiment").
  * **Daily Streaks**: Consecutive activity tracking with bonus multipliers.
  * **Achievement Badges**: Unlockable badges like *"Focus Beast"*, *"Streak Monster"*, and *"Code Ninja"*.

---

### 7. 📅 AI Planner & Risk Score Engine
* **Dynamic Study Schedules**: Weekly task organizer with auto-prioritization and deadline tracking.
* **Predictive Risk Assessment**: Real-time study risk metric (**Low**, **Medium**, **High**) calculated based on accuracy, completion rates, and streak consistency.
* **AI Weekly Remediation**: Weekly review drawer providing targeted action plans to fix weak topics.

---

### 8. 💬 Real-Time Collaboration, Social Chat & WebRTC
* **Instant Direct Messaging**: Peer-to-peer real-time chat powered by Socket.IO.
* **Group Study Rooms**: Multi-user study channels with shared notes and group message broadcasting.
* **Live Presence Tracking**: Real-time online/offline status indicators.
* **Voice Messaging**: Integrated audio recorder for direct voice notes.
* **WebRTC Peer Video Calling**: Audio/Video calls directly inside the browser using WebSockets signal exchange.

---

### 9. 📊 Comprehensive Analytics & Performance Insights
* **Visual Dashboards**: Interactive charts powered by **Recharts** displaying daily study hours, notes generated, questions answered, and quiz trends.
* **Subject Mastery Radar**: Visual breakdown of strong vs weak subjects.
* **Exam Readiness Gauge**: Quantitative score reflecting exam preparation progress.

---

### 10. 🎥 YouTube Learning Hub
* **Curated Educational Search**: Integrated Invidious & YouTube Data API v3 search tailored for computer science, engineering, and academic subjects.
* **AI Video Summarizer**: Instant breakdown of YouTube video transcripts into bulleted takeaways.
* **Personalized Watchlists**: Save and bookmark videos for revision.

---

### 11. ⏱️ Focus Timer & Productivity Suite
* **Pomodoro Timer**: Customizable study/break intervals with visual circular progress ring.
* **Session Logging**: Tracks completed focus blocks and updates overall study hours.
* **Distraction Counter**: Log interrupters to improve concentration over time.

---

### 12. 📚 Books & Library Management
* **Resource Directory**: Digital library catalog for textbooks, reference guides, and PDF documentation.
* **Downloadable Guides**: Built-in developer guides (`Smart_LMS_Navigation_Bar_Guide.pdf`, `Smart_LMS_Project_Documentation.pdf`, `Smart_LMS_Teammate_Developer_Guide.pdf`).

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────┐       HTTP / REST API       ┌─────────────────────────────────┐
│  React 18 + Vite Frontend       ├────────────────────────────►│ Express 4 Backend Server        │
│  • TypeScript & Tailwind CSS v4 │                             │ (Node.js Engine)                │
│  • React Router v7              │◄────────────────────────────┤ • Helmet & Express Rate Limit  │
└────────────────┬────────────────┘     JSON API Responses      └────────────────┬────────────────┘
                 │                                                               │
                 │ WebSockets (Socket.IO)                                        │ Mongoose ORM
                 ▼                                                               ▼
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│ Real-Time Peer Chat & WebRTC    │                             │ MongoDB Database                │
│ (Presence & Voice Notes)        │                             │ (16 Schemas / Collections)      │
└─────────────────────────────────┘                             └────────────────┬────────────────┘
                                                                                 │
                                                                                 │ REST / SDK Calls
                                                                                 ▼
                                                                ┌─────────────────────────────────┐
                                                                │ AI & Processing Services        │
                                                                │ • Groq SDK (LLaMA 3.1)          │
                                                                │ • Google Gemini SDK             │
                                                                │ • Tesseract.js (OCR Engine)     │
                                                                │ • Cheerio & PDF Parser          │
                                                                └─────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3 + TypeScript | Component-driven declarative UI |
| **Routing** | React Router v7 | Modern single-page app client routing |
| **Build Tool & Bundler** | Vite 6.3 | Fast HMR development server & production builder |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React | Utility-first CSS engine & accessible icon set |
| **UI Primitives** | Radix UI + Emotion + Material UI 7 | Accessible unstyled primitives & custom controls |
| **Charts & Visuals** | Recharts | Data visualization for performance analytics |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-powered browser code editing |
| **Backend Runtime** | Node.js (v18 / v20) + Express 4 | High-performance asynchronous REST API server |
| **Database** | MongoDB + Mongoose 9 | NoSQL document storage & schema validation |
| **Real-Time Engine** | Socket.IO 4.8 | Bidirectional WebSockets for messaging & presence |
| **AI LLM Services** | Groq SDK (`llama-3.1-8b-instant`) + Google Gemini | High-speed inference engines for tutoring & code prep |
| **OCR Engine** | Tesseract.js 7.0 | Optical character recognition for uploaded study notes |
| **Document Processing** | Sharp + pdf-parse + Cheerio | Server-side image manipulation & document parsing |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | Secure stateless authentication & password hashing |

---

## 📂 Directory Structure

```
Smart-LMS/
├── backend/                        # Node.js & Express API Server
│   ├── src/
│   │   ├── config/                 # Database & service configurations (MongoDB, Groq, Gemini, Kafka, RabbitMQ, OCR)
│   │   ├── controllers/            # Request handlers (AI, Auth, CodePilot, Exam Tools, Planner, Brain, Friends, Groups, etc.)
│   │   ├── middleware/             # JWT authentication, validation & express-rate-limit middleware
│   │   ├── models/                 # 16 Mongoose Database Schemas
│   │   │   ├── user.model.js       # User profile, analytics & gamification stats
│   │   │   ├── planner.model.js    # Weekly plans & risk indicators
│   │   │   ├── brain.model.js      # Brain puzzle states & intelligence scores
│   │   │   ├── group.model.js      # Study group configuration & member lists
│   │   │   ├── note.model.js       # Saved notes, flashcards & OCR output
│   │   │   ├── problem.model.js    # DSA problems & submission logs
│   │   │   ├── mocktest.model.js   # Timed mock test configurations
│   │   │   └── friendMessage.model.js
│   │   ├── prompts/                # AI Prompt Templates (Groq & Gemini)
│   │   ├── routes/                 # 22 Express API Route files
│   │   ├── services/               # AI Engine wrappers, analytics & YouTube handlers
│   │   └── server.js               # Express server entry point, Socket.IO & middleware setup
│   ├── .env.example                # Backend environment variable template
│   └── package.json
│
├── frontend/                       # Vite + React 18 + TypeScript App
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── ai-tutor/       # AI Tutor chat interface
│   │   │   │   ├── analytics/      # Recharts performance metrics
│   │   │   │   ├── codepilot/      # Monaco editor, DSA solver, roadmaps, resume review, contests
│   │   │   │   ├── critical/       # Logic/Math brain puzzles
│   │   │   │   ├── dashboard/      # Main student dashboard & widgets
│   │   │   │   ├── exam-tools/     # Exam tools & Virtual Practical Lab
│   │   │   │   ├── focus/          # Pomodoro timer component
│   │   │   │   ├── friends/        # Chat messaging & WebRTC video calls
│   │   │   │   ├── planner/        # Risk assessment & task scheduler
│   │   │   │   ├── quiz/           # Timed quizzes & confetti feedback
│   │   │   │   ├── study/          # File upload & OCR extraction viewer
│   │   │   │   └── youtube/        # Video search & AI transcript summarizer
│   │   │   ├── context/            # AuthContext & ThemeContext providers
│   │   │   ├── lib/                # API client, markdown renderer & topic stores
│   │   │   └── routes.tsx          # React Router v7 routes setup
│   ├── .env.example                # Frontend environment variable template
│   ├── package.json
│   └── vite.config.ts
│
├── project_documentation.html      # Comprehensive developer manual
├── render.yaml                     # Render backend deployment descriptor
└── README.md                       # Main Repository Readme
```

---

## 🚀 Installation & Local Setup

### Prerequisites
* **Node.js**: `v18.x` or `v20.x` installed
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
* **Package Manager**: `npm` or `pnpm`

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/Smart-LMS.git
cd Smart-LMS
```

---

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Configure your `.env` file in `/backend`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-lms
JWT_SECRET=super_secret_jwt_key_smart_lms_2026
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_v3_api_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```
*Backend API server runs on `http://localhost:5000`*

---

### Step 3: Frontend Setup
Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install   # or npm install

# Create environment configuration file
cp .env.example .env
```

Configure `.env` in `/frontend`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:
```bash
pnpm dev      # or npm run dev
```
*Frontend application opens on `http://localhost:5173`*

---

## 🔑 Environment Variables Catalog

### Backend Environment Variables (`/backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | ❌ | `5000` | HTTP port backend server listens on |
| `MONGO_URI` | ✅ | - | MongoDB connection URI |
| `JWT_SECRET` | ✅ | - | Secret key used to sign & verify JWT tokens |
| `GROQ_API_KEY` | ✅ | - | Groq API Key for LLaMA 3.1 LLM execution |
| `GROQ_MODEL` | ❌ | `llama-3.1-8b-instant` | Groq model identifier |
| `GEMINI_API_KEY` | ❌ | - | Google Gemini API Key |
| `YOUTUBE_API_KEY` | ❌ | - | YouTube Data API v3 Key |
| `CLIENT_URL` | ✅ | `http://localhost:5173` | Allowed origin for CORS validation (supports comma-separated list) |

### Frontend Environment Variables (`/frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | ✅ | `http://localhost:5000/api` | Base REST API URL |
| `VITE_SOCKET_URL` | ✅ | `http://localhost:5000` | Socket.IO server connection URL |

---

## 🔌 Complete API Endpoint Directory

### 1. Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new student account.
* `POST /api/auth/login` — Authenticate user & issue JWT token.
* `GET /api/auth/me` — Retrieve current authenticated user profile.

### 2. AI Engine & Tutor (`/api/ai`)
* `POST /api/ai/solve` — Submit query to AI Tutor for step-by-step, hint, or full solution.
* `POST /api/ai/review` — Generate weekly AI learning remediation review.

### 3. CodePilot & Monaco IDE (`/api/codepilot`)
* `GET /api/codepilot/problems` — Fetch categorized DSA coding problems.
* `POST /api/codepilot/run` — Test & execute code snippets in Monaco editor context.
* `POST /api/codepilot/resume` — Analyze uploaded resume against software engineering ATS criteria.
* `POST /api/codepilot/mock-interview` — Initiate AI technical mock interview session.

### 4. Planner & Risk Engine (`/api/planner`)
* `GET /api/planner/my-plan` — Retrieve weekly study tasks & risk score.
* `POST /api/planner/task` — Add new study task with target deadline.
* `PUT /api/planner/task/:id` — Update study task completion status.

### 5. Brain & Gamification (`/api/brain`)
* `GET /api/brain/puzzles` — Fetch active logic and math brain puzzles.
* `POST /api/brain/submit-game` — Validate puzzle solution, award XP, and recompute rank.

### 6. Social, Chat & Peer WebRTC (`/api/friends`, `/api/groups`)
* `GET /api/friends/list` — Retrieve friend list & live online presence status.
* `POST /api/groups/create` — Form a new study group channel.
* `GET /api/groups/:id/messages` — Fetch historical group chat messages.

### 7. OCR & Study Materials (`/api/ocr`, `/api/notes`)
* `POST /api/ocr/extract` — Process image/PDF upload and extract text via Tesseract.js.
* `GET /api/notes` — Retrieve user saved notes and generated flashcard decks.

### 8. Analytics & Dashboard (`/api/analytics`, `/api/dashboard`)
* `GET /api/analytics/overview` — Fetch performance metrics, study hours, and subject mastery.
* `GET /api/dashboard/stats` — Retrieve summary statistics for student dashboard widgets.

---

## 🧮 Mathematical Models & Algorithms

### 1. Study Risk Score Formula
The platform computes a dynamic risk score to flag struggling students early:

$$\text{RiskScore} = \text{Clamp}\Big((100 - \text{Accuracy}) \times 0.4 + (100 - \text{Completion}) \times 0.3 + \text{StreakImpact} \times 0.3\Big)$$

* **Risk Tiers**:
  * $0 - 30$: **Low Risk** 🟢
  * $31 - 65$: **Medium Risk** 🟡
  * $66 - 100$: **High Risk** 🔴

### 2. Level & Intelligence Progression
Experience Points (XP) control student leveling and cognitive performance scores:

$$\text{Level} = \lfloor \frac{\text{XP}}{100} \rfloor + 1$$

$$\text{Intelligence Score} = 100 + \lfloor \text{XP} \times 0.8 \rfloor$$

---

## 🛡️ Production Deployment & Hardening

* **Render Deployment** (`render.yaml`): Pre-configured descriptor for automated backend deployment on Render.
* **Express Proxy Trust**: Includes `app.set("trust proxy", 1)` to support load balancers (Render / Nginx) and prevent rate-limiter header crashes (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`).
* **Vercel / Netlify Single-Page Routing**: Pre-configured `vercel.json` rewrite rules to ensure seamless React Router v7 client-side navigation.

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Q: How do I resolve CORS errors when connecting the frontend to the backend?</strong></summary>
<p>Ensure your frontend origin (e.g., <code>http://localhost:5173</code> or your production domain) is added to the <code>CLIENT_URL</code> environment variable in your backend <code>.env</code> file.</p>
</details>

<details>
<summary><strong>Q: Why is OCR text extraction slow on the first attempt?</strong></summary>
<p>On initial execution, Tesseract.js downloads the English language training binary (<code>eng.traineddata</code>). Subsequent scans use the cached language file locally for maximum speed.</p>
</details>

---

## 📄 License & Credits

Built with ❤️ for students, educators, and software engineers worldwide.
* **License**: Open Source under [ISC License](LICENSE)
* **Documentation**: Refer to [project_documentation.html](project_documentation.html) for full architectural blueprints.
