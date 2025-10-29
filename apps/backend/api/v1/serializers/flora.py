# apps/backend/api/v1/serializers/flora.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, computed_field
from api.v1.serializers.common import WorkflowStatus, IUCNStatus, ErrorResponse, PaginatedResponse

class ParkRef(BaseModel):
    id: int
    name: str
    # region_id: int  # Removed - using user-based access control

    class Config:
        from_attributes = True

class FloraBase(BaseModel):
    local_name: Optional[str] = Field(None, description="Nama lokal flora")
    scientific_name: Optional[str] = Field(None, description="Nama ilmiah flora")
    family: Optional[str] = Field(None, description="Famili")
    genus: Optional[str] = Field(None, description="Genus")
    species: Optional[str] = Field(None, description="Nama spesies flora")
    synonym: Optional[str] = Field(None, description="Sinonim")
    description: Optional[str] = None
    habitat: Optional[str] = Field(None, description="Data alami habitat")
    morphology: Optional[str] = Field(None, description="Deskripsi morfologi flora")
    flowering_time: Optional[str] = Field(None, description="Waktu berbunga")
    distribution: Optional[str] = Field(None, description="Penyebaran")
    propagation_method: Optional[str] = Field(None, description="Metode perbanyakan")
    benefits: Optional[str] = Field(None, description="Manfaat atau kegunaan flora")
    uses: Optional[str] = Field(None, description="Kegunaan flora")
    reference: Optional[str] = Field(None, description="Referensi")
    local_id: Optional[str] = Field(None, description="ID lokal flora")
    
    # Gambar
    image_url: Optional[str] = Field(None, description="URL gambar flora")
    gambar_utama: Optional[str] = Field(None, description="URL gambar utama flora")
    leaf_image_url: Optional[str] = Field(None, description="Gambar pertelaan daun")
    stem_image_url: Optional[str] = Field(None, description="Gambar batang percabangan")
    flower_image_url: Optional[str] = Field(None, description="Gambar bunga")
    fruit_image_url: Optional[str] = Field(None, description="Gambar buah")
    
    is_endemic: bool = Field(False, description="Apakah endemik di Indonesia")
    iucn_status: Optional[IUCNStatus] = Field(None, description="Status konservasi IUCN")

class FloraIn(FloraBase):
    park_id: Optional[int] = Field(None, description="ID taman tempat flora ditemukan", examples=[1])
    status: Optional[WorkflowStatus] = Field(WorkflowStatus.draft, description="Status workflow (draft atau in_review)")

class FloraUpdate(FloraBase):
    park_id: Optional[int] = Field(None, description="ID taman baru (opsional)")

class FloraOut(FloraBase):
    id: int
    park_id: Optional[int] = None
    park: Optional[ParkRef] = None
    status: WorkflowStatus = Field(WorkflowStatus.draft, description="Status workflow")
    submitted_by: Optional[int] = None
    approved_by: Optional[int] = None
    rejected_by: Optional[int] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @computed_field(return_type=Optional[str])
    @property
    def wilayah(self) -> Optional[str]:
        return None

    @computed_field(return_type=Optional[str])
    @property
    def region_code(self) -> Optional[str]:
        # The region_code should be obtained through a separate query if needed
        return None

# Paginated response model
FloraListResponse = PaginatedResponse[FloraOut]
