# apps/backend/alembic/env.py
import sys
import os
from logging.config import fileConfig
from alembic import context
from sqlalchemy import create_engine, pool

# Add current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)  # apps/backend
sys.path.insert(0, parent_dir)

from core.config.env import load_env
from core.database.base import Base

# Import all models to ensure they're registered with Base.metadata
# Only import models that have corresponding migrations
import domains.articles.models
import users.models
import domains.flora.models
import domains.fauna.models
import domains.parks.models
import domains.galleries.models
import domains.activities.models
# Note: announcements, news, chat, system_settings, regions tables exist in Railway
# but are not managed by Alembic migrations - they are handled separately

config = context.config

# Load environment variables before resolving connection URL.
load_env()

# PRIORITAS: DATABASE_URL_SYNC (psycopg2), fallback ke DATABASE_URL
db_url = os.getenv("DATABASE_URL_SYNC") or os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("Set DATABASE_URL_SYNC atau DATABASE_URL")

# Kalau user tak sengaja taruh asyncpg, konversi otomatis ke psycopg2
if "+asyncpg" in db_url:
    db_url = db_url.replace("+asyncpg", "+psycopg2")

config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    engine = create_engine(db_url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
