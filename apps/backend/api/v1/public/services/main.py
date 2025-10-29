from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
# from sqlalchemy.orm import selectinload  # Temporarily removed
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from domains.parks.models import Park
from domains.articles.models import Article
from domains.galleries.models import Gallery
# from domains.zones.models import Zone  # Temporarily removed
from core.database.session import get_session
from ai.services.tooling import maybe_run_tool
import re


class PublicFloraService:
    @staticmethod
    async def get_list(db: AsyncSession, search: Optional[str] = None, wilayah: Optional[str] = None, status_iucn: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Flora], int]:
        # Base query
        stmt = select(Flora).where(Flora.status == "approved")
        
        # Apply search filter
        if search:
            stmt = stmt.where(
                or_(
                    Flora.local_name.ilike(f"%{search}%"),
                    Flora.scientific_name.ilike(f"%{search}%"),
                    Flora.family.ilike(f"%{search}%"),
                    Flora.description.ilike(f"%{search}%")
                )
            )
        
        # Apply wilayah filter - disabled
        # if wilayah:
        #     stmt = stmt.join(Zone, Flora.zone_id == Zone.id).where(Zone.name.ilike(f"%{wilayah}%"))
        
        # Apply IUCN status filter
        if status_iucn:
            stmt = stmt.where(Flora.iucn_status == status_iucn)
        
        # Get total count - create a separate count query
        count_stmt = select(func.count(Flora.id)).where(Flora.status == "approved")
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Flora.local_name.ilike(f"%{search}%"),
                    Flora.scientific_name.ilike(f"%{search}%"),
                    Flora.family.ilike(f"%{search}%"),
                    Flora.description.ilike(f"%{search}%")
                )
            )
        if status_iucn:
            count_stmt = count_stmt.where(Flora.iucn_status == status_iucn)
        
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()
        if total is None:
            total = 0
        
        # Apply pagination
        stmt = stmt.limit(limit).offset(offset)
        items = (await db.execute(stmt)).scalars().all()
        
        return items, total
    
    @staticmethod
    async def get_by_id(db: AsyncSession, id: int) -> Optional[Flora]:
        stmt = select(Flora).where(Flora.id == id, Flora.status == "approved")
        return (await db.execute(stmt)).scalars().first()


class PublicFaunaService:
    @staticmethod
    async def get_list(db: AsyncSession, search: Optional[str] = None, wilayah: Optional[str] = None, status_iucn: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Fauna], int]:
        # Base query
        stmt = select(Fauna).where(Fauna.status == "approved")
        
        # Apply search filter
        if search:
            stmt = stmt.where(
                or_(
                    Fauna.local_name.ilike(f"%{search}%"),
                    Fauna.scientific_name.ilike(f"%{search}%"),
                    Fauna.family.ilike(f"%{search}%"),
                    Fauna.description.ilike(f"%{search}%")
                )
            )
        
        # Apply wilayah filter - disabled
        # if wilayah:
        #     stmt = stmt.join(Zone, Fauna.zone_id == Zone.id).where(Zone.name.ilike(f"%{wilayah}%"))
        
        # Apply IUCN status filter
        if status_iucn:
            stmt = stmt.where(Fauna.iucn_status == status_iucn)
        
        # Get total count - create a separate count query
        count_stmt = select(func.count(Fauna.id)).where(Fauna.status == "approved")
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Fauna.local_name.ilike(f"%{search}%"),
                    Fauna.scientific_name.ilike(f"%{search}%"),
                    Fauna.family.ilike(f"%{search}%"),
                    Fauna.description.ilike(f"%{search}%")
                )
            )
        if status_iucn:
            count_stmt = count_stmt.where(Fauna.iucn_status == status_iucn)
        
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()
        if total is None:
            total = 0
        
        # Apply pagination
        stmt = stmt.limit(limit).offset(offset)
        items = (await db.execute(stmt)).scalars().all()
        
        return items, total
    
    @staticmethod
    async def get_by_id(db: AsyncSession, id: int) -> Optional[Fauna]:
        stmt = select(Fauna).where(Fauna.id == id, Fauna.status == "approved")
        return (await db.execute(stmt)).scalars().first()


