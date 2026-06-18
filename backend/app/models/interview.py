from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from ..core.database import Base

class Interviews(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    scheduled_at = Column(DateTime)
    location = Column(String(255))
    notes = Column(Text)
    feedback = Column(Text)
    status = Column(String(50))  # Scheduled, Completed, Cancelled