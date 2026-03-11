from pydantic import BaseModel
from typing import List, Optional
from app.models.order import PaymentMethod
from app.schemas.cart import CartItemResponse

class CheckoutCalculateResponse(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    subtotal: float
    shipping_fee: float = 0.0 # Placeholder for future logic
    final_total: float

class CheckoutConfirm(BaseModel):
    customer_name: str
    phone: str
    address: str
    payment_method: PaymentMethod
    notes: Optional[str] = None
