from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.dependencies import get_db
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services import cart_service

router = APIRouter()

def get_cart_id(x_cart_id: Optional[str] = Header(None)) -> Optional[str]:
    return x_cart_id

@router.post("/items", response_model=CartResponse)
def add_item_to_cart(
    item_in: CartItemCreate,
    cart_id: Optional[str] = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    cart = cart_service.add_to_cart(db, cart_id=cart_id, item_in=item_in)
    return cart_service.extract_cart_response(db, cart)

@router.get("/", response_model=CartResponse)
def get_cart(
    cart_id: Optional[str] = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    cart = cart_service.get_or_create_cart(db, cart_id=cart_id)
    return cart_service.extract_cart_response(db, cart)

@router.put("/items/{item_id}", response_model=CartResponse)
def update_item_quantity(
    item_id: int,
    item_in: CartItemUpdate,
    cart_id: str = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    cart = cart_service.update_cart_item(db, cart_id=cart_id, item_id=item_id, item_in=item_in)
    return cart_service.extract_cart_response(db, cart)

@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(
    item_id: int,
    cart_id: str = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    cart = cart_service.remove_from_cart(db, cart_id=cart_id, item_id=item_id)
    return cart_service.extract_cart_response(db, cart)

@router.delete("/", response_model=CartResponse)
def clear_cart(
    cart_id: str = Depends(get_cart_id),
    db: Session = Depends(get_db)
):
    cart = cart_service.clear_cart(db, cart_id=cart_id)
    return cart_service.extract_cart_response(db, cart)
