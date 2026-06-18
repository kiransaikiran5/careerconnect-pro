from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.security import get_current_user

from ..core.database import get_db
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.plan import Plans
from ..schemas.plan import PlanCreate, PlanUpdate, PlanOut

router = APIRouter(prefix="/plans", tags=["plans"])

# ---------- Admin only ----------
@router.post("/", response_model=PlanOut)
def create_plan(plan: PlanCreate, current_user=Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    new_plan = Plans(**plan.dict())
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: int, updates: PlanUpdate, current_user=Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    plan = db.query(Plans).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, current_user=Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    plan = db.query(Plans).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted"}

# ---------- Any authenticated user can view plans ----------
@router.get("/", response_model=List[PlanOut])
def list_plans(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Plans).all()