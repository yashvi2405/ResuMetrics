import os
from fastapi import UploadFile

def validate_file(file: UploadFile, allowed_extensions: set, max_file_size: int) -> dict:
    """Validate uploaded file"""
    
    # Check file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_extensions:
        return {
            "valid": False,
            "error": f"Invalid file format. Allowed formats: {', '.join(allowed_extensions)}"
        }
    
    # Check file size (FastAPI provides size, but we need to read it)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to beginning
    
    if file_size > max_file_size:
        return {
            "valid": False,
            "error": f"File too large. Maximum size: {max_file_size // (1024*1024)}MB"
        }
    
    return {"valid": True, "error": None}