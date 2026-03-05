from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.order import PaymentMethod, OrderStatus
from app.schemas.product import ProductResponse, ProductSizeResponse

class OrderItemBase(BaseModel):
    product_id: int
    size_id: Optional[int] = None
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    price_at_purchase: float
    product: Optional[ProductResponse] = None
    size: Optional[ProductSizeResponse] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    phone: str
    address: str
    payment_method: PaymentMethod
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdateStatus(BaseModel):
    status: OrderStatus

class OrderResponse(OrderBase):
    id: int
    total_price: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
