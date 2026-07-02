# 📄 Resume Insight Tool

A full-stack AI-powered resume analysis and career coaching platform. Upload your resume, get an ATS compatibility score, receive tailored improvement feedback, and practice mock technical interviews — all powered by Groq's LLaMA AI on the backend.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Resume Upload** | Upload PDF or DOCX resumes for instant parsing and analysis |
| 📊 **ATS Scoring** | Receive an overall ATS compatibility score with keyword, skill, and formatting breakdowns |
| 🤖 **AI Resume Coach** | Chat with an AI career counselor for tailored resume improvement advice |
| 🎤 **Mock Interviews** | Conduct AI-powered simulated technical interviews personalized to your resume skills |
| 📈 **Dashboard Analytics** | Track your score history, top skills, and performance trends over time |
| 🗓️ **Job Schedule** | Keep track of application deadlines and interview milestones |
| 📚 **Prep Hub** | Study curated interview questions and resources |
| 🎨 **Themes** | Choose from multiple UI themes (Cyber Stealth, Ivory Minimalist, VS Code Dark) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — fast SPA development
- **Vanilla CSS** — custom design system with CSS variables
- **React Router v6** — client-side routing
- **Axios** — HTTP client for API communication
- **React Hot Toast** — notification toasts
- **React Icons** — icon library

### Backend
- **FastAPI** — async Python web framework
- **Motor** (`motor.motor_asyncio`) — async MongoDB driver
- **MongoDB Atlas** — cloud database (also works with local MongoDB)
- **Python-JOSE** — JWT authentication
- **Passlib + bcrypt** — secure password hashing
- **spaCy + NLTK** — NLP-based resume text extraction
- **Groq API** (`llama-3.3-70b-versatile`) — AI chat completions proxy

---

## 📁 Project Structure

```
resume_analyzer/
├── backend/
│   ├── app/
│   │   ├── config.py           # Environment configuration
│   │   ├── main.py             # FastAPI app entry point + CORS
│   │   ├── database/
│   │   │   └── db_manager.py   # MongoDB AsyncIOMotorClient setup
│   │   ├── models/             # MongoModel schema wrappers
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.py         # Register, login, JWT
│   │   │   ├── resume.py       # Upload & list resumes
│   │   │   ├── analysis.py     # Run & retrieve resume analysis
│   │   │   ├── dashboard.py    # Stats, trends, skill gaps
│   │   │   └── chat.py         # Groq AI chat proxy
│   │   ├── services/           # Resume parser, ATS scorer, ML scoring
│   │   └── utils/              # File validation helpers
│   ├── uploads/resumes/        # Stored resume files (gitignored)
│   ├── .env.example            # Environment variable template
│   ├── requirements.txt        # Python dependencies
│   └── run.py                  # Uvicorn server launcher
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Full page components
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context (React Context API)
│   │   ├── services/api.js     # Axios API service layer
│   │   └── main.jsx            # App entry point
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas connection string)
- A **Groq API key** from [console.groq.com](https://console.groq.com/keys)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/resume-insight-tool.git
cd resume-insight-tool
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

Create your environment file from the template:

```bash
cp .env.example .env
```

Fill in your values in `backend/.env`:

```env
GROQ_API_KEY=gsk_your_actual_groq_key_here
SECRET_KEY=your_random_secret_key_here
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=resume_insight
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend server:

```bash
python run.py
```

> API is available at `http://localhost:8000`
> Interactive API docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> Frontend is available at `http://localhost:3000`

---

## ☁️ Production Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist your server IP in **Network Access**
3. Create a database user and copy your connection string
4. Set `MONGO_URL=mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/?retryWrites=true&w=majority`

### Environment Variables (set in your hosting dashboard)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `SECRET_KEY` | Long random string for signing JWT tokens |
| `MONGO_URL` | MongoDB Atlas connection string |
| `MONGO_DB_NAME` | Database name (e.g. `resume_insight`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs |

> ⚠️ **Never commit your `.env` file.** Use `.env.example` as a reference template for teammates.

---

## 🔐 Security Notes

- All passwords are hashed with **bcrypt** before storage
- Authentication uses **JWT Bearer tokens** with configurable expiry
- The Groq API key is stored **only on the server** — it is never sent to the frontend
- Resume files are stored on the server's filesystem; only file metadata is stored in MongoDB

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/resume/upload` | Upload a resume file |
| `GET` | `/api/resume/list` | List all user resumes |
| `POST` | `/api/analysis/analyze/{id}` | Run ATS analysis on a resume |
| `GET` | `/api/analysis/results/{id}` | Get analysis results |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/dashboard/recent-activities` | Recent user activity |
| `GET` | `/api/dashboard/performance-metrics` | Score performance metrics |
| `GET` | `/api/dashboard/skill-gaps` | Identify missing skills |
| `DELETE` | `/api/dashboard/resume/{id}` | Delete a resume and its data |
| `POST` | `/api/chat/groq` | AI chat completions proxy |
| `GET` | `/health` | Backend health check |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
