from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.file_upload import delete_file


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
