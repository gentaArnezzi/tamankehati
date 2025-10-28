# apps/backend/api/v1/serializers/parks.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from api.v1.serializers.common import WorkflowStatus, PaginatedResponse

class ParkBase(BaseModel):
    """Base park model with common fields"""
    name: str = Field(..., description="Nama Taman")
    slug: Optional[str] = Field(None, description="URL-friendly name")
    sk_penetapan: Optional[str] = Field(None, description="Nomor SK Penetapan")
    pengelola: Optional[str] = Field(None, description="Instansi Pengelola")
    
    # Lokasi Administratif
    provinsi: Optional[str] = Field(None, description="Provinsi")
    kota_kabupaten: Optional[str] = Field(None, description="Kota/Kabupaten")
    kecamatan: Optional[str] = Field(None, description="Kecamatan")
    desa_kelurahan: Optional[str] = Field(None, description="Desa/Kelurahan")
    
    # Informasi Geografis
    tipe_ekoregion: Optional[str] = Field(None, description="Tipe Ekoregion")
    area_ha: Optional[float] = Field(None, description="Luas dalam hektar")
    latitude: Optional[float] = Field(None, description="Latitude koordinat taman", ge=-90, le=90)
    longitude: Optional[float] = Field(None, description="Longitude koordinat taman", ge=-180, le=180)
    
    # Deskripsi
    description: Optional[str] = Field(None, description="Deskripsi Umum")
    kondisi_fisik: Optional[str] = Field(None, description="Kondisi Fisik Kawasan")
    nilai_penting: Optional[str] = Field(None, description="Nilai Penting Kawasan")
    sejarah: Optional[str] = Field(None, description="Sejarah Taman")
    visi: Optional[str] = Field(None, description="Visi Taman")
    misi: Optional[str] = Field(None, description="Misi Taman")
    nilai_dasar: Optional[str] = Field(None, description="Nilai-nilai Dasar")
    
    # Status
    status: Optional[WorkflowStatus] = Field("draft", description="Status taman")

class ParkIn(ParkBase):
    """Input model for creating/updating parks"""
    pass

class ParkOut(ParkBase):
    """Output model for park data"""
    id: int
    created_at: datetime
    updated_at: datetime
    submitted_by: Optional[int] = None
    submitted_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejected_by: Optional[int] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class ParkListResponse(PaginatedResponse[ParkOut]):
    """Paginated response for park list"""
    pass

class ParkCreateResponse(BaseModel):
    """Response model for park creation"""
    id: str
    name: str
    slug: str
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ParkUpdateResponse(BaseModel):
    """Response model for park update"""
    id: str
    name: str
    slug: str
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
