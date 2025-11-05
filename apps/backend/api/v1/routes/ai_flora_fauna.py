from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
from core.database.session import get_session
from api.v1.permissions.rbac import current_user
from ai.services.flora_fauna_ai import FloraFaunaAIService

router = APIRouter(prefix="/ai", tags=["AI Flora Fauna"])

class FloraAIGenerateRequest(BaseModel):
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    is_endemic: Optional[bool] = None
    iucn_status: Optional[str] = None

class FaunaAIGenerateRequest(BaseModel):
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    is_endemic: Optional[bool] = None
    iucn_status: Optional[str] = None

class AIResponse(BaseModel):
    description: str
    success: bool
    message: str

@router.post("/generate-flora-description", response_model=AIResponse)
async def generate_flora_description(
    request: FloraAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate AI description for flora based on provided data
    Only accessible by regional_admin
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate description
        description = await ai_service.generate_flora_description(flora_data)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi flora berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi flora: {str(e)}"
        ) from e

@router.post("/generate-fauna-description", response_model=AIResponse)
async def generate_fauna_description(
    request: FaunaAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate AI description for fauna based on provided data
    Only accessible by regional_admin
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        fauna_data = request.dict()
        
        # Generate description
        description = await ai_service.generate_fauna_description(fauna_data)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi fauna berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi fauna: {str(e)}"
        ) from e

@router.post("/generate-flora-morphology", response_model=AIResponse)
async def generate_flora_morphology(
    request: FloraAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate AI morphology description for flora
    Only accessible by regional_admin
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate morphology description
        morphology = await ai_service.generate_morphology_description(flora_data)
        
        return AIResponse(
            description=morphology,
            success=True,
            message="Deskripsi morfologi flora berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi morfologi flora: {str(e)}"
        ) from e

@router.post("/generate-flora-benefits", response_model=AIResponse)
async def generate_flora_benefits(
    request: FloraAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user)
):
    """
    Generate AI benefits description for flora
    Only accessible by regional_admin
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate benefits description
        benefits = await ai_service.generate_benefits_description(flora_data)
        
        return AIResponse(
            description=benefits,
            success=True,
            message="Deskripsi manfaat flora berhasil dibuat"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi manfaat flora: {str(e)}"
        ) from e

@router.get("/test-ollama")
async def test_ollama_connection():
    """
    Test Ollama connection and model availability - Fast health check
    """
    import httpx
    import os
    
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")
    
    try:
        # Fast health check: ping Ollama API
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Step 1: Check if Ollama server is running
            try:
                response = await client.get(f"{OLLAMA_URL}/api/tags")
                if response.status_code != 200:
                    return {
                        "success": False,
                        "message": f"Ollama server tidak merespons (status: {response.status_code})",
                        "error": "Server not responding"
                    }
            except httpx.ConnectError:
                return {
                    "success": False,
                    "message": "Tidak dapat terhubung ke Ollama server",
                    "error": "Connection refused"
                }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Ollama server timeout (tidak merespons dalam 5 detik)",
                    "error": "Timeout"
                }
            
            # Step 2: Quick generation test with very short prompt and timeout
            try:
                test_payload = {
                    "model": OLLAMA_MODEL,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {
                        "num_predict": 5  # Only generate 5 tokens for quick test
                    }
                }
                response = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json=test_payload,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "message": "Koneksi Ollama berhasil",
                        "test_response": result.get("response", "")[:50]
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Generate API gagal (status: {response.status_code})",
                        "error": response.text[:200]
                    }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Generate test timeout (Ollama terlalu lambat)",
                    "error": "Generation timeout"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Generate test gagal: {str(e)}",
                    "error": str(e)
                }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Gagal koneksi ke Ollama: {str(e)}",
            "error": str(e)
        }

@router.get("/public/test-ollama")
async def test_ollama_connection_public():
    """
    Test Ollama connection and model availability (public endpoint) - Fast health check
    """
    import httpx
    import os
    
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")
    
    try:
        # Fast health check: ping Ollama API
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Step 1: Check if Ollama server is running
            try:
                response = await client.get(f"{OLLAMA_URL}/api/tags")
                if response.status_code != 200:
                    return {
                        "success": False,
                        "message": f"Ollama server tidak merespons (status: {response.status_code})",
                        "error": "Server not responding"
                    }
            except httpx.ConnectError:
                return {
                    "success": False,
                    "message": "Tidak dapat terhubung ke Ollama server",
                    "error": "Connection refused"
                }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Ollama server timeout (tidak merespons dalam 5 detik)",
                    "error": "Timeout"
                }
            
            # Step 2: Quick generation test with very short prompt and timeout
            try:
                test_payload = {
                    "model": OLLAMA_MODEL,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {
                        "num_predict": 5  # Only generate 5 tokens for quick test
                    }
                }
                response = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json=test_payload,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "message": "Koneksi Ollama berhasil",
                        "test_response": result.get("response", "")[:50]
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Generate API gagal (status: {response.status_code})",
                        "error": response.text[:200]
                    }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Generate test timeout (Ollama terlalu lambat)",
                    "error": "Generation timeout"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Generate test gagal: {str(e)}",
                    "error": str(e)
                }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Gagal koneksi ke Ollama: {str(e)}",
            "error": str(e)
        }

@router.post("/test-fauna")
async def test_fauna_generation():
    """
    Test fauna generation without authentication
    """
    try:
        ai_service = FloraFaunaAIService()
        
        test_data = {
            "local_name": "Harimau Sumatera",
            "scientific_name": "Panthera tigris sumatrae",
            "family": "Felidae",
            "genus": "Panthera",
            "is_endemic": True,
            "iucn_status": "CR"
        }
        
        description = await ai_service.generate_fauna_description(test_data)
        
        return {
            "success": True,
            "message": "Fauna generation berhasil",
            "description": description
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Gagal generate fauna: {str(e)}",
            "error": str(e)
        }

@router.post("/public/generate-fauna-description")
async def public_generate_fauna_description(request: FaunaAIGenerateRequest):
    """
    Public fauna generation without authentication for testing
    Note: This endpoint is for testing only. In production, use authenticated endpoints.
    """
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        fauna_data = request.dict()
        
        # Generate description
        description = await ai_service.generate_fauna_description(fauna_data)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi fauna berhasil dibuat"
        )
        
    except Exception as e:
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat deskripsi fauna: {str(e)}"
        )

@router.post("/public/generate-flora-description")
async def public_generate_flora_description(request: FloraAIGenerateRequest):
    """
    Public flora generation without authentication for testing
    """
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate description
        description = await ai_service.generate_flora_description(flora_data)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi flora berhasil dibuat"
        )
        
    except Exception as e:
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat deskripsi flora: {str(e)}"
        )

@router.post("/public/generate-flora-morphology")
async def public_generate_flora_morphology(request: FloraAIGenerateRequest):
    """
    Public flora morphology generation without authentication for testing
    """
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate morphology
        morphology = await ai_service.generate_morphology_description(flora_data)
        
        return AIResponse(
            description=morphology,
            success=True,
            message="Morfologi flora berhasil dibuat"
        )
        
    except Exception as e:
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat morfologi flora: {str(e)}"
        )

@router.post("/public/generate-flora-benefits")
async def public_generate_flora_benefits(request: FloraAIGenerateRequest):
    """
    Public flora benefits generation without authentication for testing
    """
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate benefits
        benefits = await ai_service.generate_benefits_description(flora_data)
        
        return AIResponse(
            description=benefits,
            success=True,
            message="Manfaat flora berhasil dibuat"
        )
        
    except Exception as e:
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat manfaat flora: {str(e)}"
        )
