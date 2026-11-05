import { logoDefault, type SiteSettings } from '@/lib/siteSettings';

const fontStack = (family: string, fallback: string) => `'${family}', ${fallback}`;

export function applySiteAppearance(settings: SiteSettings) {
  const root = document.documentElement;
  root.removeAttribute('data-theme');

  if (settings.theme.fontDisplay) {
    root.style.setProperty('--font-display', fontStack(settings.theme.fontDisplay, 'serif'));
  }
  if (settings.theme.fontBody) {
    root.style.setProperty('--font-body', fontStack(settings.theme.fontBody, 'sans-serif'));
  }
  if (settings.theme.buttonRadius !== undefined) {
    root.style.setProperty('--btn-radius', `${settings.theme.buttonRadius}px`);
  }

  // Set theme color for mobile status bar / browser tab
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', '#06141B');

  let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.appendChild(icon);
  }
  icon.href = settings.branding.faviconUrl || logoDefault;
}
