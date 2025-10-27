from fastapi import APIRouter
from domains.regions.api.v1.endpoints import regions

router = APIRouter()
router.include_router(
    regions.router,
    prefix="/regions",
    tags=["regions"]
)
