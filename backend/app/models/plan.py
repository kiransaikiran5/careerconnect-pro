from sqlalchemy import Column, Integer, String, Float, Boolean
from ..core.database import Base

class Plans(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)            # Free, Premium, Enterprise
    price = Column(Float, default=0.0)
    job_posting_limit = Column(Integer, default=1)        # -1 for unlimited
    is_featured = Column(Boolean, default=False)          # featured job listing
    priority_support = Column(Boolean, default=False)
    description = Column(String(500), nullable=True)      # optional description