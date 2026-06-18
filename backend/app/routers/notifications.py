# backend/app/routers/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.notification import Notifications
from ..schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


# --------------------------------------------------------------------------
# Get all notifications for current user, newest first
# --------------------------------------------------------------------------
@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Notifications)
        .filter(Notifications.user_id == current_user.id)
        .order_by(Notifications.created_at.desc())
        .all()
    )


# --------------------------------------------------------------------------
# Get unread notification count for header bell badge
# --------------------------------------------------------------------------
@router.get("/unread-count")
def get_unread_count(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notifications)
        .filter(
            Notifications.user_id == current_user.id,
            Notifications.is_read.is_(False),
        )
        .count()
    )

    return {"unread_count": count}


# --------------------------------------------------------------------------
# Mark all notifications as read
# --------------------------------------------------------------------------
@router.put("/read-all")
def mark_all_read(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_count = (
        db.query(Notifications)
        .filter(
            Notifications.user_id == current_user.id,
            Notifications.is_read.is_(False),
        )
        .update({"is_read": True}, synchronize_session=False)
    )

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count,
    }


# --------------------------------------------------------------------------
# Mark single notification as read
# --------------------------------------------------------------------------
@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notifications)
        .filter(
            Notifications.id == notification_id,
            Notifications.user_id == current_user.id,
        )
        .first()
    )

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)

    return {"message": "Notification marked as read"}


# --------------------------------------------------------------------------
# Delete notification
# --------------------------------------------------------------------------
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notifications)
        .filter(
            Notifications.id == notification_id,
            Notifications.user_id == current_user.id,
        )
        .first()
    )

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()

    return {"message": "Notification deleted"}