class PublicParkService:
    @staticmethod
    async def get_list(db: AsyncSession, search: Optional[str] = None, region: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Park], int]:
        stmt = select(Park).where(Park.status == "published")
        
        if search:
            stmt = stmt.where(
                or_(
                    Park.name.ilike(f"%{search}%"),
                    Park.description.ilike(f"%{search}%")
                )
            )
        
        # Get total count - create a separate count query
        count_stmt = select(func.count(Park.id)).where(Park.status == "published")
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Park.name.ilike(f"%{search}%"),
                    Park.description.ilike(f"%{search}%")
                )
            )
        
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()
        if total is None:
            total = 0
        
        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)
        result = await db.execute(stmt)
        items = result.scalars().all()
        
        return items, total
    
    @staticmethod
    async def get_by_id(db: AsyncSession, id: int) -> Optional[Park]:
        stmt = select(Park).where(Park.id == id, Park.status == "published")
        return (await db.execute(stmt)).scalars().first()
    
    @staticmethod
    async def get_stats(db: AsyncSession, park_id: int) -> Optional[Dict[str, int]]:
        try:
            # Get flora count
            flora_count = await db.execute(
                select(func.count(Flora.id)).where(Flora.park_id == park_id)
            )
            
            # Get fauna count
            fauna_count = await db.execute(
                select(func.count(Fauna.id)).where(Fauna.park_id == park_id)
            )
            
            # Get article count - since articles don't have park_id, we'll return 0 for now
            # In a real implementation, you might want to add park_id to articles or use a different relationship
            article_count = 0
            
            # Get gallery count - since galleries don't have park_id, we'll return 0 for now
            # In a real implementation, you might want to add park_id to galleries or use a different relationship
            gallery_count = 0
            
            return {
                "total_flora": flora_count.scalar() or 0,
                "total_fauna": fauna_count.scalar() or 0,
                "total_artikel": article_count,
                "total_galeri": gallery_count.scalar() or 0
            }
        except Exception as e:
            print(f"Error getting park stats: {e}")
            # Return fallback data
            return {
                "total_flora": 0,
                "total_fauna": 0,
                "total_artikel": 0,
                "total_galeri": 0
            }


class PublicArtikelService:
    @staticmethod
    async def get_list(db: AsyncSession, search: Optional[str] = None, kategori: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Article], int]:
        stmt = select(Article).where(Article.status == "approved")
        
        # Apply search filter
        if search:
            stmt = stmt.where(
                or_(
                    Article.title.ilike(f"%{search}%"),
                    Article.summary.ilike(f"%{search}%"),
                    Article.content.ilike(f"%{search}%")
                )
            )
        
        # Apply kategori filter
        if kategori:
            stmt = stmt.where(Article.region_code.ilike(f"%{kategori}%"))
        
        # Get total count - create a separate count query
        count_stmt = select(func.count(Article.id)).where(Article.status == "approved")
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Article.title.ilike(f"%{search}%"),
                    Article.summary.ilike(f"%{search}%"),
                    Article.content.ilike(f"%{search}%")
                )
            )
        if kategori:
            count_stmt = count_stmt.where(Article.region_code.ilike(f"%{kategori}%"))
        
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()
        if total is None:
            total = 0
        
        # Apply pagination
        stmt = stmt.limit(limit).offset(offset)
        items = (await db.execute(stmt)).scalars().all()
        
        return items, total
    
    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> Optional[Article]:
        # We'll need to match slug with the title since there's no slug field in the model
        # In a real implementation, you might want to add a slug field to the Article model
        stmt = select(Article).where(Article.title.ilike(f"%{slug}%"), Article.status == "approved")
        result = (await db.execute(stmt)).scalars().first()
        # Try to find exact slug match by converting title to slug format
        if not result:
            # If not found by slug in title, try to find by exact title
            stmt = select(Article).where(
                func.replace(func.lower(Article.title), " ", "-").ilike(f"%{slug.lower()}%"), 
                Article.status == "approved"
            )
            result = (await db.execute(stmt)).scalars().first()
        return result


class PublicGaleriService:
    @staticmethod
    async def get_list(db: AsyncSession, jenis: Optional[str] = None, wilayah: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Gallery], int]:
        stmt = select(Gallery).where(Gallery.status == "approved")
        
        # Apply jenis filter (using region_code as a proxy for jenis)
        if jenis:
            stmt = stmt.where(Gallery.region_code.ilike(f"%{jenis}%"))
        
        # Apply wilayah filter (using region_code as a proxy for wilayah)
        if wilayah:
            stmt = stmt.where(Gallery.region_code.ilike(f"%{wilayah}%"))
        
        # Get total count - create a separate count query
        count_stmt = select(func.count(Gallery.id)).where(Gallery.status == "approved")
        if jenis:
            count_stmt = count_stmt.where(Gallery.region_code.ilike(f"%{jenis}%"))
        if wilayah:
            count_stmt = count_stmt.where(Gallery.region_code.ilike(f"%{wilayah}%"))
        
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()
        if total is None:
            total = 0
        
        # Apply pagination
        stmt = stmt.limit(limit).offset(offset)
        items = (await db.execute(stmt)).scalars().all()
        
        return items, total


