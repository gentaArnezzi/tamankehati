import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Import core database base
from core.database.base import Base

# Import all models to register them with Base.metadata

# Core models
import core.models.audit_logs
import core.models.notifications
import core.models.search_queries

# Domain models - Articles
import domains.articles.models

# Domain models - Activities
import domains.activities.models

# Domain models - Announcements (main + interaction models)
import domains.announcements.models
import domains.announcements.interaction_models

# Domain models - Flora
import domains.flora.models

# Domain models - Fauna
import domains.fauna.models

# Domain models - Parks
import domains.parks.models

# Domain models - Galleries
import domains.galleries.models

# Domain models - News
import domains.news.models

# Domain models - System Settings
import domains.system_settings.models

# Domain models - Regions
import domains.regions.models.region  # Import from models/region.py (the active one)

# User models
import users.models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Get database URL from environment variable
# Convert async URL to sync URL for Alembic
database_url = os.getenv("DATABASE_URL_SYNC") or os.getenv("DATABASE_URL")
if database_url:
    # Convert asyncpg URL to psycopg2 for Alembic (sync)
    if "postgresql+asyncpg://" in database_url:
        database_url = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    elif "postgresql://" not in database_url:
        database_url = f"postgresql://{database_url}"
    # Override sqlalchemy.url in config
    config.set_main_option("sqlalchemy.url", database_url)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# Define table creation order to handle dependencies
# Based on actual database structure from Railway
TABLE_CREATION_ORDER = [
    # Step 1: Tables without foreign key dependencies (or with nullable FK)
    'audit_logs',
    'regions',
    'search_query_logs',
    'system_settings',
    # Step 2: Users table (created first, FK to parks will be added later)
    'users',
    # Step 3: Parks table (needs users for submitted_by, approved_by, rejected_by)
    'parks',
    # Step 4: Notifications (has FK to users, but nullable from_user_id)
    'notifications',
    # Step 5: Tables that depend on both users and parks
    'activities',  # depends on park_id and submitted_by/approved_by (users)
    'articles',    # depends on park_id and author_id/submitted_by (users)
    'fauna',       # depends on park_id and submitted_by/approved_by (users)
    'flora',       # depends on park_id and submitted_by/approved_by (users)
    # Step 6: Tables that depend only on users
    'announcements',  # depends on author_id, submitted_by, approved_by (users)
    'galleries',      # depends on author_id, submitted_by, approved_by (users)
    'news',          # depends on author_id, submitted_by, approved_by (users)
    # Step 7: Tables that depend on announcements
    'announcement_reads',
    'announcement_comments',
    'announcement_reactions',
]


def include_object(object, name, type_, reflected, compare_to):
    """
    Control which objects are included in autogenerate.
    This helps ensure proper ordering of table creation.
    """
    if type_ == "table":
        # All tables should be included
        return True
    return True


def process_revision_directives(context, revision, directives):
    """
    Process revision directives to ensure proper table creation order.
    Handles circular dependency between users and parks:
    1. Create users table WITHOUT FK to parks
    2. Create parks table WITH FK to users
    3. Add FK from users to parks AFTER parks is created
    """
    if directives:
        script = directives[0]
        if hasattr(script, 'upgrade_ops') and script.upgrade_ops:
            from alembic.operations.ops import CreateTableOp, AddConstraintOp
            from sqlalchemy.schema import MetaData, Table
            from sqlalchemy import ForeignKeyConstraint
            
            # Get all operations
            all_ops = list(script.upgrade_ops.ops)
            
            # Separate operations
            create_table_ops = {}  # {table_name: op}
            users_fk_to_parks = None  # Store FK constraint from users.park_id to parks.id
            other_ops = []
            
            # Process each operation
            for op in all_ops:
                # Check if this is a CreateTableOp
                if isinstance(op, CreateTableOp) and hasattr(op, 'table_name'):
                    table_name = op.table_name
                    
                    # Special handling for users table - extract FK to parks
                    if table_name == 'users':
                        # CreateTableOp stores constraints as a tuple
                        # We need to find and extract FK constraint to parks
                        constraints_list = []
                        if hasattr(op, 'constraints'):
                            constraints_list = list(op.constraints) if isinstance(op.constraints, (tuple, list)) else []
                        
                        # Find FK constraint to parks
                        for constraint in constraints_list:
                            # Check if this is a ForeignKeyConstraint that references parks
                            if isinstance(constraint, ForeignKeyConstraint):
                                # Check if any of the columns reference parks
                                for col in constraint.columns:
                                    if hasattr(col, 'name') and col.name == 'park_id':
                                        # This is FK from users.park_id to parks.id
                                        users_fk_to_parks = constraint
                                        # Remove from constraints list
                                        constraints_list.remove(constraint)
                                        break
                        
                        # Update constraints without FK to parks
                        if hasattr(op, 'constraints'):
                            op.constraints = tuple(constraints_list)
                    
                    create_table_ops[table_name] = op
                else:
                    other_ops.append(op)
            
            # Reorder operations based on TABLE_CREATION_ORDER
            ordered_ops = []
            processed_tables = set()
            
            # Step 1: Create tables in correct order
            for table_name in TABLE_CREATION_ORDER:
                if table_name in create_table_ops and table_name not in processed_tables:
                    ordered_ops.append(create_table_ops[table_name])
                    processed_tables.add(table_name)
            
            # Add remaining tables
            for table_name, op in create_table_ops.items():
                if table_name not in processed_tables:
                    ordered_ops.append(op)
                    processed_tables.add(table_name)
            
            # Step 2: Add FK constraint from users to parks AFTER parks is created
            if users_fk_to_parks and 'parks' in processed_tables and 'users' in processed_tables:
                # Create AddConstraintOp to add FK constraint after parks is created
                # We need to create the constraint properly
                from sqlalchemy import ForeignKey
                from sqlalchemy.schema import ForeignKeyConstraint
                
                # Recreate FK constraint if needed
                if isinstance(users_fk_to_parks, ForeignKeyConstraint):
                    add_fk_op = AddConstraintOp(
                        'users',
                        users_fk_to_parks
                    )
                else:
                    # Create new FK constraint
                    fk_constraint = ForeignKeyConstraint(
                        ['park_id'],
                        ['parks.id'],
                        name='fk_users_park_id'
                    )
                    add_fk_op = AddConstraintOp(
                        'users',
                        fk_constraint
                    )
                ordered_ops.append(add_fk_op)
            
            # Add other operations (indexes, etc.)
            ordered_ops.extend(other_ops)
            
            # Update script operations
            script.upgrade_ops.ops = ordered_ops


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        include_object=include_object,
        process_revision_directives=process_revision_directives,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            include_object=include_object,
            process_revision_directives=process_revision_directives,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
