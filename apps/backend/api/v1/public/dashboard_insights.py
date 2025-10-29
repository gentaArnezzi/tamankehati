from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, func, select
from core.database.session import get_session
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta

router = APIRouter()


class ConservationStatusCount(BaseModel):
    status: str
    count: int
    percentage: float


class TopFamily(BaseModel):
    family: str
    count: int


class ProvinceDistribution(BaseModel):
    provinsi: str
    total_taman: int
    total_flora: int
    total_fauna: int


class GrowthData(BaseModel):
    month: str
    flora_count: int
    fauna_count: int
    taman_count: int


class DashboardInsightsResponse(BaseModel):
    # Basic stats
    total_flora: int
    total_fauna: int
    total_taman: int
    total_species: int
    
    # Conservation status
    flora_by_iucn: List[ConservationStatusCount]
    fauna_by_iucn: List[ConservationStatusCount]
    
    # Endemic species
    endemic_flora: int
    endemic_fauna: int
    endemic_percentage: float
    
    # Top families
    top_flora_families: List[TopFamily]
    top_fauna_families: List[TopFamily]
    
    # Geographic distribution
    province_distribution: List[ProvinceDistribution]
    
    # Growth trends (last 6 months)
    growth_trends: List[GrowthData]
    
    # Data quality
    flora_with_images: int
    fauna_with_images: int
    flora_with_complete_data: int
    fauna_with_complete_data: int


