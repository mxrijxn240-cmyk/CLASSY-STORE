import { logoDefault, type SiteSettings, type ThemeSettings } from '@/lib/siteSettings';

const fontStack = (family: string, fallback: string) => `'${family}', ${fallback}`;

export function themeVariables(theme: ThemeSettings): Record<string, string> {
  return {
    '--gold': theme.primary,
    '--gold-light': theme.primaryLight,
    '--bg': theme.background,
    '--bg-2': theme.surface,
    '--panel': theme.panel,
    '--cream': theme.text,
    '--muted': theme.muted,
    '--btn-bg': theme.buttonBg,
    '--btn-text': theme.buttonText,
    '--btn-radius': `${theme.buttonRadius}px`,
    '--font-display': fontStack(theme.fontDisplay, 'serif'),
    '--font-body': fontStack(theme.fontBody, 'sans-serif'),
  };
}

export function applySiteAppearance(settings: SiteSettings) {
  const root = document.documentElement;
  Object.entries(themeVariables(settings.theme)).forEach(([name, value]) => root.style.setProperty(name, value));
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', settings.theme.background);

  let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.appendChild(icon);
  }
  icon.href = settings.branding.faviconUrl || logoDefault;
}
