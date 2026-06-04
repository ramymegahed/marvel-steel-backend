from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.order import Order, OrderStatus

def get_dashboard_summary(db: Session):
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    new_orders = db.query(Order).filter(Order.status == OrderStatus.pending).count()
    in_delivery_orders = db.query(Order).filter(Order.status == OrderStatus.in_delivery).count()
    delivered_orders = db.query(Order).filter(Order.status == OrderStatus.delivered).count()
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
    total_revenue = db.query(func.sum(Order.total_price)).filter(
        Order.status != OrderStatus.cancelled
    ).scalar() or 0.0

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "new_orders": new_orders,
        "in_delivery_orders": in_delivery_orders,
        "delivered_orders": delivered_orders,
        "recent_orders": recent_orders,
        "total_revenue": float(total_revenue),
    }
