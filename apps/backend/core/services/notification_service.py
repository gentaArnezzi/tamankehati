"""
Notification Service
Creates and manages user notifications
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.models.notifications import Notification
from users.models import User, UserRole
from typing import Optional, List


async def create_notification(
    db: AsyncSession,
    to_user_id: int,
    type: str,
    title: str,
    message: str,
    resource: Optional[str] = None,
    resource_id: Optional[int] = None,
    region_code: Optional[str] = None,
    from_user_id: Optional[int] = None,
):
    """Create a single notification"""
    notification = Notification(
        to_user_id=to_user_id,
        from_user_id=from_user_id,
        type=type,
        title=title,
        message=message,
        resource=resource,
        resource_id=resource_id,
        region_code=region_code,
        is_read=False
    )
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def create_bulk_notifications(
    db: AsyncSession,
    notifications_data: List[dict]
):
    """Create multiple notifications at once"""
    notifications = [Notification(**data) for data in notifications_data]
    db.add_all(notifications)
    await db.commit()
    return notifications


async def notify_announcement_published(
    db: AsyncSession,
    announcement_id: int,
    announcement_title: str,
    target_audience: str,
    published_by: int
):
    """
    Notify users when an announcement is published
    
    IMPORTANT: When Super Admin publishes announcement with target_audience="regional_admin",
    ALL Regional Admins will receive notification (broadcast to all)
    
    Args:
        db: Database session
        announcement_id: ID of the published announcement
        announcement_title: Title of the announcement
        target_audience: Who the announcement is for:
            - "regional_admin": Broadcast to ALL Regional Admins (most common)
            - "super_admin": Notify all Super Admins
            - "all": Notify everyone (both Regional + Super Admins)
        published_by: User ID who published the announcement
    """
    # Get all users who should be notified based on target audience
    stmt = select(User).where(User.is_active == True)
    
    if target_audience == "regional_admin":
        # Broadcast to ALL Regional Admins (no region filtering)
        stmt = stmt.where(User.role == UserRole.regional_admin)
    elif target_audience == "super_admin":
        # Notify all Super Admins
        stmt = stmt.where(User.role == UserRole.super_admin)
    else:  # "all" or None
        # Notify everyone
        stmt = stmt.where(User.role.in_([UserRole.regional_admin, UserRole.super_admin]))
    
    # Don't notify the user who published it
    stmt = stmt.where(User.id != published_by)
    
    users = (await db.execute(stmt)).scalars().all()
    
    # Create notifications for all target users
    notifications_data = []
    for user in users:
        notifications_data.append({
            "to_user_id": user.id,
            "from_user_id": published_by,
            "type": "announcement_published",
            "title": "Pengumuman Baru",
            "message": f"Pengumuman baru telah dipublikasikan: {announcement_title}",
            "resource": "announcement",
            "resource_id": announcement_id,
            "region_code": user.region_code if hasattr(user, 'region_code') else None,
            "is_read": False
        })
    
    if notifications_data:
        await create_bulk_notifications(db, notifications_data)
    
    return len(notifications_data)


async def notify_article_published(
    db: AsyncSession,
    article_id: int,
    article_title: str,
    published_by: int
):
    """Notify admins when an article is published"""
    # Get all admins
    stmt = select(User).where(
        User.is_active == True,
        User.role.in_([UserRole.regional_admin, UserRole.super_admin]),
        User.id != published_by
    )
    
    users = (await db.execute(stmt)).scalars().all()
    
    notifications_data = []
    for user in users:
        notifications_data.append({
            "to_user_id": user.id,
            "from_user_id": published_by,
            "type": "article_published",
            "title": "Artikel Baru",
            "message": f"Artikel baru telah dipublikasikan: {article_title}",
            "resource": "article",
            "resource_id": article_id,
            "region_code": user.region_code if hasattr(user, 'region_code') else None,
            "is_read": False
        })
    
    if notifications_data:
        await create_bulk_notifications(db, notifications_data)
    
    return len(notifications_data)


async def notify_approval_requested(
    db: AsyncSession,
    resource_type: str,
    resource_id: int,
    resource_title: str,
    submitted_by: int
):
    """Notify super admins when approval is requested"""
    # Get all super admins
    stmt = select(User).where(
        User.is_active == True,
        User.role == UserRole.super_admin
    )
    
    users = (await db.execute(stmt)).scalars().all()
    
    notifications_data = []
    for user in users:
        notifications_data.append({
            "to_user_id": user.id,
            "from_user_id": submitted_by,
            "type": f"{resource_type}_approval_requested",
            "title": "Persetujuan Diperlukan",
            "message": f"{resource_type.capitalize()} baru memerlukan persetujuan: {resource_title}",
            "resource": resource_type,
            "resource_id": resource_id,
            "region_code": None,
            "is_read": False
        })
    
    if notifications_data:
        await create_bulk_notifications(db, notifications_data)
    
    return len(notifications_data)

