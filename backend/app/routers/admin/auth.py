from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_admin, oauth2_scheme
from app.core.config import settings
from app.models.admin import Admin
from app.models.revoked_token import RevokedToken
from app.services import auth_service
from app.schemas.admin import Token, ChangePasswordRequest, AdminResponse
from app.core.security import verify_password, get_password_hash
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
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        jti: str = payload.get("jti")
        exp: int = payload.get("exp")
        if jti and exp:
            expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
            db.merge(RevokedToken(jti=jti, expires_at=expires_at))
            db.commit()
    except JWTError:
        pass  # expired/invalid token — no need to blacklist
    return {"message": "Successfully logged out"}

@router.post("/change-password", response_model=AdminResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if not verify_password(payload.current_password, current_admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters")
    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must differ from current password")

    current_admin.hashed_password = get_password_hash(payload.new_password)
    current_admin.must_change_password = False
    db.commit()
    db.refresh(current_admin)
    return current_admin
