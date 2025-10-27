from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
# from sqlalchemy.orm import selectinload
from core.database.session import get_session
from domains.announcements.models import Announcement, AnnouncementStatus, AnnouncementType
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
from api.v1.serializers.announcements import (
    AnnouncementIn, 
    AnnouncementOut, 
    AnnouncementUpdate,
    AnnouncementListResponse,
    AnnouncementPublicOut,
    AnnouncementPublicListResponse
)
from api.v1.serializers.common import ErrorResponse
from utils.events import emit
from core.services.notification_service import notify_announcement_published
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/announcements")


# -------------------- ADMIN ROUTES --------------------

@router.get("", response_model=AnnouncementListResponse)
@router.get("/", response_model=AnnouncementListResponse)
async def list_announcements(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: Optional[str] = Query(None, description="Search query"),
    type_filter: Optional[AnnouncementType] = Query(None, description="Filter by type"),
    status_filter: Optional[AnnouncementStatus] = Query(None, description="Filter by status"),
    featured_only: bool = Query(False, description="Show only featured announcements"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
):
    """List announcements with admin access"""
    # Check permissions
    if user.role not in [UserRole.super_admin, UserRole.regional_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    stmt = select(Announcement).where(Announcement.deleted_at.is_(None))
    
    # Filter by target audience based on user role
    if user.role == UserRole.regional_admin:
        # Regional admin can see announcements targeted to them or to all
        stmt = stmt.where(
            or_(
                Announcement.target_audience == "regional_admin",
                Announcement.target_audience == "all",
                Announcement.target_audience.is_(None)  # Legacy announcements without target_audience
            )
        )
    # Super admin can see all announcements

    # Apply filters
    if q:
        stmt = stmt.where(
            or_(
                Announcement.title.ilike(f"%{q}%"),
                Announcement.content.ilike(f"%{q}%"),
                Announcement.summary.ilike(f"%{q}%")
            )
        )

    if type_filter:
        stmt = stmt.where(Announcement.type == type_filter)

    if status_filter:
        stmt = stmt.where(Announcement.status == status_filter)

    if featured_only:
        stmt = stmt.where(Announcement.is_featured == True)

    # Get total count
    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Order by created_at desc
    stmt = stmt.order_by(Announcement.created_at.desc()).limit(limit).offset(offset)
    
    rows = (await db.execute(stmt)).scalars().all()

    return AnnouncementListResponse(
        items=[AnnouncementOut.model_validate(row) for row in rows],
        total=total,
        limit=limit,
        offset=offset,
        has_next=offset + limit < total,
        has_prev=offset > 0
    )


@router.post(
    "/",
    response_model=AnnouncementOut,
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation Error"}
    }
)
async def create_announcement(
    payload: AnnouncementIn,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Create a new announcement"""
    announcement = Announcement(
        title=payload.title,
        content=payload.content,
        summary=payload.summary,
        type=payload.type,
        target_audience=payload.target_audience,
        priority=payload.priority,
        is_featured=payload.is_featured,
        is_pinned=payload.is_pinned,
        featured_image=payload.featured_image,
        attachments=payload.attachments,
        tags=payload.tags,
        expires_at=payload.expires_at,
        author_id=user.id,
        status=AnnouncementStatus.draft
    )

    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)

    # Emit event
    emit("announcement.created", 
         announcement_id=announcement.id,
         title=announcement.title,
         author_id=user.id
    )

    return AnnouncementOut.model_validate(announcement)


@router.get("/{announcement_id}", response_model=AnnouncementOut)
async def get_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get a single announcement by ID"""
    # Check permissions
    if user.role not in [UserRole.super_admin, UserRole.regional_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    stmt = select(Announcement).where(
        and_(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None)
        )
    )
    
    announcement = (await db.execute(stmt)).scalars().first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    return AnnouncementOut.model_validate(announcement)


@router.put(
    "/{announcement_id}",
    response_model=AnnouncementOut,
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Announcement not found"}
    }
)
async def update_announcement(
    announcement_id: int,
    payload: AnnouncementUpdate,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Update an announcement"""
    stmt = select(Announcement).where(
        and_(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None)
        )
    )
    
    announcement = (await db.execute(stmt)).scalars().first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    # Check if status is changing to published
    is_being_published = (
        payload.status == AnnouncementStatus.published and 
        announcement.status != AnnouncementStatus.published
    )

    # Update fields
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)

    # If status is being changed to published, set published_at
    if is_being_published:
        announcement.published_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(announcement)

    # Create notifications if announcement is being published
    if is_being_published:
        try:
            target_audience = announcement.target_audience or "all"
            notified_count = await notify_announcement_published(
                db=db,
                announcement_id=announcement.id,
                announcement_title=announcement.title,
                target_audience=target_audience,
                published_by=user.id
            )
            print(f"✅ Created {notified_count} notifications for announcement {announcement.id}")
        except Exception as e:
            print(f"❌ Failed to create notifications: {e}")

    # Emit event
    emit("announcement.updated", 
         announcement_id=announcement.id,
         title=announcement.title,
         status=announcement.status.value
    )

    return AnnouncementOut.model_validate(announcement)


@router.delete(
    "/{announcement_id}",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Announcement not found"}
    }
)
async def delete_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_session),
    _user: User = Depends(current_user)
):
    """Delete an announcement (soft delete)"""
    stmt = select(Announcement).where(
        and_(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None)
        )
    )
    
    announcement = (await db.execute(stmt)).scalars().first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    announcement.deleted_at = datetime.now(timezone.utc)
    await db.commit()

    # Emit event
    emit("announcement.deleted", 
         announcement_id=announcement.id,
         title=announcement.title
    )

    return {"ok": True}


# -------------------- WORKFLOW ROUTES --------------------

@router.post(
    "/{announcement_id}/publish",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Announcement not found"}
    }
)
async def publish_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Publish an announcement"""
    stmt = select(Announcement).where(
        and_(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None)
        )
    )
    
    announcement = (await db.execute(stmt)).scalars().first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    announcement.status = AnnouncementStatus.published
    announcement.published_at = datetime.now(timezone.utc)
    await db.commit()

    # Create notifications for target audience
    try:
        target_audience = announcement.target_audience or "all"
        notified_count = await notify_announcement_published(
            db=db,
            announcement_id=announcement.id,
            announcement_title=announcement.title,
            target_audience=target_audience,
            published_by=user.id
        )
        print(f"✅ Created {notified_count} notifications for announcement {announcement.id}")
    except Exception as e:
        print(f"❌ Failed to create notifications: {e}")
        # Don't fail the publish operation if notifications fail

    # Emit event
    emit("announcement.published", 
         announcement_id=announcement.id,
         title=announcement.title,
         published_by=user.id
    )

    return {"ok": True, "message": "Announcement published successfully"}


@router.post(
    "/{announcement_id}/archive",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Announcement not found"}
    }
)
async def archive_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Archive an announcement"""
    stmt = select(Announcement).where(
        and_(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None)
        )
    )
    
    announcement = (await db.execute(stmt)).scalars().first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    announcement.status = AnnouncementStatus.archived
    await db.commit()

    # Emit event
    emit("announcement.archived", 
         announcement_id=announcement.id,
         title=announcement.title,
         archived_by=user.id
    )

    return {"ok": True, "message": "Announcement archived successfully"}
