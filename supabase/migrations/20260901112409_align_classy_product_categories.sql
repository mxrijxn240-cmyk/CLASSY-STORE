/*
# Align CLASSY product categories

1. Modified Tables
- `products.category`: replace the original plural category constraint with the exact CLASSY labels `Frame`, `Car Frame`, and `Diecast Car`.

2. Data Safety
- Existing product rows are preserved. Existing plural labels are converted to their singular equivalents before the new constraint is applied.

3. Security
- No row-level security or access rules are changed.
*/

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
UPDATE public.products SET category = 'Frame' WHERE category = 'Frames';
UPDATE public.products SET category = 'Car Frame' WHERE category = 'Car Frames';
UPDATE public.products SET category = 'Diecast Car' WHERE category = 'Diecast Cars';
ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('Frame', 'Car Frame', 'Diecast Car'));