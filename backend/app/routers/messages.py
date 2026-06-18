# backend/app/routers/messages.py
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.application import Applications
from ..models.job import Jobs
from ..models.message import Messages
from ..models.profile import Profiles
from ..models.recruiter import Recruiters
from ..models.user import Users, UserRole
from ..schemas.message import ConversationOut, MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def has_role(current_user, role: UserRole):
    return current_user.role == role or current_user.role == role.value


def get_role_value(user):
    if isinstance(user.role, UserRole):
        return user.role.value

    return str(user.role)


def get_name_from_email(email: Optional[str]):
    if not email:
        return "User"

    return (
        email.split("@")[0]
        .replace(".", " ")
        .replace("_", " ")
        .replace("-", " ")
        .title()
    )


def get_user_display_name(db: Session, user: Users):
    profile = (
        db.query(Profiles)
        .filter(Profiles.user_id == user.id)
        .first()
    )

    if profile and profile.full_name:
        return profile.full_name

    return get_name_from_email(user.email)


def find_receiver(msg: MessageCreate, current_user, db: Session):
    receiver = None

    if msg.receiver_email:
        receiver_email = msg.receiver_email.strip().lower()

        receiver = (
            db.query(Users)
            .filter(func.lower(Users.email) == receiver_email)
            .first()
        )

    elif msg.receiver_id:
        receiver = db.query(Users).get(msg.receiver_id)

    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    if receiver.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot message yourself",
        )

    return receiver


def get_recruiter_job_ids(user_id: int, db: Session):
    recruiter = (
        db.query(Recruiters)
        .filter(Recruiters.user_id == user_id)
        .first()
    )

    if not recruiter:
        return []

    jobs = db.query(Jobs).filter(Jobs.recruiter_id == recruiter.id).all()

    return [job.id for job in jobs]


def check_application_relationship(sender_id: int, receiver_id: int, db: Session):
    """
    True when:
    1. sender is applicant and receiver is recruiter for applied job
    2. sender is recruiter and receiver is applicant for recruiter's job
    """

    # sender applicant, receiver recruiter
    receiver_job_ids = get_recruiter_job_ids(receiver_id, db)

    if receiver_job_ids:
        application = (
            db.query(Applications)
            .filter(
                Applications.job_id.in_(receiver_job_ids),
                Applications.applicant_id == sender_id,
            )
            .first()
        )

        if application:
            return True

    # sender recruiter, receiver applicant
    sender_job_ids = get_recruiter_job_ids(sender_id, db)

    if sender_job_ids:
        application = (
            db.query(Applications)
            .filter(
                Applications.job_id.in_(sender_job_ids),
                Applications.applicant_id == receiver_id,
            )
            .first()
        )

        if application:
            return True

    return False


def can_message_user(current_user, other_user_id: int, db: Session):
    # Admin can message any user
    if has_role(current_user, UserRole.ADMIN):
        return True

    return check_application_relationship(
        sender_id=current_user.id,
        receiver_id=other_user_id,
        db=db,
    )


# --------------------------------------------------------------------------
# Send message
# --------------------------------------------------------------------------
@router.post("/", response_model=MessageOut)
def send_message(
    msg: MessageCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = msg.content.strip() if msg.content else ""

    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    receiver = find_receiver(msg, current_user, db)

    if not can_message_user(current_user, receiver.id, db):
        raise HTTPException(
            status_code=403,
            detail="You can only message users you have an application connection with.",
        )

    message = Messages(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


# --------------------------------------------------------------------------
# Get unread message count for header badge
# --------------------------------------------------------------------------
@router.get("/unread-count")
def get_messages_unread_count(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(func.count(Messages.id))
        .filter(
            Messages.receiver_id == current_user.id,
            Messages.is_read.is_(False),
        )
        .scalar()
    )

    return {"unread_count": count or 0}


# --------------------------------------------------------------------------
# Get conversations
# --------------------------------------------------------------------------
@router.get("/conversations", response_model=List[ConversationOut])
def get_conversations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sent = (
        db.query(Messages.receiver_id)
        .filter(Messages.sender_id == current_user.id)
        .distinct()
        .all()
    )

    received = (
        db.query(Messages.sender_id)
        .filter(Messages.receiver_id == current_user.id)
        .distinct()
        .all()
    )

    other_ids = set([row[0] for row in sent] + [row[0] for row in received])

    conversations = []

    for other_id in other_ids:
        other_user = db.query(Users).get(other_id)

        if not other_user:
            continue

        last_msg = (
            db.query(Messages)
            .filter(
                or_(
                    and_(
                        Messages.sender_id == current_user.id,
                        Messages.receiver_id == other_id,
                    ),
                    and_(
                        Messages.sender_id == other_id,
                        Messages.receiver_id == current_user.id,
                    ),
                )
            )
            .order_by(Messages.sent_at.desc())
            .first()
        )

        unread_count = (
            db.query(func.count(Messages.id))
            .filter(
                Messages.sender_id == other_id,
                Messages.receiver_id == current_user.id,
                Messages.is_read.is_(False),
            )
            .scalar()
        )

        conversations.append(
            ConversationOut(
                other_user_id=other_id,
                other_user_name=get_user_display_name(db, other_user),
                other_user_email=other_user.email,
                other_user_role=get_role_value(other_user),
                last_message=last_msg.content if last_msg else None,
                last_sent_at=last_msg.sent_at if last_msg else None,
                unread_count=unread_count or 0,
            )
        )

    conversations.sort(
        key=lambda item: item.last_sent_at or datetime.min,
        reverse=True,
    )

    return conversations


# --------------------------------------------------------------------------
# Get conversation with another user
# --------------------------------------------------------------------------
@router.get("/conversation/{other_user_id}", response_model=List[MessageOut])
def get_conversation(
    other_user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    other_user = db.query(Users).get(other_user_id)

    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not can_message_user(current_user, other_user_id, db):
        raise HTTPException(
            status_code=403,
            detail="No application connection found",
        )

    messages = (
        db.query(Messages)
        .filter(
            or_(
                and_(
                    Messages.sender_id == current_user.id,
                    Messages.receiver_id == other_user_id,
                ),
                and_(
                    Messages.sender_id == other_user_id,
                    Messages.receiver_id == current_user.id,
                ),
            )
        )
        .order_by(Messages.sent_at.asc())
        .all()
    )

    # Mark received messages as read when opening chat
    (
        db.query(Messages)
        .filter(
            Messages.sender_id == other_user_id,
            Messages.receiver_id == current_user.id,
            Messages.is_read.is_(False),
        )
        .update({"is_read": True}, synchronize_session=False)
    )

    db.commit()

    return messages


# --------------------------------------------------------------------------
# Mark one message as read
# --------------------------------------------------------------------------
@router.put("/{message_id}/read")
def mark_read(
    message_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    message = (
        db.query(Messages)
        .filter(
            Messages.id == message_id,
            Messages.receiver_id == current_user.id,
        )
        .first()
    )

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_read = True
    db.commit()

    return {"message": "Marked as read"}