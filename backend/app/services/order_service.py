from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product, ProductSize
from app.schemas.order import OrderCreate, OrderUpdateStatus

def get_orders(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Order)
    if search:
        search_filter = f"%{search}%"
        query = query.filter((Order.customer_name.ilike(search_filter)) | (Order.phone.ilike(search_filter)))
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    db_obj = db.query(Order).filter(Order.id == order_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_obj

def create_order(db: Session, order_in: OrderCreate):
    # Calculate Total Price and create Items
    total_price = 0.0
    items_to_add = []

    for item_in in order_in.items:
        # Fetch Product Base Price
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {item_in.product_id} is unavailable")
        
        item_price = 0.0
        
        # Check Size Price and Stock
        if item_in.size_id:
            size_obj = db.query(ProductSize).filter(ProductSize.id == item_in.size_id, ProductSize.product_id == item_in.product_id).first()
            if not size_obj:
                 raise HTTPException(status_code=400, detail=f"Size {item_in.size_id} is invalid for product {item_in.product_id}")
            # DISABLED: Manufacture on demand — no stock management
            # if size_obj.stock_quantity < item_in.quantity:
            #      raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name} (Size: {size_obj.name})")
            
            item_price += size_obj.discount_price if size_obj.discount_price is not None else size_obj.price

        # The price should not be dependent on base price in product if the sizes have prices?
        # Typically base price + size additional price. We assume MVP: base product price is implicit in size or zero if sizes handle prices.
        # Wait, the specs don't explicitly list a "base price" field for Product. Only "additional_price" in ProductSize.
        # So price comes ONLY from ProductSize or we consider base price = 0.
        
        total_price += (item_price * item_in.quantity)
        
        items_to_add.append(
             OrderItem(
                 product_id=product.id,
                 size_id=item_in.size_id,
                 quantity=item_in.quantity,
                 price_at_purchase=item_price
             )
        )

    db_order = Order(
        customer_name=order_in.customer_name,
        phone=order_in.phone,
        address=order_in.address,
        payment_method=order_in.payment_method,
        notes=order_in.notes,
        total_price=total_price,
        status=OrderStatus.pending
    )
    
    db.add(db_order)
    db.flush() # get db_order.id
    
    for item in items_to_add:
        item.order_id = db_order.id
        db.add(item)
        
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: int, status_in: OrderUpdateStatus):
    order = get_order(db, order_id)
    old_status = order.status
    new_status = status_in.status

    if old_status == new_status:
        return order
        
    # DISABLED: Manufacture on demand — no stock management
    # if new_status == OrderStatus.confirmed and old_status != OrderStatus.confirmed:
    #     _adjust_stock(db, order, reduce=True)
    # if new_status == OrderStatus.cancelled and old_status in [OrderStatus.confirmed, OrderStatus.in_delivery, OrderStatus.delivered]:
    #     _adjust_stock(db, order, reduce=False)
        
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order

def _adjust_stock(db: Session, order: Order, reduce: bool = True):
    for item in order.items:
        if item.size_id:
            size_obj = db.query(ProductSize).filter(ProductSize.id == item.size_id).first()
            if size_obj:
                if reduce:
                    size_obj.stock_quantity -= item.quantity
                else:
                    size_obj.stock_quantity += item.quantity
                db.add(size_obj)
