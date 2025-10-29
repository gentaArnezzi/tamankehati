"""initial_migration

Revision ID: 20251029_0001
Revises: 
Create Date: 2025-10-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251029_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Create parks table first (referenced by users) ###
    op.create_table('parks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False, comment='Nama Taman'),
        sa.Column('slug', sa.String(length=255), nullable=False, comment='URL-friendly name'),
        sa.Column('sk_penetapan', sa.String(length=255), nullable=True, comment='Nomor SK Penetapan'),
        sa.Column('pengelola', sa.String(length=255), nullable=True, comment='Instansi Pengelola'),
        sa.Column('provinsi', sa.String(length=100), nullable=True, comment='Provinsi'),
        sa.Column('kota_kabupaten', sa.String(length=100), nullable=True, comment='Kota/Kabupaten'),
        sa.Column('kecamatan', sa.String(length=100), nullable=True, comment='Kecamatan'),
        sa.Column('desa_kelurahan', sa.String(length=100), nullable=True, comment='Desa/Kelurahan'),
        sa.Column('tipe_ekoregion', sa.String(length=100), nullable=True, comment='Tipe Ekoregion'),
        sa.Column('area_ha', sa.Numeric(precision=10, scale=2), nullable=True, comment='Luas dalam hektar'),
        sa.Column('latitude', sa.Numeric(precision=10, scale=8), nullable=True, comment='Latitude koordinat taman'),
        sa.Column('longitude', sa.Numeric(precision=11, scale=8), nullable=True, comment='Longitude koordinat taman'),
        sa.Column('description', sa.Text(), nullable=True, comment='Deskripsi Umum'),
        sa.Column('kondisi_fisik', sa.Text(), nullable=True, comment='Kondisi Fisik Kawasan'),
        sa.Column('nilai_penting', sa.Text(), nullable=True, comment='Nilai Penting Kawasan'),
        sa.Column('sejarah', sa.Text(), nullable=True, comment='Sejarah Taman'),
        sa.Column('visi', sa.Text(), nullable=True, comment='Visi Taman'),
        sa.Column('misi', sa.Text(), nullable=True, comment='Misi Taman'),
        sa.Column('nilai_dasar', sa.Text(), nullable=True, comment='Nilai-nilai Dasar'),
        sa.Column('gambar_utama', sa.String(length=500), nullable=True, comment='URL gambar utama taman'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('submitted_by', sa.Integer(), nullable=True, comment='User who created/submitted this park'),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True, comment='Rejection reason or backup data for approved park edits'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_parks_id'), 'parks', ['id'], unique=False)

    # ### Create users table ###
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='regional_admin'),
        sa.Column('park_id', sa.Integer(), nullable=True),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('profile_picture_url', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['park_id'], ['parks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_park_id'), 'users', ['park_id'], unique=False)

    # ### Add foreign keys to parks table for workflow columns (after users table created) ###
    op.create_foreign_key('fk_parks_submitted_by', 'parks', 'users', ['submitted_by'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_parks_approved_by', 'parks', 'users', ['approved_by'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_parks_rejected_by', 'parks', 'users', ['rejected_by'], ['id'], ondelete='SET NULL')

    # ### Create flora table ###
    op.create_table('flora',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('park_id', sa.Integer(), nullable=False),
        sa.Column('local_name', sa.String(), nullable=True),
        sa.Column('scientific_name', sa.String(), nullable=True),
        sa.Column('family', sa.String(), nullable=True),
        sa.Column('genus', sa.String(), nullable=True),
        sa.Column('species', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('habitat', sa.Text(), nullable=True),
        sa.Column('morphology', sa.Text(), nullable=True),
        sa.Column('benefits', sa.Text(), nullable=True),
        sa.Column('uses', sa.Text(), nullable=True),
        sa.Column('local_id', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('gambar_utama', sa.String(length=500), nullable=True),
        sa.Column('is_endemic', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('iucn_status', sa.String(length=8), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['park_id'], ['parks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create fauna table ###
    op.create_table('fauna',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('park_id', sa.Integer(), nullable=False),
        sa.Column('local_name', sa.String(), nullable=True),
        sa.Column('scientific_name', sa.String(), nullable=True),
        sa.Column('family', sa.String(), nullable=True),
        sa.Column('genus', sa.String(), nullable=True),
        sa.Column('species', sa.String(), nullable=True),
        sa.Column('ordo', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('habitat', sa.Text(), nullable=True),
        sa.Column('diet', sa.Text(), nullable=True),
        sa.Column('behavior', sa.Text(), nullable=True),
        sa.Column('morphology', sa.Text(), nullable=True),
        sa.Column('local_id', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('habitat_sumber_makanan', sa.Text(), nullable=True),
        sa.Column('status_hama', sa.String(length=50), nullable=True),
        sa.Column('tingkat_hama', sa.String(length=50), nullable=True),
        sa.Column('gambar_utama', sa.String(length=500), nullable=True),
        sa.Column('is_endemic', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('iucn_status', sa.String(length=8), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['park_id'], ['parks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create activities table ###
    op.create_table('activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('park_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('activity_date', sa.Date(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('images', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('submitted_by', sa.Integer(), nullable=True, comment='User who created/submitted this activity'),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['park_id'], ['parks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create articles table ###
    op.create_table('articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('featured_image', sa.String(length=500), nullable=True),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('park_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['park_id'], ['parks.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_articles_id'), 'articles', ['id'], unique=False)

    # ### Create galleries table ###
    op.create_table('galleries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('entity_type', sa.String(length=20), nullable=True),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_galleries_author_id'), 'galleries', ['author_id'], unique=False)
    op.create_index(op.f('ix_galleries_entity_id'), 'galleries', ['entity_id'], unique=False)
    op.create_index(op.f('ix_galleries_entity_type'), 'galleries', ['entity_type'], unique=False)
    op.create_index(op.f('ix_galleries_id'), 'galleries', ['id'], unique=False)

    # ### Create notifications table ###
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('to_user_id', sa.Integer(), nullable=False),
        sa.Column('from_user_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('resource', sa.String(length=100), nullable=True),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('region_code', sa.String(length=10), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_from_user_id'), 'notifications', ['from_user_id'], unique=False)
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_region_code'), 'notifications', ['region_code'], unique=False)
    op.create_index(op.f('ix_notifications_to_user_id'), 'notifications', ['to_user_id'], unique=False)


def downgrade() -> None:
    # ### Drop tables in reverse order ###
    op.drop_index(op.f('ix_notifications_to_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_region_code'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_from_user_id'), table_name='notifications')
    op.drop_table('notifications')
    
    op.drop_index(op.f('ix_galleries_id'), table_name='galleries')
    op.drop_index(op.f('ix_galleries_entity_type'), table_name='galleries')
    op.drop_index(op.f('ix_galleries_entity_id'), table_name='galleries')
    op.drop_index(op.f('ix_galleries_author_id'), table_name='galleries')
    op.drop_table('galleries')
    
    op.drop_index(op.f('ix_articles_id'), table_name='articles')
    op.drop_table('articles')
    
    op.drop_table('activities')
    op.drop_table('fauna')
    op.drop_table('flora')
    
    op.drop_index(op.f('ix_users_park_id'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    op.drop_index(op.f('ix_parks_id'), table_name='parks')
    op.drop_table('parks')

