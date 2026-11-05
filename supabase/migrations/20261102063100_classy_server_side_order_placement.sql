/*
# Server-side order placement and admin check hardening

1. New Function
- `place_order` receives the customer's details and the list of products and quantities from the cart.
- It looks up prices from the database, never from the browser, and calculates the order total.
- It checks that each product is available and that enough stock exists, then reserves that stock.
- The order and its items are saved in one step. If anything fails, nothing is saved.
- It returns the order number, total, and time to the browser.

2. Modified Function
- `is_admin()` now runs with the caller's own permissions instead of elevated rights. It still returns true only for accounts listed in `admins`.

3. Security
- Customer details are validated for required fields, length, and email format.
- Quantities must be whole numbers from 1 to 100, and a bag can hold at most 50 different lines.
- Existing products, orders, and order items are not changed.

4. Important Notes
- Direct public writes to orders are removed in a follow-up step once the website uses this function.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_city text,
  p_state text,
  p_pin_code text,
  p_notes text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid := gen_random_uuid();
  v_created_at timestamptz := now();
  v_order_number text;
  v_total numeric := 0;
  v_item jsonb;
  v_product products%ROWTYPE;
  v_quantity integer;
BEGIN
  IF coalesce(btrim(p_customer_name), '') = '' OR coalesce(btrim(p_phone), '') = '' OR coalesce(btrim(p_email), '') = ''
     OR coalesce(btrim(p_address), '') = '' OR coalesce(btrim(p_city), '') = '' OR coalesce(btrim(p_state), '') = ''
     OR coalesce(btrim(p_pin_code), '') = '' THEN
    RAISE EXCEPTION 'Please complete the required fields.';
  END IF;

  IF char_length(p_customer_name) > 120 OR char_length(p_phone) > 20 OR char_length(p_email) > 200
     OR char_length(p_address) > 300 OR char_length(p_city) > 100 OR char_length(p_state) > 100
     OR char_length(p_pin_code) > 10 OR char_length(coalesce(p_notes, '')) > 1000 THEN
    RAISE EXCEPTION 'One of the details is too long.';
  END IF;

  IF p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Your bag is empty.';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF coalesce(v_item->>'quantity', '') !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'Invalid quantity.';
    END IF;
    v_quantity := (v_item->>'quantity')::integer;
    IF v_quantity < 1 OR v_quantity > 100 THEN
      RAISE EXCEPTION 'Invalid quantity.';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid;
    IF NOT FOUND OR NOT v_product.is_available THEN
      RAISE EXCEPTION 'An item in your bag is no longer available.';
    END IF;
    v_total := v_total + v_product.price * v_quantity;
  END LOOP;

  v_order_number := 'CL-' || to_char(v_created_at, 'YYYY') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));

  INSERT INTO orders (id, order_number, customer_name, phone, email, address, city, state, pin_code, notes, total, payment_status, order_status, created_at)
  VALUES (v_order_id, v_order_number, btrim(p_customer_name), btrim(p_phone), btrim(p_email), btrim(p_address),
          btrim(p_city), btrim(p_state), btrim(p_pin_code), btrim(coalesce(p_notes, '')), v_total, 'pending', 'pending', v_created_at);

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_quantity := (v_item->>'quantity')::integer;

    UPDATE products
       SET stock_quantity = stock_quantity - v_quantity
     WHERE id = (v_item->>'product_id')::uuid
       AND is_available
       AND stock_quantity >= v_quantity
    RETURNING * INTO v_product;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough stock for one of the items in your bag. Please update your bag.';
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, image_url, quantity, unit_price)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.image_url, v_quantity, v_product.price);
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total', v_total, 'created_at', v_created_at);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, jsonb) TO anon, authenticated;
