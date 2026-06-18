# backend/app/routers/jobs.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.middleware import require_role
from ..models.user import Users, UserRole
from ..models.job import Jobs
from ..models.recruiter import Recruiters
from ..models.notification import Notifications
from ..models.subscription import Subscriptions
from ..models.plan import Plans
from ..schemas.job import JobCreate, JobUpdate, JobOut
from ..services.audit_service import log_activity   # <-- audit logging

router = APIRouter(prefix="/jobs", tags=["jobs"])

# --------------------------------------------------------------------------
# Create job (only verified recruiter) + job alert + subscription check + audit
# --------------------------------------------------------------------------
@router.post("/", response_model=JobOut)
def create_job(
    job_data: JobCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None   # optional, for IP logging
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can create jobs")
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=403, detail="Recruiter profile not found")
    if not recruiter.is_verified:
        raise HTTPException(status_code=403, detail="Recruiter is not verified")

    # ----- Subscription posting limit check -----
    active_sub = db.query(Subscriptions).filter(
        Subscriptions.recruiter_id == recruiter.id,
        Subscriptions.is_active == True
    ).first()
    if active_sub:
        plan = db.query(Plans).get(active_sub.plan_id)
        if plan and plan.job_posting_limit != -1:   # -1 means unlimited
            current_job_count = db.query(Jobs).filter(
                Jobs.recruiter_id == recruiter.id,
                Jobs.is_active == True
            ).count()
            if current_job_count >= plan.job_posting_limit:
                raise HTTPException(
                    status_code=403,
                    detail=f"Job posting limit reached ({plan.job_posting_limit}). Upgrade your plan."
                )

    job = Jobs(
        company_id=recruiter.company_id,
        recruiter_id=recruiter.id,
        **job_data.dict()
    )
    db.add(job)

    # ---- JOB ALERT: notify all job seekers ----
    job_seekers = db.query(Users).filter(Users.role == UserRole.JOB_SEEKER).all()
    for seeker in job_seekers:
        notif = Notifications(
            user_id=seeker.id,
            message=f"New job posted: '{job.title}' by {recruiter.company.name if recruiter.company else 'a recruiter'}.",
            type="job_alert"
        )
        db.add(notif)

    db.commit()
    db.refresh(job)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="JOB_CREATE",
        details={"job_id": job.id, "title": job.title, "is_active": job.is_active},
        ip_address=request.client.host if request else None
    )

    return job

# --------------------------------------------------------------------------
# List jobs
# --------------------------------------------------------------------------
@router.get("/", response_model=List[JobOut])
def list_jobs(
    show_drafts: bool = Query(False),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Jobs)
    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
        if recruiter:
            query = query.filter(Jobs.recruiter_id == recruiter.id)
            if not show_drafts:
                query = query.filter(Jobs.is_active == True)
        else:
            return []
    else:
        query = query.filter(Jobs.is_active == True)
    return query.order_by(Jobs.created_at.desc()).all()

# --------------------------------------------------------------------------
# Get single job
# --------------------------------------------------------------------------
@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Jobs).get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active:
        if current_user.role == UserRole.RECRUITER:
            recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
            if not recruiter or job.recruiter_id != recruiter.id:
                raise HTTPException(status_code=404, detail="Job not found")
        else:
            raise HTTPException(status_code=404, detail="Job not found")
    return job

# --------------------------------------------------------------------------
# Update job (recruiter own job or admin) + audit
# --------------------------------------------------------------------------
@router.put("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    updates: JobUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    job = db.query(Jobs).get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this job")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Keep track of changed fields for audit
    changed_fields = {f: getattr(job, f) for f in updates.dict(exclude_unset=True).keys()}

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="JOB_UPDATE",
        details={"job_id": job.id, "changed_fields": changed_fields},
        ip_address=request.client.host if request else None
    )

    return job

# --------------------------------------------------------------------------
# Delete job (soft delete for recruiter, permanent for admin) + audit
# --------------------------------------------------------------------------
@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    job = db.query(Jobs).get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    action = "JOB_DEACTIVATE"   # default for recruiter
    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        job.is_active = False
        db.commit()
        message = "Job deactivated"
    elif current_user.role == UserRole.ADMIN:
        action = "JOB_DELETE_PERMANENT"
        db.delete(job)
        db.commit()
        message = "Job permanently deleted"
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action=action,
        details={"job_id": job_id, "title": job.title},
        ip_address=request.client.host if request else None
    )

    return {"message": message}

# --------------------------------------------------------------------------
# Publish / Unpublish toggle + audit
# --------------------------------------------------------------------------
@router.put("/{job_id}/publish", response_model=JobOut)
def toggle_publish(
    job_id: int,
    publish: bool = True,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    job = db.query(Jobs).get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    job.is_active = publish
    db.commit()
    db.refresh(job)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="JOB_PUBLISH" if publish else "JOB_UNPUBLISH",
        details={"job_id": job.id, "title": job.title},
        ip_address=request.client.host if request else None
    )

    return job