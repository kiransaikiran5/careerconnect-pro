from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import UserRole
from ..models.recruiter import Recruiters
from ..models.plan import Plans
from ..models.subscription import Subscriptions
from ..models.payment import Payments
from ..schemas.payment import PaymentOut, InvoiceOut

router = APIRouter(prefix="/payments", tags=["payments"])

# --------------------------------------------------------------------------
# Checkout – process a mock payment and activate subscription
# --------------------------------------------------------------------------
@router.post("/checkout/{plan_id}", response_model=PaymentOut)
def checkout_plan(
    plan_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can make payments")

    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    plan = db.query(Plans).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # For free plans, we simply activate subscription without payment
    if plan.price == 0:
        # Deactivate any existing active subscription
        active_sub = db.query(Subscriptions).filter(
            Subscriptions.recruiter_id == recruiter.id,
            Subscriptions.is_active == True
        ).first()
        if active_sub:
            active_sub.is_active = False

        new_sub = Subscriptions(
            recruiter_id=recruiter.id,
            plan_id=plan.id,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            is_active=True
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)

        # Create a payment record for free plans (optional, but for history)
        payment = Payments(
            subscription_id=new_sub.id,
            amount=0.0,
            transaction_id=f"FREE-{uuid.uuid4().hex[:8]}",
            status="Completed"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    # Paid plan: mock payment processing
    # In production, you would integrate with Stripe/PayPal and handle webhooks

    # Simulate a successful transaction
    transaction_id = f"TXN-{uuid.uuid4().hex[:12]}"

    # Create payment record
    payment = Payments(
        subscription_id=None,   # will update after subscription creation
        amount=plan.price,
        transaction_id=transaction_id,
        status="Completed"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create (or renew) subscription
    active_sub = db.query(Subscriptions).filter(
        Subscriptions.recruiter_id == recruiter.id,
        Subscriptions.is_active == True
    ).first()
    if active_sub:
        active_sub.is_active = False

    new_sub = Subscriptions(
        recruiter_id=recruiter.id,
        plan_id=plan.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        is_active=True
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)

    # Link payment to subscription
    payment.subscription_id = new_sub.id
    db.commit()
    db.refresh(payment)

    return payment

# --------------------------------------------------------------------------
# Payment history for the current recruiter
# --------------------------------------------------------------------------
@router.get("/history", response_model=List[PaymentOut])
def payment_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters")

    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    # Get all subscriptions for this recruiter
    subs = db.query(Subscriptions).filter(Subscriptions.recruiter_id == recruiter.id).all()
    sub_ids = [s.id for s in subs]

    payments = db.query(Payments).filter(Payments.subscription_id.in_(sub_ids)).order_by(Payments.payment_date.desc()).all()
    return payments

# --------------------------------------------------------------------------
# Invoice – returns payment + plan details
# --------------------------------------------------------------------------
@router.get("/invoice/{payment_id}", response_model=InvoiceOut)
def get_invoice(
    payment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payments).get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Ensure the payment belongs to a subscription owned by the current user's recruiter
    recruiter = db.query(Recruiters).filter(Recruiters.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=403, detail="Not a recruiter")

    sub = db.query(Subscriptions).get(payment.subscription_id)
    if not sub or sub.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not your payment")

    plan = db.query(Plans).get(sub.plan_id) if sub else None

    return InvoiceOut(
        payment_id=payment.id,
        transaction_id=payment.transaction_id,
        amount=payment.amount,
        payment_date=payment.payment_date,
        plan_name=plan.name if plan else "Unknown",
        company_name=recruiter.company.name if recruiter.company else None,
        recruiter_email=current_user.email
    )