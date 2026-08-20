import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { List, X } from 'phosphor-react';
import { goTo } from './landingCss';

const SECTIONS = [
  ['features', 'Products'],
  ['modes', 'Modes'],
  ['how-it-works', 'How it works'],
  ['pricing', 'Pricing'],
];

const baseBtn = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)',
  fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-2)', padding: '0.4rem 0.75rem',
  borderRadius: 8, transition: 'color 0.15s',
};

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Section links only exist on the landing page itself. From anywhere else
  // (e.g. /faq), navigate home with the section as a hash and let Landing.jsx
  // scroll to it once mounted, instead of silently doing nothing.
  const handleSectionClick = (id) => {
    if (location.pathname === '/') {
      goTo(id);
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <>
      <nav className="landing-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? 'rgba(6,14,26,0.93)' : 'transparent', backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'all 0.35s ease', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button className="nav-mark" onClick={() => goTo('hero')} style={{ ...baseBtn, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', padding: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Qreek<span style={{ color: '#00d4aa' }}>Finance</span>
        </button>

        <div className="desktop-nav" style={{ gap: '0.2rem' }}>
          {SECTIONS.map(([id, label]) => (
            <button key={id} onClick={() => handleSectionClick(id)} style={baseBtn}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>{label}</button>
          ))}
          <Link to="/faq" style={{ ...baseBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>FAQ</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Sign in is hidden on narrow phones — it stays reachable in the menu below */}
          <Link className="nav-signin" to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '0.45rem 0.9rem', borderRadius: 8, whiteSpace: 'nowrap' }}>Sign in</Link>
          <Link className="nav-cta" to="/register" style={{ background: '#00d4aa', color: '#000', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 800, padding: '0.45rem 1.1rem', borderRadius: 8, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>Get started</Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--text-2)', alignItems: 'center' }}>
            {menuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 190, background: 'rgba(6,14,26,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {SECTIONS.map(([id, label]) => (
            <button key={id} onClick={() => { handleSectionClick(id); setMenuOpen(false); }}
              style={{ ...baseBtn, fontSize: '1rem', padding: '0.75rem 0.5rem', textAlign: 'left' }}>{label}</button>
          ))}
          <Link to="/faq" onClick={() => setMenuOpen(false)}
            style={{ ...baseBtn, fontSize: '1rem', padding: '0.75rem 0.5rem', textAlign: 'left', textDecoration: 'none', display: 'block' }}>FAQ</Link>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: '#000', background: '#00d4aa', fontSize: '0.9rem', fontWeight: 800, padding: '0.75rem', borderRadius: 10, fontFamily: 'var(--font-display)' }}>Get started</Link>
          </div>
        </div>
      )}
    </>
  );
}
