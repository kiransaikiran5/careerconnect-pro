from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.reported_content import ReportedContent
from ..schemas.reported_content import ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])

# --------------------------------------------------------------------------
# Report content (any authenticated user)
# --------------------------------------------------------------------------
@router.post("/", response_model=ReportOut)
def create_report(
    report: ReportCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if report.content_type not in ("job", "review"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    new_report = ReportedContent(
        reporter_id=current_user.id,
        content_type=report.content_type,
        content_id=report.content_id,
        reason=report.reason
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# --------------------------------------------------------------------------
# Admin – list all reports (optionally filter by status)
# --------------------------------------------------------------------------
@router.get("/", response_model=List[ReportOut])
def get_reports(
    status: str = None,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(ReportedContent).order_by(ReportedContent.created_at.desc())
    if status:
        query = query.filter(ReportedContent.status == status)
    return query.all()

# --------------------------------------------------------------------------
# Admin – update report status (reviewed / dismissed)
# --------------------------------------------------------------------------
@router.put("/{report_id}", response_model=ReportOut)
def update_report_status(
    report_id: int,
    status: str,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    report = db.query(ReportedContent).get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if status not in ("pending", "reviewed", "dismissed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    report.status = status
    db.commit()
    db.refresh(report)
    return report