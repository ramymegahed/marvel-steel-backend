from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.admin import Admin
from app.core.security import verify_password, create_access_token

def authenticate_admin(db: Session, form_data: OAuth2PasswordRequestForm):
    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=admin.email)
    return {"access_token": access_token, "token_type": "bearer"}
