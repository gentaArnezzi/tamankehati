import os
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from core.database.session import get_session
from domains.flora.models import Flora
from domains.galleries.models import Gallery
from api.v1.serializers.public import FloraPublicOut, FloraPublicListResponse

router = APIRouter()

def _build_image_url(image_path: str, request: Optional[Request] = None) -> str:
    """
    Build full URL for image path.
    Priority: BASE_URL > API_BASE_URL > BACKEND_URL > request URL
    Returns relative path if no base URL found (frontend will handle it).
    """
    if not image_path:
        return ""
    if image_path.startswith('http'):
        return image_path
    
    # Use environment variable if available (priority order)
    base_url = (
        os.getenv("BASE_URL") or 
        os.getenv("API_BASE_URL") or 
        os.getenv("BACKEND_URL")
    )
    
    if not base_url and request:
        # Try to get base URL from request
        scheme = request.url.scheme
        host = request.url.hostname
        port = request.url.port
        if port and port not in [80, 443]:
            base_url = f"{scheme}://{host}:{port}"
        else:
            base_url = f"{scheme}://{host}"
    
    # If still no base_url, return relative path (frontend will prepend API URL)
    if not base_url:
        # Return relative path - frontend will handle it
        return image_path
    
    return f"{base_url}{image_path}"

@router.get("", response_model=FloraPublicListResponse)
@router.get("/", response_model=FloraPublicListResponse)
async def get_flora(
    request: Request,
    search: Optional[str] = Query(None, description="Search by name"),
    status_iucn: Optional[str] = Query(None, description="Filter by IUCN status"),
    provinsi: Optional[str] = Query(None, description="Filter by park province"),
    wilayah: Optional[str] = Query(None, description="Filter by park province (alias for provinsi)"),
    taman: Optional[int] = Query(None, description="Filter by park ID"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """Get approved flora for public display"""
    try:
        from domains.parks.models import Park
        
        # Support both 'provinsi' and 'wilayah' parameters (wilayah is alias)
        province_filter = provinsi or wilayah
        
        # Build query for approved flora only (exclude deleted)
        # Always join with parks table to get province for display
        stmt = select(Flora, Park.provinsi).join(Park, Flora.park_id == Park.id).where(
            Flora.status == "approved",
            Flora.deleted_at == None,
            Park.deleted_at == None
        )
        
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
        
        # Add province filter (from park)
        if province_filter:
            stmt = stmt.filter(Park.provinsi == province_filter)
        
        # Add park filter
        if taman:
            stmt = stmt.filter(Flora.park_id == taman)
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar() or 0
        
        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)
        result = await db.execute(stmt)
        rows = result.all()
        
        # Build response with park province information
        flora_items = []
        for flora_item, park_provinsi in rows:
            flora_items.append(FloraPublicOut(
                id=str(flora_item.id),
                nama_ilmiah=flora_item.scientific_name or "",
                nama_umum=flora_item.local_name or "",
                famili=flora_item.family or "",
                status_iucn=flora_item.iucn_status or "",
                deskripsi=flora_item.description or "",
                habitat=flora_item.habitat or "",
                wilayah=park_provinsi or "",
                gambar_utama=_build_image_url(flora_item.gambar_utama or "", request),
                status=flora_item.status
            ))
        
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
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    """Get single flora by ID with enhanced data"""
    try:
        # Enhanced query with park information (exclude deleted)
        stmt = select(Flora).where(
            Flora.id == id, 
            Flora.status == "approved",
            Flora.deleted_at == None
        )
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Flora tidak ditemukan")
        
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
        
        return FloraPublicOut(
            id=str(item.id),
            nama_ilmiah=item.scientific_name or "",
            nama_umum=item.local_name or "",
            famili=item.family or "",
            genus=item.genus or "",
            spesies=item.species or "",
            sinonim=item.synonym or "",
            status_iucn=item.iucn_status or "",
            deskripsi=item.description or "",
            habitat=item.habitat or "",
            morfologi=item.morphology or "",
            manfaat=item.benefits or "",
            kegunaan=item.uses or "",
            waktu_berbunga=item.flowering_time or "",
            penyebaran=item.distribution or "",
            metode_perbanyakan=item.propagation_method or "",
            referensi=item.reference or "",
            wilayah=wilayah,
            gambar_utama=_build_image_url(item.gambar_utama or "", request),
            gambar_daun=_build_image_url(item.leaf_image_url or "", request),
            gambar_batang=_build_image_url(item.stem_image_url or "", request),
            gambar_bunga=_build_image_url(item.flower_image_url or "", request),
            gambar_buah=_build_image_url(item.fruit_image_url or "", request),
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
        print(f"Error in get_flora_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/{id}/gallery")
async def get_flora_gallery(
    id: int,
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    """Get gallery images for a specific flora"""
    try:
        # First check if flora exists and is approved (exclude deleted)
        flora_stmt = select(Flora).where(
            Flora.id == id, 
            Flora.status == "approved",
            Flora.deleted_at == None
        )
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
                "image_url": _build_image_url(item.image_url or "", request),
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