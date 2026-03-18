from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductSize
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.product import ProductCreate, ProductUpdate, ProductImageCreate, ProductSizeCreate, ProductSizeUpdate
from app.utils.file_upload import delete_file

# --- Category Logic ---
def get_categories(db: Session, skip: int = 0, limit: int = 100, active_only: bool = False):
    query = db.query(Category)
    if active_only:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.sort_order).offset(skip).limit(limit).all()

def create_category(db: Session, category_in: CategoryCreate):
    db_obj = Category(**category_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_category(db: Session, category_id: int, category_in: CategoryUpdate):
    db_obj = db.query(Category).filter(Category.id == category_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = category_in.model_dump(exclude_unset=True)
    
    # If a new image is provided, delete the old one
    if "image_url" in update_data and db_obj.image_url and update_data["image_url"] != db_obj.image_url:
        delete_file(db_obj.image_url)

    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_category(db: Session, category_id: int):
    db_obj = db.query(Category).filter(Category.id == category_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Category not found")
        
    if db_obj.image_url:
        delete_file(db_obj.image_url)
        
    db.delete(db_obj)
    db.commit()
    return {"message": "Category deleted"}

# --- Product Logic ---
def get_products(db: Session, skip: int = 0, limit: int = 100, category_id: int = None, active_only: bool = False):
    query = db.query(Product)
    if active_only:
        query = query.filter(Product.is_active == True)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    db_obj = db.query(Product).filter(Product.id == product_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_obj

def create_product(db: Session, product_in: ProductCreate):
    db_obj = Product(**product_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_product(db: Session, product_id: int, product_in: ProductUpdate):
    db_obj = get_product(db, product_id)
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_product(db: Session, product_id: int):
    db_obj = get_product(db, product_id)
    # Soft delete: hide from store but keep for order history
    db_obj.is_active = False
    db.commit()
    return {"message": "Product deactivated (soft delete)"}

# --- Product Image Logic ---
def add_product_image(db: Session, product_id: int, file_url: str):
    get_product(db, product_id)  # verify product exists
    
    # Check if this is the first image to make it main by default
    is_main = db.query(ProductImage).filter(ProductImage.product_id == product_id).count() == 0
    db_obj = ProductImage(product_id=product_id, image_url=file_url, is_main=is_main)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_product_image(db: Session, image_id: int):
    db_obj = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Attempt to delete file
    delete_file(db_obj.image_url)

    db.delete(db_obj)
    db.commit()
    return {"message": "Image deleted"}

def set_main_image(db: Session, product_id: int, image_id: int):
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    target_img = None
    for img in images:
        if img.id == image_id:
            img.is_main = True
            target_img = img
        else:
            img.is_main = False
    
    if not target_img:
        raise HTTPException(status_code=404, detail="Image not found for this product")

    db.commit()
    return target_img
    
# --- Product Size Logic ---
def add_product_size(db: Session, product_id: int, size_in: ProductSizeCreate):
    get_product(db, product_id)
    db_obj = ProductSize(product_id=product_id, **size_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_product_size(db: Session, size_id: int, size_in: ProductSizeUpdate):
    db_obj = db.query(ProductSize).filter(ProductSize.id == size_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Size not found")
    
    update_data = size_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_product_size(db: Session, size_id: int):
    db_obj = db.query(ProductSize).filter(ProductSize.id == size_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Size not found")
    db.delete(db_obj)
    db.commit()
    return {"message": "Size deleted"}
