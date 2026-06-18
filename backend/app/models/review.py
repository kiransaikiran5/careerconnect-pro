from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from ..core.database import Base

class Reviews(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"))
    rating = Column(Integer, nullable=False)   # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())