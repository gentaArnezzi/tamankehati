from fastapi import APIRouter
from . import (
    flora,
    fauna,
    parks_simple,
    artikel,
    galeri,
    stats,
    chatbot as chat,
    search,
    activities,
    dashboard_insights
)

__all__ = [
    "flora",
    "fauna",
    "parks_simple",
    "artikel",
    "galeri",
    "stats",
    "chat",
    "search",
    "activities",
    "dashboard_insights"
]

router = APIRouter()

# Include all public routes with single tag
router.include_router(flora.router, prefix="/flora", tags=["Public"])
router.include_router(fauna.router, prefix="/fauna", tags=["Public"])
router.include_router(parks_simple.router, prefix="/parks", tags=["Public"])
router.include_router(artikel.router, prefix="/artikel", tags=["Public"])
router.include_router(galeri.router, prefix="/galeri", tags=["Public"])
router.include_router(stats.router, prefix="/stats", tags=["Public"])
router.include_router(chat.router, prefix="/chat", tags=["Public"])
router.include_router(search.router, prefix="/search", tags=["Public"])
router.include_router(activities.router, prefix="/activities", tags=["Public"])
router.include_router(dashboard_insights.router, prefix="/dashboard", tags=["Public"])