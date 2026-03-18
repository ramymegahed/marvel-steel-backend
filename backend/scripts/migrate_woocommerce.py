"""
WooCommerce CSV Migration Script for Marvel Steel Backend
=========================================================

Reads beds_data.csv.csv and outdoor_data.csv.csv, then populates:
  - categories
  - products
  - product_images
  - product_sizes  (with bed_size, metal_color, slats_type, cushion_color)

Usage:
    cd backend
    python -m scripts.migrate_woocommerce
"""

import csv
import os
import re
import sys
from urllib.parse import unquote

# Ensure the backend directory is on sys.path so app.* imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductSize


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    if not text:
        return ""
    return re.sub(r"<[^>]+>", "", text).strip()


def parse_price(value: str) -> float | None:
    """Parse a price string to float, returning None on failure."""
    if not value or not value.strip():
        return None
    try:
        return float(value.strip().replace(",", ""))
    except ValueError:
        return None


def decode_attribute(value: str) -> str:
    """URL-decode an attribute value (handles Arabic percent-encoded strings)."""
    if not value:
        return ""
    decoded = unquote(value.strip())
    return decoded


def build_variation_name(attrs: dict) -> str:
    """Build a human-readable name from non-empty attribute values."""
    parts = [v for v in attrs.values() if v]
    return " - ".join(parts) if parts else "Default"


# ---------------------------------------------------------------------------
# Core migration logic
# ---------------------------------------------------------------------------

def get_or_create_category(db: Session, name: str, cache: dict) -> Category:
    """Get existing category or create a new one. Uses a local cache."""
    if name in cache:
        return cache[name]

    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        cache[name] = existing
        return existing

    cat = Category(name=name, is_active=True)
    db.add(cat)
    db.flush()  # get the id without committing
    cache[name] = cat
    return cat


