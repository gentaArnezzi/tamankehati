# api/v1/serializers/public.py
from typing import Optional
from pydantic import BaseModel
from api.v1.serializers.common import PaginatedResponse


class FloraPublicBase(BaseModel):
    nama_ilmiah: Optional[str]
    nama_umum: Optional[str]
    famili: Optional[str]
    status_iucn: Optional[str]
    deskripsi: Optional[str]
    habitat: Optional[str]
    wilayah: Optional[str]
    gambar_utama: Optional[str]
    status: Optional[str]


class ParkInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    area_ha: Optional[float] = None
    provinsi: Optional[str] = None
    kota_kabupaten: Optional[str] = None
    kecamatan: Optional[str] = None
    desa_kelurahan: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pengelola: Optional[str] = None
    tipe_ekoregion: Optional[str] = None

class FloraPublicOut(FloraPublicBase):
    id: str
    nama_ilmiah: str
    nama_umum: str
    famili: str
    genus: Optional[str] = None
    spesies: Optional[str] = None
    status_iucn: str
    deskripsi: str
    habitat: str
    morfologi: Optional[str] = None
    manfaat: Optional[str] = None
    kegunaan: Optional[str] = None
    wilayah: str
    gambar_utama: str
    status: str
    is_endemic: Optional[bool] = False
    park_info: Optional[ParkInfo] = None
    local_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class FaunaPublicBase(BaseModel):
    nama_ilmiah: Optional[str]
    nama_umum: Optional[str]
    famili: Optional[str]
    status_iucn: Optional[str]
    deskripsi: Optional[str]
    habitat: Optional[str]
    wilayah: Optional[str]
    gambar_utama: Optional[str]
    status: Optional[str]


class FaunaPublicOut(FaunaPublicBase):
    id: str
    nama_ilmiah: str
    nama_umum: str
    famili: str
    genus: Optional[str] = None
    spesies: Optional[str] = None
    ordo: Optional[str] = None
    status_iucn: str
    deskripsi: str
    habitat: str
    morfologi: Optional[str] = None
    diet: Optional[str] = None
    behavior: Optional[str] = None
    habitat_sumber_makanan: Optional[str] = None
    status_hama: Optional[str] = None
    tingkat_hama: Optional[str] = None
    wilayah: str
    gambar_utama: str
    status: str
    is_endemic: Optional[bool] = False
    park_info: Optional[ParkInfo] = None
    local_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ParkPublicBase(BaseModel):
    name: Optional[str]
    slug: Optional[str]
    region_id: Optional[int]
    area_ha: Optional[float]
    description: Optional[str]
    provinsi: Optional[str]
    kota_kabupaten: Optional[str]
    kecamatan: Optional[str]
    desa_kelurahan: Optional[str]
    sk_penetapan: Optional[str]
    pengelola: Optional[str]
    tipe_ekoregion: Optional[str]
    kondisi_fisik: Optional[str]
    nilai_penting: Optional[str]
    sejarah: Optional[str]
    visi: Optional[str]
    misi: Optional[str]
    nilai_dasar: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ParkPublicOut(ParkPublicBase):
    id: int
    name: str
    slug: str
    status: str
    area_ha: Optional[float] = None
    description: Optional[str] = None
    created_at: str
    updated_at: str
    submitted_by: Optional[int] = None
    submitted_at: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[str] = None
    rejected_at: Optional[str] = None

    class Config:
        from_attributes = True


class ArtikelPublicBase(BaseModel):
    judul: Optional[str]
    slug: Optional[str]
    excerpt: Optional[str]
    kategori: Optional[str]
    tanggal_publish: Optional[str]
    gambar_cover: Optional[str]


class ArtikelPublicOut(ArtikelPublicBase):
    id: str
    judul: str
    slug: str
    excerpt: str
    kategori: str
    tanggal_publish: str
    gambar_cover: str

    class Config:
        from_attributes = True


class GaleriPublicBase(BaseModel):
    judul: Optional[str]
    url: Optional[str]
    jenis: Optional[str]
    wilayah: Optional[str]


class GaleriPublicOut(GaleriPublicBase):
    id: str
    judul: str
    url: str
    jenis: str
    wilayah: str

    class Config:
        from_attributes = True


class ActivityPublicBase(BaseModel):
    title: Optional[str]
    description: Optional[str]
    activity_date: Optional[str]
    location: Optional[str]
    park_name: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]


class ActivityPublicOut(ActivityPublicBase):
    id: str
    title: str
    description: str
    activity_date: str
    location: str
    park_name: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# Response models with pagination
FloraPublicListResponse = PaginatedResponse[FloraPublicOut]
FaunaPublicListResponse = PaginatedResponse[FaunaPublicOut]
ParkPublicListResponse = PaginatedResponse[ParkPublicOut]
ArtikelPublicListResponse = PaginatedResponse[ArtikelPublicOut]
GaleriPublicListResponse = PaginatedResponse[GaleriPublicOut]
ActivityPublicListResponse = PaginatedResponse[ActivityPublicOut]


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    reply: str


class StatsResponse(BaseModel):
    total_flora: int
    total_fauna: int
    total_taman: int
    total_artikel: int