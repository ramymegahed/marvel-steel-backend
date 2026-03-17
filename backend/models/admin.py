import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base

class AdminRole(str, enum.Enum):
    super_admin = "super_admin"
    staff = "staff"

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(AdminRole), default=AdminRole.staff, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
