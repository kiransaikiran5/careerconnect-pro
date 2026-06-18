from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Experience(Base):
    __tablename__ = "experience"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    description = Column(Text)
    is_current = Column(Boolean, default=False)        # for “currently working here”

    user = relationship("Users", backref="experience")