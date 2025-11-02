import sys
import os
from typing import List

# --- sys.path setup (keep) ---
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

# --- your imports (keep) ---
# Import all models to ensure they're registered
import domains.articles.models
import domains.activities.models
import domains.announcements.models
import domains.flora.models
import domains.fauna.models
import domains.parks.models
import domains.galleries.models
import domains.news.models
import users.models

from core.logging.setup import configure_logging
from core.middleware.ratelimit_headers import RateLimitHeadersMiddleware
from middleware.security import SecurityHeadersMiddleware, RequestSizeLimitMiddleware
from utils.events import on
from core.notifications.handlers import (
    notify_review_submitted, notify_approved, notify_rejected
)
from api.v1.routes import (
    analytics,
    announcements,
    approvals,
    articles,
    auth,
    dashboard,
    dashboard_modern,
    fauna,
    flora,
    galleries,
    news,
    notifications,   # imported but not used in original; ok to keep
    parks,
    # parks_crud removed - merged into parks.py
    # regions removed - using park-based scoping
    setup,  # One-time setup endpoint for admin creation
    system_settings,
    upload,
    users,
    # zones removed - zones functionality removed
    search,
    activities,
    indonesia_regions
)
from api.v1.routes.ai_flora_fauna import router as ai_flora_fauna_router
from api.v1.routes.ai_comprehensive import router as ai_comprehensive_router
# from domains.regions.api.v1.routers import regions as regions_router  # removed - using park-based scoping
from api.v1.public import router as public_router
# Removed unused router imports
# Bypass API removed - public APIs now working!

# --- Security scheme (keep) ---
security_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    description="JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
)

# --- App ---
app = FastAPI(
    title="Taman Kehati API",
    version="1.0.0",
    redirect_slashes=True,
    description="""
    API untuk sistem manajemen Taman Kehati dengan fitur lengkap:
    - RBAC (Role-Based Access Control) dengan region scope
    - Approval Workflow untuk flora/fauna (draft → in_review → approved/rejected)
    - Real-time Chat dengan RAG dan streaming responses
    - Analytics untuk biodiversity insights
    - Rate Limiting dengan header informasi

    Authentication
    Gunakan endpoint POST /api/v1/auth/login dengan email dan password untuk mendapatkan JWT token.
    Header yang dibutuhkan: `Authorization: Bearer <token>`

    Akun yang Tersedia (seeded otomatis):
    - admin@kehati.org (Super Admin - akses penuh ke semua region)
      - Password: `password`
    - kaltim.admin@kehati.org (Regional Admin KALTIM - akses region Kalimantan Timur)
      - Password: `password`
    - sumut.admin@kehati.org (Regional Admin SUMUT - akses region Sumatera Utara)
      - Password: `password`
    - test@example.com (Test Super Admin - untuk testing dan development)
      - Password: `test`

    Role-Based Access Control (RBAC)
    - Super Admin: Akses penuh ke semua region dan fitur (create, update, delete, approve/reject)
    - Regional Admin: Akses terbatas ke region mereka sendiri (create, update, submit untuk review)
    - Ranger/Volunteer: Akses terbatas ke draft milik sendiri (create, update, submit)
    - Public: Read-only akses ke data approved

    Workflow Status
    - `draft` - Data baru belum direview
    - `in_review` - Sedang dalam proses review
    - `approved` - Telah disetujui dan publik
    - `rejected` - Ditolak dengan alasan

    Rate Limits
    Header `X-RateLimit-*` menyediakan informasi limit dan reset time.

    Error Codes
    - 401: Unauthorized - Token tidak valid atau missing
    - 403: Forbidden - Tidak memiliki izin untuk akses
    - 404: Not Found - Resource tidak ditemukan
    - 422: Validation Error - Input tidak valid
    """,
    contact={"name": "Tim Taman Kehati", "email": "tspdigital.id@gmail.com"},
    license_info={"name": "TSPDigital"},
    servers=[
        {"url": "http://localhost:8000", "description": "Development server"},
        {"url": "https://api.kehati.local", "description": "Production server"},
        {"url": "https://staging.api.kehati.local", "description": "Staging server"}
    ],
    openapi_tags=[
        {"name": "Flora", "description": "Manajemen data flora dengan workflow approval"},
        {"name": "Fauna", "description": "Manajemen data fauna dengan workflow approval"},
        # Zones removed - zones functionality removed
        {"name": "Chat", "description": "Chatbot dengan RAG dan streaming responses"},
        {"name": "Chat-Stream", "description": "Server-Sent Events untuk chat real-time"},
        {"name": "Analytics", "description": "Analytics dan statistik biodiversity"}
    ]
)

