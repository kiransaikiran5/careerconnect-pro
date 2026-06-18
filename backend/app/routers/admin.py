# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.middleware import require_role
from ..models.user import Users, UserRole
from ..models.recruiter import Recruiters
from ..models.company import Companies
from ..models.job import Jobs
from ..schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])

# --------------------------------------------------------------------------
# 1. Admin Dashboard – platform statistics
# --------------------------------------------------------------------------
@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    total_users = db.query(Users).count()
    total_recruiters = db.query(Recruiters).count()
    total_companies = db.query(Companies).count()
    total_jobs = db.query(Jobs).count()

    return {
        "total_users": total_users,
        "total_recruiters": total_recruiters,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
    }

# --------------------------------------------------------------------------
# 2. List all users (admin only)
# --------------------------------------------------------------------------
@router.get("/users", response_model=List[UserOut])
def list_all_users(
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return db.query(Users).order_by(Users.created_at.desc()).all()

# --------------------------------------------------------------------------
# 3. Get a single user by ID
# --------------------------------------------------------------------------
@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    user = db.query(Users).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --------------------------------------------------------------------------
# 4. Enable / Disable a user
# --------------------------------------------------------------------------
@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    user = db.query(Users).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}

# --------------------------------------------------------------------------
# 5. Verify a company (admin only)
# --------------------------------------------------------------------------
@router.put("/verify-company/{company_id}")
def verify_company(
    company_id: int,
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    company = db.query(Companies).get(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_verified = True
    db.commit()
    return {"message": "Company verified", "id": company.id}

# --------------------------------------------------------------------------
# 6. Verify a recruiter (admin only)
# --------------------------------------------------------------------------
@router.put("/verify-recruiter/{recruiter_id}")
def verify_recruiter(
    recruiter_id: int,
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    recruiter = db.query(Recruiters).get(recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    recruiter.is_verified = True
    db.commit()
    return {"message": "Recruiter verified", "id": recruiter.id}