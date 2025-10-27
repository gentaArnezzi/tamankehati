from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel
from core.database.session import get_session
from api.v1.permissions.rbac import current_user
from ai.services.comprehensive_ai import ComprehensiveAIService
from ai.services.csv_import_service import CSVImportService
import io

router = APIRouter(prefix="/ai", tags=["AI Comprehensive"])

# ==================== REQUEST MODELS ====================

class ArticleAIGenerateRequest(BaseModel):
    topic: str
    category: Optional[str] = "Konservasi"
    park_name: Optional[str] = None
    key_points: Optional[List[str]] = []

class NewsAIGenerateRequest(BaseModel):
    event: str
    location: Optional[str] = None
    park_name: Optional[str] = None
    impact: Optional[str] = None

class CSVExtractionRequest(BaseModel):
    park_id: int
    park_name: str
    description: Optional[str] = None

class AIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ArticleAIResponse(BaseModel):
    title: str
    summary: str
    content: str
    success: bool
    message: str

class NewsAIResponse(BaseModel):
    headline: str
    lead: str
    content: str
    success: bool
    message: str

class CSVExtractionResponse(BaseModel):
    success: bool
    message: str
    analysis: Optional[dict] = None
    flora_data: List[dict] = []
    fauna_data: List[dict] = []
    articles_data: List[dict] = []
    total_records: int = 0
    valid_records: int = 0

# ==================== ARTICLE GENERATION ====================

@router.post("/generate-article", response_model=ArticleAIResponse)
async def generate_article(
    request: ArticleAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate comprehensive article content using AI
    Only accessible by regional_admin
    """
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = ComprehensiveAIService()
        
        # Convert request to dict
        article_data = request.dict()
        
        # Generate article content
        result = await ai_service.generate_article_content(article_data)
        
        return ArticleAIResponse(
            title=result["title"],
            summary=result["summary"],
            content=result["content"],
            success=True,
            message="Artikel berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat artikel: {str(e)}"
        ) from e

# ==================== NEWS GENERATION ====================

@router.post("/generate-news", response_model=NewsAIResponse)
async def generate_news(
    request: NewsAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate news content using AI
    Only accessible by regional_admin
    """
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = ComprehensiveAIService()
        
        # Convert request to dict
        news_data = request.dict()
        
        # Generate news content
        result = await ai_service.generate_news_content(news_data)
        
        return NewsAIResponse(
            headline=result["headline"],
            lead=result["lead"],
            content=result["content"],
            success=True,
            message="Berita berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat berita: {str(e)}"
        ) from e

# ==================== CSV EXTRACTION ====================

@router.post("/test-extract-csv", response_model=CSVExtractionResponse)
async def test_extract_csv_data(
    file: UploadFile = File(...),
    park_id: int = None,
    park_name: str = None
):
    """
    Test CSV extraction without authentication
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File harus berupa CSV"
        )
    
    try:
        # Read CSV content
        content = await file.read()
        csv_content = io.StringIO(content.decode('utf-8'))
        
        # Prepare park info
        park_info = {
            "id": park_id,
            "name": park_name or "Unknown Park",
            "description": "Park data extraction"
        }
        
        # Extract data using AI
        ai_service = ComprehensiveAIService()
        result = await ai_service.extract_csv_data(csv_content.getvalue(), park_info)
        
        return CSVExtractionResponse(
            success=result["success"],
            message="Data CSV berhasil diekstrak" if result["success"] else f"Gagal mengekstrak data: {result.get('error', 'Unknown error')}",
            analysis=result.get("analysis"),
            flora_data=result.get("flora_data", []),
            fauna_data=result.get("fauna_data", []),
            articles_data=result.get("articles_data", []),
            total_records=result.get("total_records", 0),
            valid_records=result.get("valid_records", 0)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses file CSV: {str(e)}"
        ) from e

@router.post("/preview-csv-mapping")
async def preview_csv_mapping(
    file: UploadFile = File(...),
    park_id: int = None,
    park_name: str = None
):
    """
    Preview CSV mapping without extraction - for user review and editing
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File harus berupa CSV"
        )
    
    try:
        # Read CSV content
        content = await file.read()
        csv_content_str = content.decode('utf-8')
        
        # Create park info
        park_info = {
            "id": park_id,
            "name": park_name or "Unknown Park"
        }
        
        # Parse CSV to get columns and sample data
        import csv
        import io
        
        # Parse CSV content
        csv_reader = csv.DictReader(io.StringIO(csv_content_str))
        columns = csv_reader.fieldnames or []
        
        # Get sample data (first 5 rows)
        sample_data = {}
        for col in columns:
            sample_data[col] = []
        
        # Read first 5 rows for sample data
        row_count = 0
        for row in csv_reader:
            if row_count >= 5:
                break
            for col in columns:
                if col in row and row[col]:
                    sample_data[col].append(row[col])
            row_count += 1
        
        # Get total row count
        total_rows = sum(1 for _ in csv.DictReader(io.StringIO(csv_content_str)))
        
        # Create intelligent mapping
        ai_service = ComprehensiveAIService()
        mapping = ai_service.column_mapper.create_intelligent_mapping(columns, sample_data)
        
        return {
            "success": True,
            "columns": columns,
            "sample_data": sample_data,
            "mapping": mapping,
            "total_rows": total_rows,
            "message": "CSV mapping preview generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat preview mapping CSV: {str(e)}"
        ) from e

