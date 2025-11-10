from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, computed_field
from api.v1.serializers.common import WorkflowStatus, IUCNStatus, PaginatedResponse

class ParkRef(BaseModel):
    id: int
    name: str
    # region_id: int  # Removed - using user-based access control

    class Config:
        from_attributes = True

class FaunaBase(BaseModel):
    local_name: Optional[str] = Field(None, description="Nama lokal fauna")
    scientific_name: Optional[str] = Field(None, description="Nama ilmiah fauna")
    class_: Optional[str] = Field(None, alias="class", description="Kelas/Class")
    family: Optional[str] = Field(None, description="Famili fauna")
    genus: Optional[str] = Field(None, description="Genus fauna")
    species: Optional[str] = Field(None, description="Spesies fauna")
    ordo: Optional[str] = Field(None, description="Klasifikasi ordo hewan")
    
    class Config:
        populate_by_name = True
    description: Optional[str] = None
    habitat: Optional[str] = Field(None, description="Habitat fauna")
    diet: Optional[str] = Field(None, description="Makanan fauna")
    behavior: Optional[str] = Field(None, description="Perilaku fauna")
    morphology: Optional[str] = Field(None, description="Morfologi fauna")
    local_id: Optional[str] = Field(None, description="ID lokal fauna")
    image_url: Optional[str] = Field(None, description="URL gambar fauna")
    habitat_sumber_makanan: Optional[str] = Field(None, description="Habitat dan sumber makanan utama fauna")
    status_hama: Optional[str] = Field(None, description="Apakah fauna termasuk hama (ya/tidak)")
    tingkat_hama: Optional[str] = Field(None, description="Tingkatan hama jika fauna termasuk hama")
    gambar_utama: Optional[str] = Field(None, description="URL gambar utama fauna")
    is_endemic: bool = Field(False, description="Apakah endemik di Indonesia")
    iucn_status: Optional[IUCNStatus] = Field(None, description="Status konservasi IUCN")

class FaunaIn(FaunaBase):
    park_id: Optional[int] = Field(None, description="ID taman tempat fauna ditemukan", examples=[1])
    status: Optional[WorkflowStatus] = Field(WorkflowStatus.draft, description="Status workflow (draft atau in_review)")

class FaunaUpdate(FaunaBase):
    park_id: Optional[int] = Field(None, description="ID taman baru (opsional)")

class FaunaOut(FaunaBase):
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
        return None

FaunaListResponse = PaginatedResponse[FaunaOut]
