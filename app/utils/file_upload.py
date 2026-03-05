import os
import shutil
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    original_filename = upload_file.filename
    if not original_filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Optional: secure filename and create unique name
    base_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(base_dir, exist_ok=True)
    
    file_path = os.path.join(base_dir, original_filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    
    # Return the relative path for the database image_url
    return f"{settings.UPLOAD_DIR}/{subfolder}/{original_filename}".replace("//", "/").strip("/")

def delete_file(file_path: str) -> bool:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
