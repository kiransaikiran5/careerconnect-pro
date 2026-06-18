from pydantic import BaseModel
from typing import Optional

class JobCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class JobCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True