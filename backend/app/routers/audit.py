from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ..core.database import get_db
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.audit_log import AuditLogs
from ..schemas.audit_log import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@router.get("/", response_model=List[AuditLogOut])
def get_audit_logs(
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, le=1000),
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLogs).order_by(AuditLogs.timestamp.desc())
    if user_id:
        query = query.filter(AuditLogs.user_id == user_id)
    if action:
        query = query.filter(AuditLogs.action == action)
    if start_date:
        query = query.filter(AuditLogs.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLogs.timestamp <= end_date)
    return query.limit(limit).all()