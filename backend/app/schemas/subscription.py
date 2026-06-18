from pydantic import BaseModel
from datetime import datetime

class SubscriptionOut(BaseModel):
    id: int
    recruiter_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime
    is_active: bool

    class Config:
        from_attributes = True