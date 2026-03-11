from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CartItemBase(BaseModel):
    product_id: int
    size_id: Optional[int] = None
    quantity: int = Field(default=1, ge=1)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(default=1, ge=1)

class CartItemResponse(CartItemBase):
    id: int
    cart_id: str
    product_name: str
    size_name: Optional[str] = None
    item_price: float
    subtotal: float
    added_at: datetime
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse] = []
    total_items: int
    total_price: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
