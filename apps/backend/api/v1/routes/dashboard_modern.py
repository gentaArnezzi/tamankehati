# apps/backend/api/v1/routes/dashboard_modern.py
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, func, select, and_, or_
from core.database.session import get_session
from users.models import User
from api.v1.permissions.rbac import current_user
from api.v1.serializers.common import ErrorResponse

router = APIRouter(prefix="/dashboard-modern")

@router.get(
    "/",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
    },
)
async def get_modern_dashboard(
    time_range: str = Query("yearly", description="Time range: daily, weekly, monthly, yearly"),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """
    Get comprehensive dashboard data for modern dashboard UI.
    Returns real data from database based on user role and time range.
    """
    try:
        # Calculate date range
        end_date = datetime.now()
        if time_range == "daily":
            start_date = end_date - timedelta(days=1)
        elif time_range == "weekly":
            start_date = end_date - timedelta(weeks=1)
        elif time_range == "monthly":
            start_date = end_date - timedelta(days=30)
        elif time_range == "yearly":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=365)

        # Base filters based on user role
        user_filter = ""
        filter_params = {"start_date": start_date, "end_date": end_date}
        
        if user.role == "regional_admin":
            # Regional admin sees only data they submitted
            user_filter = "AND submitted_by = :user_id"
            filter_params["user_id"] = user.id

        # 1. BIODIVERSITY ANALYTICS
        biodiversity_data = await get_biodiversity_analytics(db, user_filter, filter_params)
        
        # 2. CONSERVATION ANALYTICS  
        conservation_data = await get_conservation_analytics(db, user_filter, filter_params)
        
        # 3. ACTIVITIES ANALYTICS
        activities_data = await get_activities_analytics(db, user_filter, filter_params)
        
        # 4. USER ANALYTICS
        users_data = await get_users_analytics(db, user.role)
        
        # 5. GEOGRAPHIC ANALYTICS
        geographic_data = await get_geographic_analytics(db, user_filter, filter_params)
        
        # 6. TEMPORAL ANALYTICS
        temporal_data = await get_temporal_analytics(db, user_filter, filter_params, time_range)
        
        # 7. PERFORMANCE METRICS
        performance_data = await get_performance_metrics(db, user_filter, filter_params)

        return {
            "user_role": user.role,
            "user_id": user.id,
            "park_id": user.park_id,
            "time_range": time_range,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "analytics": {
                "biodiversity": biodiversity_data,
                "conservation": conservation_data,
                "activities": activities_data,
                "users": users_data,
                "geographic": geographic_data,
                "temporal": temporal_data,
                "performance": performance_data
            },
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard data: {str(e)}")

async def get_biodiversity_analytics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any]) -> Dict[str, Any]:
    """Get biodiversity analytics data"""
    
    # Flora statistics
    flora_sql = f"""
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN is_endemic = true THEN 1 ELSE 0 END), 0) as endemic,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected,
            COALESCE(SUM(CASE WHEN iucn_status = 'CR' THEN 1 ELSE 0 END), 0) as critically_endangered,
            COALESCE(SUM(CASE WHEN iucn_status = 'EN' THEN 1 ELSE 0 END), 0) as endangered,
            COALESCE(SUM(CASE WHEN iucn_status = 'VU' THEN 1 ELSE 0 END), 0) as vulnerable,
            COALESCE(SUM(CASE WHEN iucn_status = 'NT' THEN 1 ELSE 0 END), 0) as near_threatened,
            COALESCE(SUM(CASE WHEN iucn_status = 'LC' THEN 1 ELSE 0 END), 0) as least_concern,
            COALESCE(SUM(CASE WHEN iucn_status = 'DD' THEN 1 ELSE 0 END), 0) as data_deficient,
            COALESCE(SUM(CASE WHEN iucn_status = 'NE' THEN 1 ELSE 0 END), 0) as not_evaluated
        FROM flora 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
    """
    
    flora_result = await db.execute(text(flora_sql), filter_params)
    flora_stats = flora_result.first()
    
    # Fauna statistics
    fauna_sql = f"""
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN is_endemic = true THEN 1 ELSE 0 END), 0) as endemic,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected,
            COALESCE(SUM(CASE WHEN iucn_status = 'CR' THEN 1 ELSE 0 END), 0) as critically_endangered,
            COALESCE(SUM(CASE WHEN iucn_status = 'EN' THEN 1 ELSE 0 END), 0) as endangered,
            COALESCE(SUM(CASE WHEN iucn_status = 'VU' THEN 1 ELSE 0 END), 0) as vulnerable,
            COALESCE(SUM(CASE WHEN iucn_status = 'NT' THEN 1 ELSE 0 END), 0) as near_threatened,
            COALESCE(SUM(CASE WHEN iucn_status = 'LC' THEN 1 ELSE 0 END), 0) as least_concern,
            COALESCE(SUM(CASE WHEN iucn_status = 'DD' THEN 1 ELSE 0 END), 0) as data_deficient,
            COALESCE(SUM(CASE WHEN iucn_status = 'NE' THEN 1 ELSE 0 END), 0) as not_evaluated
        FROM fauna 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
    """
    
    fauna_result = await db.execute(text(fauna_sql), filter_params)
    fauna_stats = fauna_result.first()
    
    # Summary
    total_species = (flora_stats.total or 0) + (fauna_stats.total or 0)
    total_endemic = (flora_stats.endemic or 0) + (fauna_stats.endemic or 0)
    total_approved = (flora_stats.approved or 0) + (fauna_stats.approved or 0)
    
    return {
        "summary": {
            "total_species": total_species,
            "total_endemic": total_endemic,
            "total_approved": total_approved,
            "total_pending": (flora_stats.pending or 0) + (fauna_stats.pending or 0),
            "total_rejected": (flora_stats.rejected or 0) + (fauna_stats.rejected or 0)
        },
        "flora": {
            "total": flora_stats.total or 0,
            "endemic": flora_stats.endemic or 0,
            "approved": flora_stats.approved or 0,
            "pending": flora_stats.pending or 0,
            "rejected": flora_stats.rejected or 0,
            "iucn_status": {
                "critically_endangered": flora_stats.critically_endangered or 0,
                "endangered": flora_stats.endangered or 0,
                "vulnerable": flora_stats.vulnerable or 0,
                "near_threatened": flora_stats.near_threatened or 0,
                "least_concern": flora_stats.least_concern or 0,
                "data_deficient": flora_stats.data_deficient or 0,
                "not_evaluated": flora_stats.not_evaluated or 0
            }
        },
        "fauna": {
            "total": fauna_stats.total or 0,
            "endemic": fauna_stats.endemic or 0,
            "approved": fauna_stats.approved or 0,
            "pending": fauna_stats.pending or 0,
            "rejected": fauna_stats.rejected or 0,
            "iucn_status": {
                "critically_endangered": fauna_stats.critically_endangered or 0,
                "endangered": fauna_stats.endangered or 0,
                "vulnerable": fauna_stats.vulnerable or 0,
                "near_threatened": fauna_stats.near_threatened or 0,
                "least_concern": fauna_stats.least_concern or 0,
                "data_deficient": fauna_stats.data_deficient or 0,
                "not_evaluated": fauna_stats.not_evaluated or 0
            }
        }
    }

