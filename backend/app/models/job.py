from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, func
from ..core.database import Base
from sqlalchemy.orm import relationship


class Jobs(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=False)
    title = Column(String(255))
    description = Column(Text)
    requirements = Column(Text)
    location = Column(String(255))
    salary_min = Column(Float)
    salary_max = Column(Float)
    job_type = Column(String(50))
    category_id = Column(Integer, ForeignKey("job_categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Companies", backref="jobs")
    recruiter = relationship("Recruiters", backref="jobs")
    category = relationship("JobCategories", backref="jobs")