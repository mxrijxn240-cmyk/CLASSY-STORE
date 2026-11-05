import { money, type Product } from '@/lib/store';
import { ProductImage } from '@/components/store/ProductImage';

type ProductCardProps = {
  product: Product;
  openProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
};

export function ProductCard({ product, openProduct, addToCart }: ProductCardProps) {
  const inStock = product.is_available && product.stock_quantity > 0;
  return (
    <article className="product-card">
      <button type="button" className="product-media" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
        <ProductImage src={product.image_url} alt={product.name} />
        {product.is_new && <span className="product-badge">New</span>}
      </button>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className={inStock ? 'availability is-available' : 'availability'}>{inStock ? 'Available' : 'Unavailable'}</p>
        <p className="product-price">{money(product.price)}</p>
        <div className="product-actions">
          <button type="button" className="button button-outline" onClick={() => openProduct(product)}>View Product</button>
          <button type="button" className="button button-primary" onClick={() => addToCart(product)} disabled={!inStock}>Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, openProduct, addToCart }: { products: Product[] } & Omit<ProductCardProps, 'product'>) {
  return (
    <div className="product-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} openProduct={openProduct} addToCart={addToCart} />)}
    </div>
  );
}
