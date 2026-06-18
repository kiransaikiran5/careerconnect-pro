from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.job import Jobs
from ..models.skill import Skills
from ..models.application import Applications
from ..schemas.job import JobOut

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

# --------------------------------------------------------------------------
# Personalized jobs – based on user’s skills
# --------------------------------------------------------------------------
@router.get("/personalized", response_model=List[JobOut])
def personalized_jobs(
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the user's skill names
    skills = db.query(Skills).filter(Skills.user_id == current_user.id).all()
    skill_names = [s.name.lower() for s in skills]

    if not skill_names:
        # No skills → return latest active jobs
        return db.query(Jobs).filter(Jobs.is_active == True).order_by(
            Jobs.created_at.desc()
        ).limit(limit).all()

    # Build a filter that checks if any skill appears in title, description, or requirements
    filters = []
    for skill in skill_names:
        like_pattern = f"%{skill}%"
        filters.append(Jobs.title.ilike(like_pattern))
        filters.append(Jobs.description.ilike(like_pattern))
        filters.append(Jobs.requirements.ilike(like_pattern))

    from sqlalchemy import or_
    query = db.query(Jobs).filter(Jobs.is_active == True).filter(or_(*filters))
    return query.order_by(Jobs.created_at.desc()).limit(limit).all()

# --------------------------------------------------------------------------
# Trending jobs – most applied (active) in last 30 days
# --------------------------------------------------------------------------
@router.get("/trending", response_model=List[JobOut])
def trending_jobs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    # Subquery to count applications per job (all time, but we could add a date filter)
    # For simplicity, count all applications for active jobs
    subq = (
        db.query(Applications.job_id, func.count(Applications.id).label("app_count"))
        .group_by(Applications.job_id)
        .subquery()
    )

    trending = (
        db.query(Jobs)
        .outerjoin(subq, Jobs.id == subq.c.job_id)
        .filter(Jobs.is_active == True)
        .order_by(desc(func.coalesce(subq.c.app_count, 0)))
        .limit(limit)
        .all()
    )
    return trending

# --------------------------------------------------------------------------
# Recommended – combined personalized + trending (de-duplicated)
# --------------------------------------------------------------------------
@router.get("/recommended", response_model=List[JobOut])
def recommended_jobs(
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get personalized list
    personalized = personalized_jobs(limit=limit, current_user=current_user, db=db)
    # Get trending list
    trending = trending_jobs(limit=limit, db=db)

    # Combine, de-duplicate, and slice to limit
    seen_ids = set()
    combined = []
    for job in personalized + trending:
        if job.id not in seen_ids:
            seen_ids.add(job.id)
            combined.append(job)
    return combined[:limit]