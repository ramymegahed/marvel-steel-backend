"""Phase 3 schema: customer_email, shipping_fee, revoked_tokens

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-06-04
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

revision: str = 'f4a5b6c7d8e9'
down_revision: Union[str, None] = 'e3f4a5b6c7d8'
branch_labels = None
depends_on = None


def _column_exists(inspector: Inspector, table: str, column: str) -> bool:
    return any(c['name'] == column for c in inspector.get_columns(table))


def _table_exists(inspector: Inspector, table: str) -> bool:
    return table in inspector.get_table_names()


def upgrade() -> None:
    inspector = Inspector.from_engine(op.get_bind())

    # 3.1 — customer email on orders
    if not _column_exists(inspector, 'orders', 'customer_email'):
        op.add_column('orders', sa.Column('customer_email', sa.String(), nullable=True))

    # 3.5 — shipping fee on site_settings
    if not _column_exists(inspector, 'site_settings', 'shipping_fee'):
        op.add_column(
            'site_settings',
            sa.Column('shipping_fee', sa.Float(), nullable=False, server_default='0')
        )

    # 3.7 — revoked_tokens table for server-side logout
    if not _table_exists(inspector, 'revoked_tokens'):
        op.create_table(
            'revoked_tokens',
            sa.Column('jti', sa.String(), nullable=False),
            sa.Column('revoked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint('jti'),
        )
        op.create_index('ix_revoked_tokens_jti', 'revoked_tokens', ['jti'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_revoked_tokens_jti', table_name='revoked_tokens')
    op.drop_table('revoked_tokens')
    op.drop_column('site_settings', 'shipping_fee')
    op.drop_column('orders', 'customer_email')
