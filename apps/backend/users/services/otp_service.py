# apps/backend/users/services/otp_service.py
"""OTP service for generating and managing OTP codes"""

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from users.models_otp import OTP


def generate_otp_code(length: int = 6) -> str:
    """Generate a random numeric OTP code"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))


async def create_otp(
    db: AsyncSession,
    email: str,
    expiration_minutes: int = 10
) -> OTP:
    """
    Create a new OTP for the given email.
    
    Args:
        db: Database session
        email: User email address
        expiration_minutes: OTP expiration time in minutes (default: 10)
    
    Returns:
        OTP: Created OTP object
    """
    # Invalidate any existing unused OTPs for this email
    await invalidate_otps_for_email(db, email)
    
    # Generate new OTP
    code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expiration_minutes)
    
    otp = OTP(
        email=email.lower().strip(),
        code=code,
        expires_at=expires_at,
        used=False
    )
    
    db.add(otp)
    await db.commit()
    await db.refresh(otp)
    
    return otp


async def verify_otp(
    db: AsyncSession,
    email: str,
    code: str
) -> Optional[OTP]:
    """
    Verify an OTP code for the given email.
    
    Args:
        db: Database session
        email: User email address
        code: OTP code to verify
    
    Returns:
        OTP: OTP object if valid, None otherwise
    """
    email_lower = email.lower().strip()
    
    # Find the most recent unused OTP for this email
    stmt = (
        select(OTP)
        .where(OTP.email == email_lower)
        .where(OTP.code == code)
        .where(OTP.used == False)
        .order_by(OTP.created_at.desc())
    )
    
    result = await db.execute(stmt)
    otp = result.scalar_one_or_none()
    
    if not otp:
        return None
    
    # Check if OTP is still valid (not expired)
    if not otp.is_valid():
        return None
    
    # Mark as used
    otp.mark_as_used()
    await db.commit()
    
    return otp


async def invalidate_otps_for_email(
    db: AsyncSession,
    email: str
):
    """Invalidate all unused OTPs for a given email"""
    email_lower = email.lower().strip()
    
    # Mark all unused OTPs as used
    stmt = (
        select(OTP)
        .where(OTP.email == email_lower)
        .where(OTP.used == False)
    )
    
    result = await db.execute(stmt)
    otps = result.scalars().all()
    
    for otp in otps:
        otp.mark_as_used()
    
    await db.commit()


async def cleanup_expired_otps(db: AsyncSession, days_old: int = 7):
    """Clean up expired OTPs older than specified days"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)
    
    stmt = delete(OTP).where(OTP.expires_at < cutoff_date)
    await db.execute(stmt)
    await db.commit()

