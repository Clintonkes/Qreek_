import React from 'react';
import { Link } from 'react-router-dom';
import { goTo } from './landingCss';
import { CREDITS } from './images';

const linkStyle = { color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.83rem', lineHeight: 2.1, display: 'block', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'var(--font-display)', cursor: 'pointer' };
const headStyle = { fontSize: '0.66rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.85rem' };

const COLUMNS = [
  {
    title: 'Products',
    items: [
      { label: 'Payment Pools',     scroll: 'features' },
      { label: 'Payment Links',     scroll: 'features' },
      { label: 'Enterprise Payroll', scroll: 'features' },
      { label: 'Modes',             scroll: 'modes' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'How it works', scroll: 'how-it-works' },
      { label: 'Pricing',      scroll: 'pricing' },
      { label: 'Sign up',      to: '/register' },
      { label: 'Log in',       to: '/login' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { label: 'Flutterwave-powered', scroll: 'how-it-works' },
      { label: 'CBN-licensed PSP',    scroll: 'how-it-works' },
      { label: 'Zero fund custody',   scroll: 'how-it-works' },
    ],
  },
  {
    title: 'Contact',
    items: [
      { label: 'support@qreekfinance.org', href: 'mailto:support@qreekfinance.org' },
      { label: 'qreekfinance.org', static: true },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3.5rem 2rem 2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              Qreek<span style={{ color: '#00d4aa' }}>Finance</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.75, maxWidth: 320, margin: 0 }}>
              All payments processed by Flutterwave Technology Solutions Limited, a CBN-licensed Payment Solution Provider. Qreek Finance does not hold, custody, or transmit funds.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <div style={headStyle}>{col.title}</div>
              {col.items.map(item => {
                if (item.to)     return <Link key={item.label} to={item.to} style={linkStyle}>{item.label}</Link>;
                if (item.href)   return <a key={item.label} href={item.href} style={linkStyle}>{item.label}</a>;
                if (item.static) return <span key={item.label} style={{ ...linkStyle, cursor: 'default' }}>{item.label}</span>;
                return <button key={item.label} onClick={() => goTo(item.scroll)} style={linkStyle}>{item.label}</button>;
              })}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', fontSize: '0.74rem', color: 'var(--text-3)' }}>
          <span>© 2026 Qreek Finance</span>
          <span style={{ maxWidth: 640, textAlign: 'right', lineHeight: 1.6 }}>
            Photography by {CREDITS.join(', ')} on Unsplash.
          </span>
        </div>
      </div>
    </footer>
  );
}
