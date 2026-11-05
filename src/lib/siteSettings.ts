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
  subtitle: string;
  imageUrl: string;
};

export type HomeSettings = {
  hero: {
    kicker: string;
    title: string;
    titleAccent: string;
    copy: string;
    tagline: string;
    ctaLabel: string;
    imageUrl: string;
  };
  statement: {
    kicker: string;
    title: string;
    titleAccent: string;
    copy: string;
  };
  collection: {
    kicker: string;
    title: string;
    titleAccent: string;
    copy: string;
    ctaLabel: string;
    imageUrl: string;
  };
  banner: { enabled: boolean; message: string; linkLabel: string };
  collections: CollectionSetting[];
  editTitle: string;
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
    primary: '#CCD0CF',
    primaryLight: '#FFFFFF',
    background: '#06141B',
    surface: '#11212D',
    panel: '#253745',
    text: '#CCD0CF',
    muted: '#9BA8AB',
    buttonBg: '#CCD0CF',
    buttonText: '#06141B',
    buttonRadius: 4,
    fontDisplay: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
  },
  branding: {
    logoUrl: logoDefault,
    faviconUrl: logoDefault,
  },
  home: {
    hero: {
      kicker: 'PREMIUM CAR MINIATURES & WALL FRAMES',
      title: 'DETAILED MODEL CARS &',
      titleAccent: 'FRAMES FOR CAR LOVERS.',
      copy: 'We sell super-detailed metal miniature cars (with opening doors & real rubber tires) and custom framed cars ready to hang on your wall. The ultimate room decor or gift for anyone who loves cars.',
      tagline: 'Made for anyone who loves cars.',
      ctaLabel: 'Shop All Models',
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    },
    statement: {
      kicker: 'WHY PEOPLE LOVE THESE',
      title: 'BRING YOUR DREAM CARS',
      titleAccent: 'INTO YOUR ROOM.',
      copy: 'Whether you want a heavy metal Porsche or Ferrari on your study desk, or an iconic race car framed on your bedroom wall, CLASSY brings automotive passion to life in high quality miniatures.',
    },
    collection: {
      kicker: 'FEATURED WALL ART',
      title: 'REAL MINI CARS',
      titleAccent: 'INSIDE WALL FRAMES.',
      copy: 'Want something way cooler than a paper poster? We mount real detailed miniature cars inside sleek wooden glass frames with the car’s top speed, engine specs, and history printed behind it. Ready to hang right out of the box.',
      ctaLabel: 'Explore Car Frames',
      imageUrl: '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg',
    },
    banner: { enabled: true, message: '⚡ PAN-INDIA DELIVERY — SAFELY PACKED IN SHOCKPROOF BOXES SO YOUR CAR ARRIVES IN PERFECT SHAPE', linkLabel: 'Shop Now' },
    collections: [
      { id: 'diecast', title: 'Detailed Metal Cars', label: 'Doors Open · Solid Metal', subtitle: 'Heavy metal scale cars with opening doors, hood, working steering, and realistic interiors', imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80' },
      { id: 'car-frame', title: 'Car Wall Frames', label: 'Ready to Hang on Wall', subtitle: 'An actual miniature car mounted inside a glass frame with car specs printed behind it', imageUrl: '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg' },
      { id: 'limited-edition', title: 'Rare Collector Cars', label: 'Hard-to-Find Models', subtitle: 'Special edition model cars for enthusiasts and collectors with numbered display stands', imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80' },
      { id: 'frame', title: 'Car Art & Panels', label: 'Room & Office Decor', subtitle: 'Clean automotive technical prints and race track wall pieces designed for modern rooms', imageUrl: '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM_(1).jpeg' },
    ],
    editTitle: 'Popular Cars & Frames',
    justInTitle: 'Fresh Stock',
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
