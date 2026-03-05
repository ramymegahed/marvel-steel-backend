from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.schemas.category import CategoryResponse
from app.services import product_service

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db)
):
    # Public only sees active categories
    return product_service.get_categories(db, skip=skip, limit=limit, active_only=True)
