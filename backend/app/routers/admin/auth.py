from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.services import auth_service
from app.schemas.admin import Token
from app.core.limiter import limiter

router = APIRouter()

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    return auth_service.authenticate_admin(db, form_data)

@router.post("/logout")
def logout():
    # Since we are using stateless JWT, logout is handled client-side by deleting the token.
    return {"message": "Successfully logged out"}
