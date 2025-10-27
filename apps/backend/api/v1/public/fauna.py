from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from core.database.session import get_session
from domains.fauna.models import Fauna
from api.v1.serializers.public import FaunaPublicOut, FaunaPublicListResponse

router = APIRouter()

def _build_image_url(image_path: str) -> str:
    """Build full URL for image path"""
    if not image_path:
        return ""
    if image_path.startswith('http'):
        return image_path
    return f"http://localhost:8000{image_path}"

@router.get("", response_model=FaunaPublicListResponse)
@router.get("/", response_model=FaunaPublicListResponse)
async def get_fauna(
    search: Optional[str] = Query(None, description="Search by name"),
    status_iucn: Optional[str] = Query(None, description="Filter by IUCN status"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """Get approved fauna for public display"""
    try:
        # Build query for approved fauna only
        stmt = select(Fauna).where(Fauna.status == "approved")
        
        # Add search filter
        if search:
            stmt = stmt.filter(
                or_(
                    Fauna.local_name.ilike(f"%{search}%"),
                    Fauna.scientific_name.ilike(f"%{search}%"),
                    Fauna.family.ilike(f"%{search}%")
                )
            )
        
        # Add IUCN status filter
        if status_iucn:
            stmt = stmt.filter(Fauna.iucn_status == status_iucn)
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar() or 0
        
        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)
        result = await db.execute(stmt)
        items = result.scalars().all()
        
        # Build response
        fauna_items = [
            FaunaPublicOut(
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
        
        return FaunaPublicListResponse(
            items=fauna_items,
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
        
    except Exception as e:
        print(f"Error in get_fauna: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/{id}", response_model=FaunaPublicOut)
async def get_fauna_by_id(
    id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get single fauna by ID"""
    try:
        stmt = select(Fauna).where(Fauna.id == id, Fauna.status == "approved")
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Fauna tidak ditemukan")
        
        return FaunaPublicOut(
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
        print(f"Error in get_fauna_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")