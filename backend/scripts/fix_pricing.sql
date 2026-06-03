-- Fix inverted price/discount_price data imported by the original migration.
--
-- The original migration stored:
--   price          = WooCommerce "Sale price"  (the lower value)
--   discount_price = WooCommerce "Regular price" (the higher value)
--
-- The correct mapping is:
--   price          = regular/original price  (shown as strikethrough on product page)
--   discount_price = sale/current price      (what the customer actually pays)
--
-- This UPDATE swaps the two columns for every row where discount_price > price,
-- which is every row affected by the bug. In SQL, the right-hand side of SET
-- is evaluated using old column values before any assignment, so the swap is safe.

UPDATE product_sizes
SET
    price          = discount_price,
    discount_price = price
WHERE
    discount_price IS NOT NULL
    AND discount_price > price;
