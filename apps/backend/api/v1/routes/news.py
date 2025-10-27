from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from core.database.session import get_session
from domains.news.models import News, NewsStatus, NewsCategory
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
from api.v1.serializers.news import (
    NewsIn, 
    NewsOut, 
    NewsUpdate,
    NewsListResponse,
    NewsPublicOut,
    NewsPublicListResponse
)
from api.v1.serializers.common import ErrorResponse
from utils.events import emit
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/news")


# -------------------- PUBLIC ROUTES --------------------

@router.get("/public", response_model=NewsPublicListResponse)
async def list_public_news(
    db: AsyncSession = Depends(get_session),
    category_filter: Optional[NewsCategory] = Query(None, description="Filter by news category"),
    featured_only: bool = Query(False, description="Show only featured news"),
    pinned_only: bool = Query(False, description="Show only pinned news"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
):
    """Get public news (published only)"""
    stmt = select(News).where(
        and_(
            News.deleted_at.is_(None),
            News.status == NewsStatus.published,
            or_(
                News.expires_at.is_(None),
                News.expires_at > datetime.now(timezone.utc)
            )
        )
    )

    if category_filter:
        stmt = stmt.where(News.category == category_filter)
    
    if featured_only:
        stmt = stmt.where(News.is_featured == True)
    
    if pinned_only:
        stmt = stmt.where(News.is_pinned == True)

    # Get total count
    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Order by pinned first, then priority, then published_at desc
    stmt = stmt.order_by(
        News.is_pinned.desc(),
        News.priority.desc(),
        News.published_at.desc()
    ).limit(limit).offset(offset)
    
    rows = (await db.execute(stmt)).scalars().all()

    return NewsPublicListResponse(
        items=[NewsPublicOut.model_validate(row) for row in rows],
        total=total,
        limit=limit,
        offset=offset,
        has_next=offset + limit < total,
        has_prev=offset > 0
    )


@router.get("/public/{news_id}", response_model=NewsPublicOut)
async def get_public_news(
    news_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get a single public news by ID"""
    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None),
            News.status == NewsStatus.published,
            or_(
                News.expires_at.is_(None),
                News.expires_at > datetime.now(timezone.utc)
            )
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    # Increment view count
    news.view_count += 1
    await db.commit()

    return NewsPublicOut.model_validate(news)


# -------------------- ADMIN ROUTES --------------------

@router.get("/", response_model=NewsListResponse)
async def list_news(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: Optional[str] = Query(None, description="Search query"),
    category_filter: Optional[NewsCategory] = Query(None, description="Filter by category"),
    status_filter: Optional[NewsStatus] = Query(None, description="Filter by status"),
    featured_only: bool = Query(False, description="Show only featured news"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
):
    """List news with admin access"""
    # Check permissions
    if user.role not in [UserRole.super_admin, UserRole.regional_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    stmt = select(News).where(News.deleted_at.is_(None))

    # Apply filters
    if q:
        stmt = stmt.where(
            or_(
                News.title.ilike(f"%{q}%"),
                News.content.ilike(f"%{q}%"),
                News.summary.ilike(f"%{q}%")
            )
        )

    if category_filter:
        stmt = stmt.where(News.category == category_filter)

    if status_filter:
        stmt = stmt.where(News.status == status_filter)

    if featured_only:
        stmt = stmt.where(News.is_featured == True)

    # Get total count
    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Order by created_at desc
    stmt = stmt.order_by(News.created_at.desc()).limit(limit).offset(offset)
    
    rows = (await db.execute(stmt)).scalars().all()

    return NewsListResponse(
        items=[NewsOut.model_validate(row) for row in rows],
        total=total,
        limit=limit,
        offset=offset,
        has_next=offset + limit < total,
        has_prev=offset > 0
    )


@router.post(
    "/",
    response_model=NewsOut,
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.super_admin, UserRole.regional_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation Error"}
    }
)
async def create_news(
    payload: NewsIn,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Create a new news"""
    news = News(
        title=payload.title,
        content=payload.content,
        summary=payload.summary,
        slug=payload.slug,
        category=payload.category,
        priority=payload.priority,
        is_featured=payload.is_featured,
        is_pinned=payload.is_pinned,
        featured_image=payload.featured_image,
        attachments=payload.attachments,
        tags=payload.tags,
        reading_time=payload.reading_time,
        expires_at=payload.expires_at,
        author_id=user.id,
        status=NewsStatus.draft
    )

    db.add(news)
    await db.commit()
    await db.refresh(news)

    # Emit event
    emit("news.created", 
         news_id=news.id,
         title=news.title,
         author_id=user.id
    )

    return NewsOut.model_validate(news)


@router.get("/{news_id}", response_model=NewsOut)
async def get_news(
    news_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get a single news by ID"""
    # Check permissions
    if user.role not in [UserRole.super_admin, UserRole.regional_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None)
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    return NewsOut.model_validate(news)


@router.put(
    "/{news_id}",
    response_model=NewsOut,
    dependencies=[Depends(require_roles(UserRole.super_admin, UserRole.regional_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "News not found"}
    }
)
async def update_news(
    news_id: int,
    payload: NewsUpdate,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Update a news"""
    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None)
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    # Update fields
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(news, field, value)

    # If status is being changed to published, set published_at
    if payload.status == NewsStatus.published and news.status != NewsStatus.published:
        news.published_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(news)

    # Emit event
    emit("news.updated", 
         news_id=news.id,
         title=news.title,
         status=news.status.value
    )

    return NewsOut.model_validate(news)


@router.delete(
    "/{news_id}",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "News not found"}
    }
)
async def delete_news(
    news_id: int,
    db: AsyncSession = Depends(get_session),
    _user: User = Depends(current_user)
):
    """Delete a news (soft delete)"""
    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None)
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    news.deleted_at = datetime.now(timezone.utc)
    await db.commit()

    # Emit event
    emit("news.deleted", 
         news_id=news.id,
         title=news.title
    )

    return {"ok": True}


# -------------------- WORKFLOW ROUTES --------------------

@router.post(
    "/{news_id}/publish",
    dependencies=[Depends(require_roles(UserRole.super_admin, UserRole.regional_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "News not found"}
    }
)
async def publish_news(
    news_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Publish a news"""
    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None)
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    news.status = NewsStatus.published
    news.published_at = datetime.now(timezone.utc)
    await db.commit()

    # Emit event
    emit("news.published", 
         news_id=news.id,
         title=news.title,
         published_by=user.id
    )

    return {"ok": True, "message": "News published successfully"}


@router.post(
    "/{news_id}/archive",
    dependencies=[Depends(require_roles(UserRole.super_admin, UserRole.regional_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "News not found"}
    }
)
async def archive_news(
    news_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Archive a news"""
    stmt = select(News).where(
        and_(
            News.id == news_id,
            News.deleted_at.is_(None)
        )
    )
    
    news = (await db.execute(stmt)).scalars().first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )

    news.status = NewsStatus.archived
    await db.commit()

    # Emit event
    emit("news.archived", 
         news_id=news.id,
         title=news.title,
         archived_by=user.id
    )

    return {"ok": True, "message": "News archived successfully"}
