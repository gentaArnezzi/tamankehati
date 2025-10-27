from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from core.database.base import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=False, index=True)  # User ID who performed the action
    actor_role = Column(String(50), nullable=False)  # Role at time of action
    actor_region_code = Column(String(10), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # e.g., "create", "update", "approve", "delete"
    resource_type = Column(String(100), nullable=False)  # e.g., "flora", "fauna", "user"
    resource_id = Column(Integer, nullable=True, index=True)  # ID of the resource affected
    old_values = Column(JSON, nullable=True)  # Previous state (for updates)
    new_values = Column(JSON, nullable=True)  # New state (for creates/updates)
    metadata = Column(JSON, nullable=True)  # Additional context (e.g., region_code, status)
    ip_address = Column(String(45), nullable=True)  # For security tracking
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<AuditLog(id={self.id}, actor_id={self.actor_id}, action={self.action}, resource_type={self.resource_type})>"
