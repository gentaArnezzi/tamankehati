from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.v1.serializers.public import ActivityPublicOut, ActivityPublicListResponse
from core.database.session import get_session

router = APIRouter()


@router.get("", response_model=ActivityPublicListResponse)
@router.get("/", response_model=ActivityPublicListResponse)
async def get_activities(
    search: Optional[str] = Query(None, description="Search by activity title"),
    park_id: Optional[int] = Query(None, description="Filter by park ID"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """
    Get approved activities for public display
    """
    try:
        # Build base query for approved activities only
        base_query = """
            SELECT a.id, a.title, a.description, a.activity_date, a.location, 
                   a.created_at, a.updated_at, p.name as park_name
            FROM activities a
            LEFT JOIN parks p ON a.park_id = p.id
            WHERE a.status = 'approved'
        """
        
        count_query = """
            SELECT COUNT(*)
            FROM activities a
            WHERE a.status = 'approved'
        """
        
        params = {}
        
        # Add search filter
        if search:
            base_query += " AND a.title ILIKE :search"
            count_query += " AND a.title ILIKE :search"
            params["search"] = f"%{search}%"
        
        # Add park filter
        if park_id:
            base_query += " AND a.park_id = :park_id"
            count_query += " AND a.park_id = :park_id"
            params["park_id"] = park_id
        
        # Get total count
        count_result = await db.execute(text(count_query), params)
        total = count_result.scalar() or 0
        
        # Add pagination and ordering
        base_query += " ORDER BY a.activity_date DESC LIMIT :limit OFFSET :offset"
        params.update({"limit": limit, "offset": offset})
        
        # Execute query
        result = await db.execute(text(base_query), params)
        items = result.fetchall()
        
        # Build response
        activity_items = [
            ActivityPublicOut(
                id=str(item.id),
                title=item.title or "",
                description=item.description or "",
                activity_date=str(item.activity_date) if item.activity_date else "",
                location=item.location or "",
                park_name=item.park_name or "",
                created_at=str(item.created_at) if item.created_at else "",
                updated_at=str(item.updated_at) if item.updated_at else ""
            ) for item in items
        ]
        
        return ActivityPublicListResponse(
            items=activity_items,
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
        
    except Exception as e:
        print(f"Error in get_activities: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/park/{park_id}", response_model=ActivityPublicListResponse)
async def get_activities_by_park(
    park_id: int,
    search: Optional[str] = Query(None, description="Search by activity title"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    """
    Get approved activities for a specific park
    """
    try:
        # Build query for specific park
        base_query = """
            SELECT a.id, a.title, a.description, a.activity_date, a.location, 
                   a.created_at, a.updated_at, p.name as park_name
            FROM activities a
            LEFT JOIN parks p ON a.park_id = p.id
            WHERE a.status = 'approved' AND a.park_id = :park_id
        """
        
        count_query = """
            SELECT COUNT(*)
            FROM activities a
            WHERE a.status = 'approved' AND a.park_id = :park_id
        """
        
        params = {"park_id": park_id}
        
        # Add search filter
        if search:
            base_query += " AND a.title ILIKE :search"
            count_query += " AND a.title ILIKE :search"
            params["search"] = f"%{search}%"
        
        # Get total count
        count_result = await db.execute(text(count_query), params)
        total = count_result.scalar() or 0
        
        # Add pagination and ordering
        base_query += " ORDER BY a.activity_date DESC LIMIT :limit OFFSET :offset"
        params.update({"limit": limit, "offset": offset})
        
        # Execute query
        result = await db.execute(text(base_query), params)
        items = result.fetchall()
        
        # Build response
        activity_items = [
            ActivityPublicOut(
                id=str(item.id),
                title=item.title or "",
                description=item.description or "",
                activity_date=str(item.activity_date) if item.activity_date else "",
                location=item.location or "",
                park_name=item.park_name or "",
                created_at=str(item.created_at) if item.created_at else "",
                updated_at=str(item.updated_at) if item.updated_at else ""
            ) for item in items
        ]
        
        return ActivityPublicListResponse(
            items=activity_items,
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
        
    except Exception as e:
        print(f"Error in get_activities_by_park: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/{activity_id}", response_model=ActivityPublicOut)
async def get_activity_by_id(
    activity_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get a specific approved activity by ID
    """
    try:
        query = text("""
            SELECT a.id, a.title, a.description, a.activity_date, a.location, 
                   a.created_at, a.updated_at, p.name as park_name
            FROM activities a
            LEFT JOIN parks p ON a.park_id = p.id
            WHERE a.id = :activity_id AND a.status = 'approved'
        """)
        
        result = await db.execute(query, {"activity_id": activity_id})
        item = result.fetchone()
        
        if not item:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        return ActivityPublicOut(
            id=str(item.id),
            title=item.title or "",
            description=item.description or "",
            activity_date=str(item.activity_date) if item.activity_date else "",
            location=item.location or "",
            park_name=item.park_name or "",
            created_at=str(item.created_at) if item.created_at else "",
            updated_at=str(item.updated_at) if item.updated_at else ""
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_activity_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
