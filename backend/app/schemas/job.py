# backend/app/schemas/job.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = None
    category_id: Optional[int] = None
    is_active: bool = False   # default draft

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class JobOut(BaseModel):
    id: int
    company_id: int
    recruiter_id: int
    title: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = None
    category_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True