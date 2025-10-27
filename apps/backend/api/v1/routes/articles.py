from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from core.database.session import get_session
from domains.articles.models import Article, ArticleStatus
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles, ensure_user_scope_or_admin
from api.v1.serializers.articles import ArticleIn, ArticleOut, ArticleListResponse
from utils.events import emit
from datetime import datetime, timezone

router = APIRouter(prefix="/articles")

@router.get("")
@router.get("/")
async def list_articles(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: str = None,
    park_id: str = None,
    status_filter: str = None,
    limit: int = 50,
    offset: int = 0,
):
    # Get real data from database
    stmt = select(Article).where(Article.deleted_at == None)
    
    # Get total count
    total = (await db.execute(
        select(func.count(Article.id)).where(Article.deleted_at == None)
    )).scalar() or 0

    # Apply pagination
    stmt = stmt.limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # Convert to ArticleOut format
    items = []
    for article in rows:
        items.append(ArticleOut(
            id=article.id,
            title=article.title,
            slug=article.slug,
            content=article.content,
            summary=article.summary,
            category=article.category,
            featured_image=article.featured_image,
            author_id=article.author_id,
            park_id=article.park_id,
            status=article.status,
            submitted_by=article.submitted_by,
            submitted_at=article.submitted_at,
            approved_by=article.approved_by,
            approved_at=article.approved_at,
            rejected_by=article.rejected_by,
            rejected_at=article.rejected_at,
            rejection_reason=article.rejection_reason,
            created_at=article.created_at,
            updated_at=article.updated_at
        ))

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_next": (offset + limit) < total,
        "has_prev": offset > 0
    }

@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Article).where(Article.id == article_id, Article.deleted_at == None)
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    # Permission check:
    # - Approved articles: anyone can see
    # - Draft/in_review/rejected: only super_admin or author can see
    if obj.status != ArticleStatus.approved.value:
        # Check if user is super_admin or the author
        is_super_admin = user.role == UserRole.super_admin
        is_author = obj.author_id == user.id
        
        if not (is_super_admin or is_author):
            raise HTTPException(
                status_code=403, 
                detail="You can only view your own draft articles or approved articles"
            )

    return ArticleOut(
        id=obj.id,
        title=obj.title,
        slug=obj.slug,
        content=obj.content,
        summary=obj.summary,
        category=obj.category,
        featured_image=obj.featured_image,
        author_id=str(obj.author_id) if obj.author_id else None,
        park_id=obj.park_id,
        status=obj.status,
        submitted_by=str(obj.submitted_by) if obj.submitted_by else None,
        submitted_at=obj.submitted_at,
        approved_by=str(obj.approved_by) if obj.approved_by else None,
        approved_at=obj.approved_at,
        rejected_by=str(obj.rejected_by) if obj.rejected_by else None,
        rejected_at=obj.rejected_at,
        rejection_reason=obj.rejection_reason,
        created_at=obj.created_at,
        updated_at=obj.updated_at
    )

