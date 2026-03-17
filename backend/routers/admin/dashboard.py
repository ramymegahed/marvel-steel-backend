from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.dashboard import DashboardOverview
from app.services import dashboard_service

router = APIRouter()

@router.get("/", response_model=DashboardOverview)
def get_dashboard(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return dashboard_service.get_dashboard_summary(db)