@router.post("/extract-csv", response_model=CSVExtractionResponse)
async def extract_csv_data(
    file: UploadFile = File(...),
    park_id: int = None,
    park_name: str = None,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Extract and validate data from CSV file for park import
    Only accessible by regional_admin
    """
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File harus berupa CSV"
        )
    
    try:
        # Read CSV content
        content = await file.read()
        csv_content = io.StringIO(content.decode('utf-8'))
        
        # Prepare park info
        park_info = {
            "id": park_id,
            "name": park_name or "Unknown Park",
            "description": "Park data extraction"
        }
        
        # Extract data using AI
        ai_service = ComprehensiveAIService()
        result = await ai_service.extract_csv_data(csv_content.getvalue(), park_info)
        
        return CSVExtractionResponse(
            success=result["success"],
            message="Data CSV berhasil diekstrak" if result["success"] else f"Gagal mengekstrak data: {result.get('error', 'Unknown error')}",
            analysis=result.get("analysis"),
            flora_data=result.get("flora_data", []),
            fauna_data=result.get("fauna_data", []),
            articles_data=result.get("articles_data", []),
            total_records=result.get("total_records", 0),
            valid_records=result.get("valid_records", 0)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses file CSV: {str(e)}"
        ) from e

# ==================== BULK IMPORT ====================

@router.post("/bulk-import", response_model=AIResponse)
async def bulk_import_data(
    extraction_result: CSVExtractionResponse,
    park_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Import extracted data to database
    Only accessible by regional_admin
    """
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    if not extraction_result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data extraction tidak berhasil"
        )
    
    try:
        import_service = CSVImportService(db)
        
        # Validate park access
        if not await import_service.validate_park_access(park_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tidak memiliki akses ke taman ini"
            )
        
        # Import flora data
        flora_result = await import_service.import_flora_data(
            extraction_result.flora_data, 
            park_id, 
            current_user.id
        )
        
        # Import fauna data
        fauna_result = await import_service.import_fauna_data(
            extraction_result.fauna_data, 
            park_id, 
            current_user.id
        )
        
        # Import articles data
        articles_result = await import_service.import_articles_data(
            extraction_result.articles_data, 
            park_id, 
            current_user.id
        )
        
        # Get import summary
        summary = await import_service.get_import_summary(park_id)
        
        return AIResponse(
            success=True,
            message=f"Data berhasil diimpor: {flora_result['imported_count']} flora, {fauna_result['imported_count']} fauna, {articles_result['imported_count']} artikel",
            data={
                "flora_imported": flora_result['imported_count'],
                "fauna_imported": fauna_result['imported_count'],
                "articles_imported": articles_result['imported_count'],
                "total_imported": flora_result['imported_count'] + fauna_result['imported_count'] + articles_result['imported_count'],
                "flora_errors": flora_result['errors'],
                "fauna_errors": fauna_result['errors'],
                "articles_errors": articles_result['errors'],
                "summary": summary
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengimpor data: {str(e)}"
        ) from e

# ==================== VALIDATION ====================

@router.post("/validate-data", response_model=AIResponse)
async def validate_extracted_data(
    data: dict,
    data_type: str,  # 'flora', 'fauna', or 'article'
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Validate extracted data using AI
    Only accessible by regional_admin
    """
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        # Basic validation logic
        validation_score = 85  # Placeholder
        recommendations = ["Data sudah cukup lengkap", "Periksa format nama ilmiah"]
        
        # Check data completeness based on type
        if data_type == 'flora':
            required_fields = ['nama_lokal', 'nama_ilmiah']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                validation_score = max(0, validation_score - len(missing_fields) * 20)
                recommendations.append(f"Lengkapi field: {', '.join(missing_fields)}")
        elif data_type == 'fauna':
            required_fields = ['nama_lokal', 'nama_ilmiah']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                validation_score = max(0, validation_score - len(missing_fields) * 20)
                recommendations.append(f"Lengkapi field: {', '.join(missing_fields)}")
        elif data_type == 'article':
            required_fields = ['judul', 'konten']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                validation_score = max(0, validation_score - len(missing_fields) * 20)
                recommendations.append(f"Lengkapi field: {', '.join(missing_fields)}")
        
        return AIResponse(
            success=True,
            message=f"Validasi selesai dengan skor {validation_score}",
            data={
                "validation_score": validation_score,
                "recommendations": recommendations,
                "is_valid": validation_score >= 70
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memvalidasi data: {str(e)}"
        ) from e
