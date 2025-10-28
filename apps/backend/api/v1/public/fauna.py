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
    taman: Optional[int] = Query(None, description="Filter by park ID"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """Get approved fauna for public display"""
    try:
        # Build query for approved fauna only (exclude deleted)
        stmt = select(Fauna).where(
            Fauna.status == "approved",
            Fauna.deleted_at == None
        )
        
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
        
        # Add park filter
        if taman:
            stmt = stmt.filter(Fauna.park_id == taman)
        
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
    """Get single fauna by ID with enhanced data"""
    try:
        # Enhanced query with park information (exclude deleted)
        stmt = select(Fauna).where(
            Fauna.id == id, 
            Fauna.status == "approved",
            Fauna.deleted_at == None
        )
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Fauna tidak ditemukan")
        
        # Get park information if park_id exists
        park_info = None
        if item.park_id:
            from domains.parks.models import Park
            park_stmt = select(Park).where(Park.id == item.park_id)
            park_result = await db.execute(park_stmt)
            park_obj = park_result.scalar_one_or_none()
            
            if park_obj:
                park_info = {
                    "id": park_obj.id,
                    "name": park_obj.name,
                    "description": park_obj.description,
                    "area_ha": park_obj.area_ha,
                    "provinsi": park_obj.provinsi,
                    "kota_kabupaten": park_obj.kota_kabupaten,
                    "kecamatan": park_obj.kecamatan,
                    "desa_kelurahan": park_obj.desa_kelurahan,
                    "latitude": park_obj.latitude,
                    "longitude": park_obj.longitude,
                    "pengelola": park_obj.pengelola,
                    "tipe_ekoregion": park_obj.tipe_ekoregion,
                }
        
        # Build wilayah string from park location info
        wilayah_parts = []
        if park_info:
            if park_info.get("provinsi"):
                wilayah_parts.append(park_info["provinsi"])
            if park_info.get("kota_kabupaten"):
                wilayah_parts.append(park_info["kota_kabupaten"])
            if park_info.get("kecamatan"):
                wilayah_parts.append(park_info["kecamatan"])
        
        wilayah = ", ".join(wilayah_parts) if wilayah_parts else ""
        
        return FaunaPublicOut(
            id=str(item.id),
            nama_ilmiah=item.scientific_name or "",
            nama_umum=item.local_name or "",
            famili=item.family or "",
            genus=item.genus or "",
            spesies=item.species or "",
            ordo=item.ordo or "",
            status_iucn=item.iucn_status or "",
            deskripsi=item.description or "",
            habitat=item.habitat or "",
            morfologi=item.morphology or "",
            diet=item.diet or "",
            behavior=item.behavior or "",
            habitat_sumber_makanan=item.habitat_sumber_makanan or "",
            status_hama=item.status_hama or "",
            tingkat_hama=item.tingkat_hama or "",
            wilayah=wilayah,
            gambar_utama=_build_image_url(item.gambar_utama or ""),
            status=item.status,
            is_endemic=item.is_endemic or False,
            park_info=park_info,
            local_id=item.local_id or "",
            created_at=item.created_at.isoformat() if item.created_at else None,
            updated_at=item.updated_at.isoformat() if item.updated_at else None,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_fauna_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")