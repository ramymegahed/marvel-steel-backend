from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.cart import Cart
from app.models.product import Product, ProductSize
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.checkout import CheckoutConfirm, CheckoutCalculateResponse
from app.schemas.cart import CartItemResponse

def calculate_checkout(db: Session, cart_id: str) -> CheckoutCalculateResponse:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    items_response = []
    subtotal = 0.0
    total_items = 0
    shipping_fee = 0.0 # Setup for future logic

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
             raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable")
             
        size = None
        item_price = 0.0
        
        if item.size_id:
            size = db.query(ProductSize).filter(ProductSize.id == item.size_id).first()
            if not size:
                 raise HTTPException(status_code=400, detail=f"Size {item.size_id} is invalid for product {product.name}")
            # Verify stock ONLY warning (not deducting here)
            if size.stock_quantity < item.quantity:
                 raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name} (Size: {size.name})")
            
            item_price = size.discount_price if size.discount_price is not None else size.price

        item_subtotal = item_price * item.quantity
        subtotal += item_subtotal
        total_items += item.quantity

        items_response.append(CartItemResponse(
            id=item.id,
            cart_id=str(item.cart_id),
            product_id=item.product_id,
            product_name=product.name,
            size_id=item.size_id,
            size_name=size.name if size else None,
            quantity=item.quantity,
            item_price=item_price,
            subtotal=item_subtotal,
            added_at=item.added_at
        ))

    final_total = subtotal + shipping_fee

    return CheckoutCalculateResponse(
        items=items_response,
        total_items=total_items,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        final_total=final_total
    )

def confirm_checkout(db: Session, cart_id: str, checkout_in: CheckoutConfirm) -> Order:
    # 1. Calculate to ensure stock & validity right before processing
    calculation = calculate_checkout(db, cart_id)
    cart = db.query(Cart).filter(Cart.id == cart_id).first()

    # 2. Create Order Header
    db_order = Order(
        customer_name=checkout_in.customer_name,
        phone=checkout_in.phone,
        address=checkout_in.address,
        payment_method=checkout_in.payment_method,
        notes=checkout_in.notes,
        total_price=calculation.final_total,
        status=OrderStatus.pending  # Stock adjusts when status becomes 'confirmed' typically. Wait, specification says:
                                     # "Create order and order_items records"
                                     # "Deduct Stock" - The specs mentioned Deduct Stock during confirm step.
                                     # The previous order_service._adjust_stock handles this upon moving to 'confirmed'.
                                     # If we want immediate deduction on checkout, we can set it to Pending, but explicitly deduct.
                                     # Let's align with the order_service logic: order_service deducts when status -> confirmed.
                                     # If the requirement directly says "Deduct Stock during checkout confirm step", 
                                     # we should either deduct it here manually, OR create the order as "confirmed" immediately.
                                     # Let's explicitly deduct stock here to perfectly fulfill "Deduct Stock" requirement on checkout.
    )
    db.add(db_order)
    db.flush()

    # 3. Create Items & Deduct Stock
    for item in cart.items:
        size = None
        item_price = 0.0
        
        if item.size_id:
            size = db.query(ProductSize).filter(ProductSize.id == item.size_id).first()
            item_price = size.discount_price if size.discount_price is not None else size.price
            
            # Deduct Stock
            size.stock_quantity -= item.quantity
            db.add(size)

        db.add(OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            size_id=item.size_id,
            quantity=item.quantity,
            price_at_purchase=item_price
        ))

    # 4. Clear/Delete Cart
    db.delete(cart) # Instead of clearing items, we just destroy the session cart completely

    db.commit()
    db.refresh(db_order)
    
    return db_order
