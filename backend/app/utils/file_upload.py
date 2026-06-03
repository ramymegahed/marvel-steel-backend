import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(upload_file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    base_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(base_dir, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(base_dir, safe_filename)

    try:
        size = 0
        with open(file_path, "wb") as buffer:
            while chunk := upload_file.file.read(8192):
                size += len(chunk)
                if size > MAX_FILE_SIZE_BYTES:
                    buffer.close()
                    os.remove(file_path)
                    raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    return f"{settings.UPLOAD_DIR}/{subfolder}/{safe_filename}".replace("//", "/").strip("/")

def delete_file(file_path: str) -> bool:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
