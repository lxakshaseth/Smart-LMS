# 🚀 Smart-LMS — AI-Powered Learning Management System

> **Next-Generation Full-Stack AI Learning Management, Code Execution & Developer Interview Preparation Platform.**

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

**Smart-LMS** is an enterprise-grade, full-stack AI-driven Learning Management System designed to modernize academic learning, interview preparation, and developer training. By synthesizing generative AI (LLaMA 3.1 & Gemini), optical character recognition (Tesseract.js), real-time WebSockets, Monaco code execution, and gamified study analytics, Smart-LMS transforms traditional learning into an adaptive, personalized experience.

---

## 🌟 Feature Overview & Core Modules

Smart-LMS is structured into **10 core feature domains**:

```
                                  Smart-LMS Platform
                                          │
    ┌────────────────┬────────────────────┼────────────────────┬────────────────┐
    │                │                    │                    │                │
🤖 AI Tutor    💻 CodePilot        📄 OCR & Study        🧠 Gamification   📅 AI Planner
    │                │                    │                    │                │
💬 WebRTC Chat 📊 Analytics        🎥 YouTube Hub        ⏱️ Focus Timer   📚 Book Library
```

---

### 1. 🤖 AI Tutor & Automated Problem Solver
* **Step-by-Step Explanations**: Instant step-by-step problem breakdown across Mathematics, Physics, Chemistry, Computer Science, and Humanities.
* **Multi-Mode Assistance**: Toggle between **Hint Mode** (guided discovery), **Step-by-Step** (detailed walkthrough), and **Direct Answer** (full solution).
* **Rich Markdown & LaTeX**: Full rendering of mathematical formulas, code blocks with syntax highlighting, and chemical equations.
* **Adaptive XP Rewards**: Automatically updates study streaks and awards experience points (XP) based on query interaction.

---

### 2. 💻 CodePilot — Developer Prep & Monaco IDE Suite
* **Interactive Monaco Code Editor**: Full-featured code editor with syntax highlighting, auto-completion, line numbers, and multi-language support (JavaScript, Python, C++, Java).
* **DSA Mastery & Problem Library**: Comprehensive Data Structures & Algorithms problem set categorised by difficulty (Easy, Medium, Hard) and topics (Arrays, Trees, Graphs, Dynamic Programming).
* **Personalized AI Roadmaps**: Generates custom step-by-step career and learning roadmaps tailored to student target roles (e.g. Full-Stack Engineer, ML Engineer).
* **AI Mock Interviews & Resume Analyzer**: Simulated AI-driven technical interviews with performance evaluation and automated resume feedback.
* **Placement & Competitive Coding**: Timed coding contest platform, engineering exam practice modules, and student portfolio generator with GitHub integration.

---

### 3. 📄 Study Mode, Smart Uploads & OCR Engine
* **Multimodal Uploads**: Drag-and-drop support for images, PDFs, scanned lecture notes, and diagrams.
* **Client-Side/Server OCR**: Integrated **Tesseract.js** optical character recognition engine extracts plaintext from uploaded images or hand-written notes.
* **Smart Summaries & Flashcards**: Converts extracted text into concise study summaries and auto-generated interactive digital flashcard decks.

---

### 4. 🧠 Gamified Learning & Critical Thinking
* **Brain Puzzle Platform**: Interactive logic, pattern recognition, and math challenges to boost cognitive skills.
* **Gamification Engine**:
  * **XP & Leveling System**: Earn XP for solving problems, reading notes, and completing quizzes.
  * **Rank Tiers**: Automatic progression across 5 ranks (`Beginner` ➔ `Intermediate` ➔ `Advanced` ➔ `Master` ➔ `Grandmaster`).
  * **Daily Missions**: Dynamic daily goals (e.g. "Solve 3 Code Pilot Problems", "Complete 1 Quiz").
  * **Daily Streaks**: Consecutive activity tracking with bonus multipliers.
  * **Achievement Badges**: Unlockable badges like *"Focus Beast"*, *"Streak Monster"*, and *"Code Ninja"*.

---

### 5. 📅 AI Planner & Risk Score Engine
* **Dynamic Study Schedules**: Weekly task organizer with auto-prioritization and deadline tracking.
* **Predictive Risk Assessment**: Real-time study risk metric (**Low**, **Medium**, **High**) calculated based on accuracy, completion rates, and streak consistency.
* **AI Weekly Remediation**: Weekly review drawer providing targeted action plans to fix weak topics.

---

### 6. 💬 Real-Time Collaboration, Social Chat & WebRTC
* **Instant Direct Messaging**: Peer-to-peer real-time chat powered by Socket.IO.
* **Group Study Rooms**: Multi-user study channels with shared notes and group message broadcasting.
* **Live Presence Tracking**: Real-time online/offline status indicators.
* **Voice Messaging**: Integrated audio recorder for direct voice notes.
* **WebRTC Peer Video Calling**: Audio/Video calls directly inside the browser using WebSockets signal exchange.

