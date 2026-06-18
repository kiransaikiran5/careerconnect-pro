# backend/app/routers/recruiters.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.recruiter import Recruiters
from ..models.job import Jobs
from ..models.application import Applications, ApplicationStatus
from ..models.interview import Interviews
from ..schemas.recruiter import (
    RecruiterProfileOut,
    RecruiterProfileUpdate,
    RecruiterDashboardOut,
    RecruiterOut,
    RecruiterCreate,
)

router = APIRouter(prefix="/recruiters", tags=["recruiters"])

# --------------------------------------------------------------------------
# 0. Register as a recruiter (link user to a company)
# --------------------------------------------------------------------------
@router.post("/register", response_model=RecruiterProfileOut)
def register_as_recruiter(
    data: RecruiterCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="User must have RECRUITER role")

    existing = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Recruiter profile already exists")

    recruiter = Recruiters(
        user_id=current_user.id,
        company_id=data.company_id,
        title=data.title,
        department=data.department,
        phone=data.phone
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    return RecruiterProfileOut(
        id=recruiter.id,
        user_id=recruiter.user_id,
        company_id=recruiter.company_id,
        is_verified=recruiter.is_verified,
        title=recruiter.title,
        department=recruiter.department,
        phone=recruiter.phone,
        email=current_user.email,
        company_name=recruiter.company.name if recruiter.company else None
    )

# --------------------------------------------------------------------------
# 1. Recruiter Profile – get own profile
# --------------------------------------------------------------------------
@router.get("/me", response_model=RecruiterProfileOut)
def get_my_recruiter_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found. Register as recruiter first.")

    return RecruiterProfileOut(
        id=recruiter.id,
        user_id=recruiter.user_id,
        company_id=recruiter.company_id,
        is_verified=recruiter.is_verified,
        title=recruiter.title,
        department=recruiter.department,
        phone=recruiter.phone,
        email=current_user.email,
        company_name=recruiter.company.name if recruiter.company else None
    )

# --------------------------------------------------------------------------
# 2. Recruiter Profile – update own profile
# --------------------------------------------------------------------------
@router.put("/me", response_model=RecruiterProfileOut)
def update_my_recruiter_profile(
    updates: RecruiterProfileUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found.")

    # Update only provided fields
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(recruiter, field, value)

    db.commit()
    db.refresh(recruiter)

    return RecruiterProfileOut(
        id=recruiter.id,
        user_id=recruiter.user_id,
        company_id=recruiter.company_id,
        is_verified=recruiter.is_verified,
        title=recruiter.title,
        department=recruiter.department,
        phone=recruiter.phone,
        email=current_user.email,
        company_name=recruiter.company.name if recruiter.company else None
    )

# --------------------------------------------------------------------------
# 3. Recruiter Dashboard (Enhanced with Pipeline Breakdown)
# --------------------------------------------------------------------------
@router.get("/dashboard", response_model=RecruiterDashboardOut)
def recruiter_dashboard(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Not a recruiter")

    # Active jobs count
    total_jobs = db.query(Jobs).filter(
        Jobs.recruiter_id == recruiter.id,
        Jobs.is_active == True
    ).count()

    # Get all jobs of this recruiter
    jobs = db.query(Jobs).filter(Jobs.recruiter_id == recruiter.id).all()
    job_ids = [j.id for j in jobs]

    if not job_ids:
        return RecruiterDashboardOut(
            total_jobs_posted=0,
            total_applications_received=0,
            total_shortlisted=0,
            total_interviews_scheduled=0,
            pipeline_applied=0,
            pipeline_shortlisted=0,
            pipeline_rejected=0,
            pipeline_interview_scheduled=0,
            pipeline_offered=0,
        )

    applications = db.query(Applications).filter(Applications.job_id.in_(job_ids))

    total_applications = applications.count()
    total_shortlisted = applications.filter(Applications.status == ApplicationStatus.SHORTLISTED).count()
    total_interviews = applications.filter(Applications.status == ApplicationStatus.INTERVIEW_SCHEDULED).count()

    # Pipeline counts
    applied = applications.filter(Applications.status == ApplicationStatus.APPLIED).count()
    shortlisted = total_shortlisted
    rejected = applications.filter(Applications.status == ApplicationStatus.REJECTED).count()
    interview_scheduled = total_interviews
    offered = applications.filter(Applications.status == ApplicationStatus.OFFERED).count()

    return {
        "total_jobs_posted": total_jobs,
        "total_applications_received": total_applications,
        "total_shortlisted": total_shortlisted,
        "total_interviews_scheduled": total_interviews,
        "pipeline_applied": applied,
        "pipeline_shortlisted": shortlisted,
        "pipeline_rejected": rejected,
        "pipeline_interview_scheduled": interview_scheduled,
        "pipeline_offered": offered,
    }

# --------------------------------------------------------------------------
# 4. Admin – list all recruiters
# --------------------------------------------------------------------------
@router.get("/", response_model=List[RecruiterOut])
def list_recruiters(
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    recruiters = db.query(Recruiters).all()
    return [
        RecruiterOut(
            id=r.id,
            user_id=r.user_id,
            company_id=r.company_id,
            is_verified=r.is_verified,
            title=r.title,
            department=r.department,
            phone=r.phone,
            email=r.user.email if r.user else None,
            company_name=r.company.name if r.company else None
        )
        for r in recruiters
    ]

# --------------------------------------------------------------------------
# 5. Admin – verify a recruiter
# --------------------------------------------------------------------------
@router.put("/{recruiter_id}/verify", response_model=RecruiterOut)
def verify_recruiter(
    recruiter_id: int,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiters).get(recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    recruiter.is_verified = True
    db.commit()
    db.refresh(recruiter)

    return RecruiterOut(
        id=recruiter.id,
        user_id=recruiter.user_id,
        company_id=recruiter.company_id,
        is_verified=recruiter.is_verified,
        title=recruiter.title,
        department=recruiter.department,
        phone=recruiter.phone,
        email=recruiter.user.email if recruiter.user else None,
        company_name=recruiter.company.name if recruiter.company else None
    )