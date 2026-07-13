# 📄 ResuMeterics

A full-stack AI-powered resume analysis and placement preparation platform. Upload your resume, get an ATS compatibility score, practice with an AI career coach powered by Groq LLaMA 3.3, and track your placement readiness — all in one place.

Vercel Link:http://resu-metrics.vercel.app/
---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Resume Upload** | Upload PDF or DOCX resumes for instant parsing and analysis |
| 📊 **ATS Scoring** | ATS compatibility score with keyword, skill, and formatting breakdowns |
| 📈 **Dashboard Analytics** | Track score history, top skills, and performance trends over time |
| 🔍 **Skill Gap Analysis** | Identify missing skills compared to industry benchmarks |
| 🤖 **AI Resume Coach** | Chat with a Groq LLaMA 3.3-powered assistant for tailored resume advice |
| 🎤 **Mock Interview** | Simulate full technical interview rounds with AI feedback and scoring |
| 🎯 **JD Matcher** | Paste any job description and get a keyword match score vs. your resume |
| 📚 **Prep Arena** | CS/Aptitude quizzes, LeetCode study plans, and placement resources — all DB-synced |
| 🗓️ **Job Schedule** | Track application deadlines and interview milestones |
| 🎨 **Themes** | Multiple UI themes (Cyber Stealth, Ivory Minimalist, VS Code Dark) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — fast SPA development
- **Vanilla CSS** — custom design system with CSS variables and theming
- **React Router v6** — client-side routing
- **Axios** — HTTP client for API communication
- **React Hot Toast** — notification toasts
- **React Icons** — icon library

### Backend
- **Node.js 18+** + **Express** — REST API server
- **MongoDB** (native driver) — document database, no ORM
- **JSON Web Tokens** (`jsonwebtoken`) — stateless authentication
- **bcryptjs** — secure password hashing
- **Multer** — multipart file upload handling
- **pdf-parse** — PDF text extraction
- **mammoth** — DOCX text extraction
- **groq-sdk** — Groq AI API client for LLaMA 3.3-70b chat

---

## 📁 Project Structure

```
resume_analyzer/
├── backend/
│   ├── src/
│   │   ├── config.js               # Environment configuration
│   │   ├── db.js                   # MongoDB connection + indexes + auto-increment
│   │   ├── app.js                  # Express app (CORS, routes, health checks)
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT Bearer token middleware
│   │   ├── models/                 # Document schema factories
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   ├── AnalysisResult.js
│   │   │   ├── ExtractedData.js
│   │   │   ├── Feedback.js
│   │   │   ├── PrepProgress.js     # Study plan + solved count per user
│   │   │   └── QuizScore.js        # Quiz results per user/subject/difficulty
│   │   ├── routes/                 # Express route handlers
│   │   │   ├── auth.js             # Register, login, JWT
│   │   │   ├── resume.js           # Upload & list resumes
│   │   │   ├── analysis.js         # Run & retrieve resume analysis
│   │   │   ├── dashboard.js        # Stats, trends, skill gaps, delete
│   │   │   ├── prep.js             # Study progress, quiz scores, JD matcher
│   │   │   └── chat.js             # Groq AI proxy (counselor & interview modes)
│   │   └── services/               # Business logic
│   │       ├── resumeParser.js     # PDF/DOCX extraction + skill/keyword detection
│   │       ├── atsService.js       # ATS compatibility scoring
│   │       └── scoringService.js   # Weighted resume score + feedback
│   ├── uploads/resumes/            # Stored resume files (gitignored)
│   ├── server.js                   # Entry point — connects DB, starts server
│   ├── package.json
│   ├── .env.example                # Environment variable template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Full page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ResumesPage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── AssistantPage.jsx   # AI Coach (Groq-powered)
│   │   │   └── PrepPage.jsx        # Prep Arena (DB-synced)
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # Auth context (React Context API)
│   │   ├── data/mockQuestions.js   # CS & Aptitude quiz question bank
│   │   ├── services/api.js         # Axios API service layer
│   │   └── main.jsx                # App entry point
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js 18+**
- **MongoDB** running locally on port `27017` — or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **Groq API Key** *(optional)* — enables the AI assistant; get one free at [console.groq.com](https://console.groq.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ResuMeterics.git
cd ResuMeterics
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file from the template:

```bash
cp .env.example .env
```

Fill in your values in `backend/.env`:

```env
SECRET_KEY=your_random_secret_key_here
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=resume_insight
PORT=8000

