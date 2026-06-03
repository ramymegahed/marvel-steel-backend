from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.services import settings_service
from app.schemas.settings import PublicSettingsResponse

router = APIRouter()

@router.get("/", response_model=PublicSettingsResponse)
def get_public_settings(db: Session = Depends(get_db)):
    return settings_service.get_settings(db)
