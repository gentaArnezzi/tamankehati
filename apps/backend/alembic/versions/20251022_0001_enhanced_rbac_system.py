"""Enhanced RBAC System for Taman Kehati

This migration adds proper RBAC tables to replace the simple role enum system.
It creates:
- roles table (from UserRole enum)
- permissions table (for fine-grained access control)
- role_permissions junction table
- user_roles junction table (replaces role column in users)
- policy_rules table (for optional ABAC)

Revision ID: 20251022_0001
Revises: 20251021_0023
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = "20251022_0001"
down_revision = "20251021_0023"
branch_labels = None
depends_on = None

# Define enums
user_role_enum = sa.Enum(
    "super_admin",
    "regional_admin",
    "ranger",
    "volunteer",
    "user",
    name="user_role",
    create_type=False  # Don't create new enum, use existing
)

permission_enum = sa.Enum(
    "create",
    "read",
    "update",
    "delete",
    "approve",
    "reject",
    "manage_users",
    "manage_regions",
    "view_all_regions",
    "export_data",
    "import_data",
    name="permission_type"
)

def upgrade() -> None:
    # Create roles table
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(50), unique=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Create permissions table
    op.create_table(
        "permissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("resource", sa.String(100)),  # e.g., "flora", "fauna", "zones", etc.
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Create role_permissions junction table
    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", sa.Integer(), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Create user_roles junction table
    op.create_table(
        "user_roles",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("region_code", sa.String(10), nullable=True),  # Scoped roles
        sa.Column("assigned_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create policy_rules table (optional ABAC)
    op.create_table(
        "policy_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("effect", sa.Enum("allow", "deny", name="policy_effect"), nullable=False),
        sa.Column("subject_selector", sa.JSON(), nullable=False),  # User matching conditions
        sa.Column("resource_selector", sa.JSON(), nullable=False),  # Resource matching conditions
        sa.Column("condition", sa.JSON()),  # Additional conditions
        sa.Column("priority", sa.Integer(), default=0),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Insert default roles
    op.execute("""
        INSERT INTO roles (key, name, description) VALUES
        ('super_admin', 'Super Administrator', 'Full system access'),
        ('regional_admin', 'Regional Administrator', 'Administrative access within assigned region'),
        ('ranger', 'Park Ranger', 'Field data collection and management'),
        ('volunteer', 'Volunteer', 'Limited data entry and viewing'),
        ('user', 'Public User', 'Read-only access to approved content')
    """)

    # Insert default permissions
    op.execute("""
        INSERT INTO permissions (key, name, description, resource) VALUES
        ('create_flora', 'Create Flora Records', 'Create new flora species records', 'flora'),
        ('read_flora', 'View Flora Records', 'View flora species records', 'flora'),
        ('update_flora', 'Update Flora Records', 'Edit flora species records', 'flora'),
        ('delete_flora', 'Delete Flora Records', 'Delete flora species records', 'flora'),
        ('approve_flora', 'Approve Flora Records', 'Approve flora records for publication', 'flora'),
        ('create_fauna', 'Create Fauna Records', 'Create new fauna species records', 'fauna'),
        ('read_fauna', 'View Fauna Records', 'View fauna species records', 'fauna'),
        ('update_fauna', 'Update Fauna Records', 'Edit fauna species records', 'fauna'),
        ('delete_fauna', 'Delete Fauna Records', 'Delete fauna species records', 'fauna'),
        ('approve_fauna', 'Approve Fauna Records', 'Approve fauna records for publication', 'fauna'),
        ('create_zones', 'Create Zones', 'Create new conservation zones', 'zones'),
        ('read_zones', 'View Zones', 'View conservation zones', 'zones'),
        ('update_zones', 'Update Zones', 'Edit conservation zones', 'zones'),
        ('delete_zones', 'Delete Zones', 'Delete conservation zones', 'zones'),
        ('create_articles', 'Create Articles', 'Create new articles', 'articles'),
        ('read_articles', 'View Articles', 'View articles', 'articles'),
        ('update_articles', 'Update Articles', 'Edit articles', 'articles'),
        ('delete_articles', 'Delete Articles', 'Delete articles', 'articles'),
        ('approve_articles', 'Approve Articles', 'Approve articles for publication', 'articles'),
        ('manage_users', 'Manage Users', 'Create and manage user accounts', 'users'),
        ('manage_regions', 'Manage Regions', 'Create and manage regions', 'regions'),
        ('view_all_regions', 'View All Regions', 'Access data across all regions', 'regions'),
        ('export_data', 'Export Data', 'Export system data', 'system'),
        ('import_data', 'Import Data', 'Import data from external sources', 'system')
    """)

    # Assign permissions to roles
    op.execute("""
        -- Super Admin: All permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p WHERE r.key = 'super_admin';

        -- Regional Admin: Regional permissions + approval rights
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.key = 'regional_admin' AND p.key IN (
            'create_flora', 'read_flora', 'update_flora', 'approve_flora',
            'create_fauna', 'read_fauna', 'update_fauna', 'approve_fauna',
            'read_zones', 'create_articles', 'read_articles', 'update_articles', 'approve_articles',
            'view_all_regions'
        );

        -- Ranger: Field data collection
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.key = 'ranger' AND p.key IN (
            'create_flora', 'read_flora', 'update_flora',
            'create_fauna', 'read_fauna', 'update_fauna',
            'read_zones', 'create_articles', 'read_articles', 'update_articles'
        );

        -- Volunteer: Limited data entry
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.key = 'volunteer' AND p.key IN (
            'read_flora', 'read_fauna', 'read_zones', 'read_articles'
        );

        -- Public User: Read-only
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.key = 'user' AND p.key IN ('read_articles');
    """)

    # Migrate existing user roles to user_roles table
    op.execute("""
        INSERT INTO user_roles (user_id, role_id, region_code, assigned_by, assigned_at)
        SELECT
            u.id,
            r.id,
            u.region_code,
            1, -- Assigned by system
            u.created_at
        FROM users u
        JOIN roles r ON r.key = u.role::text
        WHERE u.role IS NOT NULL
    """)

    # Add indexes
    op.create_index("ix_user_roles_user_id", "user_roles", ["user_id"])
    op.create_index("ix_user_roles_role_id", "user_roles", ["role_id"])
    op.create_index("ix_user_roles_region_code", "user_roles", ["region_code"])
    op.create_index("ix_role_permissions_role_id", "role_permissions", ["role_id"])
    op.create_index("ix_role_permissions_permission_id", "role_permissions", ["permission_id"])
    op.create_index("ix_policy_rules_is_active", "policy_rules", ["is_active"])
    op.create_index("ix_policy_rules_priority", "policy_rules", ["priority"])

    # Add unique constraints
    op.create_unique_constraint("uq_user_roles_user_region_role", "user_roles", ["user_id", "role_id", "region_code"])
    op.create_unique_constraint("uq_role_permissions_role_permission", "role_permissions", ["role_id", "permission_id"])

def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("policy_rules")
    op.drop_table("user_roles")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")

    # Drop enums
    op.execute("DROP TYPE IF EXISTS policy_effect")
