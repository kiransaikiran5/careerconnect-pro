from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from ..core.database import Base

class Messages(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(DateTime, server_default=func.now())
    is_read = Column(Boolean, default=False)