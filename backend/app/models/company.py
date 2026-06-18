from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from ..core.database import Base

class Companies(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    website = Column(String(500))
    location = Column(String(255))
    logo = Column(String(500))               # path to uploaded logo
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())