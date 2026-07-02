import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "resume_insight")
    UPLOAD_DIR = "./uploads/resumes"
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}

    # Groq AI — server-side API key, never exposed to the frontend
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

    # Scoring weights
    SKILL_WEIGHT = 0.35
    EXPERIENCE_WEIGHT = 0.30
    EDUCATION_WEIGHT = 0.20
    FORMATTING_WEIGHT = 0.15