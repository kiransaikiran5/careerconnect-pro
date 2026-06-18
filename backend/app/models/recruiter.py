# backend/app/models/recruiter.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Recruiters(Base):
    __tablename__ = "recruiters"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_verified = Column(Boolean, default=False)

    # New recruiter‑specific fields
    title = Column(String(255))                # e.g., "HR Manager"
    department = Column(String(255))           # e.g., "Human Resources"
    phone = Column(String(50))                 # direct contact

    user = relationship("Users", backref="recruiter_profile")
    company = relationship("Companies", backref="recruiters")