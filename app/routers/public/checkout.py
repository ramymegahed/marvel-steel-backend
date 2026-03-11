from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.checkout import CheckoutConfirm, CheckoutCalculateResponse
from app.schemas.order import OrderResponse
from app.services import checkout_service

router = APIRouter()

def get_cart_id(x_cart_id: str = Header(...)) -> str:
    return x_cart_id

@router.post("/calculate", response_model=CheckoutCalculateResponse)
def calculate_checkout_totals(
    cart_id: str = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    return checkout_service.calculate_checkout(db, cart_id)

@router.post("/confirm", response_model=OrderResponse)
def confirm_checkout_order(
    checkout_in: CheckoutConfirm,
    cart_id: str = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    return checkout_service.confirm_checkout(db, cart_id, checkout_in)