def process_csv(db: Session, filepath: str, category_cache: dict, stats: dict):
    """
    Process a single WooCommerce CSV export file.

    Pass 1: Collect parent products (Type == 'variable')
    Pass 2: Create variations  (Type == 'variation') linked via Parent SKU
    """
    print(f"\n{'='*60}")
    print(f"Processing: {os.path.basename(filepath)}")
    print(f"{'='*60}")

    # ------------------------------------------------------------------
    # Read all rows
    # ------------------------------------------------------------------
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"  Total rows read: {len(rows)}")

    # ------------------------------------------------------------------
    # Pass 1 — Parent products  (Type == 'variable')
    # ------------------------------------------------------------------
    # Map: parent SKU -> Product ORM object
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

        # --- Category ---------------------------------------------------
        raw_categories = (row.get("Categories") or "").strip()
        # WooCommerce uses "Parent > Child" format; take the last segment
        if raw_categories:
            cat_parts = [p.strip() for p in raw_categories.split(">")]
            cat_name = cat_parts[-1]  # most specific sub-category
        else:
            cat_name = "Uncategorized"

        category = get_or_create_category(db, cat_name, category_cache)

        # --- Description -------------------------------------------------
        description = strip_html(row.get("Description") or "")
        short_desc = strip_html(row.get("Short description") or "")

        # --- Create Product ----------------------------------------------
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

        # --- Images from parent row --------------------------------------
        images_str = (row.get("Images") or "").strip()
        if images_str:
            urls = [u.strip() for u in images_str.split(",") if u.strip()]
            for i, url in enumerate(urls):
                img = ProductImage(
                    product_id=product.id,
                    image_url=url,
                    is_main=(i == 0),
                )
                db.add(img)
                stats["images"] += 1

        print(f"  [+] Product: {name}  (SKU={sku}, category={cat_name})")

    db.flush()

    # ------------------------------------------------------------------
    # Pass 2 — Variations  (Type == 'variation')
    # ------------------------------------------------------------------
    for row in rows:
        row_type = (row.get("Type") or "").strip().lower()
        if row_type != "variation":
            continue

        parent_sku = (row.get("Parent") or "").strip()
        if parent_sku not in parent_map:
            print(f"  [!] Skipping variation with unknown parent SKU: {parent_sku}")
            stats["skipped"] += 1
            continue

        product = parent_map[parent_sku]

        # --- Attributes -------------------------------------------------
        # The attribute columns use patterns like:
        #   "Attribute 1 name"  / "Attribute 1 value(s)"
        #   "Attribute 2 name"  / "Attribute 2 value(s)"
        #   etc.
        attrs = {}
        for i in range(1, 5):  # support up to 4 attributes
            attr_name_col = f"Attribute {i} name"
            attr_val_col = f"Attribute {i} value(s)"
            attr_name = decode_attribute(row.get(attr_name_col, "")).strip()
            attr_val = decode_attribute(row.get(attr_val_col, "")).strip()
            if attr_name:
                attrs[attr_name] = attr_val

        # Map Arabic attribute names to our columns
        bed_size = None
        metal_color = None
        slats_type = None
        cushion_color = None
        rope_color = None
        umbrella_color = None

        for attr_name, attr_val in attrs.items():
            name_lower = attr_name.lower()
            # المقاس = bed size
            if "مقاس" in attr_name or "مقاسات" in attr_name:
                bed_size = attr_val
            # لون المعدن = metal color
            elif "لون المعدن" in attr_name or "لون-المعدن" in attr_name or "metal" in name_lower:
                metal_color = attr_val
            # نوع الملل = slats type
            elif "ملل" in attr_name or "slat" in name_lower:
                slats_type = attr_val
            # لون الكوشنز = cushion color
            elif "كوشنز" in attr_name or "cushion" in name_lower:
                cushion_color = attr_val
            # ألوان الأحبال = rope color
            elif "أحبال" in attr_name or "rope" in name_lower:
                rope_color = attr_val
            # لون المظلة = umbrella color
            elif "مظلة" in attr_name or "umbrella" in name_lower:
                umbrella_color = attr_val
            else:
                # Fallback: unknown attribute
                print(f"  [?] Unknown attribute: '{attr_name}' = '{attr_val}' on parent {parent_sku}")

        # --- Price -------------------------------------------------------
        sale_price = parse_price(row.get("Sale price", ""))
        regular_price = parse_price(row.get("Regular price", ""))

        # In WooCommerce: Regular price = original, Sale price = discounted
        # In our schema: price = current price, discount_price = original (higher) price
        if sale_price is not None and regular_price is not None and regular_price > sale_price:
            price = sale_price
            discount_price = regular_price
        elif sale_price is not None:
            price = sale_price
            discount_price = None
        elif regular_price is not None:
            price = regular_price
            discount_price = None
        else:
            price = 0.0
            discount_price = None

        # --- Stock -------------------------------------------------------
        stock_str = (row.get("Stock") or "").strip()
        try:
            stock_quantity = int(stock_str) if stock_str else 0
        except ValueError:
            stock_quantity = 0

        # --- Build variation name ----------------------------------------
        variation_attrs = {}
        if bed_size:
            variation_attrs["bed_size"] = bed_size
        if metal_color:
            variation_attrs["metal_color"] = metal_color
        if slats_type:
            variation_attrs["slats_type"] = slats_type
        if cushion_color:
            variation_attrs["cushion_color"] = cushion_color
        if rope_color:
            variation_attrs["rope_color"] = rope_color
        if umbrella_color:
            variation_attrs["umbrella_color"] = umbrella_color

        variation_name = build_variation_name(variation_attrs)

        # --- Create ProductSize ------------------------------------------
        size = ProductSize(
            product_id=product.id,
            name=variation_name,
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

        # --- Images on variation (if any, less common) -------------------
        var_images = (row.get("Images") or "").strip()
        if var_images:
            for url in [u.strip() for u in var_images.split(",") if u.strip()]:
                # Avoid duplicating images that already exist on the parent
                existing = db.query(ProductImage).filter(
                    ProductImage.product_id == product.id,
                    ProductImage.image_url == url,
                ).first()
                if not existing:
                    img = ProductImage(
                        product_id=product.id,
                        image_url=url,
                        is_main=False,
                    )
                    db.add(img)
                    stats["images"] += 1

    db.flush()
    print(f"  Finished processing {os.path.basename(filepath)}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  Marvel Steel — WooCommerce CSV Migration")
    print("=" * 60)

    # Locate CSV files (relative to the project root)
    # Script is at backend/scripts/migrate_woocommerce.py
    # CSVs are at the project root (one level above backend/)
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    project_root = os.path.dirname(backend_dir)
    csv_files = [
        os.path.join(project_root, "beds_data.csv.csv"),
        os.path.join(project_root, "outdoor_data.csv.csv"),
    ]

    for f in csv_files:
        if not os.path.exists(f):
            print(f"ERROR: CSV file not found: {f}")
            sys.exit(1)

    # Stats tracker
    stats = {
        "categories": 0,
        "products": 0,
        "sizes": 0,
        "images": 0,
        "skipped": 0,
    }

    db: Session = SessionLocal()
    try:
        category_cache: dict[str, Category] = {}

        for csv_path in csv_files:
            process_csv(db, csv_path, category_cache, stats)

        # Count newly created categories
        stats["categories"] = len(category_cache)

        # Commit all changes in one transaction
        db.commit()
        print("\n" + "=" * 60)
        print("  Migration Complete!")
        print("=" * 60)
        print(f"  Categories created/found : {stats['categories']}")
        print(f"  Products created         : {stats['products']}")
        print(f"  Variations (sizes) created: {stats['sizes']}")
        print(f"  Images created           : {stats['images']}")
        print(f"  Rows skipped             : {stats['skipped']}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\nERROR: Migration failed — {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