# ------------------------------------------------------------------------------
# CORS CONFIG (MAKE THIS FIRST/OUTERMOST)
# ------------------------------------------------------------------------------

# Allow list: prefer explicit dev origins. You can override via env if needed.
DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://tamankehati-8x6q.vercel.app",  # Frontend production URL
]
env_origins = os.getenv("CORS_ALLOW_ORIGINS")
allow_origins = (
    [o.strip() for o in env_origins.split(",")] if env_origins else DEFAULT_CORS_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,          # IMPORTANT: don't use "*" with credentials
    allow_credentials=True,               # if you use cookies/sessions; OK for Bearer too
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Region-Scope",
        "X-Park-Scope",  # Added for regional_admin
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    max_age=86400,                        # cache preflight 1 day
)

# Static files for uploads - mount early to avoid conflicts
# Use UPLOAD_DIRECTORY from env, fallback to relative path for local dev
uploads_dir = os.getenv("UPLOAD_DIRECTORY") or os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
print(f"Uploads directory: {uploads_dir}")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ------------------------------------------------------------------------------
# SECURITY MIDDLEWARE (registered in proper order)
# ------------------------------------------------------------------------------
# Security headers middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS)
app.add_middleware(SecurityHeadersMiddleware)

# Request size limit middleware (default 10MB, prevent large file attacks)
app.add_middleware(RequestSizeLimitMiddleware, max_size=10_000_000)

# ------------------------------------------------------------------------------
# OPTIONAL: UNIVERSAL OPTIONS HANDLER (SAFETY NET)
# ------------------------------------------------------------------------------
@app.options("/{full_path:path}")
async def any_options(full_path: str):
    # This will still pass through CORSMiddleware which will add the right headers.
    return PlainTextResponse("", status_code=204)

# ------------------------------------------------------------------------------
# HEALTH
# ------------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/healthz/")
async def healthz():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "Taman Kehati API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/healthz"
    }

# Temporary simple endpoints for testing - REMOVED hardcoded flora endpoint

@app.get("/api/public/test/")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working", "status": "ok"}

@app.get("/api/public/stats-simple/")
async def get_stats_simple():
    """Simple stats endpoint without database"""
    return {
        "total_flora": 3,
        "total_fauna": 0,
        "total_taman": 1,
        "total_artikel": 0
    }

@app.get("/api/public/artikel-simple/")
async def get_artikel_simple():
    """Simple artikel endpoint without database"""
    return [
        {
            "id": "1",
            "judul": "Keanekaragaman Hayati Indonesia",
            "slug": "keanekaragaman-hayati-indonesia",
            "excerpt": "Indonesia memiliki keanekaragaman hayati yang sangat tinggi...",
            "kategori": "Konservasi",
            "tanggal_publish": "2024-01-15T00:00:00Z",
            "gambar_cover": ""
        }
    ]

@app.get("/api/public/galeri-simple/")
async def get_galeri_simple():
    """Simple galeri endpoint without database"""
    return [
        {
            "id": "1",
            "judul": "Rafflesia Arnoldii",
            "url": "/images/rafflesia.jpg",
            "jenis": "Flora",
            "wilayah": "Sumatera"
        }
    ]

