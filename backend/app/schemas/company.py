from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    logo: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True