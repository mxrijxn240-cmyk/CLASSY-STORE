import { ArrowRight } from 'lucide-react';
import type { CollectionSetting } from '@/lib/siteSettings';

export function CollectionGrid({ collections, openCollection }: { collections: CollectionSetting[]; openCollection: (id: CollectionSetting['id']) => void }) {
  return (
    <div className="collection-grid">
      {collections.map((collection) => (
        <button type="button" key={collection.id} className="collection-card" onClick={() => openCollection(collection.id)}>
          <span className="collection-media">
            <img src={collection.imageUrl} alt="" loading="lazy" />
          </span>
          <span className="collection-title">{collection.title}</span>
          <span className="collection-label">{collection.label} <ArrowRight size={14} /></span>
        </button>
      ))}
    </div>
  );
}
