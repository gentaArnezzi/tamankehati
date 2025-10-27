from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta
from core.database.session import get_session
from api.v1.permissions.rbac import current_user
from users.models import User

router = APIRouter(prefix="/dashboard")

@router.get("")
@router.get("/")
async def get_dashboard(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get dashboard data for authenticated users"""
    try:
        # Filter by user for Regional Admin
        user_filter = ""
        filter_params = {}
        if user.role == "regional_admin":
            user_filter = "AND submitted_by = :user_id"
            filter_params = {"user_id": user.id}
        
        # Get real statistics from database
        # Count pending approvals (status != 'approved' AND status != 'rejected')
        # This includes 'in_review', 'draft', and any other pending status
        # Regional Admin: only their submitted data
        # Super Admin: all data
        pending_sql = f"""
            SELECT 
                (SELECT COUNT(*) FROM flora WHERE status NOT IN ('approved', 'rejected') {user_filter}) +
                (SELECT COUNT(*) FROM fauna WHERE status NOT IN ('approved', 'rejected') {user_filter}) +
                (SELECT COUNT(*) FROM parks WHERE status NOT IN ('approved', 'rejected') {user_filter}) +
                (SELECT COUNT(*) FROM activities WHERE status NOT IN ('approved', 'rejected') {user_filter}) as total_pending
        """
        pending_result = await db.execute(text(pending_sql), filter_params)
        pending_approvals = pending_result.scalar() or 0
        
        # Count users (Super Admin only, Regional Admin sees 0)
        if user.role == "super_admin":
            users_sql = "SELECT COUNT(*) FROM users"
            users_result = await db.execute(text(users_sql))
            total_users = users_result.scalar() or 0
        else:
            total_users = 0
        
        # Count articles (approved flora)
        articles_sql = f"SELECT COUNT(*) FROM flora WHERE status = 'approved' {user_filter}"
        articles_result = await db.execute(text(articles_sql), filter_params)
        total_articles = articles_result.scalar() or 0
        
        # Count announcements (Super Admin only)
        if user.role == "super_admin":
            announcements_sql = "SELECT COUNT(*) FROM announcements WHERE status = 'published'"
            announcements_result = await db.execute(text(announcements_sql))
            total_announcements = announcements_result.scalar() or 0
        else:
            total_announcements = 0
        
        # Count flora and fauna
        flora_sql = f"SELECT COUNT(*) FROM flora {('WHERE ' + user_filter.replace('AND ', '')) if user_filter else ''}"
        flora_result = await db.execute(text(flora_sql), filter_params)
        total_flora = flora_result.scalar() or 0
        
        fauna_sql = f"SELECT COUNT(*) FROM fauna {('WHERE ' + user_filter.replace('AND ', '')) if user_filter else ''}"
        fauna_result = await db.execute(text(fauna_sql), filter_params)
        total_fauna = fauna_result.scalar() or 0
        
        # Count parks
        parks_sql = f"SELECT COUNT(*) FROM parks {('WHERE ' + user_filter.replace('AND ', '')) if user_filter else ''}"
        parks_result = await db.execute(text(parks_sql), filter_params)
        total_parks = parks_result.scalar() or 0
        
        return {
            "role": user.role,
            "pending_approvals": pending_approvals,
            "pending_approval": pending_approvals,  # alias for compatibility
            "total_users": total_users,
            "total_flora": total_articles,  # Using articles count
            "total_zones": total_announcements,  # Using announcements count (legacy)
            "total_announcements": total_announcements,  # New key for announcements
            "total_taman": total_parks,
            "total_observasi": 0,  # Can be calculated if needed
            "regional_breakdown": [],
            # Legacy format support
            "stats": {
                "parks": {"total": total_parks},
                "regions": {"total": 0},
                "users": {"total": total_users},
                "flora": {"total": total_flora},
                "fauna": {"total": total_fauna},
                "articles": {"total": total_articles},
                "galleries": {"total": total_announcements}
            }
        }
    except Exception as e:
        # Return zeros on error to prevent crashes
        return {
            "role": "super_admin",
            "pending_approvals": 0,
            "pending_approval": 0,
            "total_users": 0,
            "total_flora": 0,
            "total_zones": 0,
            "total_announcements": 0,
            "total_taman": 0,
            "total_observasi": 0,
            "regional_breakdown": [],
            "stats": {
                "parks": {"total": 0},
                "regions": {"total": 0},
                "users": {"total": 0},
                "flora": {"total": 0},
                "fauna": {"total": 0},
                "articles": {"total": 0},
                "galleries": {"total": 0}
            },
            "error": str(e)
        }

@router.get("/activity")
async def get_recent_activity(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get recent activity for dashboard"""
    return {
        "activities": [
            {
                "id": 1,
                "type": "observasi",
                "description": "Aktivitas terbaru",
                "user": "Sistem",
                "timestamp": "2025-01-01T00:00:00Z"
            }
        ]
    }

@router.get("/approvals")
async def get_pending_approvals(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Get pending approvals for dashboard"""
    return {
        "approvals": []
    }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MIGRATED FROM dashboard_simple_test.py
# These endpoints were previously in a separate router causing confusion
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/test")
async def test_dashboard(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Test dashboard endpoint - verify database connectivity"""
    try:
        # Simple test query
        result = await db.execute(text("SELECT COUNT(*) as count FROM parks"))
        park_count = result.scalar() or 0
        
        return {
            "status": "success",
            "user_role": user.role,
            "park_count": park_count,
            "message": "Dashboard test successful"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Dashboard test failed"
        }

@router.get("/overview-simple")
async def get_overview_simple(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Simple overview dashboard - basic entity counts"""
    try:
        # Get basic counts
        parks_result = await db.execute(text("SELECT COUNT(*) FROM parks"))
        parks_count = parks_result.scalar() or 0
        
        flora_result = await db.execute(text("SELECT COUNT(*) FROM flora"))
        flora_count = flora_result.scalar() or 0
        
        fauna_result = await db.execute(text("SELECT COUNT(*) FROM fauna"))
        fauna_count = fauna_result.scalar() or 0
        
        users_result = await db.execute(text("SELECT COUNT(*) FROM users"))
        users_count = users_result.scalar() or 0
        
        return {
            "user_role": user.role,
            "overview": {
                "parks": parks_count,
                "flora": flora_count,
                "fauna": fauna_count,
                "users": users_count
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@router.get("/comprehensive-simple")
async def get_comprehensive_simple(
    time_range: str = "yearly",
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """
    Comprehensive dashboard with analytics and time-based filtering.
    
    Used by: /dashboard/comprehensive-simple page (frontend)
    
    Time ranges: daily, weekly, monthly, quarterly, yearly, five_years
    """
    try:
        # Get time range boundaries
        end_date = datetime.now()
        
        if time_range == "daily":
            start_date = end_date - timedelta(days=1)
        elif time_range == "weekly":
            start_date = end_date - timedelta(weeks=1)
        elif time_range == "monthly":
            start_date = end_date - timedelta(days=30)
        elif time_range == "quarterly":
            start_date = end_date - timedelta(days=90)
        elif time_range == "yearly":
            start_date = end_date - timedelta(days=365)
        elif time_range == "five_years":
            start_date = end_date - timedelta(days=1825)
        else:
            start_date = end_date - timedelta(days=365)
        
        # Base filters based on user role
        # Regional Admin: See ONLY data they submitted (submitted_by = user.id)
        # Super Admin: See all data
        user_filter = ""
        filter_params = {}
        
        if user.role == "regional_admin":
            # Always filter by submitted_by for regional admin
            user_filter = "AND f.submitted_by = :user_id"
            filter_params = {"user_id": user.id}
        
        # Get basic counts and area data
        # For parks: Regional Admin sees only parks they submitted
        parks_filter = ""
        if user.role == "regional_admin":
            parks_filter = "AND p.submitted_by = :user_id"
        
        parks_sql = f"""
            SELECT 
                COUNT(*) as total_parks,
                COALESCE(SUM(p.area_ha), 0) as total_area_ha,
                COALESCE(AVG(p.area_ha), 0) as avg_area_ha
            FROM parks p
            WHERE p.created_at >= :start_date AND p.created_at <= :end_date {parks_filter}
        """
        
        parks_params = {"start_date": start_date, "end_date": end_date}
        if user.role == "regional_admin":
            parks_params["user_id"] = user.id
        parks_result = await db.execute(text(parks_sql), parks_params)
        parks_data = parks_result.first()
        parks_count = parks_data[0] or 0
        total_area_ha = parks_data[1] or 0
        avg_area_ha = parks_data[2] or 0
        
        # Flora counts - filter by submitted_by for Regional Admin
        flora_sql = f"""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN f.is_endemic = true THEN 1 END) as endemic,
                COUNT(CASE WHEN f.status = 'approved' THEN 1 END) as approved
            FROM flora f
            WHERE f.created_at >= :start_date AND f.created_at <= :end_date {user_filter}
        """
        
        flora_result = await db.execute(text(flora_sql), {**filter_params, "start_date": start_date, "end_date": end_date})
        flora_data = flora_result.first()
        
        # Fauna counts - filter by submitted_by for Regional Admin
        fauna_sql = f"""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN f.is_endemic = true THEN 1 END) as endemic,
                COUNT(CASE WHEN f.status = 'approved' THEN 1 END) as approved
            FROM fauna f
            WHERE f.created_at >= :start_date AND f.created_at <= :end_date {user_filter}
        """
        
        fauna_result = await db.execute(text(fauna_sql), {**filter_params, "start_date": start_date, "end_date": end_date})
        fauna_data = fauna_result.first()
        
        # Activities count - filter by submitted_by for Regional Admin
        activities_filter = ""
        if user.role == "regional_admin":
            activities_filter = "AND a.submitted_by = :user_id"
        
        activities_sql = f"""
            SELECT COUNT(*) as total_activities
            FROM activities a
            WHERE a.created_at >= :start_date AND a.created_at <= :end_date {activities_filter}
        """
        
        activities_params = {"start_date": start_date, "end_date": end_date}
        if user.role == "regional_admin":
            activities_params["user_id"] = user.id
        activities_result = await db.execute(text(activities_sql), activities_params)
        activities_count = activities_result.scalar() or 0
        
        # Get monthly discoveries trend (for line charts)
        # For regional admin, replace "f.submitted_by" with "submitted_by" in subquery
        monthly_user_filter = user_filter.replace('f.submitted_by', 'submitted_by') if user_filter else ''
        
        monthly_sql = f"""
            SELECT 
                TO_CHAR(created_at, 'Mon') as month,
                EXTRACT(MONTH FROM created_at) as month_num,
                COUNT(*) as discoveries
            FROM (
                SELECT created_at FROM flora WHERE created_at >= :start_date AND created_at <= :end_date {monthly_user_filter}
                UNION ALL
                SELECT created_at FROM fauna WHERE created_at >= :start_date AND created_at <= :end_date {monthly_user_filter}
            ) combined
            GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
            ORDER BY month_num
        """
        
        monthly_params = {"start_date": start_date, "end_date": end_date}
        if user.role == "regional_admin":
            monthly_params["user_id"] = user.id
        monthly_result = await db.execute(text(monthly_sql), monthly_params)
        monthly_discoveries = [
            {"month": row[0], "discoveries": row[2], "month_num": row[1]}
            for row in monthly_result.fetchall()
        ]
        
        # Get regional/park distribution (for regional admins, show their parks only)
        if user.role == "super_admin":
            # Super admin sees distribution by province
            # Only count parks with provinsi (skip NULL values)
            regional_sql = """
                SELECT 
                    p.provinsi as region,
                    COUNT(DISTINCT p.id) as parks,
                    COUNT(DISTINCT f.id) as flora,
                    COUNT(DISTINCT fa.id) as fauna
                FROM parks p
                LEFT JOIN flora f ON f.park_id = p.id AND f.created_at >= :start_date AND f.created_at <= :end_date
                LEFT JOIN fauna fa ON fa.park_id = p.id AND fa.created_at >= :start_date AND fa.created_at <= :end_date
                WHERE p.provinsi IS NOT NULL 
                    AND p.provinsi != ''
                    AND p.created_at >= :start_date 
                    AND p.created_at <= :end_date
                GROUP BY p.provinsi
                ORDER BY (COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id)) DESC, parks DESC
                LIMIT 10
            """
            regional_result = await db.execute(text(regional_sql), {"start_date": start_date, "end_date": end_date})
        else:
            # Regional admin sees parks they submitted with their flora/fauna
            regional_sql = f"""
                SELECT 
                    p.name as region,
                    1 as parks,
                    COUNT(DISTINCT f.id) as flora,
                    COUNT(DISTINCT fa.id) as fauna
                FROM parks p
                LEFT JOIN flora f ON f.park_id = p.id AND f.submitted_by = :user_id
                LEFT JOIN fauna fa ON fa.park_id = p.id AND fa.submitted_by = :user_id
                WHERE p.submitted_by = :user_id 
                    AND p.created_at >= :start_date 
                    AND p.created_at <= :end_date
                GROUP BY p.name
                ORDER BY (COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id)) DESC
                LIMIT 10
            """
            regional_result = await db.execute(text(regional_sql), {**filter_params, "start_date": start_date, "end_date": end_date})
        
        regional_distribution = [
            {
                "region": row[0],
                "parks": row[1],
                "flora": row[2] or 0,
                "fauna": row[3] or 0
            }
            for row in regional_result.fetchall()
        ]
        
        # Get park details with species count
        # For regional admin, show only flora/fauna they submitted
        park_distribution_sql = f"""
            SELECT 
                p.name,
                COALESCE(p.area_ha, 0) as area,
                COUNT(DISTINCT f.id) + COUNT(DISTINCT fa.id) as species
            FROM parks p
            LEFT JOIN flora f ON f.park_id = p.id {'AND f.submitted_by = :user_id' if user.role == 'regional_admin' else ''}
            LEFT JOIN fauna fa ON fa.park_id = p.id {'AND fa.submitted_by = :user_id' if user.role == 'regional_admin' else ''}
            WHERE p.created_at >= :start_date AND p.created_at <= :end_date {parks_filter}
            GROUP BY p.name, p.area_ha
            ORDER BY species DESC
            LIMIT 8
        """
        
        park_dist_params = {"start_date": start_date, "end_date": end_date}
        if user.role == "regional_admin":
            park_dist_params["user_id"] = user.id
        park_dist_result = await db.execute(text(park_distribution_sql), park_dist_params)
        park_distribution = [
            {
                "name": row[0],
                "area": float(row[1]),
                "species": row[2]
            }
            for row in park_dist_result.fetchall()
        ]
        
        return {
            "user_role": user.role,
            "user_id": user.id,
            "park_id": getattr(user, 'park_id', None),
            "time_range": time_range,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "analytics": {
                "biodiversity": {
                    "flora": {
                        "total": flora_data[0] or 0,
                        "endemic": flora_data[1] or 0,
                        "approved": flora_data[2] or 0
                    },
                    "fauna": {
                        "total": fauna_data[0] or 0,
                        "endemic": fauna_data[1] or 0,
                        "approved": fauna_data[2] or 0
                    },
                    "summary": {
                        "total_species": (flora_data[0] or 0) + (fauna_data[0] or 0),
                        "total_endemic": (flora_data[1] or 0) + (fauna_data[1] or 0),
                        "total_approved": (flora_data[2] or 0) + (fauna_data[2] or 0),
                        "approval_rate": round(((flora_data[2] or 0) + (fauna_data[2] or 0)) / max((flora_data[0] or 0) + (fauna_data[0] or 0), 1) * 100, 1),
                        "endemic_rate": round(((flora_data[1] or 0) + (fauna_data[1] or 0)) / max((flora_data[0] or 0) + (fauna_data[0] or 0), 1) * 100, 1)
                    },
                    "monthly_discoveries": monthly_discoveries,
                    "regional_distribution": regional_distribution,
                    "park_distribution": park_distribution
                },
                "conservation": {
                    "parks": {
                        "total": parks_count,
                        "total_area_ha": total_area_ha,
                        "avg_area_ha": avg_area_ha
                    }
                },
                "activities": {
                    "total": activities_count
                }
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        # Return proper structure even on error to prevent frontend crashes
        print(f"Dashboard error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "user_role": user.role if user else "super_admin",
            "user_id": user.id if user else 0,
            "park_id": getattr(user, 'park_id', None) if user else None,
            "time_range": time_range,
            "date_range": {
                "start": start_date.isoformat() if 'start_date' in locals() else datetime.now().isoformat(),
                "end": end_date.isoformat() if 'end_date' in locals() else datetime.now().isoformat()
            },
            "analytics": {
                "biodiversity": {
                    "flora": {
                        "total": 0,
                        "endemic": 0,
                        "approved": 0
                    },
                    "fauna": {
                        "total": 0,
                        "endemic": 0,
                        "approved": 0
                    },
                    "summary": {
                        "total_species": 0,
                        "total_endemic": 0,
                        "total_approved": 0,
                        "approval_rate": 0,
                        "endemic_rate": 0
                    },
                    "monthly_discoveries": [],
                    "regional_distribution": [],
                    "park_distribution": []
                },
                "conservation": {
                    "parks": {
                        "total": 0,
                        "total_area_ha": 0,
                        "avg_area_ha": 0
                    }
                },
                "activities": {
                    "total": 0
                }
            },
            "generated_at": datetime.now().isoformat(),
            "error": str(e)
        }