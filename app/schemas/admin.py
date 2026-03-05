from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.admin import AdminRole

class AdminBase(BaseModel):
    email: EmailStr
    role: AdminRole

class AdminCreate(AdminBase):
    password: str

class AdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[AdminRole] = None
    password: Optional[str] = None

class AdminResponse(AdminBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
