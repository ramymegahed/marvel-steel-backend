import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Marvel Steel Backend"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"  # In production, use a strong random secret
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "postgresql://admin:secret123@db:5432/marvel_steel"
    
    # File Uploads
    UPLOAD_DIR: str = "uploads/products"
    
    # Telegram Notifications
    TELEGRAM_BOT_TOKEN: str = "8664079807:AAHlkcNqtI9QfOWbLcwTXdDLgswF8JLETrs"
    TELEGRAM_CHAT_ID: str = "-5152690579"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
