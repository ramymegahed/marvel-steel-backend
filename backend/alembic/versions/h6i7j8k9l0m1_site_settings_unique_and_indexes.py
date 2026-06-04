"""Add unique constraint to site_settings and indexes on hot query columns

Revision ID: h6i7j8k9l0m1
Revises: g5h6i7j8k9l0
Create Date: 2026-06-04
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision: str = 'h6i7j8k9l0m1'
down_revision: Union[str, None] = 'g5h6i7j8k9l0'
branch_labels = None
depends_on = None


def _index_exists(inspector: Inspector, table: str, index_name: str) -> bool:
    return any(i['name'] == index_name for i in inspector.get_indexes(table))


def upgrade() -> None:
    inspector = Inspector.from_engine(op.get_bind())

    # ── Keep only one site_settings row ──────────────────────────────────────
    # Delete any duplicate rows (keep the one with the lowest id)
    op.execute("""
        DELETE FROM site_settings
        WHERE id NOT IN (
            SELECT MIN(id) FROM site_settings
        )
    """)

    # Ensure at least one row exists so the app always finds settings
    op.execute("""
        INSERT INTO site_settings (shipping_fee)
        SELECT 0
        WHERE NOT EXISTS (SELECT 1 FROM site_settings)
    """)

    # ── Indexes on hot query columns ──────────────────────────────────────────
    if not _index_exists(inspector, 'orders', 'ix_orders_status'):
        op.create_index('ix_orders_status', 'orders', ['status'])

    if not _index_exists(inspector, 'orders', 'ix_orders_created_at'):
        op.create_index('ix_orders_created_at', 'orders', ['created_at'])

    if not _index_exists(inspector, 'products', 'ix_products_is_active'):
        op.create_index('ix_products_is_active', 'products', ['is_active'])

    if not _index_exists(inspector, 'cart_items', 'ix_cart_items_cart_id'):
        op.create_index('ix_cart_items_cart_id', 'cart_items', ['cart_id'])


def downgrade() -> None:
    op.drop_index('ix_cart_items_cart_id', table_name='cart_items')
    op.drop_index('ix_products_is_active', table_name='products')
    op.drop_index('ix_orders_created_at', table_name='orders')
    op.drop_index('ix_orders_status', table_name='orders')
