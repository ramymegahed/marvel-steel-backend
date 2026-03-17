from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.site_settings import SiteSettings
from app.schemas.settings import SiteSettingsUpdate

def get_settings(db: Session):
    settings_obj = db.query(SiteSettings).first()
    if not settings_obj:
        settings_obj = SiteSettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

def update_settings(db: Session, settings_in: SiteSettingsUpdate):
    settings_obj = get_settings(db)
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings_obj, field, value)
    db.commit()
    db.refresh(settings_obj)
    return settings_obj
