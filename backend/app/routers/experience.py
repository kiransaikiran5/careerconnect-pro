from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.experience import Experience
from ..schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceOut

router = APIRouter(prefix="/experience", tags=["experience"])

# --------------------------------------------------------------------------
# Add a work experience entry
# --------------------------------------------------------------------------
@router.post("/", response_model=ExperienceOut)
def add_experience(
    experience: ExperienceCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If this entry is set as current, unset any previous current one
    if experience.is_current:
        db.query(Experience).filter(
            Experience.user_id == current_user.id,
            Experience.is_current == True
        ).update({"is_current": False})

    new_exp = Experience(user_id=current_user.id, **experience.dict())
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

# --------------------------------------------------------------------------
# List all work experience entries for current user
# --------------------------------------------------------------------------
@router.get("/", response_model=List[ExperienceOut])
def list_experience(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Experience).filter(Experience.user_id == current_user.id).order_by(
        Experience.start_date.desc()
    ).all()

# --------------------------------------------------------------------------
# Get a single experience entry
# --------------------------------------------------------------------------
@router.get("/{exp_id}", response_model=ExperienceOut)
def get_experience(
    exp_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experience).filter(
        Experience.id == exp_id,
        Experience.user_id == current_user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    return exp

# --------------------------------------------------------------------------
# Update an experience entry
# --------------------------------------------------------------------------
@router.put("/{exp_id}", response_model=ExperienceOut)
def update_experience(
    exp_id: int,
    updates: ExperienceUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experience).filter(
        Experience.id == exp_id,
        Experience.user_id == current_user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")

    # Handle the “is_current” flag
    if updates.is_current and not exp.is_current:
        # If we’re marking this as current, unset any other current for this user
        db.query(Experience).filter(
            Experience.user_id == current_user.id,
            Experience.is_current == True
        ).update({"is_current": False})

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(exp, field, value)

    db.commit()
    db.refresh(exp)
    return exp

# --------------------------------------------------------------------------
# Delete an experience entry
# --------------------------------------------------------------------------
@router.delete("/{exp_id}")
def delete_experience(
    exp_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experience).filter(
        Experience.id == exp_id,
        Experience.user_id == current_user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience record deleted"}