---

### 7. 📊 Comprehensive Analytics & Performance Insights
* **Visual Dashboards**: Interactive charts powered by **Recharts** displaying daily study hours, notes generated, questions answered, and quiz trends.
* **Subject Mastery Radar**: Visual breakdown of strong vs weak subjects.
* **Exam Readiness Gauge**: Quantitative score reflecting exam preparation progress.

---

### 8. 🎥 YouTube Learning Hub
* **Curated Educational Search**: Integrated YouTube Data API v3 search tailored for computer science, engineering, and academic subjects.
* **AI Video Summarizer**: Instant breakdown of YouTube video transcripts into bulleted takeaways.
* **Personalized Watchlists**: Save and bookmark videos for revision.

---

### 9. ⏱️ Focus Timer & Productivity Suite
* **Pomodoro Timer**: Customizable study/break intervals with visual circular progress ring.
* **Session Logging**: Tracks completed focus blocks and updates overall study hours.
* **Distraction Counter**: Log interrupters to improve concentration over time.

---

### 10. 📚 Books & Library Management
* **Resource Directory**: Digital library catalog for textbooks, reference guides, and PDF documentation.
* **Downloadable Guides**: Native project guides included (`Smart_LMS_Navigation_Bar_Guide.pdf`, `Smart_LMS_Project_Documentation.pdf`).

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────┐       HTTP / REST API        ┌────────────────────────┐
│  React 18 +     ├─────────────────────────────►│ Express 4 Backend      │
│  Vite Frontend  │                              │ (Node.js Engine)       │
│  (Tailwind v4)  │◄─────────────────────────────┤                        │
└────────┬────────┘      JSON API Responses      └───────────┬────────────┘
         │                                                   │
         │ WebSockets (Socket.IO)                            │ Mongoose ORM
         ▼                                                   ▼
┌─────────────────┐                              ┌────────────────────────┐
│ Real-Time Peer  │                              │ MongoDB Database       │
│ Chat & WebRTC   │                              │ (14 Data Collections)  │
└─────────────────┘                              └────────────────────────┘
                                                             │
                                                             │ REST / SDK Calls
                                                             ▼
                                                 ┌────────────────────────┐
                                                 │ AI Service Providers   │
                                                 │ • Groq (LLaMA 3.1)     │
                                                 │ • Google Gemini        │
                                                 │ • Tesseract.js (OCR)   │
                                                 └────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3 + TypeScript | Component-driven declarative UI |
| **Build Tool & Bundler** | Vite 6.3 | Fast HMR development server & production builder |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React | Modern utility-first CSS & accessible icon set |
| **UI Components** | Radix UI + Emotion + Material UI | Accessible unstyled primitives & custom controls |
| **Charts & Visuals** | Recharts | Data visualization for performance analytics |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-powered browser code editing |
| **Backend Runtime** | Node.js (v18 / v20) + Express 4 | High-performance asynchronous REST API server |
| **Database** | MongoDB + Mongoose 9 | NoSQL document storage & schema validation |
| **Real-Time Engine** | Socket.IO 4.8 | Bidirectional WebSockets for messaging & presence |
| **AI LLM Services** | Groq SDK (`llama-3.1-8b-instant`) + Google Gemini | High-speed inference engines for tutoring & code prep |
| **OCR Engine** | Tesseract.js 7.0 | Optical character recognition for uploaded study notes |
| **Image Processing** | Sharp | High-performance server-side image manipulation |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | Secure stateless authentication & password hashing |

---

## 📂 Directory Structure

```
Smart-LMS/
├── backend/                        # Node.js & Express API Server
│   ├── src/
│   │   ├── config/                 # DB connection setup (MongoDB Mongoose)
│   │   ├── controllers/            # Request handlers (AI, Auth, CodePilot, Planner, etc.)
│   │   ├── middleware/             # JWT Auth & rate-limiting middleware
│   │   ├── models/                 # 14 Mongoose Database Schemas
│   │   │   ├── user.model.js       # User profile, analytics & gamification stats
│   │   │   ├── planner.model.js    # Weekly plans & risk indicators
│   │   │   ├── brain.model.js      # Brain puzzle states & intelligence scores
│   │   │   ├── group.model.js      # Study group configuration & member lists
│   │   │   ├── note.model.js       # Saved notes, flashcards & OCR output
│   │   │   └── problem.model.js    # DSA problems & submission logs
│   │   ├── prompts/                # AI Prompt Templates (Groq & Gemini)
│   │   ├── routes/                 # 22 Express API Route files
│   │   ├── services/               # AI Engine wrappers, analytics & YouTube handlers
│   │   └── server.js               # Entry point, Socket.IO & Express configuration
│   ├── .env.example                # Backend environment variable template
│   └── package.json
│
├── frontend/                       # Vite + React + TypeScript App
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── ai-tutor/       # AI Tutor chat interface
│   │   │   │   ├── analytics/      # Recharts performance metrics
│   │   │   │   ├── codepilot/      # Monaco editor, DSA solver, roadmaps, resume review
│   │   │   │   ├── critical/       # Logic/Math brain puzzles
│   │   │   │   ├── dashboard/      # Main student dashboard
│   │   │   │   ├── focus/          # Pomodoro timer component
│   │   │   │   ├── friends/        # Chat messaging & WebRTC video calls
│   │   │   │   ├── planner/        # Risk assessment & task scheduler
│   │   │   │   ├── quiz/           # Timed quizzes & confetti feedback
│   │   │   │   ├── study/          # File upload & OCR extraction viewer
│   │   │   │   └── youtube/        # Video search & summary modal
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
* **MongoDB**: Running local instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
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
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
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

Start the backend server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5000`*

