# backend/app/routers/resumes.py
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.config import settings
from ..models.resume import Resumes
from ..schemas.resume import ResumeCreate, ResumeOut

router = APIRouter(prefix="/resumes", tags=["resumes"])

# --------------------------------------------------------------------------
# Upload Resume
# --------------------------------------------------------------------------
@router.post("/", response_model=ResumeOut)
async def upload_resume(
    title: str = Form(...),
    is_current: bool = Form(False),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, DOC, and TXT files are allowed")

    # Create directory if not exists
    upload_dir = os.path.join(settings.upload_dir, "resumes")
    os.makedirs(upload_dir, exist_ok=True)

    # Unique filename
    file_ext = os.path.splitext(file.filename)[1]
    safe_title = title.replace(' ', '_')
    filename = f"resume_{current_user.id}_{safe_title}{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # If this resume is set as current, unset any previous current one
    if is_current:
        db.query(Resumes).filter(Resumes.user_id == current_user.id, Resumes.is_current == True).update(
            {"is_current": False}
        )

    # Create DB record
    resume = Resumes(
        user_id=current_user.id,
        title=title,
        file_path=file_path,
        is_current=is_current
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

# --------------------------------------------------------------------------
# List user's resumes
# --------------------------------------------------------------------------
@router.get("/", response_model=List[ResumeOut])
def list_resumes(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Resumes).filter(Resumes.user_id == current_user.id).order_by(Resumes.uploaded_at.desc()).all()

# --------------------------------------------------------------------------
# Get single resume metadata
# --------------------------------------------------------------------------
@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resumes).filter(Resumes.id == resume_id, Resumes.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

# --------------------------------------------------------------------------
# Download resume file (protected)
# --------------------------------------------------------------------------
@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resumes).filter(Resumes.id == resume_id, Resumes.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(
        path=resume.file_path,
        filename=os.path.basename(resume.file_path),
        media_type="application/octet-stream"
    )
#
# --------------------------------------------------------------------------
# Preview resume (returns the file inline)
# --------------------------------------------------------------------------
@router.get("/{resume_id}/preview")
def preview_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resumes).filter(
        Resumes.id == resume_id,
        Resumes.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    # Determine the correct media type for inline viewing
    mime_map = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
        ".txt": "text/plain",
    }
    ext = os.path.splitext(resume.file_path)[1].lower()
    media_type = mime_map.get(ext, "application/octet-stream")

    return FileResponse(
        path=resume.file_path,
        filename=os.path.basename(resume.file_path),
        media_type=media_type,
        headers={"Content-Disposition": "inline"},   # tells the browser to show, not download
    )

# --------------------------------------------------------------------------
# Delete resume
# --------------------------------------------------------------------------
@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resumes).filter(Resumes.id == resume_id, Resumes.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}

# --------------------------------------------------------------------------
# Set a resume as the current one
# --------------------------------------------------------------------------
@router.put("/{resume_id}/set-current", response_model=ResumeOut)
def set_current_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resumes).filter(Resumes.id == resume_id, Resumes.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Unset all current for this user
    db.query(Resumes).filter(Resumes.user_id == current_user.id).update({"is_current": False})
    # Set this one as current
    resume.is_current = True
    db.commit()
    db.refresh(resume)
    return resume