# backend/app/schemas/application.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None
    resume_id: Optional[int] = None

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    applicant_id: int
    status: str
    applied_at: datetime
    cover_letter: Optional[str] = None
    resume_id: Optional[int] = None

    class Config:
        from_attributes = True

class ApplicationHistoryOut(ApplicationOut):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None

# ---------- NEW: for shortlisting views ----------
class ApplicantOut(BaseModel):
    application_id: int
    job_id: int
    applicant_id: int
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    status: str
    applied_at: datetime
    cover_letter: Optional[str] = None
    resume_id: Optional[int] = None
    resume_title: Optional[str] = None

    class Config:
        from_attributes = True

class PipelineStats(BaseModel):
    total_applications: int
    applied: int
    shortlisted: int
    rejected: int
    interview_scheduled: int
    offered: int
    
class ApplicationStatsOut(BaseModel):
    total_applications: int
    applied: int
    shortlisted: int
    rejected: int
    interview_scheduled: int
    offered: int