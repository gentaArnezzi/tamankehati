from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from core.database.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, nullable=False, index=True)
    actor_role = Column(String(50), nullable=False)
    actor_region_code = Column(String(10), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # e.g., "create", "update", "approve", "delete"
    resource = Column(String(100), nullable=False)  # e.g., "flora", "fauna", "article"
    resource_id = Column(Integer, nullable=False, index=True)
    before = Column(JSON, nullable=True)  # JSON snapshot before change
    after = Column(JSON, nullable=True)   # JSON snapshot after change
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource={self.resource}, resource_id={self.resource_id})>"
