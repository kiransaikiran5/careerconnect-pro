# backend/app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import Users, UserRole
from ..models.recruiter import Recruiters
from ..models.application import Applications, ApplicationStatus
from ..models.job import Jobs
from ..models.resume import Resumes
from ..models.notification import Notifications
from ..schemas.application import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationHistoryOut,
    ApplicantOut,
    ApplicationStatsOut,
)
from ..services.audit_service import log_activity   # <-- audit logging

router = APIRouter(prefix="/applications", tags=["applications"])

# --------------------------------------------------------------------------
# Apply for a job + audit
# --------------------------------------------------------------------------
@router.post("/", response_model=ApplicationOut)
def apply_to_job(
    app: ApplicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None   # optional IP logging
):
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Only job seekers can apply")

    job = db.query(Jobs).get(app.job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found or is not active")

    existing = db.query(Applications).filter(
        Applications.job_id == app.job_id,
        Applications.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    if app.resume_id:
        resume = db.query(Resumes).filter(
            Resumes.id == app.resume_id,
            Resumes.user_id == current_user.id
        ).first()
        if not resume:
            raise HTTPException(status_code=400, detail="Resume not found or does not belong to you")

    new_app = Applications(
        job_id=app.job_id,
        applicant_id=current_user.id,
        cover_letter=app.cover_letter,
        resume_id=app.resume_id
    )
    db.add(new_app)

    # Notify the recruiter
    # job.recruiter relationship may not be loaded; we'll look up the recruiter explicitly
    recruiter = db.query(Recruiters).filter(Recruiters.id == job.recruiter_id).first()
    if recruiter:
        notif = Notifications(
            user_id=recruiter.user_id,
            message=f"New application for '{job.title}' from {current_user.email}.",
            type="application_update"
        )
        db.add(notif)

    db.commit()
    db.refresh(new_app)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="APPLICATION_SUBMIT",
        details={"application_id": new_app.id, "job_id": app.job_id, "job_title": job.title},
        ip_address=request.client.host if request else None
    )

    return new_app

# --------------------------------------------------------------------------
# Application Stats for Dashboard
# --------------------------------------------------------------------------
@router.get("/stats", response_model=ApplicationStatsOut)
def application_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Applications).filter(
        Applications.applicant_id == current_user.id
    ).all()

    total = len(apps)
    applied = sum(1 for a in apps if a.status == ApplicationStatus.APPLIED)
    shortlisted = sum(1 for a in apps if a.status == ApplicationStatus.SHORTLISTED)
    rejected = sum(1 for a in apps if a.status == ApplicationStatus.REJECTED)
    interview = sum(1 for a in apps if a.status == ApplicationStatus.INTERVIEW_SCHEDULED)
    offered = sum(1 for a in apps if a.status == ApplicationStatus.OFFERED)

    return ApplicationStatsOut(
        total_applications=total,
        applied=applied,
        shortlisted=shortlisted,
        rejected=rejected,
        interview_scheduled=interview,
        offered=offered
    )

# --------------------------------------------------------------------------
# List my applications (with optional status filter)
# --------------------------------------------------------------------------
@router.get("/my-applications", response_model=List[ApplicationHistoryOut])
def my_applications(
    status: Optional[str] = Query(None, description="Filter by status (e.g., APPLIED, SHORTLISTED)"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Applications).filter(
        Applications.applicant_id == current_user.id
    )
    if status:
        try:
            status_enum = ApplicationStatus[status.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status value")
        query = query.filter(Applications.status == status_enum)

    apps = query.order_by(Applications.applied_at.desc()).all()

    result = []
    for app in apps:
        job = db.query(Jobs).get(app.job_id)
        result.append(ApplicationHistoryOut(
            id=app.id,
            job_id=app.job_id,
            applicant_id=app.applicant_id,
            status=app.status.value if isinstance(app.status, ApplicationStatus) else app.status,
            applied_at=app.applied_at,
            cover_letter=app.cover_letter,
            resume_id=app.resume_id,
            job_title=job.title if job else None,
            company_name=job.company.name if job and job.company else None,
            location=job.location if job else None
        ))
    return result

# --------------------------------------------------------------------------
# Get a single application (for status tracking)
# --------------------------------------------------------------------------
@router.get("/{application_id}", response_model=ApplicationHistoryOut)
def get_application(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Applications).filter(
        Applications.id == application_id,
        Applications.applicant_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.query(Jobs).get(app.job_id)
    return ApplicationHistoryOut(
        id=app.id,
        job_id=app.job_id,
        applicant_id=app.applicant_id,
        status=app.status.value if isinstance(app.status, ApplicationStatus) else app.status,
        applied_at=app.applied_at,
        cover_letter=app.cover_letter,
        resume_id=app.resume_id,
        job_title=job.title if job else None,
        company_name=job.company.name if job and job.company else None,
        location=job.location if job else None
    )

# --------------------------------------------------------------------------
# Recruiter – list all applications for my jobs
# --------------------------------------------------------------------------
@router.get("/recruiter", response_model=List[ApplicantOut])
def recruiter_applications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can access this")

    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    jobs = db.query(Jobs).filter(Jobs.recruiter_id == recruiter.id).all()
    if not jobs:
        return []

    job_ids = [j.id for j in jobs]
    apps = db.query(Applications).filter(
        Applications.job_id.in_(job_ids)
    ).order_by(Applications.applied_at.desc()).all()

    result = []
    for app in apps:
        applicant = db.query(Users).get(app.applicant_id)
        resume_title = None
        if app.resume_id:
            resume = db.query(Resumes).get(app.resume_id)
            if resume:
                resume_title = resume.title

        applicant_name = None
        if applicant and applicant.profile:
            applicant_name = applicant.profile.full_name

        result.append(ApplicantOut(
            application_id=app.id,
            job_id=app.job_id,
            applicant_id=app.applicant_id,
            applicant_name=applicant_name,
            applicant_email=applicant.email if applicant else None,
            status=app.status.value if isinstance(app.status, ApplicationStatus) else app.status,
            applied_at=app.applied_at,
            cover_letter=app.cover_letter,
            resume_id=app.resume_id,
            resume_title=resume_title
        ))

    return result