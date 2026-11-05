import { ChevronLeft } from 'lucide-react';
import { CollectionGrid } from '@/components/store/CollectionGrid';
import { ProductGrid } from '@/components/store/ProductCard';
import { productsInCollection } from '@/lib/products';
import type { View } from '@/lib/navigation';
import type { CollectionSetting, HomeSettings } from '@/lib/siteSettings';
import type { Product } from '@/lib/store';

type CollectionsPageProps = {
  collections: HomeSettings['collections'];
  openCollection: (id: CollectionSetting['id']) => void;
};

export function CollectionsPage({ collections, openCollection }: CollectionsPageProps) {
  return (
    <main className="page">
      <div className="page-intro">
        <h1>Collections</h1>
      </div>
      <CollectionGrid collections={collections} openCollection={openCollection} />
    </main>
  );
}

type CollectionPageProps = {
  collection: CollectionSetting;
  products: Product[];
  navigate: (view: View) => void;
  openProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
};

export function CollectionPage({ collection, products, navigate, openProduct, addToCart }: CollectionPageProps) {
  const items = productsInCollection(products, collection.id);
  return (
    <main className="page">
      <button type="button" className="back-link" onClick={() => navigate('collections')}><ChevronLeft size={16} /> All collections</button>
      <div className="page-intro compact">
        <p className="kicker">{collection.label}</p>
        <h1>{collection.title}</h1>
      </div>
      {items.length > 0 ? (
        <ProductGrid products={items} openProduct={openProduct} addToCart={addToCart} />
      ) : (
        <div className="coming-soon">
          <h2>Coming Soon</h2>
          <p>New pieces for this collection are being prepared. Check back soon.</p>
          <button type="button" className="button button-outline" onClick={() => navigate('shop')}>Browse the shop</button>
        </div>
      )}
    </main>
  );
}
