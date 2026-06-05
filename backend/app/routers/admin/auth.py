from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, oauth2_scheme
from app.core.config import settings
from app.models.revoked_token import RevokedToken
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

