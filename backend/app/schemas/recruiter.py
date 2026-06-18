from pydantic import BaseModel
from typing import Optional

# For creating a new recruiter profile
class RecruiterCreate(BaseModel):
    company_id: int
    title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None

# For viewing / updating the recruiter profile
class RecruiterProfileOut(BaseModel):
    id: int
    user_id: int
    company_id: int
    is_verified: bool
    title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None

    # Include nested user email and company name for convenience
    email: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

class RecruiterProfileUpdate(BaseModel):
    company_id: Optional[int] = None
    title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None

# For dashboard statistics
class RecruiterDashboardOut(BaseModel):
    total_jobs_posted: int
    total_applications_received: int
    total_shortlisted: int
    total_interviews_scheduled: int
    # Pipeline breakdown (for visual charts)
    pipeline_applied: int
    pipeline_shortlisted: int
    pipeline_rejected: int
    pipeline_interview_scheduled: int
    pipeline_offered: int

# Admin list of recruiters with verification status
class RecruiterOut(BaseModel):
    id: int
    user_id: int
    company_id: int
    is_verified: bool
    title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True