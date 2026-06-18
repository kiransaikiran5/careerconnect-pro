from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    content_type: str     # job, review
    content_id: int
    reason: str

class ReportOut(BaseModel):
    id: int
    reporter_id: int
    content_type: str
    content_id: int
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True