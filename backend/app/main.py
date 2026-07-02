from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.database.db_manager import mongo_manager
from app.routes import auth, resume, analysis, dashboard, chat
from app.config import Config

app = FastAPI(title="Resume Insight Tool", version="1.0.0")

@app.on_event("startup")
async def startup_db_client():
    await mongo_manager.db["users"].create_index("email", unique=True)
    await mongo_manager.db["users"].create_index("user_id", unique=True)
    await mongo_manager.db["resumes"].create_index("resume_id", unique=True)
    await mongo_manager.db["analysis_results"].create_index("resume_id")
    await mongo_manager.db["extracted_data"].create_index("resume_id")
    await mongo_manager.db["feedbacks"].create_index("resume_id")

# CORS middleware
origins = [
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:3002", 
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:3001", 
    "http://127.0.0.1:5173"
]

env_origins = os.getenv("CORS_ALLOWED_ORIGINS")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(Config.UPLOAD_DIR, exist_ok=True)

# Include routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(chat.router)

# Root endpoints
@app.get("/")
async def root():
    return {"message": "Resume Insight Tool API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    try:
        await mongo_manager.client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"disconnected: {str(e)}"}

# Add this - API health endpoint
@app.get("/api/health")
async def api_health_check():
    try:
        await mongo_manager.client.admin.command('ping')
        return {"status": "healthy", "database": "connected", "api": "working"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"disconnected: {str(e)}", "api": "working"}

@app.get("/api")
async def api_root():
    return {"message": "Resume Insight Tool API", "version": "1.0.0"}