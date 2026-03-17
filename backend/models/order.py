import enum
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class PaymentMethod(str, enum.Enum):
    cash_on_delivery = "cash_on_delivery"
    vodafone_cash = "vodafone_cash"
    instapay = "instapay"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_delivery = "in_delivery"
    delivered = "delivered"
    cancelled = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    notes = Column(Text, nullable=True)
    total_price = Column(Float, default=0.0)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size_id = Column(Integer, ForeignKey("product_sizes.id"), nullable=True)
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    size = relationship("ProductSize")
