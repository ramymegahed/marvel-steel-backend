from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.site_settings import Review
from app.schemas.settings import ReviewCreate, ReviewUpdate

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Review).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

def add_review(db: Session, review_in: ReviewCreate):
    db_obj = Review(**review_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_review(db: Session, review_id: int, review_in: ReviewUpdate):
    db_obj = db.query(Review).filter(Review.id == review_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Review not found")
    
    update_data = review_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_review(db: Session, review_id: int):
    db_obj = db.query(Review).filter(Review.id == review_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(db_obj)
    db.commit()
    return db_obj
