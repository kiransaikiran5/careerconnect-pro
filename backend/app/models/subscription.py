from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from ..core.database import Base

class Subscriptions(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)