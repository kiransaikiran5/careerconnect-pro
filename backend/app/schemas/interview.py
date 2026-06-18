from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InterviewCreate(BaseModel):
    application_id: int
    scheduled_at: datetime
    location: Optional[str] = None
    notes: Optional[str] = None

class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    status: Optional[str] = None   # "Scheduled", "Completed", "Cancelled"

class InterviewOut(BaseModel):
    id: int
    application_id: int
    scheduled_at: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True

# Extended output including job & applicant details
class InterviewDetailedOut(InterviewOut):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None