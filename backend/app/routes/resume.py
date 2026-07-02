import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime
from app.database.db_manager import get_db, get_next_sequence_value
from app.models.user import User
from app.models.resume import Resume
from app.routes.auth import get_current_user
from app.config import Config
from app.utils.file_validator import validate_file

router = APIRouter(prefix="/api/resume", tags=["resume management"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Validate file
    validation_result = validate_file(file, Config.ALLOWED_EXTENSIONS, Config.MAX_FILE_SIZE)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["error"])
    
    # Create upload directory if not exists
    os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{current_user.user_id}_{timestamp}{file_extension}"
    file_path = os.path.join(Config.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save to database
    resume_id = await get_next_sequence_value("resume_id")
    resume_doc = {
        "resume_id": resume_id,
        "user_id": current_user.user_id,
        "resume_file_name": file.filename,
        "file_format": file_extension,
        "file_size": file.size,
        "upload_date": datetime.utcnow(),
        "resume_path": file_path
    }
    await db["resumes"].insert_one(resume_doc)
    
    return {
        "message": "Resume uploaded successfully",
        "resume_id": resume_id,
        "file_name": file.filename
    }

@router.get("/list")
async def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    resumes_cursor = db["resumes"].find({"user_id": current_user.user_id})
    resumes = await resumes_cursor.to_list(None)
    return [
        {
            "resume_id": r["resume_id"],
            "file_name": r["resume_file_name"],
            "upload_date": r["upload_date"],
            "file_size": r["file_size"]
        }
        for r in resumes
    ]