import { ArrowRight } from 'lucide-react';
import { CollectionGrid } from '@/components/store/CollectionGrid';
import { ProductGrid } from '@/components/store/ProductCard';
import { uniqueByName } from '@/lib/products';
import type { View } from '@/lib/navigation';
import type { CollectionId, HomeSettings } from '@/lib/siteSettings';
import type { Product } from '@/lib/store';

const plantImages = {
  pothos: 'https://images.pexels.com/photos/12413429/pexels-photo-12413429.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  monstera: 'https://images.pexels.com/photos/20419404/pexels-photo-20419404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  philodendron: 'https://images.pexels.com/photos/29641255/pexels-photo-29641255.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

type HomePageProps = {
  products: Product[];
  home: HomeSettings;
  navigate: (view: View) => void;
  openCollection: (id: CollectionId) => void;
  openProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
};

export function HomePage({ products, home, navigate, openCollection, openProduct, addToCart }: HomePageProps) {
  const newArrivals = uniqueByName(products.filter((product) => product.is_new)).slice(0, 4);

  return (
    <main>
      {home.banner.enabled && home.banner.message && (
        <div className="promo-banner">
          <p>{home.banner.message}</p>
          <button type="button" className="text-link" onClick={() => navigate('shop')}>{home.banner.linkLabel}</button>
        </div>
      )}

      <section className="hero">
        <div className="hero-media">
          <img className="hero-photo" src={home.hero.imageUrl} alt="Diecast cars displayed among indoor plants" />
          <img className="hero-plant hero-plant-pothos" src={plantImages.pothos} alt="" aria-hidden="true" />
          <img className="hero-plant hero-plant-philodendron" src={plantImages.philodendron} alt="" aria-hidden="true" />
          <img className="hero-plant hero-plant-monstera" src={plantImages.monstera} alt="" aria-hidden="true" />
        </div>
        <div className="hero-copy">
          <h1>{home.hero.title} <em>{home.hero.titleAccent}</em></h1>
          <p className="hero-tagline">{home.hero.tagline}</p>
          <button type="button" className="button button-primary hero-cta" onClick={() => navigate('collections')}>
            {home.hero.ctaLabel} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="section section-charcoal">
        <div className="section-inner">
          <div className="section-head"><h2>Collections</h2></div>
          <CollectionGrid collections={home.collections} openCollection={openCollection} />
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="section section-walnut">
          <div className="section-inner">
            <div className="section-head">
              <h2>{home.justInTitle}</h2>
              <button type="button" className="text-link" onClick={() => navigate('shop')}>View all <ArrowRight size={14} /></button>
            </div>
            <ProductGrid products={newArrivals} openProduct={openProduct} addToCart={addToCart} />
          </div>
        </section>
      )}
    </main>
  );
}
