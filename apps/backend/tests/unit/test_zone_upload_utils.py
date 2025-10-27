import os

import pytest
from shapely.geometry import GeometryCollection, LineString, Point, Polygon

from api.v1.routes import zones


def test_resolve_simplify_tolerance_override(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("ZONES_SIMPLIFY_TOLERANCE", "0.05")
    assert zones._resolve_simplify_tolerance(None) == pytest.approx(0.05)
    assert zones._resolve_simplify_tolerance(0.1) == 0.1
    monkeypatch.delenv("ZONES_SIMPLIFY_TOLERANCE")
    assert zones._resolve_simplify_tolerance(None) == 0.0


def test_as_multipolygon_accepts_polygon():
    poly = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
    mp = zones._as_multipolygon(poly)
    assert mp is not None
    assert mp.geom_type == "MultiPolygon"
    assert len(mp.geoms) == 1


def test_as_multipolygon_geometry_collection_filters_non_polygons():
    poly = Polygon([(0, 0), (2, 0), (2, 2), (0, 2)])
    collection = GeometryCollection([poly, Point(3, 3), LineString([(4, 4), (5, 5)])])
    mp = zones._as_multipolygon(collection)
    assert mp is not None
    assert mp.geom_type == "MultiPolygon"
    assert len(mp.geoms) == 1


def test_as_multipolygon_make_valid_self_intersection():
    invalid = Polygon([(0, 0), (2, 2), (0, 2), (2, 0), (0, 0)])
    assert not invalid.is_valid
    mp = zones._as_multipolygon(invalid)
    assert mp is not None
    assert mp.geom_type == "MultiPolygon"
    assert all(part.is_valid for part in mp.geoms)
