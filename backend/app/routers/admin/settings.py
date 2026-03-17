from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_super_admin, get_current_admin
from app.models.admin import Admin
from app.schemas.settings import SiteSettingsResponse, SiteSettingsUpdate
from app.services import settings_service

router = APIRouter()

@router.get("/", response_model=SiteSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return settings_service.get_settings(db)

@router.put("/", response_model=SiteSettingsResponse)
def update_settings(
    settings_in: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    return settings_service.update_settings(db, settings_in)
