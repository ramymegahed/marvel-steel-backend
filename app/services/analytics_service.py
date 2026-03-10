from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.order import Order, OrderStatus

def get_monthly_revenue(db: Session):
    """
    Sum of total_price for completed (delivered) orders grouped by month.
    """
    month_expr = func.to_char(Order.created_at, 'YYYY-MM').label('month')
    
    results = db.query(
        month_expr,
        func.sum(Order.total_price).label('revenue')
    ).filter(
        Order.status == OrderStatus.delivered
    ).group_by(
        month_expr
    ).order_by(
        month_expr
    ).all()
    
    return [{"month": row.month, "revenue": float(row.revenue or 0.0)} for row in results]

def get_monthly_orders(db: Session):
    """
    Count of orders grouped by month (all statuses).
    """
    month_expr = func.to_char(Order.created_at, 'YYYY-MM').label('month')
    
    results = db.query(
        month_expr,
        func.count(Order.id).label('orders')
    ).group_by(
        month_expr
    ).order_by(
        month_expr
    ).all()
    
    return [{"month": row.month, "orders": int(row.orders or 0)} for row in results]
