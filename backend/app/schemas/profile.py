# backend/app/schemas/profile.py
from pydantic import BaseModel
from typing import Optional

class ProfileCreate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    website: Optional[str] = None

class ProfileOut(ProfileCreate):
    id: int
    user_id: int
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True