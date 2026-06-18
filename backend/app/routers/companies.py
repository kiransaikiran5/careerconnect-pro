import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.config import settings
from ..core.middleware import require_role
from ..models.user import UserRole
from ..models.company import Companies
from ..schemas.company import CompanyCreate, CompanyUpdate, CompanyOut

router = APIRouter(prefix="/companies", tags=["companies"])

# --------------------------------------------------------------------------
# Create company (recruiter or admin only)
# --------------------------------------------------------------------------
@router.post("/", response_model=CompanyOut)
def create_company(
    company: CompanyCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only recruiters or admins can create a company")
    new_company = Companies(**company.dict())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

# --------------------------------------------------------------------------
# List all companies (any authenticated user)
# --------------------------------------------------------------------------
@router.get("/", response_model=List[CompanyOut])
def list_companies(
    skip: int = 0,
    limit: int = 100,
    verified_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Companies)
    if verified_only:
        query = query.filter(Companies.is_verified == True)
    return query.offset(skip).limit(limit).all()

# --------------------------------------------------------------------------
# Get a single company profile
# --------------------------------------------------------------------------
@router.get("/{company_id}", response_model=CompanyOut)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    company = db.query(Companies).get(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

# --------------------------------------------------------------------------
# Update company (admin only)
# --------------------------------------------------------------------------
@router.put("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int,
    updates: CompanyUpdate,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    company = db.query(Companies).get(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company

# --------------------------------------------------------------------------
# Upload company logo (admin only, or also the recruiter who created the company? 
# We'll allow any authenticated user with RECRUITER/ADMIN who owns the company? 
# For simplicity, we'll allow ADMIN only for logo upload, or any recruiter associated with the company.
# We'll use ADMIN only here to keep it simple; you can extend later.)
# --------------------------------------------------------------------------
@router.post("/{company_id}/logo")
async def upload_company_logo(
    company_id: int,
    file: UploadFile = File(...),
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    company = db.query(Companies).get(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and GIF images are allowed")

    upload_dir = os.path.join(settings.upload_dir, "company_logos")
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    filename = f"company_{company_id}{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    company.logo = file_path
    db.commit()
    return {"message": "Logo uploaded successfully", "path": file_path}

# --------------------------------------------------------------------------
# Verify company (admin only)
# --------------------------------------------------------------------------
@router.put("/{company_id}/verify", response_model=CompanyOut)
def verify_company(
    company_id: int,
    current_user = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    company = db.query(Companies).get(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_verified = True
    db.commit()
    db.refresh(company)
    return company