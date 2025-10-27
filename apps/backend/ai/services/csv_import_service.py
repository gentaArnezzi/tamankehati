from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from domains.articles.models import Article
from domains.parks.models import Park
import uuid
from datetime import datetime

class CSVImportService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def import_flora_data(self, flora_data: List[Dict[str, Any]], park_id: int, user_id: int) -> Dict[str, Any]:
        """
        Import flora data from CSV extraction
        """
        imported_count = 0
        errors = []
        
        for flora_record in flora_data:
            try:
                # Create new flora record
                flora = Flora(
                    local_name=flora_record.get('nama_lokal', ''),
                    scientific_name=flora_record.get('nama_ilmiah', ''),
                    family=flora_record.get('famili', ''),
                    genus=flora_record.get('genus', ''),
                    iucn_status=flora_record.get('status_iucn', ''),
                    is_endemic=flora_record.get('is_endemic', False),
                    description=flora_record.get('deskripsi', ''),
                    habitat=flora_record.get('habitat', ''),
                    distribution=flora_record.get('distribusi', ''),
                    conservation_status=flora_record.get('status_konservasi', ''),
                    threats=flora_record.get('ancaman', ''),
                    uses=flora_record.get('manfaat', ''),
                    morphology=flora_record.get('morfologi', ''),
                    ecology=flora_record.get('ekologi', ''),
                    image_url=flora_record.get('gambar', ''),
                    park_id=park_id,
                    submitted_by=user_id,
                    status='draft',
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                self.db.add(flora)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Error importing flora record: {str(e)}")
                continue
        
        try:
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            errors.append(f"Database commit error: {str(e)}")
        
        return {
            "imported_count": imported_count,
            "errors": errors,
            "success": len(errors) == 0
        }
    
    async def import_fauna_data(self, fauna_data: List[Dict[str, Any]], park_id: int, user_id: int) -> Dict[str, Any]:
        """
        Import fauna data from CSV extraction
        """
        imported_count = 0
        errors = []
        
        for fauna_record in fauna_data:
            try:
                # Create new fauna record
                fauna = Fauna(
                    local_name=fauna_record.get('nama_lokal', ''),
                    scientific_name=fauna_record.get('nama_ilmiah', ''),
                    family=fauna_record.get('famili', ''),
                    genus=fauna_record.get('genus', ''),
                    iucn_status=fauna_record.get('status_iucn', ''),
                    is_endemic=fauna_record.get('is_endemic', False),
                    description=fauna_record.get('deskripsi', ''),
                    habitat=fauna_record.get('habitat', ''),
                    distribution=fauna_record.get('distribusi', ''),
                    conservation_status=fauna_record.get('status_konservasi', ''),
                    threats=fauna_record.get('ancaman', ''),
                    behavior=fauna_record.get('perilaku', ''),
                    diet=fauna_record.get('makanan', ''),
                    reproduction=fauna_record.get('reproduksi', ''),
                    ecology=fauna_record.get('ekologi', ''),
                    image_url=fauna_record.get('gambar', ''),
                    park_id=park_id,
                    submitted_by=user_id,
                    status='draft',
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                self.db.add(fauna)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Error importing fauna record: {str(e)}")
                continue
        
        try:
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            errors.append(f"Database commit error: {str(e)}")
        
        return {
            "imported_count": imported_count,
            "errors": errors,
            "success": len(errors) == 0
        }
    
    async def import_articles_data(self, articles_data: List[Dict[str, Any]], park_id: int, user_id: int) -> Dict[str, Any]:
        """
        Import articles data from CSV extraction
        """
        imported_count = 0
        errors = []
        
        for article_record in articles_data:
            try:
                # Create new article record
                article = Article(
                    title=article_record.get('judul', ''),
                    slug=self._generate_slug(article_record.get('judul', '')),
                    content=article_record.get('konten', ''),
                    summary=article_record.get('ringkasan', ''),
                    category=article_record.get('kategori', 'Konservasi'),
                    featured_image=article_record.get('gambar', ''),
                    author_id=user_id,
                    park_id=park_id,
                    status='draft',
                    submitted_by=user_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                self.db.add(article)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Error importing article record: {str(e)}")
                continue
        
        try:
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            errors.append(f"Database commit error: {str(e)}")
        
        return {
            "imported_count": imported_count,
            "errors": errors,
            "success": len(errors) == 0
        }
    
    async def validate_park_access(self, park_id: int, user_id: int) -> bool:
        """
        Validate that user has access to the specified park
        """
        try:
            # Check if park exists
            park_query = select(Park).where(Park.id == park_id)
            park_result = await self.db.execute(park_query)
            park = park_result.scalar_one_or_none()
            
            if not park:
                return False
            
            # For now, allow access if park exists
            # In the future, you might want to check user permissions
            # user_id is kept for future implementation of user-specific park access
            _ = user_id  # Suppress unused parameter warning
            return True
            
        except Exception:
            return False
    
    def _generate_slug(self, title: str) -> str:
        """
        Generate URL-friendly slug from title
        """
        if not title:
            return f"article-{uuid.uuid4().hex[:8]}"
        
        # Convert to lowercase and replace spaces with hyphens
        slug = title.lower()
        slug = slug.replace(' ', '-')
        
        # Remove special characters
        import re
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        
        # Remove multiple consecutive hyphens
        slug = re.sub(r'-+', '-', slug)
        
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        
        return slug or f"article-{uuid.uuid4().hex[:8]}"
    
    async def get_import_summary(self, park_id: int) -> Dict[str, Any]:
        """
        Get summary of imported data for a park
        """
        try:
            # Count flora records
            flora_query = select(Flora).where(Flora.park_id == park_id)
            flora_result = await self.db.execute(flora_query)
            flora_count = len(flora_result.scalars().all())
            
            # Count fauna records
            fauna_query = select(Fauna).where(Fauna.park_id == park_id)
            fauna_result = await self.db.execute(fauna_query)
            fauna_count = len(fauna_result.scalars().all())
            
            # Count articles
            articles_query = select(Article).where(Article.park_id == park_id)
            articles_result = await self.db.execute(articles_query)
            articles_count = len(articles_result.scalars().all())
            
            return {
                "park_id": park_id,
                "flora_count": flora_count,
                "fauna_count": fauna_count,
                "articles_count": articles_count,
                "total_count": flora_count + fauna_count + articles_count
            }
            
        except Exception as e:
            return {
                "park_id": park_id,
                "flora_count": 0,
                "fauna_count": 0,
                "articles_count": 0,
                "total_count": 0,
                "error": str(e)
            }
