from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session

router = APIRouter()

@router.get("/")
async def get_flora_simple(
    search: Optional[str] = Query(None, description="Search by name"),
    wilayah: Optional[str] = Query(None, description="Filter by region"),
    status_iucn: Optional[str] = Query(None, description="Filter by IUCN status"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """Simple flora endpoint that works without complex relationships"""
    try:
        # Build base query
        where_conditions = ["status = 'approved'"]
        params = {}
        
        if search:
            where_conditions.append("(local_name ILIKE :search OR scientific_name ILIKE :search OR family ILIKE :search)")
            params['search'] = f"%{search}%"
        
        if status_iucn:
            where_conditions.append("iucn_status = :status_iucn")
            params['status_iucn'] = status_iucn
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM flora WHERE {where_clause}"
        count_result = await db.execute(text(count_query), params)
        total = count_result.scalar() or 0
        
        # Get items
        items_query = f"""
            SELECT id, local_name, scientific_name, family, description, 
                   iucn_status, gambar_utama, created_at
            FROM flora 
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """
        params.update({'limit': limit, 'offset': offset})
        
        items_result = await db.execute(text(items_query), params)
        items = []
        
        for row in items_result:
            items.append({
                "id": str(row.id),
                "nama_ilmiah": row.scientific_name or "",
                "nama_umum": row.local_name or "",
                "famili": row.family or "",
                "status_iucn": row.iucn_status or "",
                "deskripsi": row.description or "",
                "habitat": "",
                "wilayah": "",
                "gambar_utama": row.gambar_utama or "",
                "status": "approved"
            })
        
        return {
            "items": items,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_next": offset + limit < total,
            "has_prev": offset > 0
        }
        
    except Exception as e:
        print(f"Error in flora_simple: {e}")
        return {
            "items": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "has_next": False,
            "has_prev": False,
            "error": str(e)
        }

@router.get("/{id}")
async def get_flora_by_id(id: str, db: AsyncSession = Depends(get_session)):
    """Get single flora item by ID"""
    try:
        query = """
            SELECT id, local_name, scientific_name, family, description, 
                   iucn_status, gambar_utama, created_at
            FROM flora 
            WHERE id = :id AND status = 'approved'
        """
        
        result = await db.execute(text(query), {"id": int(id)})
        row = result.fetchone()
        
        if not row:
            return {"error": "Flora not found"}
        
        return {
            "id": str(row.id),
            "nama_ilmiah": row.scientific_name or "",
            "nama_umum": row.local_name or "",
            "famili": row.family or "",
            "status_iucn": row.iucn_status or "",
            "deskripsi": row.description or "",
            "habitat": "",
            "wilayah": "",
            "gambar_utama": row.gambar_utama or "",
            "status": "approved"
        }
        
    except Exception as e:
        print(f"Error in flora_by_id: {e}")
        return {"error": str(e)}
