# backend/app/models/notification.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from ..core.database import Base


class Notifications(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    message = Column(Text, nullable=False)

    # job_alert, application_update, interview, message
    type = Column(String(50), nullable=False, default="general")

    is_read = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)