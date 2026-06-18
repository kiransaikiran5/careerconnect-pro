from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.job import Jobs
from ..schemas.job import JobOut

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/jobs", response_model=List[JobOut])
def search_jobs(
    q: Optional[str] = Query(None, description="Keyword search in title and description"),
    location: Optional[str] = Query(None, description="Filter by location (contains)"),
    job_type: Optional[str] = Query(None, description="Filter by job type (Full-time, Part-time, etc.)"),
    min_salary: Optional[float] = Query(None, description="Minimum salary filter"),
    max_salary: Optional[float] = Query(None, description="Maximum salary filter"),
    category_id: Optional[int] = Query(None, description="Filter by job category ID"),
    current_user = Depends(get_current_user),   # any logged-in user
    db: Session = Depends(get_db)
):
    query = db.query(Jobs).filter(Jobs.is_active == True)

    if q:
        # Search in title and description
        search_term = f"%{q}%"
        query = query.filter(
            Jobs.title.ilike(search_term) | Jobs.description.ilike(search_term)
        )
    if location:
        query = query.filter(Jobs.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Jobs.job_type == job_type)
    if min_salary is not None:
        query = query.filter(Jobs.salary_min >= min_salary)
    if max_salary is not None:
        query = query.filter(Jobs.salary_max <= max_salary)
    if category_id is not None:
        query = query.filter(Jobs.category_id == category_id)

    return query.order_by(Jobs.created_at.desc()).all()