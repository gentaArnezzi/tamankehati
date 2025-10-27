from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.base import Base

class WorkflowStatus(str, PyEnum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)
    park_id = Column(Integer, ForeignKey("parks.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text)
    activity_date = Column(Date, nullable=False)
    location = Column(String(255))

    status = Column(
        String(50),
        nullable=False,
        server_default=WorkflowStatus.draft.value,
    )

    # ✅ FIXED: Added ondelete='SET NULL' for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="User who created/submitted this activity")
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # ✅ FIXED: Added missing rejected_by column for complete audit trail
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships - park relationship disabled to prevent circular import
    # park = relationship("domains.parks.models.Park", back_populates="activities", lazy="joined")
    submitted_by_user = relationship("User", foreign_keys=[submitted_by], lazy="joined")
    approved_by_user = relationship("User", foreign_keys=[approved_by], lazy="joined")
