from pydantic import BaseModel
from typing import List
from app.schemas.order import OrderResponse

class DashboardOverview(BaseModel):
    total_products: int
    total_orders: int
    new_orders: int
    in_delivery_orders: int
    delivered_orders: int
    recent_orders: List[OrderResponse] = []
