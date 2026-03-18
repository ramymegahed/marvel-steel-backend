"""add_rope_color_umbrella_color_to_product_sizes

Revision ID: b5d8g2f3c5e7
Revises: a3c7f1e2b4d6
Create Date: 2026-03-18 21:23:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'b5d8g2f3c5e7'
down_revision: Union[str, Sequence[str], None] = 'a3c7f1e2b4d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add rope_color and umbrella_color columns to product_sizes."""
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    cols = [c.get('name') for c in inspector.get_columns('product_sizes')]

    if 'rope_color' not in cols:
        op.add_column('product_sizes', sa.Column('rope_color', sa.String(), nullable=True))
    if 'umbrella_color' not in cols:
        op.add_column('product_sizes', sa.Column('umbrella_color', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove rope_color and umbrella_color columns from product_sizes."""
    op.drop_column('product_sizes', 'umbrella_color')
    op.drop_column('product_sizes', 'rope_color')
