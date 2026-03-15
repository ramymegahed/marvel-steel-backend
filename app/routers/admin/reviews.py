from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.settings import ReviewResponse, ReviewCreate, ReviewUpdate
from app.services import review_service

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def add_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return review_service.add_review(db, review_in)

@router.get("/", response_model=List[ReviewResponse])
def get_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return review_service.get_reviews(db, skip=skip, limit=limit)

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_in: ReviewUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return review_service.update_review(db, review_id, review_in)

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    review_service.delete_review(db, review_id)
    return None
