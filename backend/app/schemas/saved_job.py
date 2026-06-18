from pydantic import BaseModel
from datetime import datetime

class SavedJobOut(BaseModel):
    id: int
    user_id: int
    job_id: int
    saved_at: datetime

    class Config:
        from_attributes = True

# Optional extended schema including job details
class SavedJobWithDetails(SavedJobOut):
    job_title: str = None
    company_name: str = None
    location: str = None