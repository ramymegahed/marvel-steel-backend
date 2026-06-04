"""Add must_change_password to admins

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-06-04
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

revision: str = 'e3f4a5b6c7d8'
down_revision: Union[str, None] = 'd2e3f4a5b6c7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = Inspector.from_engine(op.get_bind())
    columns = [c['name'] for c in inspector.get_columns('admins')]
    if 'must_change_password' not in columns:
        op.add_column(
            'admins',
            sa.Column('must_change_password', sa.Boolean(), nullable=False, server_default='false')
        )


def downgrade() -> None:
    op.drop_column('admins', 'must_change_password')
