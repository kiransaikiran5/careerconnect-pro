from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.job_category import JobCategories
from ..schemas.job_category import JobCategoryCreate, JobCategoryOut

router = APIRouter(prefix="/job-categories", tags=["job-categories"])

# --------------------------------------------------------------------------
# Create a new category (Admin only)
# --------------------------------------------------------------------------
@router.post("/", response_model=JobCategoryOut)
def create_category(
    category: JobCategoryCreate,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(JobCategories).filter(JobCategories.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_cat = JobCategories(**category.dict())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

# --------------------------------------------------------------------------
# List all categories (any authenticated user)
# --------------------------------------------------------------------------
@router.get("/", response_model=List[JobCategoryOut])
def list_categories(
    current_user = Depends(get_current_user),   # any logged-in user
    db: Session = Depends(get_db)
):
    return db.query(JobCategories).order_by(JobCategories.name).all()

# --------------------------------------------------------------------------
# Get a single category
# --------------------------------------------------------------------------
@router.get("/{category_id}", response_model=JobCategoryOut)
def get_category(
    category_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = db.query(JobCategories).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

# --------------------------------------------------------------------------
# Update a category (Admin only)
# --------------------------------------------------------------------------
@router.put("/{category_id}", response_model=JobCategoryOut)
def update_category(
    category_id: int,
    category_data: JobCategoryCreate,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    cat = db.query(JobCategories).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    # Check for duplicate name (if changed)
    if category_data.name != cat.name:
        dup = db.query(JobCategories).filter(JobCategories.name == category_data.name).first()
        if dup:
            raise HTTPException(status_code=400, detail="Another category already has that name")
    for field, value in category_data.dict().items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat

# --------------------------------------------------------------------------
# Delete a category (Admin only)
# --------------------------------------------------------------------------
@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    cat = db.query(JobCategories).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}