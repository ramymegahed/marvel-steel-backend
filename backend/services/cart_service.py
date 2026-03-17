from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductSize
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse

def get_or_create_cart(db: Session, cart_id: str = None) -> Cart:
    if cart_id:
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
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
    return cart

def update_cart_item(db: Session, cart_id: str, item_id: int, item_in: CartItemUpdate):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    item.quantity = item_in.quantity
    db.commit()
    
    # Return updated cart
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    return cart

def remove_from_cart(db: Session, cart_id: str, item_id: int):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    db.delete(item)
    db.commit()

    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    return cart

def clear_cart(db: Session, cart_id: str):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        db.commit()
        db.refresh(cart)
    return cart

def extract_cart_response(db: Session, cart: Cart) -> CartResponse:
    items_response = []
    total_price = 0.0
    total_items = 0

    for item in cart.items:
        # Load relationships explicitly or via db queries if needed to calculate prices
        product = db.query(Product).filter(Product.id == item.product_id).first()
        size = db.query(ProductSize).filter(ProductSize.id == item.size_id).first() if item.size_id else None
        
        # Determine price format (Assuming size defines price as per previous order logic)
        if size:
            item_price = size.discount_price if size.discount_price is not None else size.price
        else:
            item_price = 0.0
        # If product had a base price, we'd add it here. MVP seems to use size price.
        
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
