"""Add product_id and is_approved to reviews

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-06-03
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

revision: str = 'd2e3f4a5b6c7'
down_revision: Union[str, None] = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def _column_exists(inspector, table: str, column: str) -> bool:
    return any(c['name'] == column for c in inspector.get_columns(table))


def upgrade() -> None:
    inspector = Inspector.from_engine(op.get_bind())

    if not _column_exists(inspector, 'reviews', 'product_id'):
        op.add_column('reviews', sa.Column('product_id', sa.Integer(), nullable=True))

    if not _column_exists(inspector, 'reviews', 'is_approved'):
        op.add_column('reviews', sa.Column(
            'is_approved', sa.Boolean(), nullable=False, server_default='false'
        ))


def downgrade() -> None:
    op.drop_column('reviews', 'is_approved')
    op.drop_column('reviews', 'product_id')
