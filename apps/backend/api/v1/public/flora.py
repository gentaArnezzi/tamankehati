from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from core.database.session import get_session
from domains.flora.models import Flora
from domains.galleries.models import Gallery
from api.v1.serializers.public import FloraPublicOut, FloraPublicListResponse

router = APIRouter()

def _build_image_url(image_path: str) -> str:
    """Build full URL for image path"""
    if not image_path:
        return ""
    if image_path.startswith('http'):
        return image_path
    return f"http://localhost:8000{image_path}"

@router.get("", response_model=FloraPublicListResponse)
@router.get("/", response_model=FloraPublicListResponse)
async def get_flora(
    search: Optional[str] = Query(None, description="Search by name"),
    status_iucn: Optional[str] = Query(None, description="Filter by IUCN status"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """Get approved flora for public display"""
    try:
        # Build query for approved flora only
        stmt = select(Flora).where(Flora.status == "approved")
        
        # Add search filter
        if search:
            stmt = stmt.filter(
                or_(
                    Flora.local_name.ilike(f"%{search}%"),
                    Flora.scientific_name.ilike(f"%{search}%"),
                    Flora.family.ilike(f"%{search}%")
                )
            )
        
        # Add IUCN status filter
        if status_iucn:
            stmt = stmt.filter(Flora.iucn_status == status_iucn)
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar() or 0
        
        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)
        result = await db.execute(stmt)
        items = result.scalars().all()
        
        # Build response
        flora_items = [
            FloraPublicOut(
                id=str(item.id),
                nama_ilmiah=item.scientific_name or "",
                nama_umum=item.local_name or "",
                famili=item.family or "",
                status_iucn=item.iucn_status or "",
                deskripsi=item.description or "",
                habitat=item.habitat or "",
                wilayah="",  # No region info available
                gambar_utama=_build_image_url(item.gambar_utama or ""),
                status=item.status
            ) for item in items
        ]
        
        return FloraPublicListResponse(
            items=flora_items,
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
        
    except Exception as e:
        print(f"Error in get_flora: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/{id}", response_model=FloraPublicOut)
async def get_flora_by_id(
    id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get single flora by ID"""
    try:
        stmt = select(Flora).where(Flora.id == id, Flora.status == "approved")
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Flora tidak ditemukan")
        
        return FloraPublicOut(
            id=str(item.id),
            nama_ilmiah=item.scientific_name or "",
            nama_umum=item.local_name or "",
            famili=item.family or "",
            status_iucn=item.iucn_status or "",
            deskripsi=item.description or "",
            habitat=item.habitat or "",
            wilayah="",  # No region info available
            gambar_utama=_build_image_url(item.gambar_utama or ""),
            status=item.status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_flora_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/{id}/gallery")
async def get_flora_gallery(
    id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get gallery images for a specific flora"""
    try:
        # First check if flora exists and is approved
        flora_stmt = select(Flora).where(Flora.id == id, Flora.status == "approved")
        flora_result = await db.execute(flora_stmt)
        flora = flora_result.scalar_one_or_none()
        
        if not flora:
            raise HTTPException(status_code=404, detail="Flora tidak ditemukan")
        
        # Get gallery images for this flora
        gallery_stmt = select(Gallery).where(
            Gallery.entity_type == "flora",
            Gallery.entity_id == id,
            Gallery.status == "approved"
        ).order_by(Gallery.created_at.desc())
        
        gallery_result = await db.execute(gallery_stmt)
        gallery_items = gallery_result.scalars().all()
        
        # Build response
        gallery_images = [
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "image_url": _build_image_url(item.image_url or ""),
                "created_at": item.created_at.isoformat() if item.created_at else None
            } for item in gallery_items
        ]
        
        return {
            "flora_id": id,
            "flora_name": flora.scientific_name or "",
            "gallery_images": gallery_images,
            "total": len(gallery_images)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_flora_gallery: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")