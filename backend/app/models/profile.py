# backend/app/models/profile.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Profiles(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    bio = Column(Text)
    profile_picture = Column(String(500))
    linkedin_url = Column(String(500))
    website = Column(String(500))

    user = relationship("Users", back_populates="profile")