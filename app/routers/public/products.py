from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.schemas.product import ProductResponse
from app.services import product_service
from app.models.product import ProductSize

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0, limit: int = 100, category_id: Optional[int] = None,
    # size is more complex if we need filtering by size name, but we can do a simple joined query if required.
    # We will stick to simple category/pagination for MVP as specified.
    # To filter by a specific size ID, we can do it via a simple query param.
    size_id: Optional[int] = None,
    # min_price/max_price filtering can be added here
    db: Session = Depends(get_db)
):
    products = product_service.get_products(db, skip=0, limit=1000, category_id=category_id, active_only=True)
    
    # Simple Python filtering for size and price if needed to keep logic clean, 
    # Or query builder in the service layer. For MVP:
    if size_id:
        products = [p for p in products if any(s.id == size_id for s in p.sizes)]
        
    # Return paginated slice
    return products[skip:skip + limit]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = product_service.get_product(db, product_id)
    if not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
