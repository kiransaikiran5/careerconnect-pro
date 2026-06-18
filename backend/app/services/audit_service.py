from sqlalchemy.orm import Session
from ..models.audit_log import AuditLogs

def log_activity(
    db: Session,
    user_id: int = None,
    action: str = "",
    details: dict = None,
    ip_address: str = None
):
    log_entry = AuditLogs(
        user_id=user_id,
        action=action,
        details=details or {},
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()