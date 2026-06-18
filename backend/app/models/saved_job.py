from sqlalchemy import Column, Integer, DateTime, ForeignKey, func
from ..core.database import Base

class SavedJobs(Base):
    __tablename__ = "saved_jobs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    saved_at = Column(DateTime, server_default=func.now())