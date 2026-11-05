import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { 
  ArrowRight, Check, ChevronLeft, Menu, Minus, Plus, Search, 
  ShoppingBag, Trash2, X, Shield, Box, MessageCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminPage from '@/components/admin/AdminPage';
import { money, type CartLine, type Category, type Order, type Product } from '@/lib/store';
import { sampleProducts } from '@/lib/products';
import { defaultSiteSettings, loadSiteSettings, type HomeSettings, type SiteSettings } from '@/lib/siteSettings';
import { applySiteAppearance } from '@/lib/siteTheme';

type View = 'home' | 'collections' | 'shop' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'admin';
type CollectionFilter = 'All' | Category | 'Featured';

const ownerPhone = '919048480375';
const whatsappLink = (message: string) => `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;
const categoryLabel = (category: Category) => 
  category === 'Diecast Car' ? 'Metal Model Car' : category === 'Car Frame' ? 'Car Wall Frame' : 'Wall Poster Frame';

function normalizeCategory(category: string): Category {
  if (category === 'Frames') return 'Frame';
  if (category === 'Car Frames') return 'Car Frame';
  return category === 'Diecast Cars' ? 'Diecast Car' : category as Category;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('classy-cart') ?? '[]');
    } catch {
      return [];
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(sampleProducts[0]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [site, setSite] = useState<SiteSettings>(defaultSiteSettings);
  const [shopCategory, setShopCategory] = useState<CollectionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Ensure dark theme is applied permanently and clean up any past theme mode
    localStorage.removeItem('classy-theme');
    applySiteAppearance(site);
  }, [site]);

  useEffect(() => {
    void loadSiteSettings()
      .then((settings) => setSite(settings))
      .catch(() => setSite(defaultSiteSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('classy-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const loaded = (data as Product[]).map((product) => ({
            ...product,
            category: normalizeCategory(product.category),
            gallery_urls: product.gallery_urls?.length ? product.gallery_urls : [product.image_url],
          }));
          setProducts(loaded);
        }
      } catch (err) {
        console.error('Supabase query error, retaining default inventory', err);
      }
    };
    void loadProducts();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);

  const navigate = (next: View) => {
    if (next === 'shop') setShopCategory('All');
    setView(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCollection = (filter: CollectionFilter) => {
    setShopCategory(filter);
    setView('shop');
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.is_available || product.stock_quantity < 1) return;
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing
        ? current.map((line) =>
            line.product.id === product.id
              ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock_quantity) }
              : line
          )
        : [...current, { product, quantity }];
    });
    setNotice(`Added ${product.name} to your cart.`);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === id
            ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock_quantity)) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((line) => line.product.id !== id));
  };

  return (
    <div className="site-shell">
      {notice && (
        <div className="toast-notice">
          <Check size={16} style={{ color: 'var(--gold)' }} />
          <span>{notice}</span>
        </div>
      )}

      {/* Floating WhatsApp Button (Subtle & Non-Intrusive) */}
      <a
        href={whatsappLink('Hello CLASSY, I have a question about your miniature cars and wall frames!')}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp-circle"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={22} />
      </a>

      {/* Clean Luxury Header */}
      <header className="site-header-lux">
        <div className="container-lux header-inner">
          {/* Logo is the main focus in the navbar */}
          <div
            className="brand-link"
            onClick={() => navigate('home')}
            aria-label="CLASSY Home"
            title="CLASSY — Home"
          >
            <img src={site.branding.logoUrl} alt="CLASSY" className="brand-logo" />
          </div>

          {/* Strictly 4 items in navbar as requested */}
          <nav className="nav-menu">
            <button className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>
              Home
            </button>
            <button className={`nav-link ${view === 'shop' ? 'active' : ''}`} onClick={() => navigate('shop')}>
              Products
            </button>
            <button className={`nav-link ${view === 'collections' ? 'active' : ''}`} onClick={() => navigate('collections')}>
              Categories
            </button>
            <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')}>
              Admin
            </button>
          </nav>

          <div className="header-icons">
            <button
              className="icon-btn"
              onClick={() => {
                if (view !== 'shop') navigate('shop');
              }}
              aria-label="Search"
              title="Search cars"
            >
              <Search size={18} />
            </button>

            <button className="icon-btn" onClick={() => navigate('cart')} aria-label="Cart" title="Your Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-drawer ${mobileMenu ? 'open' : ''}`}>
          <button className={view === 'home' ? 'active' : ''} onClick={() => navigate('home')}>
            Home
          </button>
          <button className={view === 'shop' ? 'active' : ''} onClick={() => navigate('shop')}>
            Products
          </button>
          <button className={view === 'collections' ? 'active' : ''} onClick={() => navigate('collections')}>
            Categories
          </button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => navigate('admin')}>
            Admin
          </button>
        </div>
      </header>

      {/* Views */}
      {view === 'home' && (
        <Home
          products={products}
          openProduct={openProduct}
          openCollection={openCollection}
          addToCart={addToCart}
          navigate={navigate}
          home={site.home}
        />
      )}

      {view === 'collections' && (
        <Collections openCollection={openCollection} navigate={navigate} collections={site.home.collections} />
      )}

      {view === 'shop' && (
        <Shop
          products={products}
          openProduct={openProduct}
          addToCart={addToCart}
          initialCategory={shopCategory}
          navigate={navigate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {view === 'product' && selectedProduct && (
        <ProductPage product={selectedProduct} addToCart={addToCart} navigate={navigate} />
      )}

      {view === 'cart' && (
        <Cart
          cart={cart}
          subtotal={subtotal}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          navigate={navigate}
        />
      )}

      {view === 'checkout' && (
        <Checkout
          cart={cart}
          subtotal={subtotal}
          setLastOrder={setLastOrder}
          navigate={navigate}
          clearCart={() => setCart([])}
        />
      )}

      {view === 'confirmation' && lastOrder && (
        <Confirmation order={lastOrder} navigate={navigate} />
      )}

      {view === 'admin' && <AdminPage />}

      {/* Footer */}
      {view !== 'checkout' && view !== 'confirmation' && (
        <Footer navigate={navigate} logoUrl={site.branding.logoUrl} />
      )}
    </div>
  );
}

/* =========================================================================
   HOME VIEW
   ========================================================================= */
function Home({
  products,
  openProduct,
  openCollection,
  addToCart,
  navigate,
  home,
}: {
  products: Product[];
  openProduct: (product: Product) => void;
  openCollection: (filter: CollectionFilter) => void;
  addToCart: (product: Product) => void;
  navigate: (view: View) => void;
  home: HomeSettings;
}) {
  const hero = home?.hero ?? defaultSiteSettings.home.hero;
  const collection = home?.collection ?? defaultSiteSettings.home.collection;
  const featured = products.slice(0, 4);

  return (
    <main>
      {/* Clean, Spacious Luxury Hero */}
      <section className="hero-clean">
        <div className="hero-bg">
          <img src={hero.imageUrl} alt="Detailed miniature sports cars and frames" />
        </div>
        <div className="hero-scrim" />

        <div className="container-lux hero-container">
          <div className="hero-body">
            <div className="hero-kicker-badge">
              <span className="badge-glow-dot" />
              <span>Collector Grade Miniatures</span>
            </div>
            <h1 className="hero-headline">
              Precision in <span className="gold-text-glow">Every Scale.</span>
            </h1>
            <p className="hero-subtext">
              Handcrafted 1:18 diecast metal cars and luxury 3D wall display frames designed for automotive enthusiasts.
            </p>
            <div className="hero-buttons">
              <button className="btn-gold" onClick={() => navigate('shop')}>
                Explore Collection <ArrowRight size={14} />
              </button>
              <button className="btn-outline" onClick={() => openCollection('Car Frame')}>
                Wall Frames
              </button>
            </div>
            <div className="hero-micro-spec">
              <span>✦ Solid Diecast Metal</span>
              <span>✦ Opening Doors</span>
              <span>✦ Safe All-India Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simple 3-Point Benefits Bar */}
      <section className="perks-bar">
        <div className="container-lux">
          <div className="perks-grid">
            <div className="perk-item">
              <Box size={20} />
              <div>
                <strong>Solid Metal Diecast</strong>
                <span>Heavy alloy bodies with functional doors & steering</span>
              </div>
            </div>
            <div className="perk-item">
              <Shield size={20} />
              <div>
                <strong>Safe Delivery Across India</strong>
                <span>Rigid multi-layer foam packaging guaranteed against damage</span>
              </div>
            </div>
            <div className="perk-item">
              <MessageCircle size={20} />
              <div>
                <strong>Direct WhatsApp Support</strong>
                <span>Instant replies, live photos, and custom frame requests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="section-lux">
        <div className="container-lux">
          <div className="section-header">
            <div>
              <span className="kicker">Curated Release</span>
              <h2>Featured Collection</h2>
            </div>
            <button className="view-all-link" onClick={() => navigate('shop')}>
              View All ({products.length}) <ArrowRight size={14} />
            </button>
          </div>

          <div className="products-grid">
            {featured.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                openProduct={openProduct}
                addToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Signature Wall Frame Spotlight */}
      <section className="section-lux" style={{ paddingTop: 0 }}>
        <div className="container-lux">
          <div className="spotlight-box">
            <div className="spotlight-media">
              <img src={collection.imageUrl} alt="Car Wall Display Frame" />
            </div>
            <div className="spotlight-content">
              <span className="kicker">Signature Piece</span>
              <h2>Wall Display Frames</h2>
              <p>
                Turn automotive legends into architectural wall art. Real precision-detailed miniature cars mounted inside deep premium shadow frames.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-gold" onClick={() => openCollection('Car Frame')}>
                  Explore Wall Frames <ArrowRight size={14} />
                </button>
                <a
                  href={whatsappLink('Hello CLASSY, I would like to order or ask about custom car wall frames!')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp-minimal"
                >
                  <MessageCircle size={15} /> Custom Inquiries
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================================
   REUSABLE PRODUCT CARD (CLEAN & MINIMAL)
   ========================================================================= */
function ProductCardItem({
  product,
  openProduct,
}: {
  product: Product;
  openProduct: (product: Product) => void;
  addToCart?: (product: Product) => void;
}) {
  return (
    <article className="product-card-clean" onClick={() => openProduct(product)}>
      <div className="product-card-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <span className="card-scale">{categoryLabel(product.category)} • {product.scale}</span>
        <h3 className="card-title">{product.name}</h3>
        <div className="card-footer">
          <span className="card-price">{money(product.price)}</span>
          <span className="card-arrow"><ArrowRight size={15} /></span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   COLLECTIONS / CATEGORIES VIEW
   ========================================================================= */
function Collections({
  openCollection,
  navigate,
  collections,
}: {
  openCollection: (filter: CollectionFilter) => void;
  navigate: (view: View) => void;
  collections: HomeSettings['collections'];
}) {
  const filters: CollectionFilter[] = ['Diecast Car', 'Car Frame', 'Featured', 'Frame'];
  const list = collections ?? defaultSiteSettings.home.collections;

  return (
    <main className="section-lux">
      <div className="container-lux">
        <button
          className="btn-outline"
          onClick={() => navigate('home')}
          style={{ marginBottom: '28px', padding: '8px 16px', fontSize: '12px' }}
        >
          <ChevronLeft size={14} /> Back to Home
        </button>

        <div style={{ marginBottom: '36px' }}>
          <span className="kicker">Categories</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            Explore Our Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            Choose a category to browse precision diecast cars or mounted wall frames.
          </p>
        </div>

        <div className="collections-grid-clean">
          {list.map((col, index) => (
            <div
              key={col.id}
              className="category-card"
              onClick={() => openCollection(filters[index % filters.length])}
            >
              <div className="category-card-img">
                <img src={col.imageUrl} alt={col.title} />
              </div>
              <div className="category-card-body">
                <h3>{col.title}</h3>
                <p>{col.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   SHOP / CATALOG VIEW
   ========================================================================= */
function Shop({
  products,
  openProduct,
  addToCart,
  initialCategory = 'All',
  searchQuery,
  setSearchQuery,
}: {
  products: Product[];
  openProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
  initialCategory?: CollectionFilter;
  navigate: (view: View) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const [category, setCategory] = useState<CollectionFilter>(initialCategory);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === 'All'
          ? true
          : category === 'Featured'
          ? product.is_featured
          : product.category === category;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.scale.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchQuery]);

  return (
    <main className="section-lux">
      <div className="container-lux">
        <div style={{ marginBottom: '32px' }}>
          <span className="kicker">Catalog</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            {category === 'All'
              ? 'All Products'
              : category === 'Diecast Car'
              ? 'Diecast Model Cars'
              : category === 'Car Frame'
              ? 'Car Wall Frames'
              : category === 'Featured'
              ? 'Featured Models'
              : 'Wall Poster Frames'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Showing {filtered.length} curated {filtered.length === 1 ? 'item' : 'items'} ready for safe dispatch.
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="filter-row">
          <div className="search-box-clean">
            <Search size={15} style={{ color: 'var(--text-dim)' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model (Porsche, Ferrari, F1, 1:18)..."
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="category-tabs-clean">
            {(['All', 'Diecast Car', 'Car Frame', 'Featured'] as CollectionFilter[]).map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${category === tab ? 'active' : ''}`}
                onClick={() => setCategory(tab)}
              >
                {tab === 'All' ? 'All' : tab === 'Diecast Car' ? 'Cars' : tab === 'Car Frame' ? 'Wall Frames' : 'Featured'}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                openProduct={openProduct}
                addToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--bg-card)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            <Search size={28} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px' }}>No models found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Try searching with different keywords like "Porsche", "Ferrari", or "Frame".
            </p>
            <button
              className="btn-outline"
              onClick={() => {
                setSearchQuery('');
                setCategory('All');
              }}
              style={{ marginTop: '16px' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================================================================
   PRODUCT DETAIL VIEW
   ========================================================================= */
function ProductPage({
  product,
  addToCart,
  navigate,
}: {
  product: Product;
  addToCart: (product: Product, quantity?: number) => void;
  navigate: (view: View) => void;
}) {
  const [activeImage, setActiveImage] = useState(product.image_url);
  const [quantity, setQuantity] = useState(1);
  const images = useMemo(() => {
    const list = [product.image_url, ...(product.gallery_urls || [])];
    return Array.from(new Set(list));
  }, [product]);

  const productWhatsappMsg = `Hello CLASSY, I would like to order: *${product.name}* (${money(product.price)}). Is this available to ship?`;

  return (
    <main className="section-lux">
      <div className="container-lux">
        <button
          className="btn-outline"
          onClick={() => navigate('shop')}
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '12px' }}
        >
          <ChevronLeft size={14} /> Back to Products
        </button>

        <div className="product-view-layout">
          {/* Gallery Sticky */}
          <div className="gallery-sticky">
            <div className="main-image-frame">
              <img src={activeImage} alt={product.name} />
            </div>

            {images.length > 1 && (
              <div className="thumbs-row">
                {images.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-col">
            <span className="kicker">{categoryLabel(product.category)}</span>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', marginBottom: '8px' }}>{product.name}</h1>
            <div className="price-banner">{money(product.price)}</div>

            <p className="product-desc">{product.description}</p>

            <table className="specs-clean-table">
              <tbody>
                <tr>
                  <td>Category</td>
                  <td>{categoryLabel(product.category)}</td>
                </tr>
                <tr>
                  <td>Scale / Size</td>
                  <td>{product.scale}</td>
                </tr>
                <tr>
                  <td>Material</td>
                  <td>{product.category === 'Car Frame' ? 'Diecast Metal car in acrylic shadow frame' : 'High-density zinc alloy metal body'}</td>
                </tr>
                <tr>
                  <td>Packaging</td>
                  <td>Shockproof box with multi-layer foam padding</td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td>Dispatched within 24–48 hours across India</td>
                </tr>
              </tbody>
            </table>

            <div className="qty-row">
              <div className="counter-box">
                <button
                  className="counter-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease"
                >
                  <Minus size={13} />
                </button>
                <span className="counter-val">{quantity}</span>
                <button
                  className="counter-btn"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  aria-label="Increase"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                className="btn-add-large"
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingBag size={16} /> Add to Cart • {money(product.price * quantity)}
              </button>
            </div>

            <a
              href={whatsappLink(productWhatsappMsg)}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp-minimal"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: '10px' }}
            >
              <MessageCircle size={15} /> Order or Inquire via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   CART VIEW
   ========================================================================= */
function Cart({
  cart,
  subtotal,
  updateQuantity,
  removeFromCart,
  navigate,
}: {
  cart: CartLine[];
  subtotal: number;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  navigate: (view: View) => void;
}) {
  if (!cart.length) {
    return (
      <main className="section-lux" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <div className="container-lux" style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '60px' }}>
          <ShoppingBag size={44} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Your Cart is Empty</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Discover our collection of precision diecast cars and framed models.
          </p>
          <button className="btn-gold" onClick={() => navigate('shop')}>
            Browse Products <ArrowRight size={14} />
          </button>
        </div>
      </main>
    );
  }

  const cartWhatsappMsg = `Hello CLASSY, I would like to order:\n\n${cart
    .map((line, i) => `${i + 1}. ${line.product.name} (x${line.quantity}) - ${money(line.product.price * line.quantity)}`)
    .join('\n')}\n\nTotal: ${money(subtotal)}\n\nPlease share delivery confirmation.`;

  return (
    <main className="section-lux">
      <div className="container-lux">
        <button
          className="btn-outline"
          onClick={() => navigate('shop')}
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '12px' }}
        >
          <ChevronLeft size={14} /> Continue Shopping
        </button>

        <div style={{ marginBottom: '28px' }}>
          <span className="kicker">Cart</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)' }}>Review Your Items</h1>
        </div>

        <div className="cart-layout-clean">
          <div className="cart-items-box">
            {cart.map(({ product, quantity }) => (
              <div className="cart-line-clean" key={product.id}>
                <img src={product.image_url} alt={product.name} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    {categoryLabel(product.category)}
                  </div>
                  <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{product.name}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--gold-light)', fontWeight: 600 }}>{money(product.price)}</div>
                </div>

                <div className="counter-box" style={{ height: '36px' }}>
                  <button className="counter-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    <Minus size={12} />
                  </button>
                  <span className="counter-val">{quantity}</span>
                  <button className="counter-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  style={{ color: 'var(--text-dim)', padding: '6px' }}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <h3>Summary</h3>
            <div className="summary-line">
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-title)', fontWeight: 600 }}>{money(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Packing & Handling</span>
              <span style={{ color: '#34D399', fontWeight: 600 }}>Free</span>
            </div>
            <div className="summary-line">
              <span>Courier</span>
              <span style={{ color: '#34D399', fontWeight: 600 }}>Calculated at Checkout</span>
            </div>

            <div className="summary-total-line">
              <span>Total</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-gold" style={{ width: '100%' }} onClick={() => navigate('checkout')}>
                Proceed to Checkout <ArrowRight size={14} />
              </button>
              <a
                href={whatsappLink(cartWhatsappMsg)}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-minimal"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <MessageCircle size={15} /> Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   CHECKOUT VIEW
   ========================================================================= */
function Checkout({
  cart,
  subtotal,
  setLastOrder,
  navigate,
  clearCart,
}: {
  cart: CartLine[];
  subtotal: number;
  setLastOrder: (order: Order) => void;
  navigate: (view: View) => void;
  clearCart: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (Object.entries(form).some(([key, value]) => key !== 'notes' && !value.trim())) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const orderNumber = `CLS-${Date.now().toString().slice(-6)}`;

    if (supabase) {
      try {
        const { data, error: orderError } = await supabase.rpc('place_order', {
          p_customer_name: form.name,
          p_phone: form.phone,
          p_email: form.email,
          p_address: form.address,
          p_city: form.city,
          p_state: form.state,
          p_pin_code: form.pin,
          p_notes: form.notes,
          p_items: cart.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
        });

        if (!orderError && data && (data as { id?: string }).id) {
          const placed = data as { id: string; order_number: string; total: number; created_at: string };
          const created: Order = {
            id: placed.id,
            order_number: placed.order_number,
            customer_name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
            pin_code: form.pin,
            notes: form.notes,
            total: placed.total,
            payment_status: 'pending',
            order_status: 'pending',
            created_at: placed.created_at,
            lines: cart,
          };
          setLastOrder(created);
          clearCart();
          setLoading(false);
          navigate('confirmation');
          return;
        }
      } catch {
        // Fall back below
      }
    }

    const fallbackOrder: Order = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      customer_name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pin_code: form.pin,
      notes: form.notes,
      total: subtotal,
      payment_status: 'pending',
      order_status: 'confirmed',
      created_at: new Date().toISOString(),
      lines: cart,
    };

    setLastOrder(fallbackOrder);
    clearCart();
    setLoading(false);
    navigate('confirmation');
  };

  return (
    <main className="section-lux">
      <div className="container-lux">
        <button
          className="btn-outline"
          onClick={() => navigate('cart')}
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '12px' }}
        >
          <ChevronLeft size={14} /> Back to Cart
        </button>

        <div style={{ marginBottom: '28px' }}>
          <span className="kicker">Checkout</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)' }}>Delivery Details</h1>
        </div>

        <div className="cart-layout-clean">
          <form className="form-box" onSubmit={submit}>
            {error && (
              <div style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <div className="form-row-2">
              <div className="form-field-clean">
                <label>Full Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="form-field-clean">
                <label>Phone / WhatsApp *</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91" required />
              </div>
              <div className="form-field-clean full">
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="For order tracking" required />
              </div>
              <div className="form-field-clean full">
                <label>Delivery Address *</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Flat, Street, Area" required />
              </div>
              <div className="form-field-clean">
                <label>City *</label>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} required />
              </div>
              <div className="form-field-clean">
                <label>State *</label>
                <input value={form.state} onChange={(e) => update('state', e.target.value)} required />
              </div>
              <div className="form-field-clean">
                <label>PIN Code *</label>
                <input value={form.pin} onChange={(e) => update('pin', e.target.value)} required />
              </div>
              <div className="form-field-clean full">
                <label>Notes (Optional)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Processing…' : `Complete Order • ${money(subtotal)}`}
            </button>
          </form>

          <div className="summary-card">
            <h3>Items ({cart.reduce((t, l) => t + l.quantity, 0)})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cart.map(({ product, quantity }) => (
                <div key={product.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img
                    src={product.image_url}
                    alt=""
                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', background: 'var(--card-img-bg)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Qty: {quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold-light)' }}>
                    {money(product.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-total-line">
              <span>Total</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Direct dispatch updates and secure UPI payment instructions will be sent via WhatsApp immediately after placement.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   CONFIRMATION VIEW
   ========================================================================= */
function Confirmation({ order, navigate }: { order: Order; navigate: (view: View) => void }) {
  const message = `CLASSY ORDER #${order.order_number}\nName: ${order.customer_name}\nPhone: ${order.phone}\nItems: ${(order.lines ?? []).map((l) => `${l.product.name} x${l.quantity}`).join(', ')}\nTotal: ${money(order.total)}`;

  return (
    <main className="section-lux" style={{ textAlign: 'center' }}>
      <div className="container-lux" style={{ maxWidth: '540px', margin: '0 auto' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10B981',
            color: '#34D399',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Check size={28} />
        </div>

        <span className="kicker">Order Placed</span>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Thank You</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          We received your order, <strong>{order.customer_name}</strong>. Your reference number is{' '}
          <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>#{order.order_number}</span>.
        </p>

        <div className="form-box" style={{ textAlign: 'left', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Order Reference</span>
            <strong style={{ color: 'var(--gold)' }}>#{order.order_number}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Total Amount</span>
            <strong style={{ color: 'var(--text-title)' }}>{money(order.total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Shipping Destination</span>
            <span style={{ color: 'var(--text)' }}>{order.city}, {order.state}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <MessageCircle size={15} /> Confirm via WhatsApp
          </a>

          <button className="btn-outline" onClick={() => navigate('shop')} style={{ width: '100%' }}>
            Back to Catalog
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   FOOTER
   ========================================================================= */
function Footer({ navigate, logoUrl }: { navigate: (view: View) => void; logoUrl: string }) {
  return (
    <footer className="site-footer-clean">
      <div className="container-lux">
        <div className="footer-columns-clean">
          <div className="footer-brand-side">
            <img src={logoUrl} alt="CLASSY" />
            <p>
              Premium miniature diecast scale models and custom shadow-box wall frames. Safe express shipping across India.
            </p>
          </div>

          <div className="footer-column-item">
            <h4>Explore</h4>
            <ul>
              <li><button onClick={() => navigate('home')}>Home</button></li>
              <li><button onClick={() => navigate('shop')}>Products</button></li>
              <li><button onClick={() => navigate('collections')}>Categories</button></li>
              <li><button onClick={() => navigate('admin')}>Admin</button></li>
            </ul>
          </div>

          <div className="footer-column-item">
            <h4>Collections</h4>
            <ul>
              <li><button onClick={() => navigate('shop')}>1:18 Diecast Models</button></li>
              <li><button onClick={() => navigate('shop')}>Car Wall Frames</button></li>
              <li><button onClick={() => navigate('shop')}>Limited Editions</button></li>
            </ul>
          </div>

          <div className="footer-column-item">
            <h4>Support</h4>
            <ul>
              <li>
                <a href={whatsappLink('Hello CLASSY, I have an inquiry')} target="_blank" rel="noreferrer">
                  WhatsApp Concierge
                </a>
              </li>
              <li>
                <a href="https://instagram.com/classy07._" target="_blank" rel="noreferrer">
                  Instagram (@classy07._)
                </a>
              </li>
              <li>
                <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Kerala, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-line">
          <span>© {new Date().getFullYear()} CLASSY — DIECAST & WALL FRAMES</span>
          <span>ALL-INDIA SAFE EXPRESS SHIPPING</span>
        </div>
      </div>
    </footer>
  );
}
