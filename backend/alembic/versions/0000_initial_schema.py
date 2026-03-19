"""Initial schema — create all base tables

Revision ID: 0000_initial_schema
Revises:
Create Date: 2026-03-19 00:00:00.000000

This is the true base migration. It creates every table from scratch so the
subsequent ALTER-only migrations work correctly on a fresh database.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

# revision identifiers
revision: str = '0000_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    # ── admins ──────────────────────────────────────────────────────────────
    if 'admins' not in tables:
        op.create_table(
            'admins',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
            sa.Column('hashed_password', sa.String(), nullable=False),
            sa.Column('role', sa.String(), nullable=False, server_default='staff'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── categories ──────────────────────────────────────────────────────────
    if 'categories' not in tables:
        op.create_table(
            'categories',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('name', sa.String(), nullable=False, index=True),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('image_url', sa.String(), nullable=True),
            sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── products ────────────────────────────────────────────────────────────
    if 'products' not in tables:
        op.create_table(
            'products',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('name', sa.String(), nullable=False, index=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('materials', sa.String(), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=False),
            sa.Column('delivery_time', sa.String(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── product_images ───────────────────────────────────────────────────────
    if 'product_images' not in tables:
        op.create_table(
            'product_images',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('image_url', sa.String(), nullable=False),
            sa.Column('is_main', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── product_sizes ────────────────────────────────────────────────────────
    if 'product_sizes' not in tables:
        op.create_table(
            'product_sizes',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('price', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('discount_price', sa.Float(), nullable=True),
            sa.Column('stock_quantity', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('bed_size', sa.String(), nullable=True),
            sa.Column('metal_color', sa.String(), nullable=True),
            sa.Column('slats_type', sa.String(), nullable=True),
            sa.Column('cushion_color', sa.String(), nullable=True),
            sa.Column('rope_color', sa.String(), nullable=True),
            sa.Column('umbrella_color', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── orders ───────────────────────────────────────────────────────────────
    if 'orders' not in tables:
        op.create_table(
            'orders',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('customer_name', sa.String(), nullable=False),
            sa.Column('phone', sa.String(), nullable=False),
            sa.Column('address', sa.Text(), nullable=False),
            sa.Column('payment_method', sa.String(), nullable=False),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('total_price', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('status', sa.String(), nullable=False, server_default='pending'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── order_items ──────────────────────────────────────────────────────────
    if 'order_items' not in tables:
        op.create_table(
            'order_items',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('size_id', sa.Integer(), sa.ForeignKey('product_sizes.id'), nullable=True),
            sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('price_at_purchase', sa.Float(), nullable=False),
        )

    # ── carts ────────────────────────────────────────────────────────────────
    if 'carts' not in tables:
        op.create_table(
            'carts',
            sa.Column('id', sa.String(), primary_key=True, index=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── cart_items ───────────────────────────────────────────────────────────
    if 'cart_items' not in tables:
        op.create_table(
            'cart_items',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('cart_id', sa.String(), sa.ForeignKey('carts.id'), nullable=False, index=True),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('size_id', sa.Integer(), sa.ForeignKey('product_sizes.id'), nullable=True),
            sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── site_settings ────────────────────────────────────────────────────────
    if 'site_settings' not in tables:
        op.create_table(
            'site_settings',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('store_name', sa.String(), nullable=True),
            sa.Column('store_email', sa.String(), nullable=True),
            sa.Column('store_phone', sa.String(), nullable=True),
            sa.Column('store_address', sa.Text(), nullable=True),
            sa.Column('logo_url', sa.String(), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )

    # ── reviews ──────────────────────────────────────────────────────────────
    if 'reviews' not in tables:
        op.create_table(
            'reviews',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('customer_name', sa.String(), nullable=False),
            sa.Column('rating', sa.Integer(), nullable=False),
            sa.Column('comment', sa.Text(), nullable=True),
            sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )


def downgrade() -> None:
    op.drop_table('reviews')
    op.drop_table('site_settings')
    op.drop_table('cart_items')
    op.drop_table('carts')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('product_sizes')
    op.drop_table('product_images')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('admins')
