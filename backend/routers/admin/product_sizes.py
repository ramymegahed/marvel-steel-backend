from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.product import ProductSizeResponse, ProductSizeCreate, ProductSizeUpdate
from app.services import product_service

router = APIRouter()

@router.get("/{product_id}/sizes", response_model=List[ProductSizeResponse])
def get_product_sizes(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    product = product_service.get_product(db, product_id)
    return product.sizes

@router.post("/{product_id}/sizes", response_model=ProductSizeResponse)
def create_product_size(
    product_id: int,
    size_in: ProductSizeCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.add_product_size(db, product_id, size_in)

@router.put("/sizes/{size_id}", response_model=ProductSizeResponse)
def update_product_size(
    size_id: int,
    size_in: ProductSizeUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.update_product_size(db, size_id, size_in)

@router.delete("/sizes/{size_id}")
def delete_product_size(
    size_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.delete_product_size(db, size_id)
