from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, func
from ..core.database import Base

class AuditLogs(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)        # e.g., USER_REGISTER, JOB_CREATE, LOGIN
    details = Column(JSON, nullable=True)               # additional info
    timestamp = Column(DateTime, server_default=func.now())
    ip_address = Column(String(50), nullable=True)