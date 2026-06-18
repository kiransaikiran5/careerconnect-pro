from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.saved_job import SavedJobs
from ..models.job import Jobs
from ..schemas.saved_job import SavedJobOut, SavedJobWithDetails

router = APIRouter(prefix="/saved-jobs", tags=["saved-jobs"])

# --------------------------------------------------------------------------
# Save a job
# --------------------------------------------------------------------------
@router.post("/{job_id}", response_model=SavedJobOut)
def save_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check job exists and is active
    job = db.query(Jobs).filter(Jobs.id == job_id, Jobs.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or inactive")

    # Check if already saved
    existing = db.query(SavedJobs).filter(
        SavedJobs.user_id == current_user.id,
        SavedJobs.job_id == job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")

    saved = SavedJobs(user_id=current_user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

# --------------------------------------------------------------------------
# Remove a saved job
# --------------------------------------------------------------------------
@router.delete("/{saved_id}")
def remove_saved_job(
    saved_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedJobs).filter(
        SavedJobs.id == saved_id,
        SavedJobs.user_id == current_user.id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
    db.delete(saved)
    db.commit()
    return {"message": "Saved job removed"}

# --------------------------------------------------------------------------
# List all saved jobs (with job details)
# --------------------------------------------------------------------------
@router.get("/", response_model=List[SavedJobWithDetails])
def list_saved_jobs(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedJobs).filter(
        SavedJobs.user_id == current_user.id
    ).order_by(SavedJobs.saved_at.desc()).all()

    result = []
    for s in saved:
        job = db.query(Jobs).get(s.job_id)
        result.append(SavedJobWithDetails(
            id=s.id,
            user_id=s.user_id,
            job_id=s.job_id,
            saved_at=s.saved_at,
            job_title=job.title if job else "N/A",
            company_name=job.company.name if job and job.company else "N/A",
            location=job.location if job else "N/A"
        ))
    return result