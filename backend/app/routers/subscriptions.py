from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import UserRole
from ..models.recruiter import Recruiters
from ..models.plan import Plans
from ..models.subscription import Subscriptions
from ..models.job import Jobs
from ..schemas.subscription import SubscriptionOut

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.post("/subscribe/{plan_id}", response_model=SubscriptionOut)
def subscribe_to_plan(plan_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can subscribe")
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    plan = db.query(Plans).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Check if already has an active subscription (optional: allow only one at a time)
    existing = db.query(Subscriptions).filter(Subscriptions.recruiter_id == recruiter.id, Subscriptions.is_active == True).first()
    if existing:
        # Deactivate it
        existing.is_active = False
        db.add(existing)

    # Create new subscription (30 days)
    sub = Subscriptions(
        recruiter_id=recruiter.id,
        plan_id=plan.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        is_active=True
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/my", response_model=List[SubscriptionOut])
def my_subscriptions(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters")
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return db.query(Subscriptions).filter(Subscriptions.recruiter_id == recruiter.id).order_by(Subscriptions.start_date.desc()).all()

# Helper to get current active plan of recruiter
def get_active_subscription(recruiter_id: int, db: Session):
    return db.query(Subscriptions).filter(Subscriptions.recruiter_id == recruiter_id, Subscriptions.is_active == True).first()

# Enforce posting limit in job creation (modify existing jobs.py)