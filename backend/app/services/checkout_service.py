from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductImage, ProductSize
from app.models.order import Order, OrderItem, OrderStatus
from app.models.site_settings import SiteSettings
from app.schemas.checkout import CheckoutConfirm, CheckoutCalculateResponse
from app.schemas.cart import CartItemResponse


def _load_cart(db: Session, cart_id: str) -> Cart:
    return (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images),
            joinedload(Cart.items).joinedload(CartItem.size),
        )
        .filter(Cart.id == cart_id)
        .first()
    )


def calculate_checkout(db: Session, cart_id: str) -> CheckoutCalculateResponse:
    cart = _load_cart(db, cart_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    items_response = []
    subtotal = 0.0
    total_items = 0

    for item in cart.items:
        product = item.product
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product '{product.name if product else item.product_id}' is no longer available")

        size = item.size
        if item.size_id and not size:
            raise HTTPException(status_code=400, detail=f"Size {item.size_id} is no longer valid")

        item_price = (size.discount_price if (size.discount_price is not None and size.discount_price > 0) else size.price) if size else 0.0
        item_subtotal = item_price * item.quantity
        subtotal += item_subtotal
        total_items += item.quantity

        main_image = None
        if product.images:
            main = next((img for img in product.images if img.is_main), product.images[0])
            main_image = main.image_url

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
            added_at=item.added_at,
            product_image_url=main_image,
        ))

    site = db.query(SiteSettings).first()
    shipping_fee = float(site.shipping_fee or 0.0) if site else 0.0
    return CheckoutCalculateResponse(
        items=items_response,
        total_items=total_items,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        final_total=subtotal + shipping_fee,
    )


def confirm_checkout(db: Session, cart_id: str, checkout_in: CheckoutConfirm) -> Order:
    # Load cart with relationships (read-only pass to get item list)
    cart = _load_cart(db, cart_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    order_items_data = []
    total_price = 0.0

    for item in cart.items:
        product = item.product
        if not product or not product.is_active:
            name = product.name if product else str(item.product_id)
            raise HTTPException(status_code=400, detail=f"Product '{name}' is no longer available")

        locked_size = None
        if item.size_id:
            # Lock the size row — prevents concurrent checkouts from overselling the same SKU
            locked_size = (
                db.query(ProductSize)
                .filter(ProductSize.id == item.size_id)
                .with_for_update()
                .first()
            )
            if not locked_size:
                raise HTTPException(status_code=400, detail=f"Size selection for '{product.name}' is no longer valid")

            if locked_size.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Not enough stock for '{product.name}' ({locked_size.name}). "
                        f"Requested: {item.quantity}, available: {locked_size.stock_quantity}."
                    ),
                )

        item_price = (
            (locked_size.discount_price if (locked_size.discount_price is not None and locked_size.discount_price > 0) else locked_size.price)
            if locked_size else 0.0
        )
        total_price += item_price * item.quantity

        order_items_data.append({
            "product_id": item.product_id,
            "size_id": item.size_id,
            "quantity": item.quantity,
            "price_at_purchase": item_price,
            "locked_size": locked_size,
        })

    site = db.query(SiteSettings).first()
    shipping_fee = float(site.shipping_fee or 0.0) if site else 0.0

    db_order = Order(
        customer_name=checkout_in.customer_name,
        customer_email=checkout_in.customer_email,
        phone=checkout_in.phone,
        address=checkout_in.address,
        payment_method=checkout_in.payment_method,
        notes=checkout_in.notes,
        total_price=total_price + shipping_fee,
        status=OrderStatus.pending,
    )
    db.add(db_order)
    db.flush()

    for data in order_items_data:
        db.add(OrderItem(
            order_id=db_order.id,
            product_id=data["product_id"],
            size_id=data["size_id"],
            quantity=data["quantity"],
            price_at_purchase=data["price_at_purchase"],
        ))
        if data["locked_size"] is not None:
            data["locked_size"].stock_quantity -= data["quantity"]

    db.delete(cart)
    db.commit()
    db.refresh(db_order)
    return db_order
