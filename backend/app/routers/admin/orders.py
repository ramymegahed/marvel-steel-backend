from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.order import OrderResponse, OrderUpdateStatus
from app.services import order_service

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    skip: int = 0, limit: int = 100, search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return order_service.get_orders(db, skip=skip, limit=limit, search=search)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return order_service.get_order(db, order_id=order_id)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_in: OrderUpdateStatus,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return order_service.update_order_status(db, order_id=order_id, status_in=status_in)
