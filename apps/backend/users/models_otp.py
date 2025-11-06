# apps/backend/users/models_otp.py
"""OTP (One-Time Password) model for authentication"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from core.database.base import Base
from core.database.functions import jakarta_now
from datetime import datetime, timedelta, timezone


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(6), nullable=False)  # 6-digit OTP code
    used = Column(Boolean, nullable=False, server_default="false")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=jakarta_now(), nullable=False)
    
    # Index for faster lookups
    __table_args__ = (
        Index('idx_otp_email_code', 'email', 'code'),
        Index('idx_otp_email_active', 'email', 'used', 'expires_at'),
    )

    def is_valid(self) -> bool:
        """Check if OTP is still valid (not used and not expired)"""
        if self.used:
            return False
        now = datetime.now(timezone.utc)
        if self.expires_at.tzinfo is None:
            # If expires_at is naive, assume it's in UTC
            expires_at_utc = self.expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at_utc = self.expires_at
        return now < expires_at_utc

    def mark_as_used(self):
        """Mark OTP as used"""
        self.used = True

    def __repr__(self):
        return f"<OTP(id={self.id}, email={self.email}, code=****, used={self.used}, expires_at={self.expires_at})>"

