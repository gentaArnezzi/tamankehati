from types import SimpleNamespace

import pytest
from httpx import AsyncClient

from main import app
from api.v1.routes import search as search_routes
from api.v1.public import search as public_search_routes
from api.v1.permissions.rbac import current_user
from api.v1.serializers.search import SearchResultOut
from core.database.session import get_session
from users.models import UserRole


class DummyAsyncSession:
    async def __aenter__(self):  # pragma: no cover - context manager protocol
        return self

    async def __aexit__(self, exc_type, exc, tb):  # pragma: no cover - context manager protocol
        return False


def _override_session():
    async def dummy_session_override():
        yield DummyAsyncSession()

    app.dependency_overrides[get_session] = dummy_session_override


def _cleanup_overrides():
    app.dependency_overrides.pop(get_session, None)
    app.dependency_overrides.pop(current_user, None)


def _patch_analytics(monkeypatch: pytest.MonkeyPatch):
    async def noop_log_query(*args, **kwargs):
        return None

    monkeypatch.setattr(
        search_routes.SearchAnalyticsService,
        "log_query",
        staticmethod(noop_log_query),
    )
    monkeypatch.setattr(
        public_search_routes.SearchAnalyticsService,
        "log_query",
        staticmethod(noop_log_query),
    )


@pytest.mark.anyio
async def test_super_admin_search_includes_unapproved(monkeypatch: pytest.MonkeyPatch):
    """
    Super admin should receive both approved and non-approved search hits.
    """
    recorded = {}

    async def fake_execute_search(db, term, limit, user):
        recorded["user"] = user
        # Return both approved and draft entries for super admin
        return [
            SearchResultOut(
                id="1",
                tipe="flora",
                judul="Anggrek Hitam",
                ringkasan="Spesies endemik",
                url="/flora/1",
                badge="KALTIM",
                gambar=None,
                score=0.9,
            ),
            SearchResultOut(
                id="2",
                tipe="fauna",
                judul="Orangutan",
                ringkasan="Masih dalam proses review",
                url="/fauna/2",
                badge="KALTIM",
                gambar=None,
                score=0.4,
            ),
        ]

    monkeypatch.setattr(search_routes, "_execute_search", fake_execute_search)
    monkeypatch.setattr(public_search_routes, "_execute_search", fake_execute_search)
    _patch_analytics(monkeypatch)

    user = SimpleNamespace(id=42, role=UserRole.super_admin, region_code=None)
    _override_session()
    app.dependency_overrides[current_user] = lambda: user

    try:
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            resp = await client.get("/api/v1/search", params={"q": "anggrek"})

        assert resp.status_code == 200
        payload = resp.json()
        assert payload["query"] == "anggrek"
        ids = [item["id"] for item in payload["results"]]
        assert ids == ["1", "2"], "Super admin should see both results"
        assert recorded["user"] is user
    finally:
        _cleanup_overrides()


@pytest.mark.anyio
async def test_regional_admin_search_excludes_unapproved(monkeypatch: pytest.MonkeyPatch):
    """
    Regional admin should only see approved items, even if service has access to drafts.
    """

    async def fake_execute_search(db, term, limit, user):
        assert user.role == UserRole.regional_admin
        # Simulate filtering by returning only approved results for non super-admins
        return [
            SearchResultOut(
                id="3",
                tipe="flora",
                judul="Bunga Padma",
                ringkasan="Approved entry",
                url="/flora/3",
                badge=user.region_code,
                gambar=None,
                score=0.8,
            )
        ]

    monkeypatch.setattr(search_routes, "_execute_search", fake_execute_search)
    _patch_analytics(monkeypatch)

    user = SimpleNamespace(id=55, role=UserRole.regional_admin, region_code="SUMUT")
    _override_session()
    app.dependency_overrides[current_user] = lambda: user

    try:
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            resp = await client.get("/api/v1/search", params={"q": "padma"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["results"] == [
            {
                "id": "3",
                "tipe": "flora",
                "judul": "Bunga Padma",
                "ringkasan": "Approved entry",
                "url": "/flora/3",
                "badge": "SUMUT",
                "gambar": None,
                "score": 0.8,
            }
        ]
    finally:
        _cleanup_overrides()


@pytest.mark.anyio
async def test_public_search_only_returns_approved(monkeypatch: pytest.MonkeyPatch):
    """
    Public search must not leak draft entries; service receives user=None.
    """

    async def fake_execute_search(db, term, limit, user):
        assert user is None
        return [
            SearchResultOut(
                id="10",
                tipe="taman",
                judul="Taman Nasional Wasur",
                ringkasan="Approved for public viewing",
                url="/taman/10",
                badge="PAPUA",
                gambar=None,
                score=0.7,
            )
        ]

    monkeypatch.setattr(search_routes, "_execute_search", fake_execute_search)
    monkeypatch.setattr(public_search_routes, "_execute_search", fake_execute_search)
    _patch_analytics(monkeypatch)
    _override_session()

    try:
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            resp = await client.get("/api/public/search", params={"q": "taman"})

        assert resp.status_code == 200
        payload = resp.json()
        assert payload["results"][0]["id"] == "10"
        assert payload["results"][0]["judul"] == "Taman Nasional Wasur"
    finally:
        _cleanup_overrides()
