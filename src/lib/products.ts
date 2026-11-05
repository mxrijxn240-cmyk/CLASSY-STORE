import type { CollectionId } from '@/lib/siteSettings';
import type { Product } from '@/lib/store';

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
  uniqueByName(products.filter(collectionMatchers[id]));
