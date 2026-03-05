from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db)
):
    return order_service.create_order(db, order_in=order_in)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    # Depending on requirements, maybe customers need a secret key or phone number to view their order to prevent enumeration.
    # For MVP, exposing direct ID view here as specified.
    return order_service.get_order(db, order_id=order_id)
