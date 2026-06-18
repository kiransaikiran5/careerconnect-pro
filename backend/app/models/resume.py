from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Resumes(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255))
    file_path = Column(String(500))
    uploaded_at = Column(DateTime, server_default=func.now())
    is_current = Column(Boolean, default=False)

    user = relationship("Users", backref="resumes")