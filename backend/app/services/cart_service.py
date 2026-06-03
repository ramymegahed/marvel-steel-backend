from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductSize
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse

def _load_cart(db: Session, cart_id: str):
    """Fetch a cart with all items, products, and sizes in a single query."""
    return (
        db.query(Cart)
        .options(
            joinedload(Cart.items)
            .joinedload(CartItem.product),
            joinedload(Cart.items)
            .joinedload(CartItem.size),
        )
        .filter(Cart.id == cart_id)
        .first()
    )

def get_or_create_cart(db: Session, cart_id: str = None) -> Cart:
    if cart_id:
        cart = _load_cart(db, cart_id)
        if cart:
            return cart

    # If no cart_id provided or cart not found, create new
    new_cart = Cart()
    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)
    return new_cart

def _validate_product_and_size(db: Session, product_id: int, size_id: int = None):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=400, detail="Product not found or unavailable")
    
    size = None
    if size_id:
        size = db.query(ProductSize).filter(ProductSize.id == size_id, ProductSize.product_id == product_id).first()
        if not size:
            raise HTTPException(status_code=400, detail="Invalid size selected for this product")

    return product, size

def add_to_cart(db: Session, cart_id: str, item_in: CartItemCreate):
    cart = get_or_create_cart(db, cart_id)
    product, size = _validate_product_and_size(db, item_in.product_id, item_in.size_id)

    # Check if this exact product & size is already in the cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id,
        CartItem.size_id == item_in.size_id
    ).first()

    if existing_item:
        existing_item.quantity += item_in.quantity
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            size_id=item_in.size_id,
            quantity=item_in.quantity
        )
        db.add(new_item)

    db.commit()
    return _load_cart(db, cart.id)

def update_cart_item(db: Session, cart_id: str, item_id: int, item_in: CartItemUpdate):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    item.quantity = item_in.quantity
    db.commit()
    return _load_cart(db, cart_id)

def remove_from_cart(db: Session, cart_id: str, item_id: int):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    db.delete(item)
    db.commit()
    return _load_cart(db, cart_id)

def clear_cart(db: Session, cart_id: str):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        return None
    db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
    db.commit()
    return _load_cart(db, cart_id)

def extract_cart_response(db: Session, cart: Cart) -> CartResponse:
    items_response = []
    total_price = 0.0
    total_items = 0

    for item in cart.items:
        # Relationships are pre-loaded via _load_cart — no extra queries here
        product = item.product
        size = item.size

        item_price = (size.discount_price if size.discount_price is not None else size.price) if size else 0.0
        subtotal = item_price * item.quantity
        total_price += subtotal
        total_items += item.quantity

        items_response.append(CartItemResponse(
            id=item.id,
            cart_id=str(item.cart_id),
            product_id=item.product_id,
            product_name=product.name if product else "Unknown Product",
            size_id=item.size_id,
            size_name=size.name if size else None,
            quantity=item.quantity,
            item_price=item_price,
            subtotal=subtotal,
            added_at=item.added_at
        ))

    return CartResponse(
        id=str(cart.id),
        items=items_response,
        total_items=total_items,
        total_price=total_price,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )
