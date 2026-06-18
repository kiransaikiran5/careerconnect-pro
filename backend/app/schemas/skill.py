from pydantic import BaseModel
from typing import Optional

class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency_level: Optional[str] = None

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency_level: Optional[str] = None

class SkillOut(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    proficiency_level: Optional[str] = None

    class Config:
        from_attributes = True