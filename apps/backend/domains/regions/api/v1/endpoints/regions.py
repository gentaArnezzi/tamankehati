from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from sqlalchemy.orm import selectinload

from core.database.session import get_session
from domains.regions.models.region import Region as RegionModel
from domains.regions.schemas.region import Region, RegionCreate, RegionUpdate

router = APIRouter()

@router.get("/")
async def list_regions(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_session)
):
    """
    Retrieve a list of regions with optional filtering.
    """
    try:
        # Simple SQL query without parameters
        from sqlalchemy import text
        query = text("SELECT id, name, code, is_active, created_at, updated_at FROM regions ORDER BY id")
        
        result = await db.execute(query)
        rows = result.fetchall()
        
        # Convert to dict format
        regions = []
        for row in rows:
            regions.append({
                "id": row[0],
                "name": row[1], 
                "code": row[2],
                "is_active": row[3],
                "created_at": row[4].isoformat() if row[4] else None,
                "updated_at": row[5].isoformat() if row[5] else None
            })
        
        return regions
    except Exception as e:
        print(f"Error in list_regions: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/", response_model=Region, status_code=status.HTTP_201_CREATED)
async def create_region(
    region_in: RegionCreate,
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new region.
    """
    # Check if region with same code already exists
    existing_region = await db.execute(
        select(RegionModel).where(RegionModel.code == region_in.code)
    )
    if existing_region.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Region with this code already exists"
        )
    
    db_region = RegionModel(**region_in.dict())
    db.add(db_region)
    await db.commit()
    await db.refresh(db_region)
    return db_region

@router.get("/{region_id}", response_model=Region)
async def read_region(
    region_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get a specific region by ID.
    """
    result = await db.execute(
        select(RegionModel).where(RegionModel.id == region_id)
    )
    region = result.scalars().first()
    
    if region is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Region not found"
        )
        
    return region

@router.put("/{region_id}", response_model=Region)
async def update_region(
    region_id: int,
    region_in: RegionUpdate,
    db: AsyncSession = Depends(get_session)
):
    """
    Update a region.
    """
    result = await db.execute(
        select(RegionModel).where(RegionModel.id == region_id)
    )
    db_region = result.scalars().first()
    
    if db_region is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Region not found"
        )
    
    update_data = region_in.dict(exclude_unset=True)
    
    # Check if updating code would cause a conflict
    if 'code' in update_data and update_data['code'] != db_region.code:
        existing_region = await db.execute(
            select(RegionModel).where(RegionModel.code == update_data['code'])
        )
        if existing_region.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Region with this code already exists"
            )
    
    for field, value in update_data.items():
        setattr(db_region, field, value)
    
    await db.commit()
    await db.refresh(db_region)
    return db_region

@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_region(
    region_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Delete a region.
    """
    result = await db.execute(
        select(RegionModel).where(RegionModel.id == region_id)
    )
    db_region = result.scalars().first()
    
    if db_region is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Region not found"
        )
    
    await db.delete(db_region)
    await db.commit()
    
    return None
