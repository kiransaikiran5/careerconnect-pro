from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from ..core.database import Base

class Payments(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, server_default=func.now())
    transaction_id = Column(String(255), unique=True)
    status = Column(String(50), default="Completed")   # Completed, Failed, Refunded