from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Tuple, Optional


class PublicStatsService:
    @staticmethod
    async def get_stats(db: AsyncSession):
        """Get public statistics for homepage"""
        try:
            # Get flora count
            flora_query = text("SELECT COUNT(*) FROM flora WHERE is_active = true")
            flora_result = await db.execute(flora_query)
            total_flora = flora_result.scalar() or 0

            # Get fauna count
            fauna_query = text("SELECT COUNT(*) FROM fauna WHERE is_active = true")
            fauna_result = await db.execute(fauna_query)
            total_fauna = fauna_result.scalar() or 0

            # Get taman count
            taman_query = text("SELECT COUNT(*) FROM parks WHERE status = 'published'")
            taman_result = await db.execute(taman_query)
            total_taman = taman_result.scalar() or 0

            # Get artikel count
            artikel_query = text("SELECT COUNT(*) FROM articles WHERE is_published = true")
            artikel_result = await db.execute(artikel_query)
            total_artikel = artikel_result.scalar() or 0

            return {
                "total_flora": total_flora,
                "total_fauna": total_fauna,
                "total_taman": total_taman,
                "total_artikel": total_artikel
            }
        except Exception as e:
            print(f"Error getting public stats: {e}")
            # Return fallback data
            return {
                "total_flora": 0,
                "total_fauna": 0,
                "total_taman": 0,
                "total_artikel": 0
            }


class PublicArtikelService:
    @staticmethod
    async def get_list(
        db: AsyncSession,
        search: Optional[str] = None,
        kategori: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List, int]:
        """Get list of articles for public API"""
        try:
            # Build query
            query = text("""
                SELECT id, title, content, summary, region_code, created_at, is_published
                FROM articles 
                WHERE is_published = true
            """)
            
            if search:
                query = text("""
                    SELECT id, title, content, summary, region_code, created_at, is_published
                    FROM articles 
                    WHERE is_published = true 
                    AND (title ILIKE :search OR content ILIKE :search)
                """)
            
            if kategori:
                query = text("""
                    SELECT id, title, content, summary, region_code, created_at, is_published
                    FROM articles 
                    WHERE is_published = true 
                    AND region_code ILIKE :kategori
                """)
            
            # Get total count
            count_query = text("SELECT COUNT(*) FROM articles WHERE is_published = true")
            count_result = await db.execute(count_query)
            total = count_result.scalar() or 0
            
            # Get items with pagination
            items_query = text(f"""
                {query} 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset
            """)
            
            params = {"limit": limit, "offset": offset}
            if search:
                params["search"] = f"%{search}%"
            if kategori:
                params["kategori"] = f"%{kategori}%"
                
            result = await db.execute(items_query, params)
            items = result.fetchall()
            
            return items, total
        except Exception as e:
            print(f"Error getting articles: {e}")
            return [], 0
    
    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str):
        """Get article by slug (using title for now)"""
        try:
            query = text("""
                SELECT id, title, content, summary, region_code, created_at, is_published
                FROM articles 
                WHERE is_published = true 
                AND LOWER(REPLACE(title, ' ', '-')) = :slug
            """)
            result = await db.execute(query, {"slug": slug.lower()})
            return result.fetchone()
        except Exception as e:
            print(f"Error getting article by slug: {e}")
            return None


class PublicGaleriService:
    @staticmethod
    async def get_list(
        db: AsyncSession,
        jenis: Optional[str] = None,
        wilayah: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List, int]:
        """Get list of gallery items for public API"""
        try:
            # Get total count
            count_query = text("SELECT COUNT(*) FROM galleries")
            count_result = await db.execute(count_query)
            total = count_result.scalar() or 0
            
            # Get items with pagination
            query = text("""
                SELECT id, title, image_url, region_code, created_at
                FROM galleries 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset
            """)
            
            result = await db.execute(query, {"limit": limit, "offset": offset})
            items = result.fetchall()
            
            return items, total
        except Exception as e:
            print(f"Error getting gallery items: {e}")
            return [], 0


class PublicChatbotService:
    @staticmethod
    async def send_message(message: str) -> str:
        """Send a message to the chatbot and get a response"""
        try:
            # Simple response for now - can be enhanced with AI integration later
            if "halo" in message.lower() or "hai" in message.lower():
                return "Halo! Saya Tanya Kehati, asisten AI Anda. Ada yang bisa saya bantu tentang keanekaragaman hayati Indonesia?"
            elif "flora" in message.lower():
                return "Flora Indonesia sangat beragam! Kami memiliki data tentang berbagai spesies tanaman dari seluruh Nusantara. Apakah ada spesies tertentu yang ingin Anda ketahui?"
            elif "fauna" in message.lower():
                return "Fauna Indonesia menakjubkan! Dari burung endemik hingga mamalia langka, kami memiliki data lengkap tentang satwa liar Indonesia. Ada yang ingin Anda tanyakan?"
            elif "taman" in message.lower() or "kehati" in message.lower():
                return "Taman Kehati adalah kawasan konservasi yang melindungi keanekaragaman hayati Indonesia. Kami memiliki data tentang berbagai taman di seluruh Nusantara. Apakah ada taman tertentu yang ingin Anda ketahui?"
            elif "konservasi" in message.lower():
                return "Konservasi adalah upaya melindungi dan melestarikan keanekaragaman hayati. Di platform ini, Anda dapat menemukan data tentang flora, fauna, dan kegiatan konservasi di Indonesia."
            else:
                return "Terima kasih atas pertanyaan Anda! Saya Tanya Kehati, asisten AI yang siap membantu Anda menjelajahi keanekaragaman hayati Indonesia. Anda dapat bertanya tentang flora, fauna, taman kehati, atau kegiatan konservasi."
        except Exception as e:
            print(f"Error in chatbot service: {e}")
            return "Maaf, terjadi kesalahan. Silakan coba lagi nanti."
