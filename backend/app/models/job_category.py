# backend/app/models/job_category.py
from sqlalchemy import Column, Integer, String, Text
from ..core.database import Base

class JobCategories(Base):
    __tablename__ = "job_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)