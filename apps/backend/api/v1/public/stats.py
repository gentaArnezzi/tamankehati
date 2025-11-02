from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.v1.serializers.public import StatsResponse
from core.database.session import get_session
from typing import List
from pydantic import BaseModel

router = APIRouter()




@router.get("/", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_session)
):
    """
    Get public statistics - only approved items, exclude deleted
    """
    try:
        # Get flora count (approved only, exclude deleted)
        flora_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE status = 'approved'
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        flora_result = await db.execute(flora_query)
        total_flora = flora_result.scalar() or 0

        # Get fauna count (approved only, exclude deleted)
        fauna_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved'
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        fauna_result = await db.execute(fauna_query)
        total_fauna = fauna_result.scalar() or 0

        # Get taman count (published/approved only, exclude deleted)
        taman_query = text("""
            SELECT COUNT(*) FROM parks 
            WHERE status IN ('approved', 'published')
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        taman_result = await db.execute(taman_query)
        total_taman = taman_result.scalar() or 0

        # Get artikel count (approved only, exclude deleted if column exists)
        artikel_query = text("""
            SELECT COUNT(*) FROM articles 
            WHERE status = 'approved'
        """)
        artikel_result = await db.execute(artikel_query)
        total_artikel = artikel_result.scalar() or 0

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=total_taman,
            total_artikel=total_artikel
        )
    except Exception as e:
        print(f"Error getting public stats: {e}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0
        )


@router.get("/park/{park_id}", response_model=StatsResponse)
async def get_park_stats(
    park_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get statistics for a specific park.
    """
    try:
        # Get flora count for this park (approved and not deleted)
        flora_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE park_id = :park_id 
            AND status = 'approved' 
            AND deleted_at IS NULL
        """)
        flora_result = await db.execute(flora_query, {"park_id": park_id})
        total_flora = flora_result.scalar() or 0
        
        # Debug: log all flora for this park to help troubleshoot
        debug_query = text("""
            SELECT id, nama_ilmiah, status, deleted_at 
            FROM flora 
            WHERE park_id = :park_id
            ORDER BY id
        """)
        debug_result = await db.execute(debug_query, {"park_id": park_id})
        debug_rows = debug_result.fetchall()
        print(f"🔍 Debug - Park {park_id} flora count breakdown:")
        print(f"   Total flora (all status): {len(debug_rows)}")
        approved_count = sum(1 for row in debug_rows if row[2] == 'approved' and row[3] is None)
        print(f"   Approved & not deleted: {approved_count}")
        print(f"   Query result: {total_flora}")
        for row in debug_rows:
            deleted_status = "DELETED" if row[3] else "active"
            print(f"   - ID: {row[0]}, Nama: {row[1]}, Status: {row[2]}, {deleted_status}")

        # Get fauna count for this park (approved and not deleted)
        fauna_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE park_id = :park_id 
            AND status = 'approved' 
            AND deleted_at IS NULL
        """)
        fauna_result = await db.execute(fauna_query, {"park_id": park_id})
        total_fauna = fauna_result.scalar() or 0
        
        # Debug: log all fauna for this park to help troubleshoot
        fauna_debug_query = text("""
            SELECT id, nama_ilmiah, status, deleted_at 
            FROM fauna 
            WHERE park_id = :park_id
            ORDER BY id
        """)
        fauna_debug_result = await db.execute(fauna_debug_query, {"park_id": park_id})
        fauna_debug_rows = fauna_debug_result.fetchall()
        print(f"🔍 Debug - Park {park_id} fauna count breakdown:")
        print(f"   Total fauna (all status): {len(fauna_debug_rows)}")
        fauna_approved_count = sum(1 for row in fauna_debug_rows if row[2] == 'approved' and row[3] is None)
        print(f"   Approved & not deleted: {fauna_approved_count}")
        print(f"   Query result: {total_fauna}")
        for row in fauna_debug_rows:
            deleted_status = "DELETED" if row[3] else "active"
            print(f"   - ID: {row[0]}, Nama: {row[1]}, Status: {row[2]}, {deleted_status}")

        # Get activities count for this park (approved and not deleted)
        activities_query = text("""
            SELECT COUNT(*) FROM activities 
            WHERE park_id = :park_id 
            AND status = 'approved' 
            AND deleted_at IS NULL
        """)
        activities_result = await db.execute(activities_query, {"park_id": park_id})
        total_activities = activities_result.scalar() or 0
        
        # Debug: log all activities for this park to help troubleshoot
        activities_debug_query = text("""
            SELECT id, title, status, deleted_at 
            FROM activities 
            WHERE park_id = :park_id
            ORDER BY id
        """)
        activities_debug_result = await db.execute(activities_debug_query, {"park_id": park_id})
        activities_debug_rows = activities_debug_result.fetchall()
        print(f"🔍 Debug - Park {park_id} activities count breakdown:")
        print(f"   Total activities (all status): {len(activities_debug_rows)}")
        activities_approved_count = sum(1 for row in activities_debug_rows if row[2] == 'approved' and row[3] is None)
        print(f"   Approved & not deleted: {activities_approved_count}")
        print(f"   Query result: {total_activities}")
        for row in activities_debug_rows:
            deleted_status = "DELETED" if row[3] else "active"
            print(f"   - ID: {row[0]}, Title: {row[1]}, Status: {row[2]}, {deleted_status}")

        # Get artikel count - since articles don't have park_id, return 0 for now
        total_artikel = 0

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=0,  # This is for the park itself, not relevant here
            total_artikel=total_activities  # Use activities count instead of articles
        )
    except Exception as e:
        print(f"Error getting park stats: {e}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0
        )

