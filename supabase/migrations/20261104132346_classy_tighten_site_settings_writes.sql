/*
# Tighten site_settings write access

Remove INSERT, UPDATE, DELETE grants from the anon role on site_settings.
Public visitors only need to read site settings. Only authenticated admins
can add, change, or remove settings (enforced by existing RLS policies).
No data is changed.
*/

REVOKE INSERT, UPDATE, DELETE ON site_settings FROM anon;
