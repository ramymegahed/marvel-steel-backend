from pydantic import BaseModel

class MonthlyRevenueResponse(BaseModel):
    month: str
    revenue: float

class MonthlyOrdersResponse(BaseModel):
    month: str
    orders: int