@router.post("/", status_code=201, dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))])
async def create_article(body: ArticleIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    # Use park_id from request body, or None (user doesn't have park_id anymore)
    park_id = body.park_id

    # Generate slug if not provided
    slug = body.title.lower().replace(' ', '-').replace('--', '-') if body.title else None
    
    obj = Article(
        title=body.title,
        slug=slug,
        content=body.content,
        summary=body.summary,
        category=body.category,
        featured_image=body.featured_image,
        author_id=user.id,
        park_id=park_id,
        status=body.status or ArticleStatus.draft.value
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return ArticleOut(
        id=obj.id,
        title=obj.title,
        slug=obj.slug,
        content=obj.content,
        summary=obj.summary,
        category=obj.category,
        featured_image=obj.featured_image,
        author_id=str(obj.author_id) if obj.author_id else None,
        park_id=obj.park_id,
        status=obj.status,
        submitted_by=str(obj.submitted_by) if obj.submitted_by else None,
        submitted_at=obj.submitted_at,
        approved_by=str(obj.approved_by) if obj.approved_by else None,
        approved_at=obj.approved_at,
        rejected_by=str(obj.rejected_by) if obj.rejected_by else None,
        rejected_at=obj.rejected_at,
        rejection_reason=obj.rejection_reason,
        created_at=obj.created_at,
        updated_at=obj.updated_at
    )

@router.put("/{article_id}", dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))])
async def update_article(article_id: int, body: ArticleIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Article).where(Article.id == article_id, Article.deleted_at == None)
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    # Permission check:
    # - Super admin: can edit any article (any status)
    # - Regional admin: can only edit their own draft articles
    # - Author: can only edit their own draft articles
    is_super_admin = user.role == UserRole.super_admin
    is_author = obj.author_id == user.id
    
    if not is_super_admin:
        # Non-admin users can only edit their own draft articles
        if not is_author:
            raise HTTPException(status_code=403, detail="Can only edit your own articles")
        
        if obj.status != ArticleStatus.draft.value:
            raise HTTPException(status_code=403, detail="Can only edit draft articles")
        
        if user.role == UserRole.regional_admin and obj.park_id and user.park_id and obj.park_id != user.park_id:
            raise HTTPException(status_code=403, detail="Park scope required")

    # Update fields
    obj.title = body.title
    obj.content = body.content
    obj.summary = body.summary
    obj.category = body.category if body.category else obj.category
    obj.featured_image = body.featured_image
    obj.status = body.status if body.status else obj.status
    obj.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(obj)
    
    return ArticleOut(
        id=obj.id,
        title=obj.title,
        slug=obj.slug,
        content=obj.content,
        summary=obj.summary,
        category=obj.category,
        featured_image=obj.featured_image,
        author_id=str(obj.author_id) if obj.author_id else None,
        park_id=obj.park_id,
        status=obj.status,
        submitted_by=str(obj.submitted_by) if obj.submitted_by else None,
        submitted_at=obj.submitted_at,
        approved_by=str(obj.approved_by) if obj.approved_by else None,
        approved_at=obj.approved_at,
        rejected_by=str(obj.rejected_by) if obj.rejected_by else None,
        rejected_at=obj.rejected_at,
        rejection_reason=obj.rejection_reason,
        created_at=obj.created_at,
        updated_at=obj.updated_at
    )

@router.post("/{article_id}/submit", dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))])
async def submit_article(article_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Article).where(Article.id == article_id, Article.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    if user.role == UserRole.regional_admin and obj.park_id != user.park_id:
        raise HTTPException(status_code=403, detail="Park scope required")

    obj.status = ArticleStatus.in_review.value
    obj.submitted_by = user.id
    obj.submitted_at = datetime.now(timezone.utc)
    await db.commit()
    emit("article.submitted", entity="article", entity_id=article_id, park_id=obj.park_id)
    return {"ok": True}

@router.post("/{article_id}/approve", dependencies=[Depends(require_roles(UserRole.super_admin))])
async def approve_article(article_id: int, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Article).where(Article.id == article_id, Article.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    obj.status = ArticleStatus.approved.value
    obj.approved_by = 1  # TODO: get from current user
    obj.approved_at = datetime.now(timezone.utc)
    await db.commit()
    emit("article.approved", entity="article", entity_id=article_id, park_id=obj.park_id)
    return {"ok": True}

@router.post("/{article_id}/reject", dependencies=[Depends(require_roles(UserRole.super_admin))])
async def reject_article(article_id: int, payload: dict, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Article).where(Article.id == article_id, Article.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    obj.status = ArticleStatus.rejected.value
    obj.rejection_reason = payload.get("reason", "")
    obj.rejected_by = 1  # TODO: get from current user
    obj.rejected_at = datetime.now(timezone.utc)
    await db.commit()
    emit("article.rejected", entity="article", entity_id=article_id, park_id=obj.park_id, reason=payload.get("reason"))
    return {"ok": True}

@router.delete("/{article_id}", dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))])
async def delete_article(article_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Article).where(Article.id == article_id, Article.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Article not found")

    if obj.author_id != user.id and user.role not in (UserRole.regional_admin, UserRole.super_admin):
        raise HTTPException(status_code=403, detail="Can only delete your own articles")

    if user.role == UserRole.regional_admin and obj.park_id != user.park_id:
        raise HTTPException(status_code=403, detail="Park scope required")

    obj.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}
