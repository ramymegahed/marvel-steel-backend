from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.schemas.category import CategoryResponse, CategoryCreate, CategoryUpdate
from app.services import product_service
from app.utils.file_upload import save_upload_file

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.get_categories(db, skip=skip, limit=limit)

@router.post("/", response_model=CategoryResponse)
def create_category(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    sort_order: int = Form(0),
    is_active: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    image_url = None
    if image is not None:
        image_url = save_upload_file(image, subfolder="categories")
        
    category_in = CategoryCreate(
        name=name,
        description=description,
        sort_order=sort_order,
        is_active=is_active,
        image_url=image_url
    )
    return product_service.create_category(db, category_in=category_in)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    update_data = {}
    if name is not None: update_data["name"] = name
    if description is not None: update_data["description"] = description
    if sort_order is not None: update_data["sort_order"] = sort_order
    if is_active is not None: update_data["is_active"] = is_active
    
    if image is not None:
        image_url = save_upload_file(image, subfolder="categories")
        update_data["image_url"] = image_url
        
    category_in = CategoryUpdate(**update_data)
    return product_service.update_category(db, category_id=category_id, category_in=category_in)

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return product_service.delete_category(db, category_id=category_id)
