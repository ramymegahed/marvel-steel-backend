"""add_variation_attributes_to_product_sizes

Revision ID: a3c7f1e2b4d6
Revises: 9719d80e4845
Create Date: 2026-03-18 20:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'a3c7f1e2b4d6'
down_revision: Union[str, Sequence[str], None] = '9719d80e4845'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add variation attribute columns to product_sizes."""
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    cols = [c.get('name') for c in inspector.get_columns('product_sizes')]

    if 'bed_size' not in cols:
        op.add_column('product_sizes', sa.Column('bed_size', sa.String(), nullable=True))
    if 'metal_color' not in cols:
        op.add_column('product_sizes', sa.Column('metal_color', sa.String(), nullable=True))
    if 'slats_type' not in cols:
        op.add_column('product_sizes', sa.Column('slats_type', sa.String(), nullable=True))
    if 'cushion_color' not in cols:
        op.add_column('product_sizes', sa.Column('cushion_color', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove variation attribute columns from product_sizes."""
    op.drop_column('product_sizes', 'cushion_color')
    op.drop_column('product_sizes', 'slats_type')
    op.drop_column('product_sizes', 'metal_color')
    op.drop_column('product_sizes', 'bed_size')
