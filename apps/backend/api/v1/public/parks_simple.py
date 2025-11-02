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
        
        # Set region name to default
        region_name = "Indonesia"
        
        # Get flora count for this park (approved and not deleted)
        flora_count = 0
        try:
            flora_query = text("SELECT COUNT(*) FROM flora WHERE park_id = :park_id AND status = 'approved' AND deleted_at IS NULL")
            flora_result = await db.execute(flora_query, {"park_id": park_id})
            flora_count = flora_result.scalar() or 0
            print(f"🌿 Flora count for park {park_id}: {flora_count}")
            
            # Debug: check all flora for this park regardless of status
            debug_query = text("SELECT id, scientific_name, status, deleted_at FROM flora WHERE park_id = :park_id LIMIT 5")
            debug_result = await db.execute(debug_query, {"park_id": park_id})
            debug_rows = debug_result.fetchall()
            print(f"🔍 Debug - All flora for park {park_id}:")
            for row in debug_rows:
                nama = row[1] or "N/A"
                deleted = "DELETED" if row[3] else "active"
                print(f"   ID: {row[0]}, Nama: {nama}, Status: {row[2]}, {deleted}")
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
        
        return ParkDetailResponse(
            id=row[0],
            name=row[1],
            slug=row[2],
            status=row[3],
            region_id=None,
            region_name=region_name,
            area_ha=float(row[4]) if row[4] else None,
            description=row[5],
            sk_penetapan=row[8],         # sk_penetapan
            pengelola=row[9],             # pengelola
            tipe_ekoregion=row[10],       # tipe_ekoregion
            kondisi_fisik=row[11],        # kondisi_fisik
            nilai_penting=row[12],        # nilai_penting
            sejarah=row[13],              # sejarah
            visi=row[14],                 # visi
            misi=row[15],                 # misi
            nilai_dasar=row[16],          # nilai_dasar
            provinsi=row[17],             # provinsi
            kota_kabupaten=row[18],       # kota_kabupaten
            kecamatan=row[19],            # kecamatan
            desa_kelurahan=row[20],       # desa_kelurahan
            latitude=float(row[21]) if row[21] else None,           # latitude
            longitude=float(row[22]) if row[22] else None,          # longitude
            gambar_utama=row[23],         # gambar_utama (NEW)
            submitted_by=row[24],         # submitted_by
            submitted_at=row[25].isoformat() if row[25] else None,  # submitted_at
            approved_by=row[26],          # approved_by
            approved_at=row[27].isoformat() if row[27] else None,   # approved_at
            rejected_at=row[28].isoformat() if row[28] else None,   # rejected_at
            created_at=row[6].isoformat() if row[6] else "",
            updated_at=row[7].isoformat() if row[7] else "",
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
