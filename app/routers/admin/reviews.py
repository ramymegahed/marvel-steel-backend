from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.settings import ReviewResponse, ReviewCreate
from app.services import review_service

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def add_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return review_service.add_review(db, review_in)
