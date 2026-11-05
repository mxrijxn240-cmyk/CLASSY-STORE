import { useState } from 'react';
import { logoDefault } from '@/lib/siteSettings';

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) {
    return (
      <div className="product-image-placeholder">
        <img src={logoDefault} alt="CLASSY" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />;
}
