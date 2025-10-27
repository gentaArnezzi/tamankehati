from alembic import op
import sqlalchemy as sa

revision = "20251018_0005"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("chat_sessions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False, server_default="New Chat"),
        sa.Column("user_id", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_table("chat_messages",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("session_id", sa.Integer, sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

def downgrade():
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
