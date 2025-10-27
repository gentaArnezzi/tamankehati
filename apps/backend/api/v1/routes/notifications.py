from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.database.session import get_session
from core.models.notifications import Notification
from users.models import User
from domains.articles.models import UserRole
from api.v1.permissions.rbac import current_user
from api.v1.serializers.notifications import NotificationOut, NotificationListResponse
from datetime import datetime

router = APIRouter(prefix="/notifications")

@router.get("", response_model=NotificationListResponse)
@router.get("/", response_model=NotificationListResponse)
async def list_notifications(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
):
    # Simple: just filter by to_user_id (submission-based, not region-based)
    stmt = select(Notification).where(Notification.to_user_id == user.id)

    if unread_only:
        stmt = stmt.where(Notification.is_read == False)

    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = stmt.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
    notifications = (await db.execute(stmt)).scalars().all()

    return NotificationListResponse(
        items=notifications,
        total=total,
        limit=limit,
        offset=offset,
        has_next=(offset + limit) < total,
        has_prev=offset > 0
    )

@router.get("/unread", response_model=NotificationListResponse)
async def list_unread_notifications(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    limit: int = 50,
    offset: int = 0,
):
    """Get list of unread notifications for current user"""
    # Filter by to_user_id and unread status
    stmt = select(Notification).where(
        Notification.to_user_id == user.id,
        Notification.is_read == False
    )

    # Get total count
    count_stmt = select(func.count()).select_from(Notification).where(
        Notification.to_user_id == user.id,
        Notification.is_read == False
    )
    total = (await db.execute(count_stmt)).scalar() or 0

    # Apply ordering and pagination
    stmt = stmt.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
    notifications = (await db.execute(stmt)).scalars().all()

    return NotificationListResponse(
        items=notifications,
        total=total,
        limit=limit,
        offset=offset,
        has_next=(offset + limit) < total,
        has_prev=offset > 0
    )

@router.get("/unread-count", response_model=dict)
async def get_unread_count(db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    # Simple: just count notifications sent to this user (submission-based)
    stmt = select(func.count()).select_from(Notification).where(
        Notification.to_user_id == user.id,
        Notification.is_read == False
    )
    
    count = (await db.execute(stmt)).scalar() or 0
    return {"count": count}

@router.get("/{notification_id}", response_model=NotificationOut)
async def get_notification(notification_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Notification).where(Notification.id == notification_id)
    notification = (await db.execute(stmt)).scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.to_user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return notification

@router.post("/{notification_id}/read", status_code=204)
async def mark_as_read(notification_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    notification = (await db.execute(select(Notification).where(Notification.id == notification_id))).scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.to_user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    notification.is_read = True
    await db.commit()
    return {}

@router.post("/mark-all-read", status_code=204)
async def mark_all_as_read(db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Notification).where(Notification.to_user_id == user.id, Notification.is_read == False)
    notifications = (await db.execute(stmt)).scalars().all()

    for notification in notifications:
        notification.is_read = True

    await db.commit()
    return {}
