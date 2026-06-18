from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    company_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: str


class ReviewOut(BaseModel):
    id: int
    reviewer_id: int

    company_id: Optional[int] = None
    recruiter_id: Optional[int] = None

    rating: int
    comment: str
    created_at: datetime

    user_email: Optional[str] = None
    reviewer_email: Optional[str] = None
    user_name: Optional[str] = None
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True