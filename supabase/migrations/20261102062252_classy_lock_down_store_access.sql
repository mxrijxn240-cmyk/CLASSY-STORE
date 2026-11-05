/*
# Lock down CLASSY store access

1. New Tables
- `admins`: list of user accounts allowed to manage the store. Each row is one user id.

2. Security
- Row Level Security enabled on `admins`. Signed-in users may only see their own row.
- `is_admin()` function returns true for the signed-in admin only. Only signed-in users may run it.
- `products`: visitors can view only products marked available. Only admins can view all products, add, edit, or delete.
- `orders` and `order_items`: visitors can place orders and add order items but cannot read, change, or delete them. Only admins can view and delete them, and change order status.
- Old open policies ("Public can ...") are removed.

3. Important Notes
- No existing rows are deleted or changed.
- Customers only ever write data; they can never read another customer's order.
- Admin accounts are added to `admins` manually after sign-up.
*/

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admins FROM anon, authenticated;
GRANT SELECT ON admins TO authenticated;

DROP POLICY IF EXISTS "Admins can view own admin record" ON admins;
CREATE POLICY "Admins can view own admin record" ON admins FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON products, orders, order_items FROM anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT INSERT ON orders, order_items TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, DELETE ON order_items TO authenticated;

DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Public can add products" ON products;
DROP POLICY IF EXISTS "Public can update products" ON products;
DROP POLICY IF EXISTS "Public can delete products" ON products;
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;
DROP POLICY IF EXISTS "Public can delete orders" ON orders;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can add order items" ON order_items;
DROP POLICY IF EXISTS "Public can update order items" ON order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON order_items;

DROP POLICY IF EXISTS "Anyone can view available products" ON products;
CREATE POLICY "Anyone can view available products" ON products FOR SELECT
  TO anon, authenticated USING (is_available = true);

DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products" ON products FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can add products" ON products;
CREATE POLICY "Admins can add products" ON products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products FOR DELETE
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
CREATE POLICY "Anyone can place orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (payment_status = 'pending' AND order_status = 'pending');

DROP POLICY IF EXISTS "Admins can view orders" ON orders;
CREATE POLICY "Admins can view orders" ON orders FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can add order items" ON order_items;
CREATE POLICY "Anyone can add order items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view order items" ON order_items;
CREATE POLICY "Admins can view order items" ON order_items FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;
CREATE POLICY "Admins can delete order items" ON order_items FOR DELETE
  TO authenticated USING (public.is_admin());
