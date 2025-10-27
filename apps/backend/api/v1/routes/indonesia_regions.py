from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/indonesia-regions")

# Simple Indonesia regions data
INDONESIA_REGIONS = [
    {"id": "aceh", "name": "Aceh", "type": "province"},
    {"id": "sumatra-utara", "name": "Sumatra Utara", "type": "province"},
    {"id": "sumatra-barat", "name": "Sumatra Barat", "type": "province"},
    {"id": "riau", "name": "Riau", "type": "province"},
    {"id": "kepulauan-riau", "name": "Kepulauan Riau", "type": "province"},
    {"id": "jambi", "name": "Jambi", "type": "province"},
    {"id": "sumatra-selatan", "name": "Sumatra Selatan", "type": "province"},
    {"id": "bangka-belitung", "name": "Bangka Belitung", "type": "province"},
    {"id": "bengkulu", "name": "Bengkulu", "type": "province"},
    {"id": "lampung", "name": "Lampung", "type": "province"},
    {"id": "dki-jakarta", "name": "DKI Jakarta", "type": "province"},
    {"id": "jawa-barat", "name": "Jawa Barat", "type": "province"},
    {"id": "jawa-tengah", "name": "Jawa Tengah", "type": "province"},
    {"id": "di-yogyakarta", "name": "DI Yogyakarta", "type": "province"},
    {"id": "jawa-timur", "name": "Jawa Timur", "type": "province"},
    {"id": "banten", "name": "Banten", "type": "province"},
    {"id": "bali", "name": "Bali", "type": "province"},
    {"id": "nusa-tenggara-barat", "name": "Nusa Tenggara Barat", "type": "province"},
    {"id": "nusa-tenggara-timur", "name": "Nusa Tenggara Timur", "type": "province"},
    {"id": "kalimantan-barat", "name": "Kalimantan Barat", "type": "province"},
    {"id": "kalimantan-tengah", "name": "Kalimantan Tengah", "type": "province"},
    {"id": "kalimantan-selatan", "name": "Kalimantan Selatan", "type": "province"},
    {"id": "kalimantan-timur", "name": "Kalimantan Timur", "type": "province"},
    {"id": "kalimantan-utara", "name": "Kalimantan Utara", "type": "province"},
    {"id": "sulawesi-utara", "name": "Sulawesi Utara", "type": "province"},
    {"id": "sulawesi-tengah", "name": "Sulawesi Tengah", "type": "province"},
    {"id": "sulawesi-selatan", "name": "Sulawesi Selatan", "type": "province"},
    {"id": "sulawesi-tenggara", "name": "Sulawesi Tenggara", "type": "province"},
    {"id": "gorontalo", "name": "Gorontalo", "type": "province"},
    {"id": "sulawesi-barat", "name": "Sulawesi Barat", "type": "province"},
    {"id": "maluku", "name": "Maluku", "type": "province"},
    {"id": "maluku-utara", "name": "Maluku Utara", "type": "province"},
    {"id": "papua-barat", "name": "Papua Barat", "type": "province"},
    {"id": "papua", "name": "Papua", "type": "province"},
    {"id": "papua-tengah", "name": "Papua Tengah", "type": "province"},
    {"id": "papua-pegunungan", "name": "Papua Pegunungan", "type": "province"},
    {"id": "papua-selatan", "name": "Papua Selatan", "type": "province"},
    {"id": "papua-barat-daya", "name": "Papua Barat Daya", "type": "province"},
]

@router.get("/")
async def get_indonesia_regions() -> List[Dict[str, str]]:
    """Get list of Indonesia regions (provinces)"""
    return INDONESIA_REGIONS

@router.get("/{region_id}")
async def get_indonesia_region(region_id: str) -> Dict[str, str]:
    """Get specific Indonesia region by ID"""
    for region in INDONESIA_REGIONS:
        if region["id"] == region_id:
            return region
    
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Region not found")