@router.get("/insights", response_model=DashboardInsightsResponse)
async def get_dashboard_insights(db: AsyncSession = Depends(get_session)):
    """
    Get comprehensive dashboard insights for public data visualization
    """
    try:
        # ===== BASIC STATS =====
        # Only count approved items, exclude soft-deleted
        flora_count_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE status = 'approved'
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        flora_result = await db.execute(flora_count_query)
        total_flora = flora_result.scalar() or 0

        fauna_count_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved'
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        fauna_result = await db.execute(fauna_count_query)
        total_fauna = fauna_result.scalar() or 0

        taman_count_query = text("""
            SELECT COUNT(*) FROM parks 
            WHERE status IN ('published', 'approved')
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        taman_result = await db.execute(taman_count_query)
        total_taman = taman_result.scalar() or 0

        total_species = total_flora + total_fauna

        # ===== CONSERVATION STATUS (IUCN) =====
        # Flora by IUCN status (approved only, exclude deleted)
        flora_iucn_query = text("""
            SELECT iucn_status, COUNT(*) as count
            FROM flora
            WHERE status = 'approved' 
            AND iucn_status IS NOT NULL 
            AND iucn_status != ''
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            GROUP BY iucn_status
            ORDER BY count DESC
        """)
        flora_iucn_result = await db.execute(flora_iucn_query)
        flora_iucn_data = flora_iucn_result.fetchall()
        
        flora_by_iucn = []
        for row in flora_iucn_data:
            percentage = (row.count / total_flora * 100) if total_flora > 0 else 0
            flora_by_iucn.append(ConservationStatusCount(
                status=row.iucn_status or "Unknown",
                count=row.count,
                percentage=round(percentage, 2)
            ))

        # Fauna by IUCN status (approved only, exclude deleted)
        fauna_iucn_query = text("""
            SELECT iucn_status, COUNT(*) as count
            FROM fauna
            WHERE status = 'approved' 
            AND iucn_status IS NOT NULL 
            AND iucn_status != ''
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            GROUP BY iucn_status
            ORDER BY count DESC
        """)
        fauna_iucn_result = await db.execute(fauna_iucn_query)
        fauna_iucn_data = fauna_iucn_result.fetchall()
        
        fauna_by_iucn = []
        for row in fauna_iucn_data:
            percentage = (row.count / total_fauna * 100) if total_fauna > 0 else 0
            fauna_by_iucn.append(ConservationStatusCount(
                status=row.iucn_status or "Unknown",
                count=row.count,
                percentage=round(percentage, 2)
            ))

        # ===== ENDEMIC SPECIES =====
        # Endemic flora (approved only, exclude deleted)
        endemic_flora_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE status = 'approved' 
            AND is_endemic = true
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        endemic_flora_result = await db.execute(endemic_flora_query)
        endemic_flora = endemic_flora_result.scalar() or 0

        # Endemic fauna (approved only, exclude deleted)
        endemic_fauna_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved' 
            AND is_endemic = true
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        """)
        endemic_fauna_result = await db.execute(endemic_fauna_query)
        endemic_fauna = endemic_fauna_result.scalar() or 0

        total_endemic = endemic_flora + endemic_fauna
        endemic_percentage = (total_endemic / total_species * 100) if total_species > 0 else 0

        # ===== TOP FAMILIES =====
        # Top Flora Families (exclude deleted)
        top_flora_families_query = text("""
            SELECT family, COUNT(*) as count
            FROM flora
            WHERE status = 'approved' 
            AND family IS NOT NULL 
            AND family != ''
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            GROUP BY family
            ORDER BY count DESC
            LIMIT 5
        """)
        top_flora_result = await db.execute(top_flora_families_query)
        top_flora_data = top_flora_result.fetchall()
        top_flora_families = [TopFamily(family=row.family, count=row.count) for row in top_flora_data]

        # Top Fauna Families (exclude deleted)
        top_fauna_families_query = text("""
            SELECT family, COUNT(*) as count
            FROM fauna
            WHERE status = 'approved' 
            AND family IS NOT NULL 
            AND family != ''
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            GROUP BY family
            ORDER BY count DESC
            LIMIT 5
        """)
        top_fauna_result = await db.execute(top_fauna_families_query)
        top_fauna_data = top_fauna_result.fetchall()
        top_fauna_families = [TopFamily(family=row.family, count=row.count) for row in top_fauna_data]

        # ===== GEOGRAPHIC DISTRIBUTION =====
        # Only include approved parks and approved species, exclude deleted items
        province_dist_query = text("""
            SELECT 
                p.provinsi,
                COUNT(DISTINCT p.id) as total_taman,
                COUNT(DISTINCT f.id) as total_flora,
                COUNT(DISTINCT fa.id) as total_fauna
            FROM parks p
            LEFT JOIN flora f ON f.park_id = p.id 
                AND f.status = 'approved'
                AND (f.deleted_at IS NULL OR f.deleted_at IS NULL)
            LEFT JOIN fauna fa ON fa.park_id = p.id 
                AND fa.status = 'approved'
                AND (fa.deleted_at IS NULL OR fa.deleted_at IS NULL)
            WHERE p.status IN ('published', 'approved') 
            AND p.provinsi IS NOT NULL
            AND (p.deleted_at IS NULL OR p.deleted_at IS NULL)
            GROUP BY p.provinsi
            ORDER BY total_taman DESC, total_flora DESC, total_fauna DESC
            LIMIT 10
        """)
        province_result = await db.execute(province_dist_query)
        province_data = province_result.fetchall()
        province_distribution = [
            ProvinceDistribution(
                provinsi=row.provinsi or "Unknown",
                total_taman=row.total_taman,
                total_flora=row.total_flora,
                total_fauna=row.total_fauna
            )
            for row in province_data
        ]

        # ===== GROWTH TRENDS (Last 6 months) =====
        # Calculate date 6 months ago
        six_months_ago = datetime.now() - timedelta(days=180)
        
        # Only count approved items, exclude deleted
        growth_query = text("""
            SELECT 
                TO_CHAR(DATE_TRUNC('month', month), 'YYYY-MM') as month,
                COALESCE(SUM(flora_count), 0) as flora_count,
                COALESCE(SUM(fauna_count), 0) as fauna_count,
                COALESCE(SUM(taman_count), 0) as taman_count
            FROM (
                SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as flora_count, 0 as fauna_count, 0 as taman_count
                FROM flora 
                WHERE status = 'approved' 
                AND created_at >= :six_months_ago
                AND (deleted_at IS NULL OR deleted_at IS NULL)
                GROUP BY DATE_TRUNC('month', created_at)
                
                UNION ALL
                
                SELECT DATE_TRUNC('month', created_at) as month, 0 as flora_count, COUNT(*) as fauna_count, 0 as taman_count
                FROM fauna 
                WHERE status = 'approved' 
                AND created_at >= :six_months_ago
                AND (deleted_at IS NULL OR deleted_at IS NULL)
                GROUP BY DATE_TRUNC('month', created_at)
                
                UNION ALL
                
                SELECT DATE_TRUNC('month', created_at) as month, 0 as flora_count, 0 as fauna_count, COUNT(*) as taman_count
                FROM parks 
                WHERE status IN ('published', 'approved') 
                AND created_at >= :six_months_ago
                AND (deleted_at IS NULL OR deleted_at IS NULL)
                GROUP BY DATE_TRUNC('month', created_at)
            ) combined
            GROUP BY DATE_TRUNC('month', month)
            ORDER BY month ASC
        """)
        growth_result = await db.execute(growth_query, {"six_months_ago": six_months_ago})
        growth_data_raw = growth_result.fetchall()
        growth_trends = [
            GrowthData(
                month=row.month,
                flora_count=row.flora_count,
                fauna_count=row.fauna_count,
                taman_count=row.taman_count
            )
            for row in growth_data_raw
        ]

        # ===== DATA QUALITY METRICS =====
        # Flora with images (approved only, exclude deleted)
        flora_images_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE status = 'approved' 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            AND (
                gambar_utama IS NOT NULL OR
                leaf_image_url IS NOT NULL OR
                stem_image_url IS NOT NULL OR
                flower_image_url IS NOT NULL OR
                fruit_image_url IS NOT NULL
            )
        """)
        flora_images_result = await db.execute(flora_images_query)
        flora_with_images = flora_images_result.scalar() or 0

        # Fauna with images (approved only, exclude deleted)
        fauna_images_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved' 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            AND gambar_utama IS NOT NULL
        """)
        fauna_images_result = await db.execute(fauna_images_query)
        fauna_with_images = fauna_images_result.scalar() or 0

        # Flora with complete data (approved only, exclude deleted)
        flora_complete_query = text("""
            SELECT COUNT(*) FROM flora 
            WHERE status = 'approved' 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            AND description IS NOT NULL AND description != ''
            AND morphology IS NOT NULL AND morphology != ''
            AND family IS NOT NULL AND family != ''
        """)
        flora_complete_result = await db.execute(flora_complete_query)
        flora_with_complete_data = flora_complete_result.scalar() or 0

        # Fauna with complete data (approved only, exclude deleted)
        fauna_complete_query = text("""
            SELECT COUNT(*) FROM fauna 
            WHERE status = 'approved' 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
            AND description IS NOT NULL AND description != ''
            AND habitat IS NOT NULL AND habitat != ''
            AND family IS NOT NULL AND family != ''
        """)
        fauna_complete_result = await db.execute(fauna_complete_query)
        fauna_with_complete_data = fauna_complete_result.scalar() or 0

        return DashboardInsightsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=total_taman,
            total_species=total_species,
            flora_by_iucn=flora_by_iucn,
            fauna_by_iucn=fauna_by_iucn,
            endemic_flora=endemic_flora,
            endemic_fauna=endemic_fauna,
            endemic_percentage=round(endemic_percentage, 2),
            top_flora_families=top_flora_families,
            top_fauna_families=top_fauna_families,
            province_distribution=province_distribution,
            growth_trends=growth_trends,
            flora_with_images=flora_with_images,
            fauna_with_images=fauna_with_images,
            flora_with_complete_data=flora_with_complete_data,
            fauna_with_complete_data=fauna_with_complete_data
        )

    except Exception as e:
        print(f"Error getting dashboard insights: {e}")
        import traceback
        traceback.print_exc()
        
        # Return minimal fallback data
        return DashboardInsightsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_species=0,
            flora_by_iucn=[],
            fauna_by_iucn=[],
            endemic_flora=0,
            endemic_fauna=0,
            endemic_percentage=0.0,
            top_flora_families=[],
            top_fauna_families=[],
            province_distribution=[],
            growth_trends=[],
            flora_with_images=0,
            fauna_with_images=0,
            flora_with_complete_data=0,
            fauna_with_complete_data=0
        )

