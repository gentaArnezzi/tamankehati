# apps/backend/domains/parks/models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Numeric, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
# PostGIS disabled - from geoalchemy2 import Geometry
from datetime import datetime
import enum

from core.database.base import Base

# Import related models - import directly to make them available for relationships
# from domains.regions.models import Region  # Removed - using user-based access control
from typing import TYPE_CHECKING

# ParkZone removed - zones functionality removed

class Status(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    APPROVED = "approved"
    
    @classmethod
    def _missing_(cls, value):
        # Handle case-insensitive matching and legacy values
        for member in cls:
            if member.value.lower() == value.lower():
                return member
        return None

class Park(Base):
    __tablename__ = "parks"

    # Identitas
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, comment="Nama Taman")
    slug = Column(String(255), unique=True, nullable=False, comment="URL-friendly name")
    
    # Relationships
    # region_id = Column(Integer, ForeignKey('regions.id'), nullable=True, comment="ID Wilayah")  # Removed - using user-based access control
    
    # Informasi Administratif
    sk_penetapan = Column(String(255), comment="Nomor SK Penetapan")
    pengelola = Column(String(255), comment="Instansi Pengelola")
    provinsi = Column(String(100), comment="Provinsi")
    kota_kabupaten = Column(String(100), comment="Kota/Kabupaten")
    kecamatan = Column(String(100), comment="Kecamatan")
    desa_kelurahan = Column(String(100), comment="Desa/Kelurahan")
    
    # Informasi Geografis
    tipe_ekoregion = Column(String(100), comment="Tipe Ekoregion")
    # PostGIS disabled - geom = Column(Geometry('MULTIPOLYGON', srid=4326), comment="Geometri Spasial")
    area_ha = Column(Numeric(10, 2), comment="Luas dalam hektar")
    
    # Koordinat untuk peta interaktif
    latitude = Column(Numeric(10, 8), comment="Latitude koordinat taman")
    longitude = Column(Numeric(11, 8), comment="Longitude koordinat taman")
    
    # Deskripsi
    description = Column(Text, comment="Deskripsi Umum")
    kondisi_fisik = Column(Text, comment="Kondisi Fisik Kawasan")
    nilai_penting = Column(Text, comment="Nilai Penting Kawasan")
    sejarah = Column(Text, comment="Sejarah Taman")
    visi = Column(Text, comment="Visi Taman")
    misi = Column(Text, comment="Misi Taman")
    nilai_dasar = Column(Text, comment="Nilai-nilai Dasar")
    
    # Gambar
    gambar_utama = Column(String(500), nullable=True, comment="URL gambar utama taman")
    
    # Status
    status = Column(String(20), default="draft", nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Approval workflow
    submitted_by = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True, comment="User who created/submitted this park")
    submitted_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejected_by = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True, comment="Rejection reason or backup data for approved park edits")
    deleted_at = Column(DateTime, nullable=True)
    
    # region = relationship("Region", back_populates="parks")
    
    # Users relationship - using foreign key reference
    # users = relationship("User", back_populates="park")  # Temporarily disabled
    
    # Activities relationship - disabled to prevent circular import issues
    # activities = relationship("Activity", back_populates="park", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Park {self.name} ({self.status})>"