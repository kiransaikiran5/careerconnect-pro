from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.review import Reviews
from ..models.company import Companies
from ..models.recruiter import Recruiters
from ..models.user import Users
from ..schemas.review import ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews"])


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def name_from_email(email: Optional[str]):
    if not email:
        return "Anonymous User"

    if "@" in email:
        return email.split("@")[0]

    return email


def serialize_review(review: Reviews, reviewer_email: Optional[str] = None):
    reviewer_name = name_from_email(reviewer_email)

    return {
        "id": review.id,
        "reviewer_id": review.reviewer_id,
        "company_id": review.company_id,
        "recruiter_id": review.recruiter_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,

        # These fields fix Anonymous User in frontend
        "user_email": reviewer_email,
        "reviewer_email": reviewer_email,
        "user_name": reviewer_name,
        "reviewer_name": reviewer_name,
    }


# --------------------------------------------------------------------------
# Create a review
# POST /reviews
# --------------------------------------------------------------------------
@router.post("/", response_model=ReviewOut)
def create_review(
    review: ReviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not review.company_id and not review.recruiter_id:
        raise HTTPException(
            status_code=400,
            detail="You must specify a company or recruiter to review",
        )

    if review.company_id and review.recruiter_id:
        raise HTTPException(
            status_code=400,
            detail="Review can target either company or recruiter, not both",
        )

    if review.company_id:
        company = db.query(Companies).filter(Companies.id == review.company_id).first()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

    if review.recruiter_id:
        recruiter = db.query(Recruiters).filter(Recruiters.id == review.recruiter_id).first()

        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter not found")

    new_review = Reviews(
        reviewer_id=current_user.id,
        company_id=review.company_id,
        recruiter_id=review.recruiter_id,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return serialize_review(new_review, current_user.email)


# --------------------------------------------------------------------------
# Get reviews for a specific company
# GET /reviews/company/{company_id}
# --------------------------------------------------------------------------
@router.get("/company/{company_id}", response_model=List[ReviewOut])
def company_reviews(
    company_id: int,
    db: Session = Depends(get_db),
):
    company = db.query(Companies).filter(Companies.id == company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    rows = (
        db.query(Reviews, Users.email)
        .outerjoin(Users, Reviews.reviewer_id == Users.id)
        .filter(Reviews.company_id == company_id)
        .order_by(Reviews.created_at.desc())
        .all()
    )

    return [
        serialize_review(review, reviewer_email)
        for review, reviewer_email in rows
    ]


# --------------------------------------------------------------------------
# Get reviews for a specific recruiter
# GET /reviews/recruiter/{recruiter_id}
# --------------------------------------------------------------------------
@router.get("/recruiter/{recruiter_id}", response_model=List[ReviewOut])
def recruiter_reviews(
    recruiter_id: int,
    db: Session = Depends(get_db),
):
    recruiter = db.query(Recruiters).filter(Recruiters.id == recruiter_id).first()

    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    rows = (
        db.query(Reviews, Users.email)
        .outerjoin(Users, Reviews.reviewer_id == Users.id)
        .filter(Reviews.recruiter_id == recruiter_id)
        .order_by(Reviews.created_at.desc())
        .all()
    )

    return [
        serialize_review(review, reviewer_email)
        for review, reviewer_email in rows
    ]


# --------------------------------------------------------------------------
# Get reviews written by current user
# GET /reviews/my
# --------------------------------------------------------------------------
@router.get("/my", response_model=List[ReviewOut])
def my_reviews(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Reviews, Users.email)
        .outerjoin(Users, Reviews.reviewer_id == Users.id)
        .filter(Reviews.reviewer_id == current_user.id)
        .order_by(Reviews.created_at.desc())
        .all()
    )

    return [
        serialize_review(review, reviewer_email)
        for review, reviewer_email in rows
    ]