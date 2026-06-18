from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.education import Education
from ..schemas.education import EducationCreate, EducationUpdate, EducationOut

router = APIRouter(prefix="/education", tags=["education"])

# --------------------------------------------------------------------------
# Add an education entry
# --------------------------------------------------------------------------
@router.post("/", response_model=EducationOut)
def add_education(
    education: EducationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_edu = Education(user_id=current_user.id, **education.dict())
    db.add(new_edu)
    db.commit()
    db.refresh(new_edu)
    return new_edu

# --------------------------------------------------------------------------
# List all education entries (and certifications) for current user
# --------------------------------------------------------------------------
@router.get("/", response_model=List[EducationOut])
def list_education(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Education).filter(Education.user_id == current_user.id).order_by(Education.start_date.desc()).all()

# --------------------------------------------------------------------------
# Get a single education entry
# --------------------------------------------------------------------------
@router.get("/{edu_id}", response_model=EducationOut)
def get_education(
    edu_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    return edu

# --------------------------------------------------------------------------
# Update an education entry
# --------------------------------------------------------------------------
@router.put("/{edu_id}", response_model=EducationOut)
def update_education(
    edu_id: int,
    updates: EducationUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(edu, field, value)
    db.commit()
    db.refresh(edu)
    return edu

# --------------------------------------------------------------------------
# Delete an education entry
# --------------------------------------------------------------------------
@router.delete("/{edu_id}")
def delete_education(
    edu_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    db.delete(edu)
    db.commit()
    return {"message": "Education record deleted"}