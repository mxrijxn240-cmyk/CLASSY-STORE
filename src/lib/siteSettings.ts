import { supabase } from '@/lib/supabase';

export type ThemeSettings = {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  panel: string;
  text: string;
  muted: string;
  buttonBg: string;
  buttonText: string;
  buttonRadius: number;
  fontDisplay: string;
  fontBody: string;
};

export type BrandingSettings = {
  logoUrl: string;
  faviconUrl: string;
};

export type CollectionId = 'diecast' | 'car-frame' | 'frame' | 'limited-edition';

export type CollectionSetting = {
  id: CollectionId;
  title: string;
  label: string;
  imageUrl: string;
};

export type HomeSettings = {
  hero: { title: string; titleAccent: string; tagline: string; ctaLabel: string; imageUrl: string };
  banner: { enabled: boolean; message: string; linkLabel: string };
  collections: CollectionSetting[];
  justInTitle: string;
};

export type SiteSettings = {
  theme: ThemeSettings;
  branding: BrandingSettings;
  home: HomeSettings;
};

export const logoDefault = '/images/ChatGPT_Image_Sep_1,_2026,_03_17_12_PM.png';
const heroImageDefault = 'https://images.pexels.com/photos/30109292/pexels-photo-30109292.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export const defaultSiteSettings: SiteSettings = {
  theme: {
    primary: '#DB9F75',
    primaryLight: '#DB9F75',
    background: '#122D2A',
    surface: '#2F3A32',
    panel: '#3E2411',
    text: '#F3EBDD',
    muted: '#D6CEBE',
    buttonBg: '#DB9F75',
    buttonText: '#3E2411',
    buttonRadius: 0,
    fontDisplay: 'Playfair Display',
    fontBody: 'Inter',
  },
  branding: {
    logoUrl: logoDefault,
    faviconUrl: '',
  },
  home: {
    hero: {
      title: 'A little world',
      titleAccent: 'of cars.',
      tagline: 'Made for collectors.',
      ctaLabel: 'Explore Collections',
      imageUrl: heroImageDefault,
    },
    banner: { enabled: false, message: '', linkLabel: 'Shop now' },
    collections: [
      { id: 'diecast', title: 'Diecast Car', label: 'Precision models', imageUrl: 'https://images.pexels.com/photos/6789979/pexels-photo-6789979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
      { id: 'car-frame', title: 'Car Frame with Diecast', label: 'Display with presence', imageUrl: 'https://images.pexels.com/photos/35930288/pexels-photo-35930288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
      { id: 'frame', title: 'Frame', label: 'Wall art', imageUrl: 'https://images.pexels.com/photos/7877826/pexels-photo-7877826.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
      { id: 'limited-edition', title: 'Limited Edition Car', label: 'Rare finds', imageUrl: 'https://images.pexels.com/photos/34126352/pexels-photo-34126352.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    ],
    justInTitle: 'Just in',
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeSection = <T extends Record<string, unknown>>(defaults: T, stored: unknown): T => {
  if (!isRecord(stored)) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const fallback = defaults[key];
    const value = stored[key as string];
    if (isRecord(fallback)) {
      result[key] = mergeSection(fallback, value) as T[keyof T];
    } else if (typeof value === typeof fallback && value !== null) {
      result[key] = value as T[keyof T];
    }
  }
  return result;
};

export function mergeSiteSettings(stored: unknown): SiteSettings {
  if (!isRecord(stored)) return defaultSiteSettings;
  return {
    theme: mergeSection(defaultSiteSettings.theme, stored.theme),
    branding: mergeSection(defaultSiteSettings.branding, stored.branding),
    home: mergeSection(defaultSiteSettings.home, stored.home),
  };
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return defaultSiteSettings;
  const { data, error } = await supabase.from('site_settings').select('content').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return mergeSiteSettings(data?.content);
}

export async function publishSiteSettings(settings: SiteSettings): Promise<void> {
  if (!supabase) throw new Error('Store unavailable');
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 'main', content: settings, updated_at: new Date().toISOString() });
  if (error) throw error;
}
