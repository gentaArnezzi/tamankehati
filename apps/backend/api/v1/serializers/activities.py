from datetime import datetime, date
from typing import Optional, List
import json
from pydantic import BaseModel, Field, computed_field, field_validator
from api.v1.serializers.common import WorkflowStatus, PaginatedResponse

class ParkRef(BaseModel):
    id: int
    name: str
    # region_id: int  # Removed - using user-based access control

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    title: str = Field(..., description="Judul kegiatan konservasi", examples=["Penanaman Pohon Endemik"])
    description: Optional[str] = Field(None, description="Deskripsi kegiatan", examples=["Penanaman pohon lokal bersama masyarakat sekitar"])
    activity_date: date = Field(..., description="Tanggal pelaksanaan kegiatan", examples=["2025-11-10"])
    location: Optional[str] = Field(None, description="Lokasi kegiatan", examples=["Area tengah taman"])
    images: Optional[List[str]] = Field(None, description="Daftar URL gambar kegiatan", examples=[["/uploads/image1.jpg", "/uploads/image2.jpg"]])

class ActivityIn(ActivityBase):
    park_id: int = Field(..., description="ID taman tempat kegiatan", examples=[1])

class ActivityUpdate(ActivityBase):
    park_id: Optional[int] = Field(None, description="ID taman baru (opsional)")

class ActivityOut(ActivityBase):
    id: int
    park_id: int
    park: Optional[ParkRef] = None
    status: WorkflowStatus = Field(WorkflowStatus.draft, description="Status workflow")
    submitted_by: Optional[int] = None
    approved_by: Optional[int] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None

    class Config:
        from_attributes = True
    
    @field_validator('images', mode='before')
    @classmethod
    def parse_images(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []
    
    @computed_field(return_type=Optional[str])
    @property
    def wilayah(self) -> Optional[str]:
        return None

    # @computed_field(return_type=Optional[str])
    # @property
    # def region_code(self) -> Optional[str]:
    #     return None  # Removed - using user-based access control

ActivityListResponse = PaginatedResponse[ActivityOut]
