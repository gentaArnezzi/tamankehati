"""
Database functions for timezone-aware operations
"""
from sqlalchemy import func, text

def jakarta_now():
    """Get current timestamp in Jakarta timezone"""
    return func.timezone('Asia/Jakarta', func.now())

def jakarta_timestamp():
    """Get current timestamp in Jakarta timezone as text"""
    return text("timezone('Asia/Jakarta', now())")
