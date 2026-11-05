/*
# Website appearance settings

1. New Tables
- `site_settings`: a single row (id = 'main') holding the published website appearance as one JSON document: banner, theme colours, fonts, buttons, logo, favicon and homepage text/images.
- `updated_at` and `updated_by` record when and by whom the site was last published.

2. New Storage
- `site-assets` bucket for banner images, logo and favicon. Public so the website can display them.

3. Security
- Anyone (visitors included) can read the published settings and site images, because the public website needs them.
- Only admins can publish settings or upload, replace, or delete site images. Admin status is checked with the existing is_admin() helper.
- No delete access is granted on the settings table, so the published row cannot be removed through the API.
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON site_settings TO authenticated;

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can add site settings" ON site_settings;
CREATE POLICY "Admins can add site settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;
CREATE POLICY "Anyone can view site assets" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
CREATE POLICY "Admins can upload site assets" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
CREATE POLICY "Admins can update site assets" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;
CREATE POLICY "Admins can delete site assets" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());
