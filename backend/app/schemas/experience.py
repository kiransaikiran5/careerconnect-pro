from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExperienceCreate(BaseModel):
    company_name: str
    position: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    is_current: bool = False

class ExperienceUpdate(BaseModel):
    company_name: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    is_current: Optional[bool] = None

class ExperienceOut(BaseModel):
    id: int
    company_name: str
    position: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    is_current: bool

    class Config:
        from_attributes = True