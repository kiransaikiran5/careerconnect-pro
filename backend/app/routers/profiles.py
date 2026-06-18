# backend/app/routers/profiles.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.profile import Profiles
from ..schemas.profile import ProfileCreate, ProfileOut
import os
from ..core.config import settings

router = APIRouter(prefix="/profiles", tags=["profiles"])

# --------------------------------------------------------------------------
# Get current user's profile
# --------------------------------------------------------------------------
@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profiles).filter(Profiles.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# --------------------------------------------------------------------------
# Create or update profile
# --------------------------------------------------------------------------
@router.put("/me", response_model=ProfileOut)
def upsert_profile(profile_data: ProfileCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_profile = db.query(Profiles).filter(Profiles.user_id == current_user.id).first()
    if not db_profile:
        # Create new profile if none exists
        db_profile = Profiles(user_id=current_user.id)
        db.add(db_profile)

    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile

# --------------------------------------------------------------------------
# Upload profile picture
# --------------------------------------------------------------------------
@router.post("/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and GIF images are allowed")

    # Ensure upload directory exists
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)

    # Create unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"profile_{current_user.id}{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Update profile record
    profile = db.query(Profiles).filter(Profiles.user_id == current_user.id).first()
    if not profile:
        profile = Profiles(user_id=current_user.id)
        db.add(profile)
    profile.profile_picture = file_path
    db.commit()

    return {"message": "Profile picture uploaded", "path": file_path}