"""
Temporary migration endpoint — trigger WooCommerce CSV import via API.
Delete this file after the production migration is complete.
"""

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_admin
from app.models.admin import Admin
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductSize

import csv
import os
import re
from urllib.parse import unquote


router = APIRouter()


# ---------------------------------------------------------------------------
# Inline helpers (copied from scripts/migrate_woocommerce.py)
# ---------------------------------------------------------------------------

def strip_html(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"<[^>]+>", "", text).strip()


def parse_price(value: str) -> float | None:
    if not value or not value.strip():
        return None
    try:
        return float(value.strip().replace(",", ""))
    except ValueError:
        return None


def decode_attribute(value: str) -> str:
    if not value:
        return ""
    return unquote(value.strip())


def build_variation_name(attrs: dict) -> str:
    parts = [v for v in attrs.values() if v]
    return " - ".join(parts) if parts else "Default"


def get_or_create_category(db: Session, name: str, cache: dict) -> Category:
    if name in cache:
        return cache[name]
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        cache[name] = existing
        return existing
    cat = Category(name=name, is_active=True)
    db.add(cat)
    db.flush()
    cache[name] = cat
    return cat


def process_csv(db: Session, filepath: str, category_cache: dict, stats: dict):
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Pass 1 — Parent products
    parent_map: dict[str, Product] = {}
    for row in rows:
        row_type = (row.get("Type") or "").strip().lower()
        if row_type != "variable":
            continue

        sku = (row.get("SKU") or "").strip()
        name = (row.get("Name") or "").strip()
        if not name:
            stats["skipped"] += 1
            continue

        raw_categories = (row.get("Categories") or "").strip()
        if raw_categories:
            cat_parts = [p.strip() for p in raw_categories.split(">")]
            cat_name = cat_parts[-1]
        else:
            cat_name = "Uncategorized"

        category = get_or_create_category(db, cat_name, category_cache)
        description = strip_html(row.get("Description") or "")
        short_desc = strip_html(row.get("Short description") or "")

        product = Product(
            name=name,
            description=description if description else short_desc,
            materials=short_desc if description else None,
            category_id=category.id,
            is_active=True,
        )
        db.add(product)
        db.flush()
        parent_map[sku] = product
        stats["products"] += 1

        images_str = (row.get("Images") or "").strip()
        if images_str:
            urls = [u.strip() for u in images_str.split(",") if u.strip()]
            for i, url in enumerate(urls):
                db.add(ProductImage(product_id=product.id, image_url=url, is_main=(i == 0)))
                stats["images"] += 1

    db.flush()

    # Pass 2 — Variations
    for row in rows:
        row_type = (row.get("Type") or "").strip().lower()
        if row_type != "variation":
            continue

        parent_sku = (row.get("Parent") or "").strip()
        if parent_sku not in parent_map:
            stats["skipped"] += 1
            continue

        product = parent_map[parent_sku]

        attrs = {}
        for i in range(1, 5):
            attr_name = decode_attribute(row.get(f"Attribute {i} name", "")).strip()
            attr_val = decode_attribute(row.get(f"Attribute {i} value(s)", "")).strip()
            if attr_name:
                attrs[attr_name] = attr_val

        bed_size = metal_color = slats_type = cushion_color = rope_color = umbrella_color = None

        for attr_name, attr_val in attrs.items():
            name_lower = attr_name.lower()
            if "مقاس" in attr_name or "مقاسات" in attr_name:
                bed_size = attr_val
            elif "لون المعدن" in attr_name or "لون-المعدن" in attr_name or "metal" in name_lower:
                metal_color = attr_val
            elif "ملل" in attr_name or "slat" in name_lower:
                slats_type = attr_val
            elif "كوشنز" in attr_name or "cushion" in name_lower:
                cushion_color = attr_val
            elif "أحبال" in attr_name or "rope" in name_lower:
                rope_color = attr_val
            elif "مظلة" in attr_name or "umbrella" in name_lower:
                umbrella_color = attr_val

        sale_price = parse_price(row.get("Sale price", ""))
        regular_price = parse_price(row.get("Regular price", ""))

        if sale_price is not None and regular_price is not None and regular_price > sale_price:
            price, discount_price = sale_price, regular_price
        elif sale_price is not None:
            price, discount_price = sale_price, None
        elif regular_price is not None:
            price, discount_price = regular_price, None
        else:
            price, discount_price = 0.0, None

        stock_str = (row.get("Stock") or "").strip()
        try:
            stock_quantity = int(stock_str) if stock_str else 0
        except ValueError:
            stock_quantity = 0

        variation_attrs = {}
        if bed_size: variation_attrs["bed_size"] = bed_size
        if metal_color: variation_attrs["metal_color"] = metal_color
        if slats_type: variation_attrs["slats_type"] = slats_type
        if cushion_color: variation_attrs["cushion_color"] = cushion_color
        if rope_color: variation_attrs["rope_color"] = rope_color
        if umbrella_color: variation_attrs["umbrella_color"] = umbrella_color

        size = ProductSize(
            product_id=product.id,
            name=build_variation_name(variation_attrs),
            price=price,
            discount_price=discount_price,
            stock_quantity=stock_quantity,
            bed_size=bed_size,
            metal_color=metal_color,
            slats_type=slats_type,
            cushion_color=cushion_color,
            rope_color=rope_color,
            umbrella_color=umbrella_color,
        )
        db.add(size)
        stats["sizes"] += 1

        var_images = (row.get("Images") or "").strip()
        if var_images:
            for url in [u.strip() for u in var_images.split(",") if u.strip()]:
                existing = db.query(ProductImage).filter(
                    ProductImage.product_id == product.id,
                    ProductImage.image_url == url,
                ).first()
                if not existing:
                    db.add(ProductImage(product_id=product.id, image_url=url, is_main=False))
                    stats["images"] += 1

    db.flush()


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/run-migration")
def run_migration(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Trigger WooCommerce CSV data migration.
    Protected by admin authentication.
    DELETE THIS ENDPOINT after production migration is complete.
    """
    # Locate CSV files
    # In Docker, the working dir is /app (which is backend/)
    # so CSVs at /app/beds_data.csv.csv  are at the same level
    app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_files = [
        os.path.join(app_root, "beds_data.csv.csv"),
        os.path.join(app_root, "outdoor_data.csv.csv"),
    ]

    # Fallback: also check one level up (project root for local dev)
    if not os.path.exists(csv_files[0]):
        project_root = os.path.dirname(app_root)
        csv_files = [
            os.path.join(project_root, "beds_data.csv.csv"),
            os.path.join(project_root, "outdoor_data.csv.csv"),
        ]

    # Verify CSVs exist
    missing = [f for f in csv_files if not os.path.exists(f)]
    if missing:
        return {"status": "error", "message": f"CSV files not found: {missing}"}

    # Check if data already exists
    existing_products = db.query(Product).count()
    if existing_products > 0:
        return {
            "status": "skipped",
            "message": f"Database already contains {existing_products} products. Clear data first or remove this check.",
        }

    stats = {"categories": 0, "products": 0, "sizes": 0, "images": 0, "skipped": 0}
    category_cache: dict[str, Category] = {}

    try:
        for csv_path in csv_files:
            process_csv(db, csv_path, category_cache, stats)

        stats["categories"] = len(category_cache)
        db.commit()

        return {
            "status": "success",
            "summary": {
                "categories_created": stats["categories"],
                "products_created": stats["products"],
                "variations_created": stats["sizes"],
                "images_created": stats["images"],
                "rows_skipped": stats["skipped"],
            },
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
