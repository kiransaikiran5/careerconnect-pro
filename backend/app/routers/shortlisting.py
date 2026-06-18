# backend/app/routers/shortlisting.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import mimetypes

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import Users, UserRole
from ..models.application import Applications, ApplicationStatus
from ..models.job import Jobs
from ..models.recruiter import Recruiters
from ..models.profile import Profiles
from ..models.resume import Resumes
from ..models.notification import Notifications
from ..schemas.application import ApplicantOut, PipelineStats
from ..services.audit_service import log_activity   # <-- audit logging

router = APIRouter(prefix="/shortlisting", tags=["shortlisting"])


# --------------------------------------------------------------------------
# Helper: role checker
# --------------------------------------------------------------------------
def has_role(current_user, role: UserRole):
    return current_user.role == role or current_user.role == role.value


# --------------------------------------------------------------------------
# Helper: verify recruiter owns the job, admin can access any job
# --------------------------------------------------------------------------
def check_job_ownership(job_id: int, current_user, db: Session):
    job = db.query(Jobs).get(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if has_role(current_user, UserRole.ADMIN):
        return job

    if not has_role(current_user, UserRole.RECRUITER):
        raise HTTPException(
            status_code=403,
            detail="Only recruiters or admins can manage candidates",
        )

    recruiter = (
        db.query(Recruiters)
        .filter(Recruiters.user_id == current_user.id)
        .first()
    )

    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    if job.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="You do not own this job")

    return job


# --------------------------------------------------------------------------
# Helper: notification creator
# --------------------------------------------------------------------------
def create_notification(
    db: Session,
    user_id: int,
    message: str,
    notification_type: str = "application_update",
):
    if not user_id:
        return None

    notif_data = {
        "user_id": user_id,
        "message": message,
    }

    if hasattr(Notifications, "type"):
        notif_data["type"] = notification_type
    if hasattr(Notifications, "notification_type"):
        notif_data["notification_type"] = notification_type
    if hasattr(Notifications, "is_read"):
        notif_data["is_read"] = False

    notif = Notifications(**notif_data)
    db.add(notif)
    return notif


def format_status(status):
    value = status.value if isinstance(status, ApplicationStatus) else str(status)
    return value.replace("_", " ").lower()


def notify_application_status_change(
    db: Session,
    app: Applications,
    job: Jobs,
    action_text: str,
):
    applicant_user = db.query(Users).get(app.applicant_id)
    if not applicant_user:
        return None

    job_title = getattr(job, "title", None) or "the job"
    message = f"Your application for '{job_title}' has been {action_text}."

    return create_notification(
        db=db,
        user_id=app.applicant_id,
        message=message,
        notification_type="application_update",
    )


# --------------------------------------------------------------------------
# Helper: resume file resolver
# --------------------------------------------------------------------------
def get_resume_download_name(resume: Resumes):
    return (
        getattr(resume, "original_filename", None)
        or getattr(resume, "file_name", None)
        or getattr(resume, "filename", None)
        or f"{resume.title or 'resume'}"
    )


def resolve_resume_file(resume: Resumes):
    possible_fields = [
        "file_path",
        "file_url",
        "path",
        "resume_path",
        "file",
        "file_name",
        "filename",
        "stored_filename",
    ]

    raw_values = []

    for field in possible_fields:
        value = getattr(resume, field, None)
        if value:
            raw_values.append(str(value))

    for raw in raw_values:
        cleaned = raw.replace("\\", "/").strip()

        if cleaned.startswith("http://") or cleaned.startswith("https://"):
            return {"type": "url", "value": cleaned}

        path = Path(cleaned)
        candidates = []

        if path.is_absolute():
            candidates.append(path)
        else:
            candidates.extend(
                [
                    Path.cwd() / path,
                    Path.cwd() / "uploads" / path,
                    Path.cwd() / "uploads" / "resumes" / path.name,
                    Path.cwd() / "backend" / "uploads" / "resumes" / path.name,
                    Path.cwd() / "app" / "uploads" / "resumes" / path.name,
                ]
            )

        for candidate in candidates:
            if candidate.exists() and candidate.is_file():
                return {"type": "file", "value": candidate}

    return None


def resume_file_response(resume: Resumes):
    resolved = resolve_resume_file(resume)

    if not resolved:
        raise HTTPException(
            status_code=404,
            detail="Resume file not found on server",
        )

    if resolved["type"] == "url":
        return RedirectResponse(url=resolved["value"])

    file_path = resolved["value"]
    download_name = get_resume_download_name(resume)

    if "." not in download_name and file_path.suffix:
        download_name = f"{download_name}{file_path.suffix}"

    media_type = (
        mimetypes.guess_type(str(file_path))[0]
        or "application/octet-stream"
    )

    return FileResponse(
        path=file_path,
        filename=download_name,
        media_type=media_type,
    )


