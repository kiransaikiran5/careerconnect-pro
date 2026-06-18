from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    details: Optional[Dict[str, Any]]
    timestamp: datetime
    ip_address: Optional[str]

    class Config:
        from_attributes = True