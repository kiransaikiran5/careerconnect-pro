# backend/app/schemas/message.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MessageCreate(BaseModel):
    receiver_id: Optional[int] = None
    receiver_email: Optional[str] = None
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    sent_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    other_user_id: int
    other_user_name: str
    other_user_email: Optional[str] = None
    other_user_role: str
    last_message: Optional[str] = None
    last_sent_at: Optional[datetime] = None
    unread_count: int = 0

    class Config:
        from_attributes = True