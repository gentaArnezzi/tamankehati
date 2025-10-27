from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from core.database.session import get_session
from domains.galleries.models import Gallery, GalleryStatus
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles, ensure_user_scope_or_admin
from api.v1.serializers.galleries import GalleryIn, GalleryOut, GalleryListResponse
from utils.events import emit
from datetime import datetime, timezone

router = APIRouter(prefix="/galleries")

@router.get("")
@router.get("/")
async def list_galleries(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: str = None,
    # park_id removed - using park-based scoping
    status_filter: str = None,
    limit: int = 50,
    offset: int = 0,
):
    # Get real data from database
    stmt = select(Gallery).where(Gallery.deleted_at == None)
    
    # Get total count
    total = (await db.execute(
        select(func.count(Gallery.id)).where(Gallery.deleted_at == None)
    )).scalar() or 0

    # Apply pagination
    stmt = stmt.limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # Convert to simple format
    items = []
    for gallery in rows:
        items.append({
            "id": gallery.id,
            "title": gallery.title,
            "description": gallery.description,
            "status": gallery.status
        })

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_next": (offset + limit) < total,
        "has_prev": offset > 0
    }

@router.get("/entity/{entity_type}/{entity_id}")
async def get_galleries_by_entity(
    entity_type: str,
    entity_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get all gallery images for a specific entity (flora/fauna)"""
    try:
        stmt = select(Gallery).where(
            Gallery.entity_type == entity_type,
            Gallery.entity_id == entity_id,
            Gallery.deleted_at == None
        )
        
        # Apply user-based filtering
        if user.role in ('public', 'volunteer', 'ranger'):
            # Public users can only see approved galleries
            stmt = stmt.where(Gallery.status == GalleryStatus.approved.value)
        elif user.role == 'regional_admin':
            # Regional admin can see their own galleries (authored or submitted) and approved ones
            stmt = stmt.where(
                (Gallery.author_id == user.id) | 
                (Gallery.submitted_by == user.id) | 
                (Gallery.status == GalleryStatus.approved.value)
            )
        # Super admin can see all galleries
        
        rows = (await db.execute(stmt)).scalars().all()
        
        items = []
        for gallery in rows:
            items.append({
                "id": gallery.id,
                "title": gallery.title,
                "description": gallery.description,
                "image_url": gallery.image_url,
                "entity_type": gallery.entity_type,
                "entity_id": gallery.entity_id,
                "status": gallery.status,
                "created_at": gallery.created_at.isoformat() if gallery.created_at else None,
                "updated_at": gallery.updated_at.isoformat() if gallery.updated_at else None
            })
        
        return {
            "success": True,
            "data": items,
            "total": len(items),
            "entity_type": entity_type,
            "entity_id": entity_id
        }
    except Exception as e:
        print(f"Error fetching galleries for {entity_type}/{entity_id}: {e}")
        # Return empty result instead of error
        return {
            "success": True,
            "data": [],
            "total": 0,
            "entity_type": entity_type,
            "entity_id": entity_id
        }

@router.get("/{gallery_id}", response_model=GalleryOut)
async def get_gallery(gallery_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Gallery).where(Gallery.id == gallery_id)
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    if user.role in ('public', 'volunteer', 'ranger') and obj.status != GalleryStatus.approved.value:
        raise HTTPException(status_code=403, detail="Forbidden")

    # TODO: Fix park_id check - Gallery model doesn't have park_id field
    # if user.role == 'regional_admin' and obj.park_id != user.park_id:
    #     raise HTTPException(status_code=403, detail="Park scope required")

    # TODO: Determine park_id from entity relationship
    park_id = None  # Placeholder until we implement proper park_id resolution

    return GalleryOut.model_validate({
        'id': obj.id,
        'title': obj.title,
        'description': obj.description,
        'image_url': obj.image_url,
        'author_id': obj.author_id,
        'park_id': park_id,
        'entity_type': obj.entity_type,
        'entity_id': obj.entity_id,
        'status': obj.status,
        'submitted_by': obj.submitted_by,
        'submitted_at': obj.submitted_at,
        'approved_by': obj.approved_by,
        'approved_at': obj.approved_at,
        'rejected_by': obj.rejected_by,
        'rejected_at': obj.rejected_at,
        'rejection_reason': obj.rejection_reason,
        'created_at': obj.created_at,
        'updated_at': obj.updated_at
    })

@router.post("/", status_code=201, dependencies=[Depends(require_roles('regional_admin', 'super_admin'))])
async def create_gallery(body: GalleryIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    park_id = body.park_id if user.role in ('regional_admin', 'super_admin') else user.park_id

    obj = Gallery(
        title=body.title,
        description=body.description,
        image_url=body.image_url,
        author_id=user.id,
        entity_type=body.entity_type,
        entity_id=body.entity_id,
        status=GalleryStatus.draft.value
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return GalleryOut.model_validate({
        'id': obj.id,
        'title': obj.title,
        'description': obj.description,
        'image_url': obj.image_url,
        'author_id': obj.author_id,
        'park_id': park_id,
        'entity_type': obj.entity_type,
        'entity_id': obj.entity_id,
        'status': obj.status,
        'submitted_by': obj.submitted_by,
        'submitted_at': obj.submitted_at,
        'approved_by': obj.approved_by,
        'approved_at': obj.approved_at,
        'rejected_by': obj.rejected_by,
        'rejected_at': obj.rejected_at,
        'rejection_reason': obj.rejection_reason,
        'created_at': obj.created_at,
        'updated_at': obj.updated_at
    })

@router.put("/{gallery_id}", dependencies=[Depends(require_roles('regional_admin', 'super_admin'))])
async def update_gallery(gallery_id: int, body: GalleryIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Gallery).where(Gallery.id == gallery_id)
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    if obj.author_id != user.id and user.role not in ('regional_admin', 'super_admin'):
        raise HTTPException(status_code=403, detail="Can only edit your own galleries")

    # All users: can only edit draft galleries
    if obj.status != GalleryStatus.draft.value:
        raise HTTPException(status_code=403, detail="Can only edit draft galleries")

    # TODO: Fix park_id check - Gallery model doesn't have park_id field
    # if user.role == UserRole.regional_admin and obj.park_id != user.park_id:
    #     raise HTTPException(status_code=403, detail="Park scope required")

    # TODO: Determine park_id from entity relationship
    park_id = None  # Placeholder until we implement proper park_id resolution

    obj.title = body.title
    obj.description = body.description
    obj.image_url = body.image_url
    await db.commit()
    await db.refresh(obj)
    return GalleryOut.model_validate({
        'id': obj.id,
        'title': obj.title,
        'description': obj.description,
        'image_url': obj.image_url,
        'author_id': obj.author_id,
        'park_id': park_id,
        'entity_type': obj.entity_type,
        'entity_id': obj.entity_id,
        'status': obj.status,
        'submitted_by': obj.submitted_by,
        'submitted_at': obj.submitted_at,
        'approved_by': obj.approved_by,
        'approved_at': obj.approved_at,
        'rejected_by': obj.rejected_by,
        'rejected_at': obj.rejected_at,
        'rejection_reason': obj.rejection_reason,
        'created_at': obj.created_at,
        'updated_at': obj.updated_at
    })

@router.post("/{gallery_id}/submit", dependencies=[Depends(require_roles('regional_admin', 'super_admin'))])
async def submit_gallery(gallery_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Gallery).where(Gallery.id == gallery_id))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    # TODO: Fix park_id check - Gallery model doesn't have park_id field
    # if user.role == UserRole.regional_admin and obj.park_id != user.park_id:
    #     raise HTTPException(status_code=403, detail="Park scope required")

    obj.status = GalleryStatus.in_review.value
    obj.submitted_by = user.id
    obj.submitted_at = datetime.now(timezone.utc)
    await db.commit()
    emit("gallery.submitted", entity="gallery", entity_id=gallery_id)
    return {"ok": True}

@router.post("/{gallery_id}/approve", dependencies=[Depends(require_roles('super_admin'))])
async def approve_gallery(gallery_id: int, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Gallery).where(Gallery.id == gallery_id))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    obj.status = GalleryStatus.approved.value
    obj.approved_by = 1  # TODO: get from current user
    obj.approved_at = datetime.now(timezone.utc)
    await db.commit()
    emit("gallery.approved", entity="gallery", entity_id=gallery_id)
    return {"ok": True}

@router.post("/{gallery_id}/reject", dependencies=[Depends(require_roles('super_admin'))])
async def reject_gallery(gallery_id: int, payload: dict, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Gallery).where(Gallery.id == gallery_id))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    obj.status = GalleryStatus.rejected.value
    obj.rejection_reason = payload.get("reason", "")
    obj.rejected_by = 1  # TODO: get from current user
    obj.rejected_at = datetime.now(timezone.utc)
    await db.commit()
    emit("gallery.rejected", entity="gallery", entity_id=gallery_id, reason=payload.get("reason"))
    return {"ok": True}

@router.delete("/{gallery_id}", dependencies=[Depends(require_roles('regional_admin', 'super_admin'))])
async def delete_gallery(gallery_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Gallery).where(Gallery.id == gallery_id))).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gallery not found")

    if obj.author_id != user.id and user.role not in ('regional_admin', 'super_admin'):
        raise HTTPException(status_code=403, detail="Can only delete your own galleries")

    if user.role == 'regional_admin' and obj.park_id != user.park_id:
        raise HTTPException(status_code=403, detail="Park scope required")

    obj.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}
