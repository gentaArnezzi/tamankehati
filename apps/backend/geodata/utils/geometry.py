from typing import Any, Optional
from geoalchemy2 import functions as ST
from sqlalchemy.sql import expression

def _as_feature_geometry(obj: Any) -> Optional[dict]:
    # Accept either a Feature or raw Geometry
    if not isinstance(obj, dict):
        return None
    if obj.get("type") == "Feature":
        return obj.get("geometry")
    if obj.get("type") in {"Polygon", "MultiPolygon"}:
        return obj
    return None

def build_geom_expr_from_geojson(geojson_obj: Any, simplify_tolerance: float = 0.0):
    geom = _as_feature_geometry(geojson_obj)
    if not geom:
        raise ValueError("invalid_geojson")
    geom_json = expression.bindparam("geom_json", value=geom)  # passed as JSON via dialect
    expr = ST.ST_GeomFromGeoJSON(geom_json)
    expr = ST.ST_SetSRID(expr, 4326)
    if simplify_tolerance and simplify_tolerance > 0:
        expr = ST.ST_SimplifyPreserveTopology(expr, simplify_tolerance)
    # ensure multipolygon
    expr = ST.ST_Multi(expr)
    return expr

def build_geom_expr_from_wkt(wkt_text: str, simplify_tolerance: float = 0.0):
    if not isinstance(wkt_text, str) or not wkt_text.strip():
        raise ValueError("invalid_wkt")
    wkt = expression.bindparam("geom_wkt", value=wkt_text)
    expr = ST.ST_GeomFromText(wkt, 4326)
    if simplify_tolerance and simplify_tolerance > 0:
        expr = ST.ST_SimplifyPreserveTopology(expr, simplify_tolerance)
    # ensure multipolygon
    expr = ST.ST_Multi(expr)
    return expr
