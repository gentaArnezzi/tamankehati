from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from core.database.base import Base

class WorkflowStatus(str, PyEnum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

class Fauna(Base):
    __tablename__ = "fauna"

    id = Column(Integer, primary_key=True)
    park_id = Column(Integer, ForeignKey("parks.id", ondelete="CASCADE"), nullable=False)
    # zone_id removed - column doesn't exist in database

    local_name = Column(String)
    scientific_name = Column(String)
    class_ = Column("class", String(100), nullable=True)  # Class/Kelas
    family = Column(String)  # Add missing column
    genus = Column(String)  # Add missing column
    species = Column(String)  # Add missing column
    ordo = Column(String(100), nullable=True)  # Klasifikasi ordo hewan
    description = Column(Text)
    habitat = Column(Text)  # Add missing column
    diet = Column(Text)  # Add missing column
    behavior = Column(Text)  # Add missing column
    morphology = Column(Text)  # Add missing column
    local_id = Column(String)  # Add missing column
    image_url = Column(String)  # Add missing column
    habitat_sumber_makanan = Column(Text, nullable=True)  # Habitat dan sumber makanan utama fauna
    status_hama = Column(String(50), nullable=True)  # Apakah fauna termasuk hama (ya/tidak)
    tingkat_hama = Column(String(50), nullable=True)  # Tingkatan hama jika fauna termasuk hama
    gambar_utama = Column(String(500), nullable=True)  # URL to main image

    is_endemic = Column(Boolean, nullable=False, default=False)
    iucn_status = Column(String(8), nullable=True)

    status = Column(
        String(50),
        nullable=False,
        server_default=WorkflowStatus.draft.value,
    )

    # ✅ FIXED: Added ondelete='SET NULL' for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # ✅ FIXED: Added missing rejected_by column for complete audit trail
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Relationships to User are commented out to avoid circular imports
    # submitted_by_user = relationship("User", foreign_keys=[submitted_by])
    # approved_by_user = relationship("User", foreign_keys=[approved_by])
    # rejected_by_user = relationship("User", foreign_keys=[rejected_by])
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # park = relationship("domains.parks.models.park.Park", back_populates="fauna", lazy="joined")
