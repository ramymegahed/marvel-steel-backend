from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.schemas.settings import ReviewResponse
from app.services import review_service

router = APIRouter()

@router.get("/", response_model=List[ReviewResponse])
def get_reviews(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db)
):
    return review_service.get_reviews(db, skip=skip, limit=limit)
