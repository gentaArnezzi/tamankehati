from alembic import op
import sqlalchemy as sa

revision = "20251019_0008"
down_revision = "20251019_0007"
branch_labels = None
depends_on = None

IUCN_ALLOWED = ('LC','NT','VU','EN','CR','DD','NE')

def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    
    # Add columns to flora (check if they exist first)
    flora_columns = [col['name'] for col in inspector.get_columns('flora')]
    if 'is_endemic' not in flora_columns:
        op.add_column('flora', sa.Column('is_endemic', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    if 'iucn_status' not in flora_columns:
        op.add_column('flora', sa.Column('iucn_status', sa.String(length=8), nullable=True))
        op.create_check_constraint('ck_flora_iucn_status', 'flora', f"iucn_status IS NULL OR iucn_status IN {IUCN_ALLOWED}")
        op.create_index('idx_flora_iucn', 'flora', ['iucn_status'])

    # Add columns to fauna (check if they exist first)
    fauna_columns = [col['name'] for col in inspector.get_columns('fauna')]
    if 'is_endemic' not in fauna_columns:
        op.add_column('fauna', sa.Column('is_endemic', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    if 'iucn_status' not in fauna_columns:
        op.add_column('fauna', sa.Column('iucn_status', sa.String(length=8), nullable=True))
        op.create_check_constraint('ck_fauna_iucn_status', 'fauna', f"iucn_status IS NULL OR iucn_status IN {IUCN_ALLOWED}")
        op.create_index('idx_fauna_iucn', 'fauna', ['iucn_status'])

def downgrade():
    op.drop_index('idx_fauna_iucn', table_name='fauna')
    op.drop_constraint('ck_fauna_iucn_status', 'fauna', type_='check')
    op.drop_column('fauna', 'iucn_status')
    op.drop_column('fauna', 'is_endemic')

    op.drop_index('idx_flora_iucn', table_name='flora')
    op.drop_constraint('ck_flora_iucn_status', 'flora', type_='check')
    op.drop_column('flora', 'iucn_status')
    op.drop_column('flora', 'is_endemic')
