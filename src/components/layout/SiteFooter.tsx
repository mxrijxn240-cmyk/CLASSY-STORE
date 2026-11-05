import type { View } from '@/lib/navigation';
import { instagramUrl, whatsappLink } from '@/lib/contact';

export function SiteFooter({ logoUrl, navigate }: { logoUrl: string; navigate: (view: View) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logoUrl} alt="CLASSY" />
          <p>Made for the detail.</p>
        </div>
        <div className="footer-columns">
          <div>
            <p className="kicker">Explore</p>
            <button type="button" onClick={() => navigate('home')}>Home</button>
            <button type="button" onClick={() => navigate('collections')}>Collections</button>
            <button type="button" onClick={() => navigate('shop')}>Shop</button>
          </div>
          <div>
            <p className="kicker">Connect</p>
            <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            <a href={whatsappLink('Hello CLASSY')} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CLASSY</span>
        </div>
      </div>
    </footer>
  );
}
