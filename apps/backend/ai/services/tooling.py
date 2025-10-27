import re
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
# Zone tools disabled since park_zones table removed
# from ai.tools.zone import get_zone_stats, list_endemic_by_region, count_by_iucn_status
from ai.tools.species import find_species_by_bbox, species_near_point

ZONE_STATS_RE = re.compile(r"\b(zone\s*stats|stats\s*zone)\s*(\d+)\b", re.IGNORECASE)
BBOX_RE = re.compile(r"\bbbox\s*=\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\b", re.IGNORECASE)
NEAR_RE = re.compile(r"\bnear\s*:\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)(?:\s*,\s*(\d*\.?\d+)\s*km)?\b", re.IGNORECASE)
ENDEMIC_RE = re.compile(r"\bendemic\s+([A-Z0-9_\-]+)\b", re.IGNORECASE)
IUCN_RE = re.compile(r"\biucn\s+([A-Z0-9_\-]+)\b", re.IGNORECASE)

# New flexible patterns for natural language queries
CRITICAL_RE = re.compile(r"\b(critically?\s*)?endangered\s+species\b", re.IGNORECASE)
SHOW_SPECIES_RE = re.compile(r"\b(show|list|tell\s+me\s+about|what\s+are)\s+(critically?\s*)?endangered\s+species\b", re.IGNORECASE)
CONSERVATION_RE = re.compile(r"\b(conservation|protected|preserve)\s+(areas?|zones?|regions?)\b", re.IGNORECASE)
FLORA_INFO_RE = re.compile(r"\b(flora|plants?|flowers?|trees?)\s+(in\s+)?([A-Z]+|indonesia)\b", re.IGNORECASE)
FAUNA_INFO_RE = re.compile(r"\b(fauna|animals?|wildlife|mammals?|birds?|reptiles?|amphibians?)\s+(in\s+)?([A-Z]+|indonesia)\b", re.IGNORECASE)

