"""
Timezone utilities for Jakarta, Indonesia timezone handling
"""
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

# Jakarta timezone
JAKARTA_TZ = ZoneInfo('Asia/Jakarta')

def get_jakarta_now() -> datetime:
    """Get current datetime in Jakarta timezone"""
    return datetime.now(JAKARTA_TZ)

def utc_to_jakarta(utc_dt: datetime) -> datetime:
    """Convert UTC datetime to Jakarta timezone"""
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(JAKARTA_TZ)

def jakarta_to_utc(jakarta_dt: datetime) -> datetime:
    """Convert Jakarta datetime to UTC"""
    if jakarta_dt.tzinfo is None:
        jakarta_dt = JAKARTA_TZ.localize(jakarta_dt)
    return jakarta_dt.astimezone(timezone.utc)

def format_jakarta_datetime(dt: datetime) -> str:
    """Format datetime in Jakarta timezone for display"""
    if dt.tzinfo is None:
        dt = JAKARTA_TZ.localize(dt)
    elif dt.tzinfo != JAKARTA_TZ:
        dt = dt.astimezone(JAKARTA_TZ)
    return dt.strftime('%Y-%m-%d %H:%M:%S %Z')
