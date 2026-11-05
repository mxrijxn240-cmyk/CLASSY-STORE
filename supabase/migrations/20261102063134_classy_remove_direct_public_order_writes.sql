/*
# Remove direct public writes to orders

1. Modified Security
- Visitors can no longer insert orders or order items directly. Orders are placed only through the `place_order` function, which calculates totals on the server.
- Admins keep their view, status update, and delete access.

2. Important Notes
- No existing orders or order items are changed or deleted.
*/

DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
DROP POLICY IF EXISTS "Anyone can add order items" ON order_items;

REVOKE INSERT ON orders, order_items FROM anon, authenticated;
GRANT UPDATE ON orders TO authenticated;
