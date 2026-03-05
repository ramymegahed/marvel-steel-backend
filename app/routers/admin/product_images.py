from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.product import ProductImageResponse
from app.services import product_service
from app.utils.file_upload import save_upload_file

router = APIRouter()

@router.get("/{product_id}/images", response_model=List[ProductImageResponse])
def get_product_images(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    product = product_service.get_product(db, product_id)
    return product.images

@router.post("/{product_id}/images", response_model=ProductImageResponse)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    # Process the file upload
    file_url = save_upload_file(file, subfolder=str(product_id))
    
    # Save image URL in database
    return product_service.add_product_image(db, product_id, file_url)

@router.delete("/images/{image_id}")
def delete_product_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.delete_product_image(db, image_id)

@router.put("/images/{image_id}/set-main", response_model=ProductImageResponse)
def set_main_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.set_main_image(db, product_id, image_id)