@app.get("/api/public/parks/")
async def get_parks_public():
    """Public parks endpoint"""
    return {
        "items": [
            {
                "id": 1,
                "name": "Taman Nasional Komodo",
                "slug": "taman-nasional-komodo",
                "area_ha": 173300.0,
                "description": "Taman nasional yang melindungi komodo dan habitatnya",
                "status": "approved",
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        ],
        "total": 1,
        "limit": 12,
        "offset": 0,
        "has_next": False,
        "has_prev": False
    }

@app.get("/api/public/parks-simple/")
async def get_parks_simple():
    """Simple parks endpoint without database"""
    return [
        {
            "id": "1",
            "name": "Taman Nasional Komodo",
            "slug": "taman-nasional-komodo",
            "area_ha": 173300.0,
            "description": "Taman nasional yang melindungi komodo dan habitatnya",
            "region": {
                "id": 1,
                "name": "Nusa Tenggara Timur"
            }
        }
    ]

@app.get("/api/public/flora-simple/")
async def get_flora_simple():
    """Simple flora endpoint without database"""
    return [
        {
            "id": "1",
            "nama_ilmiah": "Rafflesia arnoldii",
            "nama_umum": "Bunga Bangkai",
            "famili": "Rafflesiaceae",
            "status_iucn": "Vulnerable",
            "deskripsi": "Bunga terbesar di dunia yang endemik di Indonesia",
            "habitat": "Hutan hujan tropis",
            "wilayah": "Sumatera",
            "gambar_utama": "/images/rafflesia.jpg",
            "status": "approved"
        },
        {
            "id": "2", 
            "nama_ilmiah": "Amorphophallus titanum",
            "nama_umum": "Bunga Bangkai Raksasa",
            "famili": "Araceae",
            "status_iucn": "Endangered",
            "deskripsi": "Bunga dengan perbungaan tertinggi di dunia",
            "habitat": "Hutan hujan tropis",
            "wilayah": "Sumatera",
            "gambar_utama": "/images/amorphophallus.jpg",
            "status": "approved"
        },
        {
            "id": "3",
            "nama_ilmiah": "Nepenthes rajah",
            "nama_umum": "Kantong Semar Raja",
            "famili": "Nepenthaceae", 
            "status_iucn": "Vulnerable",
            "deskripsi": "Tanaman karnivora dengan kantong terbesar",
            "habitat": "Hutan pegunungan",
            "wilayah": "Kalimantan",
            "gambar_utama": "/images/nepenthes.jpg",
            "status": "approved"
        }
    ]

@app.get("/api/public/fauna-simple/")
async def get_fauna_simple():
    """Simple fauna endpoint without database"""
    return [
        {
            "id": "1",
            "nama_ilmiah": "Pongo abelii",
            "nama_umum": "Orangutan Sumatera",
            "famili": "Hominidae",
            "status_iucn": "Critically Endangered",
            "deskripsi": "Primata endemik Sumatera yang sangat terancam punah",
            "habitat": "Hutan hujan tropis",
            "wilayah": "Sumatera",
            "gambar_utama": "/images/orangutan.jpg",
            "status": "approved"
        },
        {
            "id": "2",
            "nama_ilmiah": "Varanus komodoensis",
            "nama_umum": "Komodo",
            "famili": "Varanidae",
            "status_iucn": "Endangered",
            "deskripsi": "Kadal terbesar di dunia yang hanya ditemukan di Indonesia",
            "habitat": "Savana dan hutan kering",
            "wilayah": "Nusa Tenggara Timur",
            "gambar_utama": "/images/komodo.jpg",
            "status": "approved"
        },
        {
            "id": "3",
            "nama_ilmiah": "Panthera tigris sondaica",
            "nama_umum": "Harimau Jawa",
            "famili": "Felidae",
            "status_iucn": "Extinct in the Wild",
            "deskripsi": "Subspesies harimau yang telah punah di alam liar",
            "habitat": "Hutan hujan tropis",
            "wilayah": "Jawa",
            "gambar_utama": "/images/harimau-jawa.jpg",
            "status": "approved"
        }
    ]

@app.get("/healthz")
async def healthz():
    return {"ok": True}

@app.get("/debug-cors")
async def debug_cors():
    import os
    env_origins = os.getenv("CORS_ALLOW_ORIGINS")
    return {
        "env_origins": env_origins,
        "env_origins_list": [o.strip() for o in env_origins.split(",")] if env_origins else None,
        "default_origins": DEFAULT_CORS_ORIGINS
    }

# ------------------------------------------------------------------------------
# OPENAPI (keep)
# ------------------------------------------------------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ------------------------------------------------------------------------------
# LOGGING & EVENTS (keep)
# ------------------------------------------------------------------------------
configure_logging()

on("flora.submitted", notify_review_submitted)
on("flora.approved", notify_approved)
on("flora.rejected", notify_rejected)
on("fauna.submitted", notify_review_submitted)
on("fauna.approved", notify_approved)
on("fauna.rejected", notify_rejected)
on("article.submitted", notify_review_submitted)
on("article.approved", notify_approved)
on("article.rejected", notify_rejected)
on("gallery.submitted", notify_review_submitted)
on("gallery.approved", notify_approved)
on("gallery.rejected", notify_rejected)

# ------------------------------------------------------------------------------
# OTHER MIDDLEWARE (RateLimit) — it’s fine AFTER CORS
# ------------------------------------------------------------------------------
app.add_middleware(RateLimitHeadersMiddleware)

# ------------------------------------------------------------------------------
# ROUTERS (keep)
# ------------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(setup.router, prefix="/api/v1", tags=["Setup"])  # One-time setup
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
# Zones router removed - zones functionality removed
app.include_router(flora.router, prefix="/api/v1", tags=["Flora"])
# flora_simple_router removed - using original flora route
app.include_router(fauna.router, prefix="/api/v1", tags=["Fauna"])
app.include_router(activities.router, prefix="/api/v1", tags=["Activities"])
app.include_router(announcements.router, prefix="/api/v1", tags=["Announcements"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(articles.router, prefix="/api/v1", tags=["Articles"])
app.include_router(news.router, prefix="/api/v1", tags=["News"])
app.include_router(galleries.router, prefix="/api/v1", tags=["Galleries"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(parks.router, prefix="/api/v1", tags=["Parks"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(dashboard_modern.router, prefix="/api/v1", tags=["Dashboard Modern"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])

# ✅ FIXED: Duplicate dashboard routers consolidated
# - dashboard_simple_test.py endpoints migrated to dashboard.py
# - Single router now handles all dashboard endpoints
# - Removed confusion from having two routers with same prefix

app.include_router(approvals.router, prefix="/api/v1", tags=["Approvals"])
# Chat routes removed - not used
# Analytics routes removed - not used  
app.include_router(system_settings.router, prefix="/api/v1", tags=["System Settings"])
app.include_router(search.router, prefix="/api/v1", tags=["Search"])
# app.include_router(regions.router_regions, prefix="/api/v1", tags=["Regions"])  # removed - using park-based scoping
# zones router removed - not used by frontend
app.include_router(ai_flora_fauna_router, prefix="/api/v1", tags=["AI Flora Fauna"])
app.include_router(ai_comprehensive_router, prefix="/api/v1", tags=["AI Comprehensive"])
app.include_router(indonesia_regions.router, prefix="/api/v1/indonesia", tags=["Indonesia Regions"])

# Public API routes - all grouped under "Public" tag
app.include_router(public_router, prefix="/api/public", tags=["Public"])
# Bypass API removed - public APIs now working!

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

