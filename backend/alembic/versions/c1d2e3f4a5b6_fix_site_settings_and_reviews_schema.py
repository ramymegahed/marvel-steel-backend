"""Fix site_settings and reviews schema to match current models

Revision ID: c1d2e3f4a5b6
Revises: b5d8g2f3c5e7
Create Date: 2026-06-03

site_settings: old columns (store_name, store_email, store_phone, store_address, logo_url)
               → new columns (vodafone_cash_number, instapay_number, whatsapp_number,
                               delivery_time, order_confirmation_message)

reviews: drop rating, is_approved; make customer_name nullable; ensure comment is NOT NULL
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, None] = 'b5d8g2f3c5e7'
branch_labels = None
depends_on = None


def _column_exists(inspector, table: str, column: str) -> bool:
    return any(c['name'] == column for c in inspector.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)

    # ── site_settings: drop old columns ────────────────────────────────────
    for col in ('store_name', 'store_email', 'store_phone', 'store_address', 'logo_url'):
        if _column_exists(inspector, 'site_settings', col):
            op.drop_column('site_settings', col)

    # ── site_settings: add new columns ─────────────────────────────────────
    for col, type_ in (
        ('vodafone_cash_number', sa.String()),
        ('instapay_number',      sa.String()),
        ('whatsapp_number',      sa.String()),
        ('delivery_time',        sa.String()),
        ('order_confirmation_message', sa.Text()),
    ):
        if not _column_exists(inspector, 'site_settings', col):
            op.add_column('site_settings', sa.Column(col, type_, nullable=True))

    # ── reviews: drop obsolete columns ─────────────────────────────────────
    for col in ('rating', 'is_approved'):
        if _column_exists(inspector, 'reviews', col):
            op.drop_column('reviews', col)

    # ── reviews: make customer_name nullable ────────────────────────────────
    if _column_exists(inspector, 'reviews', 'customer_name'):
        op.alter_column('reviews', 'customer_name', nullable=True)

    # ── reviews: ensure comment is NOT NULL (set empty string default first) ─
    if _column_exists(inspector, 'reviews', 'comment'):
        op.execute("UPDATE reviews SET comment = '' WHERE comment IS NULL")
        op.alter_column('reviews', 'comment', nullable=False)


def downgrade() -> None:
    # reviews
    op.alter_column('reviews', 'comment', nullable=True)
    op.alter_column('reviews', 'customer_name', nullable=False)
    op.add_column('reviews', sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('reviews', sa.Column('rating', sa.Integer(), nullable=False, server_default='5'))

    # site_settings
    for col in ('order_confirmation_message', 'delivery_time', 'whatsapp_number',
                'instapay_number', 'vodafone_cash_number'):
        op.drop_column('site_settings', col)

    op.add_column('site_settings', sa.Column('logo_url', sa.String(), nullable=True))
    op.add_column('site_settings', sa.Column('store_address', sa.Text(), nullable=True))
    op.add_column('site_settings', sa.Column('store_phone', sa.String(), nullable=True))
    op.add_column('site_settings', sa.Column('store_email', sa.String(), nullable=True))
    op.add_column('site_settings', sa.Column('store_name', sa.String(), nullable=True))
