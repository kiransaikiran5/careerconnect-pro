from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import Users, UserRole
from ..models.application import Applications, ApplicationStatus
from ..models.interview import Interviews
from ..models.job import Jobs
from ..models.recruiter import Recruiters
from ..models.notification import Notifications
from ..schemas.interview import InterviewCreate, InterviewUpdate, InterviewOut, InterviewDetailedOut

router = APIRouter(prefix="/interviews", tags=["interviews"])

# --------------------------------------------------------------------------
# Helper: verify the recruiter (or admin) owns the job linked to the application
# --------------------------------------------------------------------------
def verify_ownership(application_id: int, current_user, db: Session):
    app = db.query(Applications).get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    job = db.query(Jobs).get(app.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role == UserRole.ADMIN:
        return app, job
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can manage interviews")
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter or job.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="You do not own this job")
    return app, job

# --------------------------------------------------------------------------
# Schedule an interview
# --------------------------------------------------------------------------
@router.post("/", response_model=InterviewOut)
def schedule_interview(
    interview: InterviewCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app, job = verify_ownership(interview.application_id, current_user, db)

    if app.status not in [ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED]:
        raise HTTPException(status_code=400, detail="Cannot schedule interview for this application status")

    new_interview = Interviews(
        application_id=interview.application_id,
        scheduled_at=interview.scheduled_at,
        location=interview.location,
        notes=interview.notes,
        status="Scheduled"
    )
    db.add(new_interview)

    # Update application status
    app.status = ApplicationStatus.INTERVIEW_SCHEDULED

    # Notify the applicant
    applicant = db.query(Users).get(app.applicant_id)
    if applicant:
        notif = Notifications(
            user_id=applicant.id,
            message=f"Interview scheduled for '{job.title}' on {interview.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
            type="interview"
        )
        db.add(notif)

    db.commit()
    db.refresh(new_interview)
    return new_interview

# --------------------------------------------------------------------------
# Update / Reschedule / Complete / Cancel
# --------------------------------------------------------------------------
@router.put("/{interview_id}", response_model=InterviewOut)
def update_interview(
    interview_id: int,
    updates: InterviewUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interviews).get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    app, job = verify_ownership(interview.application_id, current_user, db)

    old_status = interview.status
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(interview, field, value)

    # Notify the applicant if status changed to Completed or Cancelled
    if updates.status and updates.status != old_status:
        applicant = db.query(Users).get(app.applicant_id)
        if applicant:
            msg = f"Interview for '{job.title}' has been {updates.status.lower()}."
            if updates.status == "Completed" and interview.feedback:
                msg += f" Feedback: {interview.feedback}"
            notif = Notifications(
                user_id=applicant.id,
                message=msg,
                type="interview"
            )
            db.add(notif)

    db.commit()
    db.refresh(interview)
    return interview

# --------------------------------------------------------------------------
# Recruiter / Admin view of all interviews for their jobs
# --------------------------------------------------------------------------
@router.get("/recruiter", response_model=List[InterviewDetailedOut])
def recruiter_interviews(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.role == UserRole.ADMIN:
        interviews = db.query(Interviews).order_by(Interviews.scheduled_at.desc()).all()
    else:
        recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
        job_ids = [j.id for j in db.query(Jobs).filter(Jobs.recruiter_id == recruiter.id).all()]
        if not job_ids:
            return []
        app_ids = [a.id for a in db.query(Applications).filter(Applications.job_id.in_(job_ids)).all()]
        if not app_ids:
            return []
        interviews = db.query(Interviews).filter(Interviews.application_id.in_(app_ids)).order_by(Interviews.scheduled_at.desc()).all()

    result = []
    for inv in interviews:
        app = db.query(Applications).get(inv.application_id)
        job = db.query(Jobs).get(app.job_id) if app else None
        applicant = db.query(Users).get(app.applicant_id) if app else None
        result.append(InterviewDetailedOut(
            id=inv.id,
            application_id=inv.application_id,
            scheduled_at=inv.scheduled_at,
            location=inv.location,
            notes=inv.notes,
            feedback=inv.feedback,
            status=inv.status,
            job_title=job.title if job else None,
            company_name=job.company.name if job and job.company else None,
            applicant_name=applicant.profile.full_name if applicant and applicant.profile else None,
            applicant_email=applicant.email if applicant else None
        ))
    return result

# --------------------------------------------------------------------------
# Job Seeker view of their own interviews
# --------------------------------------------------------------------------
@router.get("/my", response_model=List[InterviewDetailedOut])
def my_interviews(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Applications).filter(Applications.applicant_id == current_user.id).all()
    app_ids = [a.id for a in apps]
    if not app_ids:
        return []
    interviews = db.query(Interviews).filter(Interviews.application_id.in_(app_ids)).order_by(Interviews.scheduled_at.desc()).all()

    result = []
    for inv in interviews:
        app = db.query(Applications).get(inv.application_id)
        job = db.query(Jobs).get(app.job_id) if app else None
        result.append(InterviewDetailedOut(
            id=inv.id,
            application_id=inv.application_id,
            scheduled_at=inv.scheduled_at,
            location=inv.location,
            notes=inv.notes,
            feedback=inv.feedback,
            status=inv.status,
            job_title=job.title if job else None,
            company_name=job.company.name if job and job.company else None,
            applicant_name=None,
            applicant_email=None
        ))
    return result