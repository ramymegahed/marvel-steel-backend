from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_super_admin
from app.models.admin import Admin
from app.schemas.admin import AdminResponse, AdminCreate, AdminUpdate
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[AdminResponse])
def get_admins(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    return db.query(Admin).offset(skip).limit(limit).all()

@router.post("/", response_model=AdminResponse)
def create_admin(
    admin_in: AdminCreate,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    if db.query(Admin).filter(Admin.email == admin_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(admin_in.password)
    db_admin = Admin(
        email=admin_in.email,
        hashed_password=hashed_password,
        role=admin_in.role
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(
    admin_id: int,
    admin_in: AdminUpdate,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    db_admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
        
    if db_admin.role == "super_admin" and admin_in.role and admin_in.role != "super_admin":
        super_admin_count = db.query(Admin).filter(Admin.role == "super_admin").count()
        if super_admin_count <= 1:
            raise HTTPException(status_code=400, detail="At least one super admin must exist in the system.")
            
    update_data = admin_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        db_admin.hashed_password = hashed_password
        
    for field, value in update_data.items():
        setattr(db_admin, field, value)
        
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.delete("/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: Admin = Depends(get_current_super_admin)
):
    db_admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if db_admin.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    if db_admin.role == "super_admin":
        super_admin_count = db.query(Admin).filter(Admin.role == "super_admin").count()
        if super_admin_count <= 1:
            raise HTTPException(status_code=400, detail="At least one super admin must exist in the system.")
            
    db.delete(db_admin)
    db.commit()
    return {"message": "Admin deleted successfully"}
