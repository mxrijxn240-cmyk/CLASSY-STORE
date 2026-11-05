import { useState } from 'react';
import { Instagram, Menu, Search, ShoppingBag, X } from 'lucide-react';
import type { View } from '@/lib/navigation';
import { instagramUrl } from '@/lib/contact';

const navItems: { view: View; label: string }[] = [
  { view: 'home', label: 'Home' },
  { view: 'collections', label: 'Collections' },
  { view: 'shop', label: 'Shop' },
];

export function SiteHeader({ logoUrl, cartCount, navigate }: { logoUrl: string; cartCount: number; navigate: (view: View) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (view: View) => {
    setMenuOpen(false);
    navigate(view);
  };

  return (
    <header className="site-header">
      <div className="header-bar">
        <button type="button" className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Main">
          {navItems.map((item) => <button type="button" key={item.view} onClick={() => go(item.view)}>{item.label}</button>)}
        </nav>
        <button type="button" className="header-logo" onClick={() => go('home')} aria-label="CLASSY home">
          <img src={logoUrl} alt="CLASSY" />
        </button>
        <div className="header-actions">
          <a className="icon-button" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
          <button type="button" className="icon-button" onClick={() => go('shop')} aria-label="Search products"><Search size={20} /></button>
          <button type="button" className="icon-button" onClick={() => go('cart')} aria-label={`Shopping bag, ${cartCount} items`}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