async def maybe_run_tool(db: AsyncSession, user_text: str) -> Optional[str]:
    """Zone tools disabled since park_zones table removed"""
    return None
    
    if not user_text:
        return None

    m = ZONE_STATS_RE.search(user_text)
    if m:
        zone_id = int(m.group(2))
        stats = await get_zone_stats(db, zone_id)
        return ("TOOL:get_zone_stats\n"
                f"zone_id: {stats['zone_id']}\n"
                f"area_m2: {stats['area_m2']:.2f}\n"
                f"flora_count: {stats['flora_count']}\n"
                f"fauna_count: {stats['fauna_count']}\n"
                f"sample_flora: {', '.join(stats['sample_flora']) or '-'}\n"
                f"sample_fauna: {', '.join(stats['sample_fauna']) or '-'}\n")

    m = BBOX_RE.search(user_text)
    if m:
        minx, miny, maxx, maxy = map(float, m.groups())
        res = await find_species_by_bbox(db, minx, miny, maxx, maxy, limit=50)
        flora = ", ".join(res["flora"]) if res["flora"] else "-"
        fauna = ", ".join(res["fauna"]) if res["fauna"] else "-"
        return ("TOOL:find_species_by_bbox\n"
                f"bbox: {res['bbox']}\n"
                f"zones_intersect: {res['zone_count']}\n"
                f"flora: {flora}\n"
                f"fauna: {fauna}\n")

    m = NEAR_RE.search(user_text)
    if m:
        lon, lat = float(m.group(1)), float(m.group(2))
        radius_km = float(m.group(3)) if m.group(3) else 5.0
        res = await species_near_point(db, lon, lat, radius_km=radius_km, limit=50)
        flora = ", ".join(res["flora"]) if res["flora"] else "-"
        fauna = ", ".join(res["fauna"]) if res["fauna"] else "-"
        return ("TOOL:species_near_point\n"
                f"point: {res['point']}\n"
                f"radius_km: {res['radius_km']}\n"
                f"zones_intersect: {res['zone_count']}\n"
                f"flora: {flora}\n"
                f"fauna: {fauna}\n")

    m = ENDEMIC_RE.search(user_text)
    if m:
        region = m.group(1).upper()
        res = await list_endemic_by_region(db, region, limit=50)
        flora = ", ".join(res["flora"]) if res["flora"] else "-"
        fauna = ", ".join(res["fauna"]) if res["fauna"] else "-"
        return ("TOOL:list_endemic_by_region\n"
                f"region_code: {region}\n"
                f"flora: {flora}\n"
                f"fauna: {fauna}\n")

    m = IUCN_RE.search(user_text)
    if m:
        region = m.group(1).upper()
        res = await count_by_iucn_status(db, region)
        flora_stats = ", ".join([f"{k}:{v}" for k,v in sorted(res["flora"].items())]) or "-"
        fauna_stats = ", ".join([f"{k}:{v}" for k,v in sorted(res["fauna"].items())]) or "-"
        return ("TOOL:count_by_iucn_status\n"
                f"region_code: {region}\n"
                f"flora: {flora_stats}\n"
                f"fauna: {fauna_stats}\n")

    # Handle natural language queries for endangered species
    m = SHOW_SPECIES_RE.search(user_text) or CRITICAL_RE.search(user_text)
    if m:
        # Get all critically endangered species
        res = await count_by_iucn_status(db, "CR")
        flora_list = [f"{k} ({v})" for k, v in res["flora"].items() if v > 0] or ["-"]
        fauna_list = [f"{k} ({v})" for k, v in res["fauna"].items() if v > 0] or ["-"]

        flora_text = ", ".join(flora_list)
        fauna_text = ", ".join(fauna_list)

        return ("TOOL:critically_endangered_species\n"
                "CRITICALLY ENDANGERED SPECIES IN INDONESIA:\n\n"
                f"🌿 Flora (Plants): {flora_text}\n"
                f"🐾 Fauna (Animals): {fauna_text}\n\n"
                "These species are protected under Indonesian conservation laws and international agreements.")

    # Handle conservation areas queries
    m = CONSERVATION_RE.search(user_text)
    if m:
        # Get zones by region or general info
        region_match = re.search(r'\b(KALTIM|SUMUT|JAWA|BALI|PAPUA|SULAWESI|NUSA)\b', user_text.upper())
        if region_match:
            region = region_match.group(1)
            res = await list_endemic_by_region(db, region, limit=20)
        else:
            # General conservation info
            res = {"flora": ["Rafflesia", "Kantong Semar"], "fauna": ["Orangutan", "Badak Jawa"]}

        flora_text = ", ".join(res.get("flora", ["-"])) if isinstance(res, dict) and "flora" in res else str(res)
        fauna_text = ", ".join(res.get("fauna", ["-"])) if isinstance(res, dict) and "fauna" in res else ""

        return ("TOOL:conservation_areas\n"
                "INDONESIAN CONSERVATION AREAS:\n\n"
                f"🌿 Protected Flora: {flora_text}\n"
                f"🐾 Protected Fauna: {fauna_text}\n\n"
                "Indonesia has established extensive network of conservation areas to protect its unique biodiversity.")

    # Handle flora information queries
    m = FLORA_INFO_RE.search(user_text)
    if m:
        region_match = m.group(3) if m.group(3) else None
        if region_match and region_match.upper() in ['KALTIM', 'SUMUT', 'JAWA', 'BALI']:
            res = await list_endemic_by_region(db, region_match.upper(), limit=10)
            flora_text = ", ".join(res.get("flora", ["-"])) if "flora" in res else "No data available"
        else:
            flora_text = "Rafflesia arnoldii (largest flower), Amorphophallus titanum (corpse flower), Nepenthes rafflesiana (pitcher plant)"

        return ("TOOL:flora_information\n"
                "INDONESIAN FLORA INFORMATION:\n\n"
                f"🌿 Notable Species: {flora_text}\n\n"
                "Indonesia is home to over 40,000 plant species, many of which are endemic and have medicinal value.")

    # Handle fauna information queries
    m = FAUNA_INFO_RE.search(user_text)
    if m:
        region_match = m.group(3) if m.group(3) else None
        if region_match and region_match.upper() in ['KALTIM', 'SUMUT', 'JAWA', 'BALI']:
            res = await list_endemic_by_region(db, region_match.upper(), limit=10)
            fauna_text = ", ".join(res.get("fauna", ["-"])) if "fauna" in res else "No data available"
        else:
            fauna_text = "Orangutan (Pongo pygmaeus), Sumatran elephant (Elephas maximus sumatranus), Javan rhino (Rhinoceros sondaicus)"

        return ("TOOL:fauna_information\n"
                "INDONESIAN FAUNA INFORMATION:\n\n"
                f"🐾 Notable Species: {fauna_text}\n\n"
                "Indonesia's wildlife includes many endemic species found nowhere else on Earth.")

    return None
