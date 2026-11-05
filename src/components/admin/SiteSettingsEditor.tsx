import { useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { Field } from '@/components/FormField';
import { publishSiteSettings, type SiteSettings } from '@/lib/siteSettings';

export function SiteSettingsEditor({ settings, onSave, onClose }: { settings: SiteSettings; onSave: (settings: SiteSettings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateHome = (section: 'hero' | 'statement' | 'collection', key: string, value: string) => {
    setDraft((current) => ({ ...current, home: { ...current.home, [section]: { ...current.home[section], [key]: value } } }));
  };

  const updateCollection = (index: number, key: 'title' | 'subtitle' | 'imageUrl', value: string) => {
    setDraft((current) => ({ ...current, home: { ...current.home, collections: current.home.collections.map((collection, collectionIndex) => collectionIndex === index ? { ...collection, [key]: value } : collection) } }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await publishSiteSettings(draft);
      onSave(draft);
      onClose();
    } catch {
      setError('Could not save the page settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="modal"><form className="edit-form site-settings-form" onSubmit={submit}>
    <button type="button" className="close-modal" onClick={onClose} aria-label="Close"><X size={16} /></button>
    <p className="kicker">Storefront settings</p>
    <h2>Edit website</h2>
    <p className="settings-help">Update the visible wording, images, logo, colors, and collection cards without coding.</p>
    {error && <p className="form-error">{error}</p>}

    <div className="settings-block"><p className="kicker">Brand</p><div className="form-fields">
      <Field label="Logo image URL" value={draft.branding.logoUrl} onChange={(value) => setDraft((current) => ({ ...current, branding: { ...current.branding, logoUrl: value } }))} wide required />
      <Field label="Primary brown" value={draft.theme.primary} onChange={(value) => setDraft((current) => ({ ...current, theme: { ...current.theme, primary: value } }))} required />
      <Field label="Light accent" value={draft.theme.primaryLight} onChange={(value) => setDraft((current) => ({ ...current, theme: { ...current.theme, primaryLight: value } }))} required />
      <Field label="Background brown" value={draft.theme.background} onChange={(value) => setDraft((current) => ({ ...current, theme: { ...current.theme, background: value } }))} required />
      <Field label="Surface brown" value={draft.theme.surface} onChange={(value) => setDraft((current) => ({ ...current, theme: { ...current.theme, surface: value } }))} required />
    </div></div>

    <div className="settings-block"><p className="kicker">Home banner</p><div className="form-fields">
      <Field label="Small label" value={draft.home.hero.kicker} onChange={(value) => updateHome('hero', 'kicker', value)} wide required />
      <Field label="Main heading" value={draft.home.hero.title} onChange={(value) => updateHome('hero', 'title', value)} required />
      <Field label="Italic heading" value={draft.home.hero.titleAccent} onChange={(value) => updateHome('hero', 'titleAccent', value)} required />
      <Field label="Description" value={draft.home.hero.copy} onChange={(value) => updateHome('hero', 'copy', value)} wide required />
      <Field label="Button label" value={draft.home.hero.ctaLabel} onChange={(value) => updateHome('hero', 'ctaLabel', value)} required />
      <Field label="Banner image URL" value={draft.home.hero.imageUrl} onChange={(value) => updateHome('hero', 'imageUrl', value)} wide required />
    </div></div>

    <div className="settings-block"><p className="kicker">Home statement</p><div className="form-fields">
      <Field label="Small label" value={draft.home.statement.kicker} onChange={(value) => updateHome('statement', 'kicker', value)} wide required />
      <Field label="Main heading" value={draft.home.statement.title} onChange={(value) => updateHome('statement', 'title', value)} required />
      <Field label="Italic heading" value={draft.home.statement.titleAccent} onChange={(value) => updateHome('statement', 'titleAccent', value)} required />
      <Field label="Description" value={draft.home.statement.copy} onChange={(value) => updateHome('statement', 'copy', value)} wide required />
    </div></div>

    <div className="settings-block"><p className="kicker">Home feature</p><div className="form-fields">
      <Field label="Small label" value={draft.home.collection.kicker} onChange={(value) => updateHome('collection', 'kicker', value)} wide required />
      <Field label="Main heading" value={draft.home.collection.title} onChange={(value) => updateHome('collection', 'title', value)} required />
      <Field label="Italic heading" value={draft.home.collection.titleAccent} onChange={(value) => updateHome('collection', 'titleAccent', value)} required />
      <Field label="Description" value={draft.home.collection.copy} onChange={(value) => updateHome('collection', 'copy', value)} wide required />
      <Field label="Button label" value={draft.home.collection.ctaLabel} onChange={(value) => updateHome('collection', 'ctaLabel', value)} required />
      <Field label="Feature image URL" value={draft.home.collection.imageUrl} onChange={(value) => updateHome('collection', 'imageUrl', value)} wide required />
    </div></div>

    {draft.home.collections.slice(0, 3).map((collection, index) => <div className="settings-block" key={collection.id}><p className="kicker">Collection {index + 1}</p><div className="form-fields">
      <Field label="Title" value={collection.title} onChange={(value) => updateCollection(index, 'title', value)} required />
      <Field label="Short description" value={collection.subtitle} onChange={(value) => updateCollection(index, 'subtitle', value)} required />
      <Field label="Image URL" value={collection.imageUrl} onChange={(value) => updateCollection(index, 'imageUrl', value)} wide required />
    </div></div>)}

    <button className="button button-gold full" disabled={saving}>{saving ? 'Saving…' : 'Save website changes'} <Check size={14} /></button>
  </form></div>;
}
