from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.schemas.product import ProductResponse
from app.services import product_service

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    size_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return product_service.get_products(
        db, skip=skip, limit=limit,
        category_id=category_id, size_id=size_id, active_only=True
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = product_service.get_product(db, product_id)
    if not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