class PublicStatsService:
    @staticmethod
    async def get_stats(db: AsyncSession) -> Dict[str, int]:
        # Count approved flora
        flora_stmt = select(func.count(Flora.id)).where(Flora.status == "approved")
        total_flora = (await db.execute(flora_stmt)).scalar() or 0
        
        # Count approved fauna
        fauna_stmt = select(func.count(Fauna.id)).where(Fauna.status == "approved")
        total_fauna = (await db.execute(fauna_stmt)).scalar() or 0
        
        # Count all parks
        park_stmt = select(func.count(Park.id)).where(Park.status == "published")
        total_taman = (await db.execute(park_stmt)).scalar() or 0
        
        # Count approved artikel
        artikel_stmt = select(func.count(Article.id)).where(Article.status == "approved")
        total_artikel = (await db.execute(artikel_stmt)).scalar() or 0
        
        return {
            "total_flora": total_flora,
            "total_fauna": total_fauna,
            "total_taman": total_taman,
            "total_artikel": total_artikel
        }


class PublicChatbotService:
    @staticmethod
    async def send_message(message: str) -> str:
        """
        AI-powered chatbot with secure database check.
        Checks database for relevant data before using AI.
        """
        try:
            # First, check if we have relevant data in the database
            from core.database.session import get_session
            async for db_session in get_session():
                # Try to find relevant data in database
                relevant_data = await PublicChatbotService._search_database_for_relevant_data(db_session, message)
                
                if relevant_data:
                    # If we found relevant data, use AI to provide a comprehensive answer
                    return await PublicChatbotService._generate_ai_response_with_data(message, relevant_data)
                else:
                    # If no relevant data found, tell user we don't have specific information
                    return await PublicChatbotService._handle_no_data_response(message)
                break  # Important: break after first iteration
                    
        except Exception as e:
            # Log error securely without exposing system information
            print("Chatbot service error: Internal processing failure")
            return "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi nanti."
    
    
    @staticmethod
    async def _search_database_for_relevant_data(db_session, message: str) -> str:
        """
        Search database for relevant data based on the user's question.
        Returns relevant data if found, None otherwise.
        Uses parameterized queries to prevent SQL injection.
        """
        try:
            from sqlalchemy import select, and_
            from domains.flora.models import Flora
            from domains.fauna.models import Fauna
            from domains.parks.models import Park
            from domains.articles.models import Article
            
            message_lower = message.lower()
            relevant_data = []
            
            # Special handling for "taman kehati" questions
            if any(word in message_lower for word in ['taman kehati', 'kehati', 'untuk apa taman kehati', 'apa itu taman kehati']):
                # Add general information about Taman Kehati
                relevant_data.append("Informasi Taman Kehati:")
                relevant_data.append("- Taman Kehati adalah taman konservasi keanekaragaman hayati Indonesia")
                relevant_data.append("- Tujuan: melindungi dan melestarikan flora dan fauna Indonesia")
                relevant_data.append("- Fungsi: pendidikan, penelitian, dan konservasi")
                relevant_data.append("- Data tersedia di website Taman Kehati")
            
            # Search for flora data using parameterized queries
            if any(word in message_lower for word in ['flora', 'tumbuhan', 'tanaman', 'pohon', 'bunga', 'rafflesia', 'anggrek']):
                flora_stmt = select(Flora.scientific_name, Flora.local_name, Flora.description).where(
                    and_(
                        Flora.status == "approved",
                        Flora.deleted_at.is_(None)
                    )
                ).limit(3)
                
                flora_result = await db_session.execute(flora_stmt)
                flora_data = flora_result.fetchall()
                if flora_data:
                    relevant_data.append("Data Flora (Tersedia di website Taman Kehati):")
                    for flora in flora_data:
                        relevant_data.append(f"- {flora[1]} ({flora[0]})")
            
            # Search for fauna data using parameterized queries
            if any(word in message_lower for word in ['fauna', 'hewan', 'satwa', 'mamalia', 'burung', 'reptil', 'ikan', 'harimau', 'orangutan', 'komodo', 'badak']):
                fauna_stmt = select(Fauna.scientific_name, Fauna.local_name, Fauna.description).where(
                    and_(
                        Fauna.status == "approved",
                        Fauna.deleted_at.is_(None)
                    )
                ).limit(3)
                
                fauna_result = await db_session.execute(fauna_stmt)
                fauna_data = fauna_result.fetchall()
                if fauna_data:
                    relevant_data.append("Data Fauna (Tersedia di website Taman Kehati):")
                    for fauna in fauna_data:
                        relevant_data.append(f"- {fauna[1]} ({fauna[0]})")
            
            # Search for parks data using parameterized queries
            if any(word in message_lower for word in ['taman', 'konservasi', 'kawasan', 'cagar', 'suaka', 'kehati']):
                parks_stmt = select(Park.name, Park.provinsi, Park.description).where(
                    and_(
                        Park.status == "approved",
                        Park.deleted_at.is_(None)
                    )
                ).limit(3)
                
                parks_result = await db_session.execute(parks_stmt)
                parks_data = parks_result.fetchall()
                if parks_data:
                    relevant_data.append("Data Taman Konservasi (Tersedia di website Taman Kehati):")
                    for park in parks_data:
                        relevant_data.append(f"- {park[0]} di {park[1]}")
            
            # Search for articles data using parameterized queries
            if any(word in message_lower for word in ['artikel', 'berita', 'informasi', 'pengetahuan']):
                articles_stmt = select(Article.title, Article.summary).where(
                    and_(
                        Article.status == "published",
                        Article.deleted_at.is_(None)
                    )
                ).limit(3)
                
                articles_result = await db_session.execute(articles_stmt)
                articles_data = articles_result.fetchall()
                if articles_data:
                    relevant_data.append("Data Artikel (Tersedia di website Taman Kehati):")
                    for article in articles_data:
                        relevant_data.append(f"- {article[0]}")
            
            return "\n".join(relevant_data) if relevant_data else None
            
        except Exception as e:
            # Log error securely without exposing system information
            print("Error searching database for chatbot data")
            return None
    
    @staticmethod
    async def _generate_ai_response_with_data(message: str, relevant_data: str) -> str:
        """
        Generate AI response using the relevant data found in database.
        """
        try:
            # Import AI providers
            from ai.providers.ollama_provider import OllamaProvider
            from ai.providers.openai_provider import OpenAIProvider
            from ai.providers.base import ChatTurn
            
            # Try to use OpenAI first, fallback to Ollama
            provider = None
            try:
                provider = OpenAIProvider()
            except Exception:
                try:
                    provider = OllamaProvider()
                except Exception as e:
                    raise e
            
            # Build context-aware system prompt with database data
            system_prompt = f"""Anda adalah Tanya Kehati, asisten AI khusus untuk keanekaragaman hayati Indonesia. 

Berdasarkan data yang tersedia di database Taman Kehati:
{relevant_data}

Tugas Anda:
- Gunakan data di atas untuk menjawab pertanyaan pengguna dengan informatif
- Berikan informasi yang akurat berdasarkan data yang tersedia
- Jika data lengkap, berikan jawaban yang komprehensif
- Jika data tidak lengkap, jelaskan apa yang tersedia dan apa yang tidak
- Gunakan bahasa Indonesia yang mudah dipahami
- Bersikap ramah, informatif, dan membantu
- Fokus pada keanekaragaman hayati Indonesia
- JANGAN membuat informasi yang tidak ada dalam data

Jawablah pertanyaan dengan informatif dan bermanfaat berdasarkan data yang tersedia."""

            # Prepare messages for AI
            messages: list[ChatTurn] = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": message
                }
            ]
            
            # Generate AI response
            response = await provider.generate(messages)
            return response

        except Exception as e:
            # Log error securely without exposing system information
            print("AI response generation error: Internal processing failure")
            return "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi nanti."
    
    @staticmethod
    async def _handle_no_data_response(message: str) -> str:
        """
        Handle response when no relevant data is found in database.
        Simply inform that data is not available on Taman Kehati website.
        """
        return """Maaf, saya tidak memiliki data tentang pertanyaan Anda karena pada website Taman Kehati ini belum ditambahkan data tersebut.

Namun, Anda dapat:
• Mencari informasi di bagian Flora untuk data tumbuhan yang tersedia
• Mencari informasi di bagian Fauna untuk data hewan yang tersedia
• Melihat Taman Konservasi yang tersedia
• Membaca Artikel dan Berita terbaru
• Menggunakan fitur Pencarian untuk mencari informasi spesifik

Apakah ada topik lain tentang keanekaragaman hayati Indonesia yang ingin Anda ketahui?"""
    



class PublicSearchService:
    @staticmethod
    async def search(
        db: AsyncSession,
        query: str,
        limit: int = 20,
    ) -> dict:
        """
        Melakukan pencarian di semua model yang tersedia.
        """
        from api.v1.routes.search import _execute_search
        from api.v1.serializers.search import SearchResultOut
        
        try:
            # Eksekusi pencarian
            results = await _execute_search(db, query, limit, user=None)
            
            # Format hasil pencarian
            formatted_results = [
                {
                    'id': str(item.id),
                    'type': item.type,
                    'title': item.title,
                    'description': item.description,
                    'score': item.score,
                    'url': f"/{item.type}/{item.id}"  # Sesuaikan dengan routing Anda
                }
                for item in results
            ]
            
            return {
                'query': query,
                'total': len(formatted_results),
                'results': formatted_results
            }
            
        except Exception as e:
            # Log error
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in PublicSearchService.search: {str(e)}")
            
            # Kembalikan hasil kosong jika terjadi error
            return {
                'query': query,
                'total': 0,
                'results': []
            }
