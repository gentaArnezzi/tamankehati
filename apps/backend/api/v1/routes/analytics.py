# apps/backend/api/v1/routes/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from io import StringIO
import csv

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from core.database.session import get_session  # pastikan ini ada
from domains.analytics.services import endemic_by_user
from api.v1.permissions.rbac import current_user
from users.models import UserRole

router = APIRouter(prefix="/analytics")

@router.get("/", response_model=None)
async def analytics_root():
    """Get available analytics endpoints."""
    return {
        "message": "Analytics API",
        "available_endpoints": [
            "/analytics/users/{user_id}/endemic",
            "/analytics/users/{user_id}/endemic.csv",
            "/analytics/users/{user_id}/iucn",
            "/analytics/users/{user_id}/iucn.csv",
            "/analytics/dashboard"
        ]
    }

@router.get("/users/{user_id}/endemic", response_model=None)
async def analytics_endemic(user_id: int, db: AsyncSession = Depends(get_session), user=Depends(current_user)):
    if user.role == UserRole.regional_admin and user.id != user_id:
        raise HTTPException(403, "Forbidden: Access to other user's data")
    data = await endemic_by_user(db, user_id)
    return {"user_id": user_id, **data}

@router.get("/users/{user_id}/endemic.csv", response_model=None)
async def analytics_endemic_csv(user_id: int, db: AsyncSession = Depends(get_session), user=Depends(current_user)):
    if user.role == UserRole.regional_admin and user.id != user_id:
        raise HTTPException(403, "Forbidden: Access to other user's data")
    data = await endemic_by_user(db, user_id)

    buf = StringIO()
    writer = csv.writer(buf)
    writer.writerow(["user_id", "flora_endemic", "fauna_endemic"])
    writer.writerow([user_id, data["flora_endemic"], data["fauna_endemic"]])

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="endemic_user_{user_id}.csv"'},
    )

@router.get("/users/{user_id}/iucn", response_model=None)
async def analytics_iucn(user_id: int, db: AsyncSession = Depends(get_session), user=Depends(current_user)):
    if user.role == UserRole.regional_admin and user.id != user_id:
        raise HTTPException(403, "Forbidden: Access to other user's data")
    # For now, return empty data since we don't have user-based iucn analytics yet
    return {"user_id": user_id, "items": []}

@router.get("/users/{user_id}/iucn.csv", response_model=None)
async def analytics_iucn_csv(user_id: int, db: AsyncSession = Depends(get_session), user=Depends(current_user)):
    if user.role == UserRole.regional_admin and user.id != user_id:
        raise HTTPException(403, "Forbidden: Access to other user's data")
    # For now, return empty CSV since we don't have user-based iucn analytics yet
    buf = StringIO()
    writer = csv.writer(buf)
    writer.writerow(["user_id", "kingdom", "status", "count"])
    # No data for now
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="iucn_user_{user_id}.csv"'},
    )

@router.get("/dashboard", response_model=None)
async def get_dashboard(db: AsyncSession = Depends(get_session), user=Depends(current_user)):
    """Get dashboard statistics based on user role."""
    try:
        # Base filters - using park-based scoping
        park_filter = ""
        params = {}
        
        if user.role == UserRole.regional_admin and hasattr(user, 'park_id') and user.park_id:
            park_filter = "AND p.id = :park_id"
            params["park_id"] = user.park_id

        # ✅ Flora stats - ONLY APPROVED untuk analytics statistics
        # ✅ EXCLUDE draft, rejected, deleted data
        flora_sql = f"""
            SELECT
                COUNT(*) as total,
                COUNT(*) as approved,
                0 as in_review,
                COALESCE(SUM(CASE WHEN f.is_endemic = true THEN 1 ELSE 0 END), 0) as endemic
            FROM flora f
            JOIN parks p ON f.park_id = p.id
            WHERE f.status = 'approved' AND f.deleted_at IS NULL {park_filter}
        """
        flora_result = await db.execute(text(flora_sql), params)
        flora_stats = flora_result.first() or (0, 0, 0, 0)

        # ✅ Fauna stats - ONLY APPROVED untuk analytics statistics
        # ✅ EXCLUDE draft, rejected, deleted data
        fauna_sql = f"""
            SELECT
                COUNT(*) as total,
                COUNT(*) as approved,
                0 as in_review,
                COALESCE(SUM(CASE WHEN f.is_endemic = true THEN 1 ELSE 0 END), 0) as endemic
            FROM fauna f
            JOIN parks p ON f.park_id = p.id
            WHERE f.status = 'approved' AND f.deleted_at IS NULL {park_filter}
        """
        fauna_result = await db.execute(text(fauna_sql), params)
        fauna_stats = fauna_result.first() or (0, 0, 0, 0)

        # Parks stats
        parks_sql = f"""
            SELECT COUNT(*) as total_parks
            FROM parks p
            WHERE 1=1 {park_filter}
        """
        parks_result = await db.execute(text(parks_sql), params)
        parks_count = parks_result.scalar() or 0

        # Get role value safely
        role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)

        return {
            "role": role_value,
            "park_id": getattr(user, 'park_id', None),
            "flora": {
                "total": int(flora_stats[0] or 0),
                "approved": int(flora_stats[1] or 0),
                "in_review": int(flora_stats[2] or 0),
                "endemic": int(flora_stats[3] or 0)
            },
            "fauna": {
                "total": int(fauna_stats[0] or 0),
                "approved": int(fauna_stats[1] or 0),
                "in_review": int(fauna_stats[2] or 0),
                "endemic": int(fauna_stats[3] or 0)
            },
            "parks": {
                "total": int(parks_count)
            },
            "status": "success"
        }
    except Exception as e:
        print(f"Error in analytics dashboard: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")
