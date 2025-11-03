from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from core.database.session import get_session

router = APIRouter()

class ParkResponse(BaseModel):
    id: int
    name: str
    slug: str
    status: str
    region_id: Optional[int] = None
    area_ha: Optional[float] = None
    description: Optional[str] = None
    gambar_utama: Optional[str] = None
    provinsi: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: str
    updated_at: str

class ParkListResponse(BaseModel):
    items: List[ParkResponse]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool

@router.get("", response_model=ParkListResponse)
@router.get("/", response_model=ParkListResponse)
async def list_parks(
    search: Optional[str] = Query(None, description="Search by park name"),
    provinsi: Optional[str] = Query(None, description="Filter by province"),
    wilayah: Optional[str] = Query(None, description="Filter by region name (deprecated, use provinsi)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """
    Get list of parks with optional filtering
    """
    # Base query without regions join (regions table doesn't exist, region_id removed)
    # Only show approved and non-deleted parks
    base_query = """
        SELECT p.id, p.name, p.slug, p.status, p.area_ha, p.description, p.created_at, p.updated_at, p.gambar_utama, p.provinsi, p.latitude, p.longitude
        FROM parks p
        WHERE p.status = 'approved' AND p.deleted_at IS NULL
    """
    
    count_query = """
        SELECT COUNT(*)
        FROM parks p
        WHERE p.status = 'approved' AND p.deleted_at IS NULL
    """
    
    params = {}
    
    # Add search filter
    if search:
        base_query += " AND p.name ILIKE :search"
        count_query += " AND p.name ILIKE :search"
        params["search"] = f"%{search}%"
    
    # Add provinsi filter
    if provinsi:
        base_query += " AND p.provinsi = :provinsi"
        count_query += " AND p.provinsi = :provinsi"
        params["provinsi"] = provinsi
    # Support deprecated wilayah parameter for backward compatibility
    elif wilayah:
        base_query += " AND p.provinsi = :provinsi"
        count_query += " AND p.provinsi = :provinsi"
        params["provinsi"] = wilayah
    
    # Get total count
    count_result = await db.execute(text(count_query), params)
    total = count_result.scalar() or 0
    
    # Add pagination and ordering
    base_query += " ORDER BY p.id DESC LIMIT :limit OFFSET :offset"
    params.update({"limit": limit, "offset": offset})
    
    try:
        result = await db.execute(text(base_query), params)
        rows = result.fetchall()
        
        items = []
        for row in rows:
            try:
                # Handle datetime parsing safely
                created_at_str = ""
                if row[6]:
                    if hasattr(row[6], 'isoformat'):
                        created_at_str = row[6].isoformat()
                    else:
                        created_at_str = str(row[6])
                
                updated_at_str = ""
                if row[7]:
                    if hasattr(row[7], 'isoformat'):
                        updated_at_str = row[7].isoformat()
                    else:
                        updated_at_str = str(row[7])
                
                items.append(ParkResponse(
                    id=row[0],
                    name=row[1],
                    slug=row[2],
                    status=row[3],
                    region_id=None,  # region_id removed from database
                    area_ha=float(row[4]) if row[4] else None,
                    description=row[5] if row[5] else None,
                    gambar_utama=row[8] if row[8] else None,
                    provinsi=row[9] if row[9] else None,
                    latitude=float(row[10]) if row[10] else None,
                    longitude=float(row[11]) if row[11] else None,
                    created_at=created_at_str,
                    updated_at=updated_at_str
                ))
            except Exception as e:
                # Log error but continue processing other rows
                print(f"Error processing park row: {e}")
                continue
    except Exception as e:
        print(f"Error executing parks query: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return ParkListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_next=(offset + limit) < total,
        has_prev=offset > 0
    )

class ParkDetailResponse(BaseModel):
    id: int
    name: str
    slug: str
    status: str
    region_id: Optional[int] = None
    region_name: Optional[str] = None
    area_ha: Optional[float] = None
    description: Optional[str] = None
    sk_penetapan: Optional[str] = None
    pengelola: Optional[str] = None
    tipe_ekoregion: Optional[str] = None
    kondisi_fisik: Optional[str] = None
    nilai_penting: Optional[str] = None
    sejarah: Optional[str] = None
    visi: Optional[str] = None
    misi: Optional[str] = None
    nilai_dasar: Optional[str] = None
    provinsi: Optional[str] = None
    kota_kabupaten: Optional[str] = None
    kecamatan: Optional[str] = None
    desa_kelurahan: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gambar_utama: Optional[str] = None
    submitted_by: Optional[int] = None
    submitted_at: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[str] = None
    rejected_at: Optional[str] = None
    created_at: str
    updated_at: str
    statistik: dict = {}

@router.get("/{park_id}", response_model=ParkDetailResponse)
async def get_park(
    park_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get a specific park by ID with detailed information and statistics
    """
    try:
        # Get park details with ALL fields including submitted_by and submitted_at
        # Only show approved and non-deleted parks
        park_query = """
            SELECT id, name, slug, status, area_ha, description, created_at, updated_at,
                   sk_penetapan, pengelola, tipe_ekoregion, kondisi_fisik, nilai_penting,
                   sejarah, visi, misi, nilai_dasar,
                   provinsi, kota_kabupaten, kecamatan, desa_kelurahan,
                   latitude, longitude,
                   gambar_utama,
                   submitted_by, submitted_at, approved_by, approved_at, rejected_at
            FROM parks 
            WHERE id = :park_id AND status = 'approved' AND deleted_at IS NULL
        """
        
        result = await db.execute(text(park_query), {"park_id": park_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Park not found")
        
        # Debug: Check row length to prevent tuple index out of range
        row_length = len(row) if hasattr(row, '__len__') else 0
        expected_columns = 29
        if row_length < expected_columns:
            print(f"⚠️ Warning: Row has {row_length} columns, expected {expected_columns}")
            print(f"Query selected columns: id, name, slug, status, area_ha, description, created_at, updated_at, sk_penetapan, pengelola, tipe_ekoregion, kondisi_fisik, nilai_penting, sejarah, visi, misi, nilai_dasar, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, latitude, longitude, gambar_utama, submitted_by, submitted_at, approved_by, approved_at, rejected_at")
            raise HTTPException(
                status_code=500, 
                detail=f"Database schema mismatch: Expected {expected_columns} columns but got {row_length}. Please check if all columns exist in parks table."
            )
        
        # Safe access helper function
        def safe_get(index, default=None):
            try:
                return row[index] if index < row_length else default
            except (IndexError, TypeError):
                return default
        
        # Set region name to default
        region_name = "Indonesia"
        
        # Get flora count for this park (approved and not deleted)
        flora_count = 0
        try:
            flora_query = text("SELECT COUNT(*) FROM flora WHERE park_id = :park_id AND status = 'approved' AND deleted_at IS NULL")
            flora_result = await db.execute(flora_query, {"park_id": park_id})
            flora_count = flora_result.scalar() or 0
            print(f"🌿 Flora count for park {park_id}: {flora_count}")
        except Exception as e:
            print(f"❌ Error getting flora count for park {park_id}: {e}")
            flora_count = 0
        
        # Get fauna count for this park (approved and not deleted)
        fauna_count = 0
        try:
            fauna_query = text("SELECT COUNT(*) FROM fauna WHERE park_id = :park_id AND status = 'approved' AND deleted_at IS NULL")
            fauna_result = await db.execute(fauna_query, {"park_id": park_id})
            fauna_count = fauna_result.scalar() or 0
            print(f"🐾 Fauna count for park {park_id}: {fauna_count}")
        except Exception as e:
            print(f"❌ Error getting fauna count for park {park_id}: {e}")
            fauna_count = 0
        
        # Safe access to datetime fields
        def safe_datetime_str(index):
            val = safe_get(index)
            if val:
                try:
                    if hasattr(val, 'isoformat'):
                        return val.isoformat()
                    return str(val)
                except:
                    return None
            return None
        
        # Safe access to float fields
        def safe_float(index):
            val = safe_get(index)
            if val is not None:
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return None
            return None
        
        return ParkDetailResponse(
            id=safe_get(0, 0),
            name=safe_get(1, ""),
            slug=safe_get(2, ""),
            status=safe_get(3, "approved"),
            region_id=None,
            region_name=region_name,
            area_ha=safe_float(4),
            description=safe_get(5),
            sk_penetapan=safe_get(8),
            pengelola=safe_get(9),
            tipe_ekoregion=safe_get(10),
            kondisi_fisik=safe_get(11),
            nilai_penting=safe_get(12),
            sejarah=safe_get(13),
            visi=safe_get(14),
            misi=safe_get(15),
            nilai_dasar=safe_get(16),
            provinsi=safe_get(17),
            kota_kabupaten=safe_get(18),
            kecamatan=safe_get(19),
            desa_kelurahan=safe_get(20),
            latitude=safe_float(21),
            longitude=safe_float(22),
            gambar_utama=safe_get(23),
            submitted_by=safe_get(24),
            submitted_at=safe_datetime_str(25),
            approved_by=safe_get(26),
            approved_at=safe_datetime_str(27),
            rejected_at=safe_datetime_str(28),
            created_at=safe_datetime_str(6) or "",
            updated_at=safe_datetime_str(7) or "",
            statistik={
                "flora": flora_count,
                "fauna": fauna_count,
                "artikel": 0,
                "galeri": 0
            }
        )
    except Exception as e:
        print(f"Error in get_park: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
