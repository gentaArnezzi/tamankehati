import os

from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event
from sqlalchemy.pool import Pool

from core.config.env import load_env

# Ensure .env (if present) is loaded before reading DATABASE_URL variables.
load_env()

# Auto-convert dari sync → async
url_async = os.getenv("DATABASE_URL")
url_sync  = os.getenv("DATABASE_URL_SYNC")

# Prioritas: DATABASE_URL_SYNC > DATABASE_URL > default
url_to_convert = url_sync or url_async

if url_to_convert:
    # Simple string replacement instead of using make_url() which can mangle passwords
    if "postgresql://" in url_to_convert and "postgresql+asyncpg://" not in url_to_convert:
        DATABASE_URL = url_to_convert.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif "postgresql+asyncpg://" in url_to_convert:
        DATABASE_URL = url_to_convert
    else:
        DATABASE_URL = url_to_convert
else:
    # Default kalau dua-duanya gak ada
    DATABASE_URL = "postgresql+asyncpg://kehati_user:kehati_pass@localhost:5432/kehati"

# Engine & session maker async
# For asyncpg, we don't need special connect_args
# The statement cache settings don't apply to asyncpg in SQLAlchemy
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,
    max_overflow=10
)

# Set timezone to Asia/Jakarta on connection
# NOTE: Disabled for asyncpg as it uses different connection interface
# @event.listens_for(engine.sync_engine, "connect")
# def set_timezone(dbapi_connection, connection_record):
#     """Set timezone to Asia/Jakarta when connecting to database"""
#     cursor = dbapi_connection.cursor()
#     try:
#         cursor.execute("SET timezone = 'Asia/Jakarta'")
#     finally:
#         cursor.close()

SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, autoflush=False, expire_on_commit=False)
