from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.cart import Cart, CartItem
from app.models.product import ProductSize
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.checkout import CheckoutConfirm, CheckoutCalculateResponse
from app.schemas.cart import CartItemResponse

def _load_cart_for_checkout(db: Session, cart_id: str) -> Cart:
    """Fetch cart with all relationships pre-loaded in a single query."""
    return (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product),
            joinedload(Cart.items).joinedload(CartItem.size),
        )
        .filter(Cart.id == cart_id)
        .first()
    )

def calculate_checkout(db: Session, cart_id: str) -> CheckoutCalculateResponse:
    cart = _load_cart_for_checkout(db, cart_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    items_response = []
    subtotal = 0.0
    total_items = 0
    shipping_fee = 0.0

    for item in cart.items:
        product = item.product
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable")

        size = item.size
        if item.size_id and not size:
            raise HTTPException(status_code=400, detail=f"Size {item.size_id} is invalid for product {product.name}")

        item_price = (size.discount_price if size.discount_price is not None else size.price) if size else 0.0
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

    return CheckoutCalculateResponse(
        items=items_response,
        total_items=total_items,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        final_total=subtotal + shipping_fee
    )

def confirm_checkout(db: Session, cart_id: str, checkout_in: CheckoutConfirm) -> Order:
    calculation = calculate_checkout(db, cart_id)
    cart = _load_cart_for_checkout(db, cart_id)

    db_order = Order(
        customer_name=checkout_in.customer_name,
        phone=checkout_in.phone,
        address=checkout_in.address,
        payment_method=checkout_in.payment_method,
        notes=checkout_in.notes,
        total_price=calculation.final_total,
        status=OrderStatus.pending,
    )
    db.add(db_order)
    db.flush()

    for item in cart.items:
        size = item.size
        item_price = (size.discount_price if size.discount_price is not None else size.price) if size else 0.0
        db.add(OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            size_id=item.size_id,
            quantity=item.quantity,
            price_at_purchase=item_price
        ))

    db.delete(cart)
    db.commit()
    db.refresh(db_order)
    return db_order
