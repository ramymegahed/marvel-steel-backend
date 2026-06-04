"""fix: set discount_price=NULL where it was incorrectly stored as 0

When the admin left the discount price field blank, the frontend sent 0
instead of null. This caused every size with an empty discount to appear
free in the cart. This migration corrects all such rows.

Revision ID: g5h6i7j8k9l0
Revises: f4a5b6c7d8e9
Create Date: 2026-06-04
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'g5h6i7j8k9l0'
down_revision: Union[str, None] = 'f4a5b6c7d8e9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        UPDATE product_sizes
        SET discount_price = NULL
        WHERE discount_price = 0
    """)


def downgrade() -> None:
    pass
