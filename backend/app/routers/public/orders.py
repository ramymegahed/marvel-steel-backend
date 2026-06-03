from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.order import OrderResponse
from app.services import order_service

router = APIRouter()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    phone: str = Query(..., description="Phone number used when placing the order"),
    db: Session = Depends(get_db)
):
    order = order_service.get_order(db, order_id=order_id)
    if order.phone != phone.strip():
        raise HTTPException(status_code=404, detail="Order not found")
    return order
