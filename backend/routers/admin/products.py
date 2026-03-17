from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
from app.services import product_service

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0, limit: int = 100, category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.get_products(db, skip=skip, limit=limit, category_id=category_id)

@router.post("/", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.create_product(db, product_in=product_in)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.update_product(db, product_id=product_id, product_in=product_in)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.delete_product(db, product_id=product_id)
