import io
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest
import shapefile  # type: ignore
from httpx import AsyncClient

from main import app
from api.v1.routes import zones as zones_routes
from api.v1.permissions.rbac import current_user
from core.database.session import get_session
from users.models import UserRole


class DummyAsyncSession:
    async def __aenter__(self):  # pragma: no cover - context protocol
        return self

    async def __aexit__(self, exc_type, exc, tb):  # pragma: no cover - context protocol
        return False


@pytest.mark.anyio
async def test_upload_shapefile_success(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    """
    Ensure the shapefile upload endpoint accepts well-formed archives and forwards
    data to ZoneService without hitting the database.
    """
    created_payloads = []

    async def fake_create_with_guard(db, data, user):
        created_payloads.append((data, user.role))
        return SimpleNamespace(id=101, name=data["name"], region_code=data["region_code"])

    # Patch service layer to avoid touching the real database
    monkeypatch.setattr(
        zones_routes.ZoneService,
        "create_with_guard",
        staticmethod(fake_create_with_guard),
    )

    # Override dependencies: session + current user
    async def dummy_session_override():
        yield DummyAsyncSession()

    app.dependency_overrides[get_session] = dummy_session_override
    app.dependency_overrides[current_user] = lambda: SimpleNamespace(
        id=1, role=UserRole.super_admin, region_code=None
    )

    # Build minimal polygon shapefile
    shp_base = tmp_path / "zones"
    writer = shapefile.Writer(str(shp_base))
    writer.field("name", "C")
    writer.poly([[(0, 0), (1, 0), (1, 1), (0, 1), (0, 0)]])
    writer.record("Zona Uji")
    writer.close()

    prj_content = (
        'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],'
        'PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'
    )
    prj_path = tmp_path / "zones.prj"
    prj_path.write_text(prj_content, encoding="utf-8")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as archive:
        for suffix in (".shp", ".shx", ".dbf", ".prj"):
            archive.write(tmp_path / f"zones{suffix}", arcname=f"zones{suffix}")
    zip_buffer.seek(0)

    try:
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.post(
                "/api/v1/zones/upload/shapefile",
                data={"region_code": "KALTIM", "name_field": "name"},
                files={"file": ("zones.zip", zip_buffer.read(), "application/zip")},
            )

        assert response.status_code == 200
        payload = response.json()
        assert payload["summary"]["created"] == 1
        assert payload["errors"] == []
        assert payload["zones"][0]["name"] == "Zona Uji"
        assert payload["zones"][0]["status"] in {"approved", "in_review"}
        assert created_payloads, "ZoneService.create_with_guard should be invoked"
        assert created_payloads[0][0]["region_code"] == "KALTIM"
    finally:
        # Clean up overrides to avoid bleeding into other tests
        app.dependency_overrides.pop(get_session, None)
        app.dependency_overrides.pop(current_user, None)
