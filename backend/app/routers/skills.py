from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.skill import Skills
from ..schemas.skill import SkillCreate, SkillUpdate, SkillOut

router = APIRouter(prefix="/skills", tags=["skills"])

# --------------------------------------------------------------------------
# Create a new skill
# --------------------------------------------------------------------------
@router.post("/", response_model=SkillOut)
def create_skill(
    skill: SkillCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_skill = Skills(user_id=current_user.id, **skill.dict())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

# --------------------------------------------------------------------------
# List all skills for the current user
# --------------------------------------------------------------------------
@router.get("/", response_model=List[SkillOut])
def list_skills(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Skills).filter(Skills.user_id == current_user.id).all()

# --------------------------------------------------------------------------
# Get a single skill
# --------------------------------------------------------------------------
@router.get("/{skill_id}", response_model=SkillOut)
def get_skill(
    skill_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skills).filter(Skills.id == skill_id, Skills.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

# --------------------------------------------------------------------------
# Update an existing skill
# --------------------------------------------------------------------------
@router.put("/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skills).filter(Skills.id == skill_id, Skills.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for field, value in skill_data.dict(exclude_unset=True).items():
        setattr(skill, field, value)
    db.commit()
    db.refresh(skill)
    return skill

# --------------------------------------------------------------------------
# Delete a skill
# --------------------------------------------------------------------------
@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skills).filter(Skills.id == skill_id, Skills.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}