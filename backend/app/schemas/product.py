from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.category import CategoryResponse

class ProductImageBase(BaseModel):
    image_url: str
    is_main: Optional[bool] = False

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductSizeBase(BaseModel):
    name: str
    price: float = 0.0
    discount_price: Optional[float] = None
    stock_quantity: Optional[int] = 0
    bed_size: Optional[str] = None
    metal_color: Optional[str] = None
    slats_type: Optional[str] = None
    cushion_color: Optional[str] = None
    rope_color: Optional[str] = None
    umbrella_color: Optional[str] = None

class ProductSizeCreate(ProductSizeBase):
    pass

class ProductSizeUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    bed_size: Optional[str] = None
    metal_color: Optional[str] = None
    slats_type: Optional[str] = None
    cushion_color: Optional[str] = None
    rope_color: Optional[str] = None
    umbrella_color: Optional[str] = None

class ProductSizeResponse(ProductSizeBase):
    id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    materials: Optional[str] = None
    category_id: int
    delivery_time: Optional[str] = None
    is_active: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    materials: Optional[str] = None
    category_id: Optional[int] = None
    delivery_time: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    sizes: List[ProductSizeResponse] = []
    
    class Config:
        from_attributes = True