# Optional: comma-separated frontend origins for production CORS
CORS_ALLOWED_ORIGINS=

# Optional: enables the Groq AI assistant (fallback to rule-based if blank)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Start the backend:

```bash
npm run dev    # Development (auto-reload via nodemon)
npm start      # Production
```

> API available at `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

> Frontend available at `http://localhost:5173`

If your backend runs on a different URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## ☁️ Deploying to Render

### Backend (Web Service)
1. Connect your GitHub repo in the [Render dashboard](https://render.com)
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add these environment variables in Render's dashboard:

| Variable | Value |
|---|---|
| `SECRET_KEY` | A long random string |
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `MONGO_DB_NAME` | `resume_insight` |
| `CORS_ALLOWED_ORIGINS` | Your Render frontend URL (e.g. `https://resumeterics.onrender.com`) |
| `GROQ_API_KEY` | Your Groq API key |

### Frontend (Static Site)
1. Add a second Render service — **Static Site**
2. **Root directory:** `frontend`
3. **Build command:** `npm install && npm run build`
4. **Publish directory:** `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` in **Network Access** (or Render's IP)
3. Create a database user and copy your connection string
4. Set `MONGO_URL=mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/?retryWrites=true&w=majority`

---

## 🔐 Security Notes

- All passwords are hashed with **bcrypt** (salt rounds: 12) before storage
- Authentication uses **JWT Bearer tokens** — never stored in cookies
- The Groq API key is kept **server-side only** — never exposed to the browser
- Resume files are stored on the server filesystem; only metadata goes in MongoDB
- `.env` is gitignored — **never commit secrets**

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/auth/logout` | Logout (stateless) |
| `POST` | `/api/auth/refresh` | Refresh JWT token |
| `POST` | `/api/auth/change-password` | Change user password |
| `POST` | `/api/resume/upload` | Upload a resume file (PDF/DOCX) |
| `GET` | `/api/resume/list` | List all user resumes |
| `POST` | `/api/analysis/analyze/:id` | Run ATS analysis on a resume |
| `GET` | `/api/analysis/results/:id` | Get analysis results |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/dashboard/recent-activities` | Recent user activity |
| `GET` | `/api/dashboard/performance-metrics` | Score performance metrics |
| `GET` | `/api/dashboard/skill-gaps` | Identify missing skills |
| `DELETE` | `/api/dashboard/resume/:id` | Delete a resume and all its data |
| `GET` | `/api/prep/progress` | Get active study plan + solved count |
| `POST` | `/api/prep/progress` | Save active study plan + solved count |
| `GET` | `/api/prep/quiz-scores` | Get all quiz scores for the user |
| `POST` | `/api/prep/quiz-scores` | Save a quiz result |
| `POST` | `/api/prep/jd-match/:id` | Match a job description against resume skills |
| `GET` | `/api/chat/status` | Check if Groq AI is configured |
| `POST` | `/api/chat` | Send a message to the Groq AI assistant |
| `GET` | `/api/schedule` | Get all tasks (optional `?date=YYYY-MM-DD` filter) |
| `POST` | `/api/schedule` | Create a new scheduled task |
| `PATCH` | `/api/schedule/:id/toggle` | Toggle task completion status |
| `DELETE` | `/api/schedule/:id` | Delete a task |
| `GET` | `/health` | Backend health check |

---

## 🤖 AI Assistant

The AI assistant uses **Groq's LLaMA 3.3-70b-versatile** model via a secure backend proxy:

- **Counselor mode** — Personalised resume coaching using your actual resume data (score, skills, experience, ATS metrics) as context
- **Mock Interview mode** — Multi-turn technical interview simulation with per-answer feedback and scoring

If `GROQ_API_KEY` is not set, the assistant falls back to a built-in rule-based engine with no degradation to other features.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
