from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeCreate(BaseModel):
    title: str
    is_current: bool = False

class ResumeOut(BaseModel):
    id: int
    user_id: int
    title: str
    file_path: Optional[str]
    uploaded_at: datetime
    is_current: bool

    class Config:
        from_attributes = True