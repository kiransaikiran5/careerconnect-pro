# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    get_current_user,
)
from ..models.user import Users, UserRole
from ..schemas.user import (
    UserRegister,
    Token,
    PasswordResetRequest,
    PasswordReset,
    UserOut,
)
from ..core.middleware import require_role
from ..services.audit_service import log_activity   # <-- new

router = APIRouter(prefix="/auth", tags=["auth"])

# --------------------------------------------------------------------------
# Registration
# --------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED
)
def register(user: UserRegister, request: Request, db: Session = Depends(get_db)):
    existing_user = (
        db.query(Users)
        .filter(Users.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if user.role not in [role.value for role in UserRole]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    new_user = Users(
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    log_activity(
        db,
        user_id=new_user.id,
        action="USER_REGISTER",
        details={"email": new_user.email, "role": user.role},
        ip_address=request.client.host if request.client else None
    )

    return new_user

# --------------------------------------------------------------------------
# Login (OAuth2 form – works with Swagger and React)
# --------------------------------------------------------------------------
@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(Users).filter(Users.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token({"sub": user.email})

    # Audit log
    log_activity(
        db,
        user_id=user.id,
        action="LOGIN",
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )

    return {"access_token": access_token, "token_type": "bearer"}

# --------------------------------------------------------------------------
# Password Reset (unchanged)
# --------------------------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(Users).filter(Users.email == request.email).first()
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    reset_token = create_password_reset_token(user.email)
    background_tasks.add_task(
        lambda: print(f"Password reset token for {user.email}: {reset_token}")
    )
    return {
        "message": "If the email exists, a reset link has been sent.",
        "token": reset_token,
    }

@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    email = verify_password_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(Users).filter(Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}

# --------------------------------------------------------------------------
# Current user
# --------------------------------------------------------------------------
@router.get("/me", response_model=UserOut)
def read_users_me(current_user: Users = Depends(get_current_user)):
    return current_user

# --------------------------------------------------------------------------
# Admin-only test route
# --------------------------------------------------------------------------
@router.get("/admin-only")
def admin_only(current_user: Users = Depends(require_role(UserRole.ADMIN))):
    return {"message": "Welcome, admin!"}