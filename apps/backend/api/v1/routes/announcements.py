from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from core.database.session import get_session
from domains.announcements.models import Announcement, AnnouncementStatus, AnnouncementType
from domains.announcements.interaction_models import AnnouncementRead
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

    # Get read data for each announcement
    announcement_ids = [row.id for row in rows]
    read_data = {}
    if announcement_ids and user.role == UserRole.regional_admin:
        # Get read counts
        read_count_stmt = select(
            AnnouncementRead.announcement_id,
            func.count().label('count')
        ).where(
            AnnouncementRead.announcement_id.in_(announcement_ids)
        ).group_by(AnnouncementRead.announcement_id)
        read_counts = (await db.execute(read_count_stmt)).all()
        for ann_id, count in read_counts:
            read_data[ann_id] = {"read_count": count}
        
        # Get user read status
        user_read_stmt = select(AnnouncementRead.announcement_id).where(
            and_(
                AnnouncementRead.user_id == user.id,
                AnnouncementRead.announcement_id.in_(announcement_ids)
            )
        )
        user_read_ids = set((await db.execute(user_read_stmt)).scalars().all())
        for ann_id in announcement_ids:
            if ann_id not in read_data:
                read_data[ann_id] = {"read_count": 0}
            read_data[ann_id]["user_has_read"] = ann_id in user_read_ids

    # Build response items with read data
    items = []
    for row in rows:
        row_dict = {**row.__dict__}
        if row.id in read_data:
            row_dict.update(read_data[row.id])
        else:
            row_dict["read_count"] = 0
            row_dict["user_has_read"] = False
        items.append(AnnouncementOut.model_validate(row_dict))

    return AnnouncementListResponse(
        items=items,
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
    # Use status from payload, default to published if not provided
    announcement_status = payload.status if payload.status else AnnouncementStatus.published
    
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
        status=announcement_status
    )
    
    # If status is published, set published_at
    if announcement_status == AnnouncementStatus.published:
        announcement.published_at = datetime.now(timezone.utc)

    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    
    # Create notifications if announcement is published
    if announcement_status == AnnouncementStatus.published:
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
    emit("announcement.created", 
         announcement_id=announcement.id,
         title=announcement.title,
         author_id=user.id
    )

    return AnnouncementOut.model_validate(announcement)


@router.get("/unread-count")
async def get_unread_announcement_count(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get count of unread announcements for the current user"""
    # Only for regional admin
    if user.role != UserRole.regional_admin:
        return {"count": 0}

    # Get all published announcements visible to user
    stmt = select(Announcement).where(
        and_(
            Announcement.deleted_at.is_(None),
            Announcement.status == AnnouncementStatus.published,
            or_(
                Announcement.target_audience == "regional_admin",
                Announcement.target_audience == "all",
                Announcement.target_audience.is_(None)
            )
        )
    )
    announcements = (await db.execute(stmt)).scalars().all()
    announcement_ids = [ann.id for ann in announcements]

    if not announcement_ids:
        return {"count": 0}

    # Get read announcement IDs for this user
    read_stmt = select(AnnouncementRead.announcement_id).where(
        and_(
            AnnouncementRead.user_id == user.id,
            AnnouncementRead.announcement_id.in_(announcement_ids)
        )
    )
    read_announcement_ids = set((await db.execute(read_stmt)).scalars().all())

    # Count unread
    unread_count = len(announcement_ids) - len(read_announcement_ids)

    return {"count": unread_count}


@router.get("/{announcement_id}", response_model=AnnouncementOut)
async def get_announcement(
    announcement_id: int,
    request: Request,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get a single announcement by ID and track read for regional admin"""
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

    # Track read for regional admin
    if user.role == UserRole.regional_admin:
        try:
            # Check if read already exists
            read_stmt = select(AnnouncementRead).where(
                and_(
                    AnnouncementRead.announcement_id == announcement_id,
                    AnnouncementRead.user_id == user.id
                )
            )
            existing_read = (await db.execute(read_stmt)).scalars().first()
            
            if not existing_read:
                # Create new read record
                ip_address = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
                read_record = AnnouncementRead(
                    announcement_id=announcement_id,
                    user_id=user.id,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                db.add(read_record)
                # Update view count
                announcement.view_count = (announcement.view_count or 0) + 1
                await db.commit()
                await db.refresh(announcement)
        except Exception as e:
            print(f"Error tracking read: {e}")

    # Get read count and user read status
    read_count_stmt = select(func.count()).select_from(AnnouncementRead).where(
        AnnouncementRead.announcement_id == announcement_id
    )
    read_count = (await db.execute(read_count_stmt)).scalar() or 0
    
    user_read_stmt = select(AnnouncementRead).where(
        and_(
            AnnouncementRead.announcement_id == announcement_id,
            AnnouncementRead.user_id == user.id
        )
    )
    user_read = (await db.execute(user_read_stmt)).scalars().first()
    user_has_read = user_read is not None

    # Build response with read data
    announcement_dict = {
        **announcement.__dict__,
        "read_count": read_count,
        "user_has_read": user_has_read,
    }
    
    return AnnouncementOut.model_validate(announcement_dict)


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
    try:
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
            # Skip None values for optional fields (they should be set explicitly if needed)
            if value is not None:
                # Validate field exists on model before setting
                if hasattr(announcement, field):
                    setattr(announcement, field, value)
                else:
                    print(f"⚠️ Warning: Field '{field}' does not exist on Announcement model, skipping...")

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
        try:
            emit("announcement.updated", 
                 announcement_id=announcement.id,
                 title=announcement.title,
                 status=announcement.status.value
            )
        except Exception as e:
            print(f"❌ Failed to emit event: {e}")

        return AnnouncementOut.model_validate(announcement)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating announcement {announcement_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update announcement: {str(e)}"
        )


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


# -------------------- READ TRACKING ROUTES --------------------

@router.post("/{announcement_id}/mark-read", status_code=200)
async def mark_announcement_read(
    announcement_id: int,
    request: Request,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Mark an announcement as read by the current user"""
    # Check permissions
    if user.role not in [UserRole.super_admin, UserRole.regional_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    # Get announcement
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

    # Check if read already exists
    read_stmt = select(AnnouncementRead).where(
        and_(
            AnnouncementRead.announcement_id == announcement_id,
            AnnouncementRead.user_id == user.id
        )
    )
    existing_read = (await db.execute(read_stmt)).scalars().first()
    
    if existing_read:
        return {"ok": True, "message": "Announcement already marked as read"}

    # Create new read record
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    read_record = AnnouncementRead(
        announcement_id=announcement_id,
        user_id=user.id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(read_record)
    
    # Update view count
    announcement.view_count = (announcement.view_count or 0) + 1
    
    await db.commit()
    await db.refresh(announcement)

    return {"ok": True, "message": "Announcement marked as read"}
