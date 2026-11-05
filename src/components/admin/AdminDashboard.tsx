import { useEffect, useState } from 'react';
import { Check, LogOut, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { money, orderStatuses, type Order, type OrderItem, type Product } from '@/lib/store';
import { ProductEditor, emptyProduct } from '@/components/admin/ProductEditor';
import { SiteSettingsEditor } from '@/components/admin/SiteSettingsEditor';
import { defaultSiteSettings, loadSiteSettings, type SiteSettings } from '@/lib/siteSettings';

type Editing = { product: Product; isNew: boolean } | null;
type AdminTab = 'products' | 'orders' | 'settings';

export function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<AdminTab>('products');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [editingSettings, setEditingSettings] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [message, setMessage] = useState('');

  const loadAll = async () => {
    if (!supabase) return;
    const [productResult, orderResult, itemResult] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('id, order_id, product_name, image_url, quantity, unit_price'),
    ]);
    if (productResult.error || orderResult.error || itemResult.error) {
      setMessage('Could not load store data. Please refresh and try again.');
      return;
    }
    setProducts((productResult.data ?? []) as Product[]);
    setOrders((orderResult.data ?? []) as Order[]);
    setOrderItems((itemResult.data ?? []) as OrderItem[]);
  };

  useEffect(() => { void loadAll(); void loadSiteSettings().then(setSiteSettings).catch(() => setSiteSettings(defaultSiteSettings)); }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const saveProduct = async (product: Product, isNew: boolean): Promise<boolean> => {
    if (!supabase) return false;
    const fields = {
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      brand: product.brand,
      scale: product.scale,
      image_url: product.image_url,
      gallery_urls: product.gallery_urls,
      stock_quantity: product.stock_quantity,
      is_available: product.is_available,
      is_featured: product.is_featured,
      is_new: product.is_new,
    };
    const result = isNew
      ? await supabase.from('products').insert(fields)
      : await supabase.from('products').update(fields).eq('id', product.id);
    if (result.error) {
      setMessage('Could not save the product. Please try again.');
      return false;
    }
    setEditing(null);
    setMessage('Product saved.');
    await loadAll();
    return true;
  };

  const deleteProduct = async (product: Product) => {
    if (!supabase) return;
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      setMessage('This product has order history, so it cannot be deleted. Mark it unavailable instead.');
      return;
    }
    setMessage('Product deleted.');
    await loadAll();
  };

  const updateOrderStatus = async (order: Order, status: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', order.id);
    if (error) {
      setMessage('Could not update the order status. Please try again.');
      return;
    }
    setMessage('Order status updated.');
    await loadAll();
  };

  return (
    <main className="page admin-page">
      <div className="page-intro compact">
        <p className="kicker">CLASSY workspace</p>
        <h1>Manage <em>the store.</em></h1>
      </div>
      <div className="admin-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products ({products.length})</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Collections</button>
        {tab === 'products' && <button className="admin-add" onClick={() => setEditing({ product: emptyProduct(), isNew: true })}>Add product <Plus size={13} /></button>}
        {tab === 'settings' && <button className="admin-add" onClick={() => setEditingSettings(true)}>Edit website</button>}
        <button className="admin-add" onClick={onSignOut}>Sign out <LogOut size={13} /></button>
      </div>
      {message && <p className="checkout-intro"><Check size={14} /> {message}</p>}

      {tab === 'settings' ? (
        <div className="admin-list settings-preview">
          <div className="settings-preview-intro"><p className="kicker">Live storefront</p><h2>Collections</h2><p>These three sections appear on the second page of your website.</p></div>
          {siteSettings.home.collections.slice(0, 3).map((collection) => <div className="admin-row" key={collection.id}><img src={collection.imageUrl} alt="" /><div><strong>{collection.title}</strong><span>{collection.subtitle}</span></div><button onClick={() => setEditingSettings(true)}>Edit</button></div>)}
        </div>
      ) : tab === 'products' ? (
        <div className="admin-list">
          {products.length ? products.map((product) => (
            <div className="admin-row" key={product.id}>
              <img src={product.image_url} alt="" />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} · {money(product.price)}</span>
              </div>
              <span className={product.stock_quantity && product.is_available ? 'available' : 'unavailable'}>
                {product.is_available && product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Unavailable'}
              </span>
              <button onClick={() => setEditing({ product, isNew: false })}>Edit</button>
              <button className="remove-item" onClick={() => void deleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button>
            </div>
          )) : <div className="empty-state"><h2>No products yet.</h2><p>Add your first product to get started.</p></div>}
        </div>
      ) : (
        <div className="admin-list">
          {orders.length ? orders.map((order) => {
            const items = orderItems.filter((item) => item.order_id === order.id);
            return (
              <div className="order-row" key={order.id}>
                <div>
                  <strong>{order.order_number}</strong>
                  <span>{order.customer_name} · {order.phone} · {new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                  <span>{order.address}, {order.city}, {order.state} - {order.pin_code}</span>
                  {items.map((item) => <span key={item.id}>{item.product_name} × {item.quantity}</span>)}
                </div>
                <strong>{money(order.total)}</strong>
                <select value={order.order_status} onChange={(event) => void updateOrderStatus(order, event.target.value)} aria-label="Order status">
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            );
          }) : <div className="empty-state"><h2>No orders yet.</h2></div>}
        </div>
      )}

      {editingSettings && <SiteSettingsEditor settings={siteSettings} onSave={setSiteSettings} onClose={() => setEditingSettings(false)} />}
      {editing && (
        <ProductEditor
          product={editing.product}
          isNew={editing.isNew}
          onSave={(product) => saveProduct(product, editing.isNew)}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
