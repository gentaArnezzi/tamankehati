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

class Flora(Base):
    __tablename__ = "flora"

    id = Column(Integer, primary_key=True)
    park_id = Column(Integer, ForeignKey("parks.id", ondelete="CASCADE"), nullable=False)
    # park_zone_id removed - column doesn't exist in database

    local_name = Column(String)
    scientific_name = Column(String)
    family = Column(String)
    genus = Column(String)
    species = Column(String)  # Add missing column
    description = Column(Text)
    habitat = Column(Text)  # Add missing column
    morphology = Column(Text)
    benefits = Column(Text)
    uses = Column(Text)  # Add missing column
    local_id = Column(String)  # Add missing column
    image_url = Column(String)  # Add missing column
    gambar_utama = Column(String(500), nullable=True)  # URL to main image

    is_endemic = Column(Boolean, nullable=False, default=False)
    iucn_status = Column(String(8), nullable=True)

    # ✅ gunakan String untuk kompatibilitas dengan database existing
    status = Column(
        String(50),
        nullable=False,
        server_default=WorkflowStatus.draft.value,
    )

    # ✅ FIXED: Added ondelete='SET NULL' for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Relationships to User are commented out to avoid circular imports
    # submitted_by_user = relationship("User", foreign_keys=[submitted_by], lazy="selectin")
    # approved_by_user = relationship("User", foreign_keys=[approved_by], lazy="selectin")
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

    # park = relationship("domains.parks.models.park.Park", back_populates="flora", lazy="joined")