# --------------------------------------------------------------------------
# Get applicants for a specific job
# --------------------------------------------------------------------------
@router.get("/jobs/{job_id}/applications", response_model=List[ApplicantOut])
def get_applicants(
    job_id: int,
    status_filter: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_job_ownership(job_id, current_user, db)

    query = db.query(Applications).filter(Applications.job_id == job_id)

    if status_filter:
        try:
            status_enum = ApplicationStatus[status_filter.strip().upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status value")
        query = query.filter(Applications.status == status_enum)

    applications = query.order_by(Applications.applied_at.desc()).all()

    result = []

    for app in applications:
        applicant = db.query(Users).get(app.applicant_id)

        profile = (
            db.query(Profiles)
            .filter(Profiles.user_id == applicant.id)
            .first()
            if applicant
            else None
        )

        resume_title = None
        if app.resume_id:
            resume = db.query(Resumes).get(app.resume_id)
            if resume:
                resume_title = resume.title

        result.append(
            ApplicantOut(
                application_id=app.id,
                job_id=app.job_id,
                applicant_id=app.applicant_id,
                applicant_name=profile.full_name if profile else None,
                applicant_email=applicant.email if applicant else None,
                status=app.status.value
                if isinstance(app.status, ApplicationStatus)
                else app.status,
                applied_at=app.applied_at,
                cover_letter=app.cover_letter,
                resume_id=app.resume_id,
                resume_title=resume_title,
            )
        )

    return result


# --------------------------------------------------------------------------
# Download candidate resume securely (recruiter/admin) + audit
# --------------------------------------------------------------------------
@router.get("/applications/{application_id}/resume/download")
def download_candidate_resume(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None,
):
    app = db.query(Applications).get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = check_job_ownership(app.job_id, current_user, db)

    if not app.resume_id:
        raise HTTPException(status_code=404, detail="No resume attached")

    resume = db.query(Resumes).get(app.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Audit log the download
    log_activity(
        db,
        user_id=current_user.id,
        action="RESUME_DOWNLOAD",
        details={
            "application_id": application_id,
            "job_id": app.job_id,
            "job_title": job.title,
            "recruiter_action": True,
        },
        ip_address=request.client.host if request else None,
    )

    return resume_file_response(resume)


# --------------------------------------------------------------------------
# Shortlist a candidate (with audit)
# --------------------------------------------------------------------------
@router.put("/applications/{application_id}/shortlist")
def shortlist_candidate(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None,
):
    app = db.query(Applications).get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = check_job_ownership(app.job_id, current_user, db)

    app.status = ApplicationStatus.SHORTLISTED

    notify_application_status_change(
        db=db,
        app=app,
        job=job,
        action_text="shortlisted",
    )

    db.commit()
    db.refresh(app)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="APPLICATION_SHORTLISTED",
        details={
            "application_id": application_id,
            "job_id": app.job_id,
            "job_title": job.title,
        },
        ip_address=request.client.host if request else None,
    )

    return {
        "message": "Candidate shortlisted",
        "application_id": app.id,
        "status": format_status(app.status),
        "notification_sent": True,
    }


# --------------------------------------------------------------------------
# Reject a candidate (with audit)
# --------------------------------------------------------------------------
@router.put("/applications/{application_id}/reject")
def reject_candidate(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None,
):
    app = db.query(Applications).get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = check_job_ownership(app.job_id, current_user, db)

    app.status = ApplicationStatus.REJECTED

    notify_application_status_change(
        db=db,
        app=app,
        job=job,
        action_text="rejected",
    )

    db.commit()
    db.refresh(app)

    # Audit log
    log_activity(
        db,
        user_id=current_user.id,
        action="APPLICATION_REJECTED",
        details={
            "application_id": application_id,
            "job_id": app.job_id,
            "job_title": job.title,
        },
        ip_address=request.client.host if request else None,
    )

    return {
        "message": "Candidate rejected",
        "application_id": app.id,
        "status": format_status(app.status),
        "notification_sent": True,
    }


# --------------------------------------------------------------------------
# Pipeline stats for recruiter/admin
# --------------------------------------------------------------------------
@router.get("/pipeline", response_model=PipelineStats)
def pipeline_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if has_role(current_user, UserRole.ADMIN):
        all_apps = db.query(Applications)

        total = all_apps.count()
        applied = all_apps.filter(
            Applications.status == ApplicationStatus.APPLIED
        ).count()
        shortlisted = all_apps.filter(
            Applications.status == ApplicationStatus.SHORTLISTED
        ).count()
        rejected = all_apps.filter(
            Applications.status == ApplicationStatus.REJECTED
        ).count()
        interview = all_apps.filter(
            Applications.status == ApplicationStatus.INTERVIEW_SCHEDULED
        ).count()
        offered = all_apps.filter(
            Applications.status == ApplicationStatus.OFFERED
        ).count()

        return PipelineStats(
            total_applications=total,
            applied=applied,
            shortlisted=shortlisted,
            rejected=rejected,
            interview_scheduled=interview,
            offered=offered,
        )

    if not has_role(current_user, UserRole.RECRUITER):
        raise HTTPException(
            status_code=403,
            detail="Only recruiters or admins can view pipeline",
        )

    recruiter = (
        db.query(Recruiters)
        .filter(Recruiters.user_id == current_user.id)
        .first()
    )
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    jobs = db.query(Jobs).filter(Jobs.recruiter_id == recruiter.id).all()
    job_ids = [job.id for job in jobs]

    if not job_ids:
        return PipelineStats(
            total_applications=0,
            applied=0,
            shortlisted=0,
            rejected=0,
            interview_scheduled=0,
            offered=0,
        )

    all_apps = db.query(Applications).filter(Applications.job_id.in_(job_ids))

    total = all_apps.count()
    applied = all_apps.filter(
        Applications.status == ApplicationStatus.APPLIED
    ).count()
    shortlisted = all_apps.filter(
        Applications.status == ApplicationStatus.SHORTLISTED
    ).count()
    rejected = all_apps.filter(
        Applications.status == ApplicationStatus.REJECTED
    ).count()
    interview = all_apps.filter(
        Applications.status == ApplicationStatus.INTERVIEW_SCHEDULED
    ).count()
    offered = all_apps.filter(
        Applications.status == ApplicationStatus.OFFERED
    ).count()

    return PipelineStats(
        total_applications=total,
        applied=applied,
        shortlisted=shortlisted,
        rejected=rejected,
        interview_scheduled=interview,
        offered=offered,
    )