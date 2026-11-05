import { useState, type FormEvent } from 'react';
import { Check, Upload, X } from 'lucide-react';
import { Field } from '@/components/FormField';
import type { Category, Product } from '@/lib/store';
import { productPhotoTypes, uploadPublicImage, validateImageFile } from '@/lib/imageUpload';

const categories: Category[] = ['Frame', 'Car Frame', 'Diecast Car'];

export function emptyProduct(): Product {
  return {
    id: `new-${Date.now()}`,
    name: '',
    price: 0,
    category: 'Diecast Car',
    description: '',
    brand: 'CLASSY',
    scale: '1:18',
    image_url: '',
    gallery_urls: [],
    stock_quantity: 0,
    is_available: true,
    is_featured: false,
    is_new: false,
  };
}

export function ProductEditor({ product, isNew, onSave, onClose }: { product: Product; isNew: boolean; onSave: (product: Product) => Promise<boolean>; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>(product);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const uploadPhoto = async (file: File) => {
    const problem = validateImageFile(file, productPhotoTypes);
    if (problem) {
      setError(problem);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadPublicImage('product-images', file);
      setDraft((current) => ({ ...current, image_url: url, gallery_urls: [url] }));
    } catch {
      setError('The photo could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (!Number.isFinite(draft.price) || draft.price < 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (!Number.isInteger(draft.stock_quantity) || draft.stock_quantity < 0) {
      setError('Stock must be a whole number, zero or more.');
      return;
    }
    setSaving(true);
    setError('');
    const saved = await onSave({ ...draft, name: draft.name.trim(), price: Number(draft.price), stock_quantity: Number(draft.stock_quantity) });
    setSaving(false);
    if (!saved) setError('Could not save. Please try again.');
  };

  return (
    <div className="modal">
      <form className="edit-form" onSubmit={submit}>
        <button type="button" className="close-modal" onClick={onClose} aria-label="Close"><X size={16} /></button>
        <p className="kicker">Product details</p>
        <h2>{isNew ? 'Add product' : 'Edit product'}</h2>
        {error && <p className="form-error">{error}</p>}
        <div className="form-fields">
          <div className="field wide">
            <span>Product photo</span>
            <div className="admin-row">
              {draft.image_url ? <img src={draft.image_url} alt="" /> : <span>No photo yet</span>}
              <label className="button">
                <Upload size={14} /> {uploading ? 'Uploading…' : 'Choose photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); event.target.value = ''; }} />
              </label>
            </div>
          </div>
          <Field label="Product name" value={draft.name} onChange={(value) => update('name', value)} wide required />
          <Field label="Price (₹)" type="number" value={String(draft.price)} onChange={(value) => update('price', Number(value))} required />
          <label className="field">
            <span>Category *</span>
            <select value={draft.category} onChange={(event) => update('category', event.target.value as Category)}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <Field label="Stock quantity" type="number" value={String(draft.stock_quantity)} onChange={(value) => update('stock_quantity', Number(value))} required />
          <Field label="Scale" value={draft.scale} onChange={(value) => update('scale', value)} />
          <Field label="Brand" value={draft.brand} onChange={(value) => update('brand', value)} />
          <Field label="Description" value={draft.description} onChange={(value) => update('description', value)} wide />
          <label className="field"><span>Visible on the shop</span><input type="checkbox" checked={draft.is_available} onChange={(event) => update('is_available', event.target.checked)} /></label>
          <label className="field"><span>Featured on home page</span><input type="checkbox" checked={draft.is_featured} onChange={(event) => update('is_featured', event.target.checked)} /></label>
          <label className="field"><span>Show as New</span><input type="checkbox" checked={draft.is_new} onChange={(event) => update('is_new', event.target.checked)} /></label>
        </div>
        <button className="button button-gold full" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save product'} <Check size={14} /></button>
      </form>
    </div>
  );
}
