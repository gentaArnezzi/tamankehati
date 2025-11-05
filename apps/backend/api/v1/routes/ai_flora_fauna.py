from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
import json
import time
import logging
import httpx
from core.database.session import get_session
from api.v1.permissions.rbac import current_user
from ai.services.flora_fauna_ai import FloraFaunaAIService

logger = logging.getLogger(__name__)

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
    current_user = Depends(current_user),
    stream: bool = Query(False, description="Enable streaming response")
):
    """
    Generate AI description for flora based on provided data
    Only accessible by regional_admin
    Supports streaming mode for progressive text display
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    start_time = time.time()
    ai_service = FloraFaunaAIService()
    flora_data = request.dict()
    
    try:
        if stream:
            # Streaming mode - return progressive response
            async def stream_generator():
                try:
                    prompt = ai_service._build_flora_prompt(flora_data)
                    messages = [
                        {
                            "role": "system",
                            "content": "Anda adalah ahli botani Indonesia yang berpengalaman. Tugas Anda adalah membuat deskripsi yang informatif, akurat, dan menarik tentang flora Indonesia berdasarkan data yang diberikan. Deskripsi harus dalam bahasa Indonesia yang mudah dipahami oleh masyarakat umum."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                    
                    yield "event: start\n\n"
                    aggregated = []
                    
                    async for chunk in ai_service.ollama_provider.stream(messages):
                        aggregated.append(chunk)
                        # Send chunk as SSE
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    
                    final_text = "".join(aggregated)
                    duration = time.time() - start_time
                    logger.info("AI request duration: %.2fs for flora description (streaming)", duration)
                    yield f"event: done\ndata: {json.dumps({'text': final_text, 'duration': round(duration, 2)})}\n\n"
                except Exception as e:
                    logger.error(f"Error in streaming flora description: {str(e)}")
                    yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            # Non-streaming mode (backward compatible)
            description = await ai_service.generate_flora_description(flora_data)
            duration = time.time() - start_time
            logger.info("AI request duration: %.2fs for flora description (non-streaming)", duration)
            
            return AIResponse(
                description=description,
                success=True,
                message="Deskripsi flora berhasil dibuat"
            )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora description after %.2fs: %s", duration, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi flora: {str(e)}"
        ) from e

@router.post("/generate-fauna-description", response_model=AIResponse)
async def generate_fauna_description(
    request: FaunaAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user),
    stream: bool = Query(False, description="Enable streaming response")
):
    """
    Generate AI description for fauna based on provided data
    Only accessible by regional_admin
    Supports streaming mode for progressive text display
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    start_time = time.time()
    ai_service = FloraFaunaAIService()
    fauna_data = request.dict()
    
    try:
        if stream:
            # Streaming mode - return progressive response
            async def stream_generator():
                try:
                    prompt = ai_service._build_fauna_prompt(fauna_data)
                    messages = [
                        {
                            "role": "system",
                            "content": "Anda adalah ahli zoologi Indonesia yang berpengalaman. Tugas Anda adalah membuat deskripsi yang informatif, akurat, dan menarik tentang fauna Indonesia berdasarkan data yang diberikan. Deskripsi harus dalam bahasa Indonesia yang mudah dipahami oleh masyarakat umum."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                    
                    yield "event: start\n\n"
                    aggregated = []
                    
                    async for chunk in ai_service.ollama_provider.stream(messages):
                        aggregated.append(chunk)
                        # Send chunk as SSE
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    
                    final_text = "".join(aggregated)
                    duration = time.time() - start_time
                    logger.info("AI request duration: %.2fs for fauna description (streaming)", duration)
                    yield f"event: done\ndata: {json.dumps({'text': final_text, 'duration': round(duration, 2)})}\n\n"
                except Exception as e:
                    logger.error(f"Error in streaming fauna description: {str(e)}")
                    yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            # Non-streaming mode (backward compatible)
            description = await ai_service.generate_fauna_description(fauna_data)
            duration = time.time() - start_time
            logger.info("AI request duration: %.2fs for fauna description (non-streaming)", duration)
            
            return AIResponse(
                description=description,
                success=True,
                message="Deskripsi fauna berhasil dibuat"
            )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating fauna description after %.2fs: %s", duration, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi fauna: {str(e)}"
        ) from e

@router.post("/generate-flora-morphology", response_model=AIResponse)
async def generate_flora_morphology(
    request: FloraAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user),
    stream: bool = Query(False, description="Enable streaming response")
):
    """
    Generate AI morphology description for flora
    Only accessible by regional_admin
    Supports streaming mode for progressive text display
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    start_time = time.time()
    ai_service = FloraFaunaAIService()
    flora_data = request.dict()
    
    try:
        if stream:
            # Streaming mode
            async def stream_generator():
                try:
                    prompt = ai_service._build_morphology_prompt(flora_data)
                    messages = [
                        {
                            "role": "system",
                            "content": "Anda adalah ahli morfologi tumbuhan yang berpengalaman. Buatkan deskripsi morfologi yang detail dan akurat berdasarkan data yang diberikan."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                    
                    yield "event: start\n\n"
                    aggregated = []
                    
                    async for chunk in ai_service.ollama_provider.stream(messages):
                        aggregated.append(chunk)
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    
                    final_text = "".join(aggregated)
                    duration = time.time() - start_time
                    logger.info("AI request duration: %.2fs for flora morphology (streaming)", duration)
                    yield f"event: done\ndata: {json.dumps({'text': final_text, 'duration': round(duration, 2)})}\n\n"
                except Exception as e:
                    logger.error(f"Error in streaming flora morphology: {str(e)}")
                    yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            # Non-streaming mode
            morphology = await ai_service.generate_morphology_description(flora_data)
            duration = time.time() - start_time
            logger.info("AI request duration: %.2fs for flora morphology (non-streaming)", duration)
            
            return AIResponse(
                description=morphology,
                success=True,
                message="Deskripsi morfologi flora berhasil dibuat"
            )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora morphology after %.2fs: %s", duration, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi morfologi flora: {str(e)}"
        ) from e

@router.post("/generate-flora-benefits", response_model=AIResponse)
async def generate_flora_benefits(
    request: FloraAIGenerateRequest,
    _db: AsyncSession = Depends(get_session),
    current_user = Depends(current_user),
    stream: bool = Query(False, description="Enable streaming response")
):
    """
    Generate AI benefits description for flora
    Only accessible by regional_admin
    Supports streaming mode for progressive text display
    """
    # Check if user is regional_admin
    if current_user.role != 'regional_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI features hanya dapat digunakan oleh Regional Admin"
        )
    
    start_time = time.time()
    ai_service = FloraFaunaAIService()
    flora_data = request.dict()
    
    try:
        if stream:
            # Streaming mode
            async def stream_generator():
                try:
                    prompt = ai_service._build_benefits_prompt(flora_data)
                    messages = [
                        {
                            "role": "system",
                            "content": "Anda adalah ahli etnobotani Indonesia yang berpengalaman. Buatkan deskripsi tentang manfaat dan kegunaan tumbuhan berdasarkan data yang diberikan."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                    
                    yield "event: start\n\n"
                    aggregated = []
                    
                    async for chunk in ai_service.ollama_provider.stream(messages):
                        aggregated.append(chunk)
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    
                    final_text = "".join(aggregated)
                    duration = time.time() - start_time
                    logger.info("AI request duration: %.2fs for flora benefits (streaming)", duration)
                    yield f"event: done\ndata: {json.dumps({'text': final_text, 'duration': round(duration, 2)})}\n\n"
                except Exception as e:
                    logger.error(f"Error in streaming flora benefits: {str(e)}")
                    yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            # Non-streaming mode
            benefits = await ai_service.generate_benefits_description(flora_data)
            duration = time.time() - start_time
            logger.info("AI request duration: %.2fs for flora benefits (non-streaming)", duration)
            
            return AIResponse(
                description=benefits,
                success=True,
                message="Deskripsi manfaat flora berhasil dibuat"
            )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora benefits after %.2fs: %s", duration, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat deskripsi manfaat flora: {str(e)}"
        ) from e

@router.get("/test-ollama")
async def test_ollama_connection():
    """
    Test Ollama connection and model availability - Fast health check (ping only)
    Optimized for speed: only ping, no generation test to avoid timeout
    """
    import httpx
    import os
    
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")
    
    try:
        # Fast health check: ping Ollama API only (no generation test)
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check if Ollama server is running and model is available
            try:
                response = await client.get(f"{OLLAMA_URL}/api/tags")
                if response.status_code != 200:
                    return {
                        "success": False,
                        "message": f"Ollama server tidak merespons (status: {response.status_code})",
                        "error": "Server not responding"
                    }
                
                # Check if model is available
                models_data = response.json()
                models = models_data.get("models", [])
                model_names = [m.get("name", "") for m in models]
                
                # Check if requested model exists
                model_found = any(OLLAMA_MODEL in name or name in OLLAMA_MODEL for name in model_names)
                
                if not model_found and models:
                    # Return success but warn about model
                    return {
                        "success": True,
                        "message": f"Ollama server berjalan, tetapi model '{OLLAMA_MODEL}' tidak ditemukan. Model tersedia: {', '.join(model_names[:3])}",
                        "available_models": model_names[:5],
                        "warning": f"Model {OLLAMA_MODEL} not found, but server is accessible"
                    }
                
                return {
                    "success": True,
                    "message": "Koneksi Ollama berhasil",
                    "available_models": model_names[:5],
                    "model_checked": OLLAMA_MODEL,
                    "model_found": model_found
                }
                
            except httpx.ConnectError as e:
                return {
                    "success": False,
                    "message": f"Tidak dapat terhubung ke Ollama server di {OLLAMA_URL}",
                    "error": "Connection refused",
                    "suggestion": "Pastikan Ollama running dan OLLAMA_URL benar"
                }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Ollama server timeout (tidak merespons dalam 10 detik)",
                    "error": "Timeout",
                    "suggestion": "Cek apakah Ollama server overloaded atau tidak running"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error saat cek koneksi: {str(e)}",
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
    Test Ollama connection and model availability (public endpoint) - Fast health check (ping only)
    Optimized for speed: only ping, no generation test to avoid timeout
    """
    import httpx
    import os
    
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")
    
    try:
        # Fast health check: ping Ollama API only (no generation test)
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check if Ollama server is running and model is available
            try:
                response = await client.get(f"{OLLAMA_URL}/api/tags")
                if response.status_code != 200:
                    return {
                        "success": False,
                        "message": f"Ollama server tidak merespons (status: {response.status_code})",
                        "error": "Server not responding"
                    }
                
                # Check if model is available
                models_data = response.json()
                models = models_data.get("models", [])
                model_names = [m.get("name", "") for m in models]
                
                # Check if requested model exists
                model_found = any(OLLAMA_MODEL in name or name in OLLAMA_MODEL for name in model_names)
                
                if not model_found and models:
                    # Return success but warn about model
                    return {
                        "success": True,
                        "message": f"Ollama server berjalan, tetapi model '{OLLAMA_MODEL}' tidak ditemukan. Model tersedia: {', '.join(model_names[:3])}",
                        "available_models": model_names[:5],
                        "warning": f"Model {OLLAMA_MODEL} not found, but server is accessible"
                    }
                
                return {
                    "success": True,
                    "message": "Koneksi Ollama berhasil",
                    "available_models": model_names[:5],
                    "model_checked": OLLAMA_MODEL,
                    "model_found": model_found
                }
                
            except httpx.ConnectError as e:
                return {
                    "success": False,
                    "message": f"Tidak dapat terhubung ke Ollama server di {OLLAMA_URL}",
                    "error": "Connection refused",
                    "suggestion": "Pastikan Ollama running dan OLLAMA_URL benar"
                }
            except httpx.TimeoutException:
                return {
                    "success": False,
                    "message": "Ollama server timeout (tidak merespons dalam 10 detik)",
                    "error": "Timeout",
                    "suggestion": "Cek apakah Ollama server overloaded atau tidak running"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error saat cek koneksi: {str(e)}",
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
    Includes explicit timeout handling matching backend timeout settings
    """
    start_time = time.time()
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        fauna_data = request.dict()
        
        # Generate description (timeout handled by OllamaProvider: 120s small, 180s large)
        description = await ai_service.generate_fauna_description(fauna_data)
        
        duration = time.time() - start_time
        logger.info("AI request duration: %.2fs for public fauna description", duration)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi fauna berhasil dibuat"
        )
        
    except httpx.TimeoutException as e:
        duration = time.time() - start_time
        logger.error("Timeout generating fauna description after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message="Timeout: Generate memakan waktu terlalu lama. Silakan coba lagi atau gunakan data yang lebih lengkap."
        )
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating fauna description after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat deskripsi fauna: {str(e)}"
        )

@router.post("/public/generate-flora-description")
async def public_generate_flora_description(request: FloraAIGenerateRequest):
    """
    Public flora generation without authentication for testing
    Includes explicit timeout handling matching backend timeout settings
    """
    start_time = time.time()
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate description (timeout handled by OllamaProvider: 120s small, 180s large)
        description = await ai_service.generate_flora_description(flora_data)
        
        duration = time.time() - start_time
        logger.info("AI request duration: %.2fs for public flora description", duration)
        
        return AIResponse(
            description=description,
            success=True,
            message="Deskripsi flora berhasil dibuat"
        )
        
    except httpx.TimeoutException as e:
        duration = time.time() - start_time
        logger.error("Timeout generating flora description after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message="Timeout: Generate memakan waktu terlalu lama. Silakan coba lagi atau gunakan data yang lebih lengkap."
        )
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora description after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat deskripsi flora: {str(e)}"
        )

@router.post("/public/generate-flora-morphology")
async def public_generate_flora_morphology(request: FloraAIGenerateRequest):
    """
    Public flora morphology generation without authentication for testing
    Includes explicit timeout handling matching backend timeout settings
    """
    start_time = time.time()
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate morphology (timeout handled by OllamaProvider: 120s small, 180s large)
        morphology = await ai_service.generate_morphology_description(flora_data)
        
        duration = time.time() - start_time
        logger.info("AI request duration: %.2fs for public flora morphology", duration)
        
        return AIResponse(
            description=morphology,
            success=True,
            message="Morfologi flora berhasil dibuat"
        )
        
    except httpx.TimeoutException as e:
        duration = time.time() - start_time
        logger.error("Timeout generating flora morphology after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message="Timeout: Generate memakan waktu terlalu lama. Silakan coba lagi atau gunakan data yang lebih lengkap."
        )
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora morphology after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat morfologi flora: {str(e)}"
        )

@router.post("/public/generate-flora-benefits")
async def public_generate_flora_benefits(request: FloraAIGenerateRequest):
    """
    Public flora benefits generation without authentication for testing
    Includes explicit timeout handling matching backend timeout settings
    """
    start_time = time.time()
    try:
        ai_service = FloraFaunaAIService()
        
        # Convert request to dict
        flora_data = request.dict()
        
        # Generate benefits (timeout handled by OllamaProvider: 120s small, 180s large)
        benefits = await ai_service.generate_benefits_description(flora_data)
        
        duration = time.time() - start_time
        logger.info("AI request duration: %.2fs for public flora benefits", duration)
        
        return AIResponse(
            description=benefits,
            success=True,
            message="Manfaat flora berhasil dibuat"
        )
        
    except httpx.TimeoutException as e:
        duration = time.time() - start_time
        logger.error("Timeout generating flora benefits after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message="Timeout: Generate memakan waktu terlalu lama. Silakan coba lagi atau gunakan data yang lebih lengkap."
        )
    except Exception as e:
        duration = time.time() - start_time
        logger.error("Error generating flora benefits after %.2fs: %s", duration, str(e))
        return AIResponse(
            description="",
            success=False,
            message=f"Gagal membuat manfaat flora: {str(e)}"
        )