async def get_conservation_analytics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any]) -> Dict[str, Any]:
    """Get conservation analytics data"""
    
    # Parks statistics
    parks_sql = f"""
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(area_ha), 0) as total_area_ha,
            COALESCE(AVG(area_ha), 0) as avg_area_ha,
            COALESCE(MAX(area_ha), 0) as max_area_ha,
            COALESCE(MIN(area_ha), 0) as min_area_ha,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as in_review,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM parks 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
    """
    
    parks_result = await db.execute(text(parks_sql), filter_params)
    parks_stats = parks_result.first()
    
    # Conservation status distribution
    status_sql = f"""
        SELECT 
            status,
            COUNT(*) as count,
            COALESCE(SUM(area_ha), 0) as total_area_ha
        FROM parks 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        GROUP BY status
        ORDER BY count DESC
    """
    
    status_result = await db.execute(text(status_sql), filter_params)
    status_distribution = [{"status": row.status, "count": row.count, "total_area_ha": row.total_area_ha} 
                          for row in status_result]
    
    return {
        "parks": {
            "total": parks_stats.total or 0,
            "total_area_ha": float(parks_stats.total_area_ha or 0),
            "avg_area_ha": float(parks_stats.avg_area_ha or 0),
            "max_area_ha": float(parks_stats.max_area_ha or 0),
            "min_area_ha": float(parks_stats.min_area_ha or 0)
        },
        "conservation_status": status_distribution
    }

