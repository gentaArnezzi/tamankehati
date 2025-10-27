"""
Health check and monitoring endpoints for Taman Kehati.
"""
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.database.session import get_db
from core.config.env import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "taman-kehati-backend",
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with database connectivity."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "taman-kehati-backend",
        "version": "1.0.0",
        "checks": {}
    }
    
    # Database connectivity check
    try:
        result = db.execute(text("SELECT 1")).scalar()
        health_status["checks"]["database"] = {
            "status": "healthy",
            "response_time_ms": 0  # Could add timing here
        }
    except Exception as e:
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    # Environment check
    try:
        health_status["checks"]["environment"] = {
            "status": "healthy",
            "debug_mode": settings.DEBUG,
            "database_configured": bool(settings.DATABASE_URL)
        }
    except Exception as e:
        health_status["checks"]["environment"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    return health_status

@router.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check for Kubernetes/container orchestration."""
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")

@router.get("/health/live")
async def liveness_check():
    """Liveness check for Kubernetes/container orchestration."""
    return {"status": "alive"}

@router.get("/metrics")
async def metrics():
    """Basic metrics endpoint (can be extended with Prometheus)."""
    return {
        "timestamp": datetime.now().isoformat(),
        "service": "taman-kehati-backend",
        "metrics": {
            "uptime": "N/A",  # Could implement actual uptime tracking
            "requests_total": "N/A",  # Could implement request counting
            "active_connections": "N/A"  # Could implement connection tracking
        }
    }
