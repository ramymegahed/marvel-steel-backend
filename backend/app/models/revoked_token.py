from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    jti = Column(String, primary_key=True, index=True)   # JWT ID claim
    revoked_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)  # mirrors token exp — used for cleanup
