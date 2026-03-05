from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    customer_name: Optional[str] = None
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SiteSettingsBase(BaseModel):
    vodafone_cash_number: Optional[str] = None
    instapay_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    delivery_time: Optional[str] = None
    order_confirmation_message: Optional[str] = None

class SiteSettingsUpdate(SiteSettingsBase):
    pass

class SiteSettingsResponse(SiteSettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
