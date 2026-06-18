from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from ..core.database import Base

class ReportedContent(Base):
    __tablename__ = "reported_content"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_type = Column(String(50), nullable=False)      # "job", "review"
    content_id = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending")          # pending, reviewed, dismissed
    created_at = Column(DateTime, server_default=func.now())