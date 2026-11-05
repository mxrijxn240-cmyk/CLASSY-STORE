import type { CollectionId } from '@/lib/siteSettings';
import type { Product } from '@/lib/store';

export const sampleProducts: Product[] = [
  {
    id: 'porsche-992-gt3rs',
    name: 'Porsche 911 (992) GT3 RS — Grey & Red',
    price: 14999,
    category: 'Diecast Car',
    brand: 'AutoArt Models',
    scale: '1:18 Scale (Large ~26 cm)',
    description: 'A heavy metal model car of the famous Porsche 911 GT3 RS. Both doors open, the steering wheel turns the front wheels, and the rear wing looks super realistic. Perfect display piece for your desk or living room shelf.',
    image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=85'
    ],
    stock_quantity: 3,
    is_available: true,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ferrari-f40-lm',
    name: 'Ferrari F40 LM Race Edition — Rosso Corsa',
    price: 18499,
    category: 'Diecast Car',
    brand: 'BBR Models',
    scale: '1:18 Scale (Large ~25 cm)',
    description: 'The ultimate 80s supercar in metal miniature form. The rear engine cover lifts off to reveal the detailed twin-turbo V8 engine, the doors open, and it features real rubber racing tires with gold wheels.',
    image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=85'
    ],
    stock_quantity: 2,
    is_available: true,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'nissan-gtr-r34',
    name: 'Nissan Skyline GT-R (R34) — Midnight Purple',
    price: 15999,
    category: 'Diecast Car',
    brand: 'Kyosho Diecast',
    scale: '1:18 Scale (Large ~26 cm)',
    description: 'Every car enthusiast’s dream: the R34 GT-R in color-shifting Midnight Purple. All doors, hood, and trunk open. The hood opens to show the detailed twin-turbo engine with gold Brembo brake calipers behind the wheels.',
    image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=85'
    ],
    stock_quantity: 4,
    is_available: true,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'frame-senna-mp44',
    name: 'McLaren MP4/4 F1 Car — Wall Display Frame',
    price: 8499,
    category: 'Car Frame',
    brand: 'CLASSY Studio',
    scale: 'Framed Car (30x40 cm)',
    description: 'A real miniature model of Ayrton Senna’s 1988 championship Formula 1 car mounted inside a glass wall frame. Behind the car, you get the Monaco lap times, horsepower, and car specs. Comes with hanging hooks ready for your wall.',
    image_url: '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg',
    gallery_urls: [
      '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg',
      '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM_(1).jpeg'
    ],
    stock_quantity: 5,
    is_available: true,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'lambo-countach-lp5000',
    name: 'Lamborghini Countach LP5000 — Gloss Black & Gold',
    price: 13999,
    category: 'Diecast Car',
    brand: 'Kyosho Models',
    scale: '1:18 Scale (Large ~24 cm)',
    description: 'The car with iconic scissor doors that open upwards! Features pop-up headlights, opening rear engine bonnet, gold telephone-dial wheels, and a heavy solid metal body.',
    image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85'
    ],
    stock_quantity: 3,
    is_available: true,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'frame-porsche-930',
    name: 'Porsche 930 Turbo "Widowmaker" — Wall Display Frame',
    price: 6999,
    category: 'Car Frame',
    brand: 'CLASSY Studio',
    scale: 'Framed Car (25x30 cm)',
    description: 'A genuine Guards Red Porsche 911 Turbo mini car mounted inside a deep wooden glass frame. Features vehicle blueprint drawings and turbo engine stats behind it. Ready to hang right out of the box.',
    image_url: '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM_(1).jpeg',
    gallery_urls: [
      '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM_(1).jpeg',
      '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg'
    ],
    stock_quantity: 6,
    is_available: true,
    is_featured: false,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mercedes-amg-one',
    name: 'Mercedes-AMG ONE — Formula 1 Engine Hypercar',
    price: 21499,
    category: 'Diecast Car',
    brand: 'Almost Real Models',
    scale: '1:18 Scale (Large ~27 cm)',
    description: 'One of the most detailed model cars in the world. Real active roof flaps, deployable rear wing, and a removable rear engine cover that shows the Formula 1 V6 hybrid engine with real metal exhaust pipes.',
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85'
    ],
    stock_quantity: 1,
    is_available: true,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'frame-heritage-trio',
    name: 'Classic Le Mans Racing Legends — Panoramic Wall Frame',
    price: 9999,
    category: 'Frame',
    brand: 'CLASSY Studio',
    scale: 'Wall Art Frame (30x60 cm)',
    description: 'A wide panoramic wall frame celebrating classic 1960s sports racing cars (Ford GT40, Ferrari, and Porsche). High resolution artwork in an anodized aluminum frame with clear glass.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
      '/images/WhatsApp_Image_2026-11-04_at_7.03.42_PM.jpeg'
    ],
    stock_quantity: 2,
    is_available: true,
    is_featured: false,
    is_new: false,
    created_at: new Date().toISOString(),
  },
];

const collectionMatchers: Record<CollectionId, (product: Product) => boolean> = {
  diecast: (product) => product.category === 'Diecast Car',
  'car-frame': (product) => product.category === 'Car Frame',
  frame: (product) => product.category === 'Frame',
  'limited-edition': (product) => product.is_featured,
};

export function uniqueByName(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = product.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const productsInCollection = (products: Product[], id: CollectionId): Product[] =>
  uniqueByName(products.filter((p) => collectionMatchers[id] ? collectionMatchers[id](p) : true));
