from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.site_settings import Review
from app.schemas.settings import ReviewCreate

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Review).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

def add_review(db: Session, review_in: ReviewCreate):
    db_obj = Review(**review_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
