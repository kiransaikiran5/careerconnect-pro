import enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, func
from ..core.database import Base
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    JOB_SEEKER = "JOB_SEEKER"
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    profile = relationship("Profiles", back_populates="user", uselist=False)