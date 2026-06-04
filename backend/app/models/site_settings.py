from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    vodafone_cash_number = Column(String, nullable=True)
    instapay_number = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    delivery_time = Column(String, nullable=True)
    order_confirmation_message = Column(Text, nullable=True)
    shipping_fee = Column(Float, nullable=False, default=0.0, server_default="0")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=True)
    comment = Column(Text, nullable=False)
    product_id = Column(Integer, nullable=True)   # optional FK — not enforced at DB level to survive product deletion
    is_approved = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