async def get_activities_analytics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any]) -> Dict[str, Any]:
    """Get activities analytics data"""
    
    # Activities statistics
    activities_sql = f"""
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as in_review,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM activities 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
    """
    
    activities_result = await db.execute(text(activities_sql), filter_params)
    activities_stats = activities_result.first()
    
    # Activities by status
    by_status_sql = f"""
        SELECT 
            status,
            COUNT(*) as count
        FROM activities 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        GROUP BY status
        ORDER BY count DESC
    """
    
    by_status_result = await db.execute(text(by_status_sql), filter_params)
    by_status = [{"status": row.status, "count": row.count} for row in by_status_result]
    
    return {
        "total": activities_stats.total or 0,
        "approved": activities_stats.approved or 0,
        "in_review": activities_stats.in_review or 0,
        "rejected": activities_stats.rejected or 0,
        "by_status": by_status
    }

async def get_users_analytics(db: AsyncSession, user_role: str) -> Dict[str, Any]:
    """Get users analytics data"""
    
    if user_role != "super_admin":
        # Regional admin can only see their own data
        return {
            "by_role": [{"role": user_role, "total": 1, "active": 1}],
            "total_users": 1,
            "active_users": 1
        }
    
    # Super admin can see all users
    users_sql = """
        SELECT 
            role,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END), 0) as active
        FROM users 
        GROUP BY role
        ORDER BY total DESC
    """
    
    users_result = await db.execute(text(users_sql))
    by_role = [{"role": row.role, "total": row.total, "active": row.active} for row in users_result]
    
    total_users = sum(role["total"] for role in by_role)
    active_users = sum(role["active"] for role in by_role)
    
    return {
        "by_role": by_role,
        "total_users": total_users,
        "active_users": active_users
    }

async def get_geographic_analytics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any]) -> Dict[str, Any]:
    """Get geographic analytics data"""
    
    # Regional distribution
    regional_sql = f"""
        SELECT 
            provinsi,
            kota_kabupaten,
            COUNT(*) as park_count,
            COALESCE(SUM(area_ha), 0) as total_area_ha
        FROM parks 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        GROUP BY provinsi, kota_kabupaten
        ORDER BY park_count DESC
        LIMIT 10
    """
    
    regional_result = await db.execute(text(regional_sql), filter_params)
    regional_distribution = [
        {
            "provinsi": row.provinsi,
            "kota_kabupaten": row.kota_kabupaten,
            "park_count": row.park_count,
            "total_area_ha": float(row.total_area_ha or 0)
        }
        for row in regional_result
    ]
    
    return {
        "regional_distribution": regional_distribution
    }

async def get_temporal_analytics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any], time_range: str) -> Dict[str, Any]:
    """Get temporal analytics data"""
    
    # Monthly patterns
    monthly_sql = f"""
        SELECT 
            EXTRACT(MONTH FROM created_at) as month,
            COUNT(*) as species_count
        FROM (
            SELECT created_at FROM flora WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
            UNION ALL
            SELECT created_at FROM fauna WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        ) combined
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY month
    """
    
    monthly_result = await db.execute(text(monthly_sql), filter_params)
    monthly_patterns = [
        {
            "month": int(row.month),
            "species_count": row.species_count
        }
        for row in monthly_result
    ]
    
    return {
        "monthly_patterns": monthly_patterns
    }

async def get_performance_metrics(db: AsyncSession, user_filter: str, filter_params: Dict[str, Any]) -> Dict[str, Any]:
    """Get performance metrics"""
    
    # Approval rates by entity type
    approval_rates_sql = f"""
        SELECT 
            'flora' as entity_type,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM flora 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        
        UNION ALL
        
        SELECT 
            'fauna' as entity_type,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM fauna 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        
        UNION ALL
        
        SELECT 
            'parks' as entity_type,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM parks 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
        
        UNION ALL
        
        SELECT 
            'activities' as entity_type,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
            COALESCE(SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM activities 
        WHERE created_at >= :start_date AND created_at <= :end_date {user_filter}
    """
    
    approval_result = await db.execute(text(approval_rates_sql), filter_params)
    approval_rates = []
    
    for row in approval_result:
        total = row.total or 0
        approved = row.approved or 0
        approval_rate = (approved / total * 100) if total > 0 else 0
        
        approval_rates.append({
            "entity_type": row.entity_type,
            "total": total,
            "approved": approved,
            "pending": row.pending or 0,
            "rejected": row.rejected or 0,
            "approval_rate": approval_rate
        })
    
    return {
        "approval_rates": approval_rates
    }
