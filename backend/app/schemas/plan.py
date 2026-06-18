from pydantic import BaseModel
from typing import Optional

class PlanCreate(BaseModel):
    name: str
    price: float = 0.0
    job_posting_limit: int = 1
    is_featured: bool = False
    priority_support: bool = False
    description: Optional[str] = None

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    job_posting_limit: Optional[int] = None
    is_featured: Optional[bool] = None
    priority_support: Optional[bool] = None
    description: Optional[str] = None

class PlanOut(BaseModel):
    id: int
    name: str
    price: float
    job_posting_limit: int
    is_featured: bool
    priority_support: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True