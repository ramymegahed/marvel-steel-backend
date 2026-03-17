from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.analytics import MonthlyRevenueResponse, MonthlyOrdersResponse
from app.services import analytics_service

router = APIRouter()

@router.get("/monthly-revenue", response_model=List[MonthlyRevenueResponse])
def get_monthly_revenue(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Returns total revenue grouped by month for completed/delivered orders.
    """
    return analytics_service.get_monthly_revenue(db)

@router.get("/monthly-orders", response_model=List[MonthlyOrdersResponse])
def get_monthly_orders(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Returns the number of orders grouped by month.
    """
    return analytics_service.get_monthly_orders(db)