---

### Step 3: Frontend Setup
Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
pnpm install   # or npm install

# Create environment file
cp .env.example .env
```

Configure `.env` in `/frontend`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```
*Frontend app opens on `http://localhost:5173`*

---

## 🔑 Environment Variables Catalog

### Backend Environment Variables (`/backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | ❌ | `5000` | HTTP port server listens on |
| `MONGO_URI` | ✅ | - | MongoDB connection URI |
| `JWT_SECRET` | ✅ | - | Secret key used to sign & verify JWT tokens |
| `GROQ_API_KEY` | ✅ | - | Groq API Key for LLaMA 3.1 LLM execution |
| `GROQ_MODEL` | ❌ | `llama-3.1-8b-instant` | Groq model identifier |
| `GEMINI_API_KEY` | ❌ | - | Google Gemini API Key |
| `YOUTUBE_API_KEY` | ❌ | - | YouTube Data API v3 Key |
| `CLIENT_URL` | ✅ | `http://localhost:5173` | Allowed origin for CORS validation |

### Frontend Environment Variables (`/frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | ✅ | `http://localhost:5000/api` | Base REST API URL |
| `VITE_SOCKET_URL` | ✅ | `http://localhost:5000` | Socket.IO server connection URL |

---

## 🔌 API Endpoint Directory

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new student account.
* `POST /api/auth/login` — Authenticate student & receive JWT token.

### AI Engine (`/api/ai`)
* `POST /api/ai/solve` — Submit query to AI Tutor for structured solution/hint.
* `POST /api/ai/review` — Generate weekly AI learning review.

### CodePilot (`/api/codepilot`)
* `GET /api/codepilot/problems` — Fetch categorized DSA coding problems.
* `POST /api/codepilot/run` — Test & execute code snippets in Monaco context.
* `POST /api/codepilot/resume` — Analyze uploaded resume against software engineering criteria.

### Planner & Risk Engine (`/api/planner`)
* `GET /api/planner/my-plan` — Retrieve weekly study tasks & risk score.
* `POST /api/planner/task` — Add new study task with target deadline.

### Brain & Gamification (`/api/brain`)
* `GET /api/brain/puzzles` — Fetch active logic and math brain puzzles.
* `POST /api/brain/submit-game` — Validate answer, award XP, and recalculate rank.

### Social & Chat (`/api/friends`, `/api/groups`)
* `GET /api/friends/list` — Retrieve friend list & live online status.
* `POST /api/groups/create` — Form a new study group room.

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
Experience Points (XP) control student leveling:

$$\text{Level} = \lfloor \frac{\text{XP}}{100} \rfloor + 1$$

$$\text{Intelligence Score} = 100 + \lfloor \text{XP} \times 0.8 \rfloor$$

---

## 🛡️ Production Deployment & Hardening

* **Render Deployment** (`render.yaml`): Pre-configured for automated backend deployment.
* **Express Proxy Trust**: Configured `app.set("trust proxy", 1)` to support reverse proxies (Render / Nginx) and prevent rate limiter header errors (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`).
* **Vercel / Netlify Frontend**: Pre-configured `vercel.json` for single-page app fallback routing.

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Q: CORS error when calling backend from frontend?</strong></summary>
<p>Ensure your frontend origin (e.g. <code>http://localhost:5173</code> or your production domain) is specified in <code>CLIENT_URL</code> in your backend <code>.env</code> file.</p>
</details>

<details>
<summary><strong>Q: Tesseract OCR is slow on initial extract?</strong></summary>
<p>On first run, Tesseract downloads the English language training binary (<code>eng.traineddata</code>). Subsequent extractions utilize cached data locally.</p>
</details>

---

## 📄 License & Credits

Built with ❤️ for learners, educators, and software engineers worldwide.
* **License**: Open Source under [ISC License](LICENSE)
* **Documentation**: See [project_documentation.html](project_documentation.html) for full system architecture blueprints.
