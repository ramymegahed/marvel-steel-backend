from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    customer_name: Optional[str] = None
    comment: str
    product_id: Optional[int] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    customer_name: Optional[str] = None
    comment: Optional[str] = None
    is_approved: Optional[bool] = None

class ReviewResponse(ReviewBase):
    id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SiteSettingsBase(BaseModel):
    vodafone_cash_number: Optional[str] = None
    instapay_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    delivery_time: Optional[str] = None
    order_confirmation_message: Optional[str] = None
    shipping_fee: Optional[float] = 0.0

class SiteSettingsUpdate(SiteSettingsBase):
    pass

class SiteSettingsResponse(SiteSettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class PublicSettingsResponse(BaseModel):
    """Subset of SiteSettings safe to expose without authentication."""
    whatsapp_number: Optional[str] = None
    delivery_time: Optional[str] = None
    order_confirmation_message: Optional[str] = None
    vodafone_cash_number: Optional[str] = None
    instapay_number: Optional[str] = None
    shipping_fee: Optional[float] = 0.0

    class Config:
        from_attributes = True
