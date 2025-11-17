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
            AND deleted_at IS NULL
        """)
        flora_result = await db.execute(flora_query)
        total_flora = flora_result.scalar() or 0
        
        # Debug: check total flora regardless of status
        flora_debug_query = text("SELECT COUNT(*) FROM flora")
        flora_debug_result = await db.execute(flora_debug_query)
        total_flora_all = flora_debug_result.scalar() or 0
        
        flora_debug_status_query = text("SELECT status, COUNT(*) FROM flora GROUP BY status")
        flora_debug_status_result = await db.execute(flora_debug_status_query)
        flora_status_counts = flora_debug_status_result.fetchall()
        
        print(f"🔍 Debug - General stats flora breakdown:")
        print(f"   Total flora (all status): {total_flora_all}")
        print(f"   Approved & not deleted: {total_flora}")
        print(f"   Status breakdown: {dict(flora_status_counts)}")

        # Get fauna count (approved only, exclude deleted)
        fauna_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved'
            AND deleted_at IS NULL
        """)
        fauna_result = await db.execute(fauna_query)
        total_fauna = fauna_result.scalar() or 0
        
        # Debug: check total fauna regardless of status
        fauna_debug_query = text("SELECT COUNT(*) FROM fauna")
        fauna_debug_result = await db.execute(fauna_debug_query)
        total_fauna_all = fauna_debug_result.scalar() or 0
        
        fauna_debug_status_query = text("SELECT status, COUNT(*) FROM fauna GROUP BY status")
        fauna_debug_status_result = await db.execute(fauna_debug_status_query)
        fauna_status_counts = fauna_debug_status_result.fetchall()
        
        print(f"🔍 Debug - General stats fauna breakdown:")
        print(f"   Total fauna (all status): {total_fauna_all}")
        print(f"   Approved & not deleted: {total_fauna}")
        print(f"   Status breakdown: {dict(fauna_status_counts)}")

        # Get taman count (published/approved only, exclude deleted)
        taman_query = text("""
            SELECT COUNT(*) FROM parks 
            WHERE status IN ('approved', 'published')
            AND deleted_at IS NULL
        """)
        taman_result = await db.execute(taman_query)
        total_taman = taman_result.scalar() or 0
        
        # Debug: check total parks regardless of status
        taman_debug_query = text("SELECT COUNT(*) FROM parks")
        taman_debug_result = await db.execute(taman_debug_query)
        total_taman_all = taman_debug_result.scalar() or 0
        
        taman_debug_status_query = text("SELECT status, COUNT(*) FROM parks GROUP BY status")
        taman_debug_status_result = await db.execute(taman_debug_status_query)
        taman_status_counts = taman_debug_status_result.fetchall()
        
        print(f"🔍 Debug - General stats taman breakdown:")
        print(f"   Total taman (all status): {total_taman_all}")
        print(f"   Approved/Published & not deleted: {total_taman}")
        print(f"   Status breakdown: {dict(taman_status_counts)}")

        # Get unique provinces from approved parks
        provinsi_query = text("""
            SELECT COUNT(DISTINCT provinsi)
            FROM parks
            WHERE status IN ('approved', 'published')
            AND deleted_at IS NULL
            AND provinsi IS NOT NULL
            AND provinsi <> ''
        """)
        provinsi_result = await db.execute(provinsi_query)
        total_provinsi = provinsi_result.scalar() or 0

        # Get unique flora families (approved & not deleted)
        flora_family_query = text("""
            SELECT COUNT(DISTINCT family)
            FROM flora
            WHERE status = 'approved'
            AND deleted_at IS NULL
            AND family IS NOT NULL
            AND family <> ''
        """)
        flora_family_result = await db.execute(flora_family_query)
        total_famili_flora = flora_family_result.scalar() or 0
        
        # Get artikel count (approved only, exclude deleted if column exists)
        # Check if deleted_at column exists for articles
        try:
            artikel_query = text("""
                SELECT COUNT(*) FROM articles 
                WHERE status = 'approved'
                AND deleted_at IS NULL
            """)
            artikel_result = await db.execute(artikel_query)
            total_artikel = artikel_result.scalar() or 0
        except Exception:
            # If deleted_at doesn't exist, try without it
            artikel_query = text("""
                SELECT COUNT(*) FROM articles 
                WHERE status = 'approved'
            """)
            artikel_result = await db.execute(artikel_query)
            total_artikel = artikel_result.scalar() or 0
        
        print(f"🔍 Debug - General stats artikel: {total_artikel}")

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=total_taman,
            total_artikel=total_artikel,
            total_provinsi=total_provinsi,
            total_famili_flora=total_famili_flora
        )
    except Exception as e:
        import traceback
        print(f"❌ Error getting public stats: {e}")
        print(f"   Traceback: {traceback.format_exc()}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0,
            total_provinsi=0,
            total_famili_flora=0
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
        try:
            debug_query = text("""
                SELECT id, scientific_name, status, deleted_at 
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
            for row in debug_rows[:10]:  # Limit to first 10 for readability
                deleted_status = "DELETED" if row[3] else "active"
                nama = row[1] or "N/A"
                print(f"   - ID: {row[0]}, Nama: {nama}, Status: {row[2]}, {deleted_status}")
        except Exception as debug_error:
            print(f"⚠️  Debug query error for flora: {debug_error}")

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
        try:
            fauna_debug_query = text("""
                SELECT id, scientific_name, status, deleted_at 
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
            for row in fauna_debug_rows[:10]:  # Limit to first 10 for readability
                deleted_status = "DELETED" if row[3] else "active"
                nama = row[1] or "N/A"
                print(f"   - ID: {row[0]}, Nama: {nama}, Status: {row[2]}, {deleted_status}")
        except Exception as debug_error:
            print(f"⚠️  Debug query error for fauna: {debug_error}")

        # Get activities count for this park (approved only)
        # Note: activities table doesn't have deleted_at column, only rejected_at
        # So we only filter by status = 'approved'
        activities_query = text("""
            SELECT COUNT(*) FROM activities 
            WHERE park_id = :park_id 
            AND status = 'approved'
        """)
        activities_result = await db.execute(activities_query, {"park_id": park_id})
        total_activities = activities_result.scalar() or 0
        
        # Debug: log all activities for this park to help troubleshoot
        try:
            activities_debug_query = text("""
                SELECT id, title, status, rejected_at 
                FROM activities 
                WHERE park_id = :park_id
                ORDER BY id
            """)
            activities_debug_result = await db.execute(activities_debug_query, {"park_id": park_id})
            activities_debug_rows = activities_debug_result.fetchall()
            print(f"🔍 Debug - Park {park_id} activities count breakdown:")
            print(f"   Total activities (all status): {len(activities_debug_rows)}")
            activities_approved_count = sum(1 for row in activities_debug_rows if row[2] == 'approved')
            print(f"   Approved: {activities_approved_count}")
            print(f"   Query result: {total_activities}")
            for row in activities_debug_rows[:10]:  # Limit to first 10 for readability
                rejected_status = "REJECTED" if row[3] else "active"
                title = row[1] or "N/A"
                print(f"   - ID: {row[0]}, Title: {title}, Status: {row[2]}, {rejected_status}")
        except Exception as debug_error:
            print(f"⚠️  Debug query error for activities: {debug_error}")

        # Get artikel count - since articles don't have park_id, return 0 for now
        total_artikel = 0

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=0,  # This is for the park itself, not relevant here
            total_artikel=total_activities  # Use activities count instead of articles
        )
    except Exception as e:
        import traceback
        print(f"❌ Error getting park stats for park {park_id}: {e}")
        print(f"   Traceback: {traceback.format_exc()}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0
        )

