import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes marqueeScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.8; transform: scale(1.06); }
  }
  @keyframes meshMove {
    0%   { transform: translate(0%,0%) scale(1); }
    33%  { transform: translate(2%,-2%) scale(1.04); }
    66%  { transform: translate(-2%,2%) scale(0.97); }
    100% { transform: translate(0%,0%) scale(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes payBar {
    from { width: 0%; }
    to   { width: 60%; }
  }
  @keyframes heroTextIn {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes heroMockIn {
    from { opacity: 0; transform: translateX(18px) scale(0.97); }
    to   { opacity: 1; transform: none scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  .desktop-nav { display: flex; }
  @media (max-width: 768px) {
    .desktop-nav        { display: none !important; }
    .mobile-menu-btn    { display: flex !important; }
    .hero-layout        { grid-template-columns: 1fr !important; }
    .hero-mockup        { display: none !important; }
    .hero-cats          { grid-template-columns: 1fr !important; }
    .hero-cat-mid       { border-right: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
    .hero-cat-last      { border-top: 1px solid rgba(255,255,255,0.07) !important; }
    .product-grid       { grid-template-columns: 1fr !important; }
    .product-vis        { order: -1 !important; }
    .modes-grid         { grid-template-columns: 1fr !important; }
    .how-grid           { grid-template-columns: 1fr !important; }
    .trust-grid-3       { grid-template-columns: 1fr !important; }
    .price-row          { grid-template-columns: 1fr 1fr !important; }
    .hero-ctas          { flex-direction: column !important; align-items: stretch !important; }
    .hero-ctas a, .hero-ctas button { text-align: center !important; }
    .case-card          { flex: 0 0 280px !important; }
    .showcase-track     { padding: 0 1.25rem 1.25rem !important; }
  }
  @media (max-width: 480px) {
    .price-row { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
  }
  .usecase-track::-webkit-scrollbar { display: none; }
  .usecase-track { scrollbar-width: none; -ms-overflow-style: none; }
  .showcase-track::-webkit-scrollbar { display: none; }
  .showcase-track { scrollbar-width: none; -ms-overflow-style: none; }
`;

function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Reveal wrapper ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dx = 0, dy = 24, threshold = 0.1, style, className, ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return (
    <div ref={ref} className={className} {...rest} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : `translate(${dx}px, ${dy}px)`,
      transition: `opacity 0.75s ${delay}ms ease, transform 0.75s ${delay}ms ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Pool Mockup ────────────────────────────────────────────────────────── */
function PoolMockup() {
  const C = '#00d4aa';
  const members = [
    { name: 'Adaeze O.', paid: true,  amount: '₦10,000' },
    { name: 'Tunde K.',  paid: true,  amount: '₦10,000' },
    { name: 'Ngozi B.',  paid: false, amount: 'Pending'  },
    { name: 'James E.',  paid: true,  amount: '₦10,000' },
    { name: 'Chisom A.', paid: true,  amount: '₦10,000' },
  ];
  return (
    <div style={{ background: 'linear-gradient(160deg,#0a1628,#060e1a)', borderRadius: 20, border: `1px solid ${C}28`, padding: '1.5rem', boxShadow: `0 40px 100px ${C}14`, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
      <div aria-hidden style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${C}18, transparent)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: C, marginBottom: 4 }}>Pool, Communal</div>
          <div style={{ fontWeight: 900, fontSize: '1rem' }}>Adaeze Market Circle</div>
        </div>
        <div style={{ background: `${C}15`, border: `1px solid ${C}40`, borderRadius: 8, padding: '0.28rem 0.6rem', fontSize: '0.7rem', color: C, fontWeight: 800 }}>Active</div>
      </div>
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-2)' }}>Collected</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: C }}>₦240k / ₦400k</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
          <div style={{ height: '100%', animation: 'payBar 1.8s 0.3s ease both', background: `linear-gradient(90deg, ${C}, #00ffca)`, borderRadius: 99, boxShadow: `0 0 10px ${C}60` }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        {members.map(m => (
          <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.7rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${m.paid ? C + '18' : 'rgba(255,255,255,0.04)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: m.paid ? `${C}18` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: m.paid ? C : 'var(--text-3)' }}>{m.name[0]}</div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: m.paid ? C : 'var(--text-3)' }}>{m.amount}</span>
              <span style={{ fontSize: '0.75rem', color: m.paid ? C : 'var(--text-3)' }}>{m.paid ? '✓' : '○'}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem', padding: '0.65rem', background: `${C}08`, border: `1px solid ${C}18`, borderRadius: 10, fontSize: '0.76rem', color: 'var(--text-2)', textAlign: 'center', position: 'relative' }}>
        20 members, 17 paid, 3 pending
      </div>
    </div>
  );
}

/* ─── Link Mockup ────────────────────────────────────────────────────────── */
function LinkMockup() {
  const C = '#f5a623';
  return (
    <div style={{ background: 'linear-gradient(160deg,#0a1628,#060e1a)', borderRadius: 20, border: `1px solid ${C}28`, padding: '1.5rem', boxShadow: `0 40px 100px ${C}10`, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
      <div aria-hidden style={{ position: 'absolute', top: -50, left: -50, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${C}14, transparent)`, pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${C}18`, border: `1px solid ${C}40`, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>👗</div>
        <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: 3 }}>Tokunbo Fashion</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>qreekfinance.org/p/tokunbo</div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 900, color: C }}>₦25,000</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>Custom order deposit</div>
      </div>
      <button style={{ width: '100%', background: `linear-gradient(135deg, ${C}, #ffb84d)`, color: '#000', fontWeight: 900, fontSize: '0.92rem', border: 'none', borderRadius: 11, padding: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: `0 8px 24px ${C}30`, marginBottom: '1rem' }}>
        Pay with Flutterwave →
      </button>
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', position: 'relative' }}>
        {['💳 Card', '🏦 Transfer', '📱 USSD'].map(m => (
          <div key={m} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '0.3rem 0.55rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>{m}</div>
        ))}
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-3)', position: 'relative' }}>🔒 Secured by Flutterwave, CBN-licensed</div>
    </div>
  );
}

/* ─── Payroll Mockup ─────────────────────────────────────────────────────── */
function PayrollMockup() {
  const C = '#9b59b6';
  const depts = [
    { name: 'Engineering', n: 12 },
    { name: 'Design',      n: 6  },
    { name: 'Sales',       n: 18 },
    { name: 'Operations',  n: 11 },
  ];
  return (
    <div style={{ background: 'linear-gradient(160deg,#0a1628,#060e1a)', borderRadius: 20, border: `1px solid ${C}28`, padding: '1.5rem', boxShadow: `0 40px 100px ${C}10`, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
      <div aria-hidden style={{ position: 'absolute', bottom: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${C}14, transparent)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: C, marginBottom: 4 }}>Payroll Run</div>
          <div style={{ fontWeight: 900, fontSize: '1rem' }}>October 2026</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-2)', marginTop: 2 }}>TechBridge Solutions</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900, color: C }}>₦30.6M</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Total disbursed</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', position: 'relative' }}>
        {[{ v: '47', l: 'Employees', c: C }, { v: '47', l: 'Paid ✓', c: '#2ed573' }, { v: '4m', l: 'Run time', c: 'var(--text-2)' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: `${s.c}0e`, border: `1px solid ${s.c}28`, borderRadius: 11, padding: '0.7rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', position: 'relative' }}>
        {depts.map(d => (
          <div key={d.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.22rem' }}>
              <span style={{ color: 'var(--text-2)' }}>{d.name}</span>
              <span style={{ color: '#2ed573', fontWeight: 700 }}>{d.n} paid ✓</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${C}, #2ed573)`, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem', padding: '0.65rem 0.75rem', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.18)', borderRadius: 10, fontSize: '0.76rem', color: '#2ed573', display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
        ✓ All 47 transfers confirmed. Receipt ready
      </div>
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const sections = [['features','Products'],['modes','Modes'],['how-it-works','How it works'],['pricing','Pricing']];
  const baseBtn = { background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-2)', padding: '0.4rem 0.75rem', borderRadius: 8, transition: 'color 0.15s' };
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? 'rgba(6,14,26,0.93)' : 'transparent', backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'all 0.35s ease', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => goTo('hero')} style={{ ...baseBtn, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', padding: 0 }}>
          Qreek<span style={{ color: '#00d4aa' }}>Finance</span>
        </button>
        <div className="desktop-nav" style={{ gap: '0.2rem' }}>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => goTo(id)} style={baseBtn}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '0.45rem 0.9rem', borderRadius: 8 }}>Sign in</Link>
          <Link to="/register" style={{ background: '#00d4aa', color: '#000', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 800, padding: '0.45rem 1.1rem', borderRadius: 8, fontFamily: 'var(--font-display)' }}>Get started</Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--text-2)', borderRadius: 2 }} />)}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 190, background: 'rgba(6,14,26,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => { goTo(id); setMenuOpen(false); }}
              style={{ ...baseBtn, fontSize: '1rem', padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-2)' }}>{label}</button>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: '#000', background: '#00d4aa', fontSize: '0.9rem', fontWeight: 800, padding: '0.75rem', borderRadius: 10, fontFamily: 'var(--font-display)' }}>Get started</Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Trust Marquee (REQUIRED — do not remove) ───────────────────────────── */
function Marquee() {
  const items = ['🔒 Flutterwave-powered','🏛️ CBN-licensed processing','🚫 Zero fund custody','📋 Immutable receipts','✅ Bank-to-bank transfers','🇳🇬 Built for Nigeria','⚡ Real-time confirmation','👁️ Full member transparency','🔐 PIN-secured transactions'];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,212,170,0.025)', padding: '0.85rem 0' }}>
      <div style={{ display: 'flex', gap: '3.5rem', width: 'max-content', animation: 'marqueeScroll 42s linear infinite' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>{item}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero Slider (Adobe-style: left-aligned, full-screen, category bar) ─── */
function HeroSlider() {
  const [slide, setSlide] = useState(0);
  const [vis, setVis]     = useState(true);
  const timer             = useRef(null);

  const SLIDES = [
    {
      tag: 'Payment Pools',
      lines: ['Your ajo group,', 'now with a', 'live ledger.'],
      sub: 'Every member sees every naira. Who paid, how much, and when. Powered by Flutterwave.',
      cta: 'Create a pool',
      accent: '#00d4aa',
      mesh1: 'rgba(0,212,170,0.15)',
      mesh2: 'rgba(74,144,226,0.07)',
      Mockup: PoolMockup,
    },
    {
      tag: 'Payment Links',
      lines: ['One link.', 'Any payment.', 'Instant receipt.'],
      sub: 'Create a link in 2 minutes. Clients pay via card, transfer, or USSD. No Qreek account needed.',
      cta: 'Create a link',
      accent: '#f5a623',
      mesh1: 'rgba(245,166,35,0.13)',
      mesh2: 'rgba(155,89,182,0.07)',
      Mockup: LinkMockup,
    },
    {
      tag: 'Enterprise Payroll',
      lines: ['500 salaries.', '4 minutes.', 'No subscription.'],
      sub: 'Import your team, approve with your PIN, and every salary hits every bank account in parallel.',
      cta: 'Set up payroll',
      accent: '#9b59b6',
      mesh1: 'rgba(155,89,182,0.14)',
      mesh2: 'rgba(0,212,170,0.06)',
      Mockup: PayrollMockup,
    },
  ];

  const go = useCallback((idx) => {
    const n = ((idx % 3) + 3) % 3;
    setVis(false);
    setTimeout(() => { setSlide(n); setVis(true); }, 320);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => go(slide + 1), 7500);
    return () => clearTimeout(timer.current);
  }, [slide, go]);

  const s = SLIDES[slide];
  const M = s.Mockup;

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Per-slide background mesh */}
      {SLIDES.map((sl, i) => (
        <div key={i} aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 10% 40%, ${sl.mesh1}, transparent 52%), radial-gradient(ellipse at 90% 65%, ${sl.mesh2}, transparent 52%)`,
          opacity: i === slide ? 1 : 0,
          transition: 'opacity 1.1s ease',
        }} />
      ))}

      {/* Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.022, pointerEvents: 'none' }} aria-hidden>
        <defs><pattern id="hgrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#hgrid)"/>
      </svg>

      {/* Main slide content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 5vw', paddingTop: 80, paddingBottom: 16, position: 'relative', zIndex: 2 }}>
        <div className="hero-layout" style={{ width: '100%', maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>

          {/* LEFT — text, left-aligned (Adobe approach) */}
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            {/* Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', background: `${s.accent}18`, border: `1px solid ${s.accent}35`, borderRadius: 999, padding: '0.3rem 0.9rem', fontSize: '0.7rem', fontWeight: 800, color: s.accent, marginBottom: '1.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              {s.tag}
            </div>

            {/* Headline — large, bold, left-aligned */}
            <h1 style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.035em', color: 'var(--text)', marginBottom: '1.4rem', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
              {s.lines[0]}<br />{s.lines[1]}<br />
              <span style={{ color: s.accent }}>{s.lines[2]}</span>
            </h1>

            {/* Sub */}
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.88, maxWidth: 460, marginBottom: '2rem', textAlign: 'left' }}>
              {s.sub}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: s.accent, color: '#000', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 900, padding: '0.82rem 2.1rem', borderRadius: 999, fontFamily: 'var(--font-display)', boxShadow: `0 8px 28px ${s.accent}38`, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {s.cta}
              </Link>
              <button onClick={() => goTo('how-it-works')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                ▶ See how it works
              </button>
            </div>
          </div>

          {/* RIGHT — product mockup */}
          <div className="hero-mockup" style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateX(14px)', transition: 'opacity 0.45s 0.1s ease, transform 0.45s 0.1s ease' }}>
            <M />
          </div>
        </div>
      </div>

      {/* Slide dot indicators */}
      <div style={{ padding: '0.75rem 5vw 1.1rem', position: 'relative', zIndex: 3, display: 'flex', gap: '0.4rem' }}>
        {SLIDES.map((sl, i) => (
          <button key={i} onClick={() => { clearTimeout(timer.current); go(i); }}
            style={{ width: i === slide ? 28 : 7, height: 4, borderRadius: 99, background: i === slide ? s.accent : 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', padding: 0 }} />
        ))}
      </div>

      {/* Bottom category bar — Adobe-style */}
      <div className="hero-cats" style={{ position: 'relative', zIndex: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { icon: '🏦', label: 'Payment Pools',     fee: '0.15% per contribution', color: '#00d4aa', cls: '' },
          { icon: '🔗', label: 'Payment Links',      fee: '0.25% per payment',      color: '#f5a623', cls: 'hero-cat-mid' },
          { icon: '💼', label: 'Enterprise Payroll', fee: '0.2% per payroll run',   color: '#9b59b6', cls: 'hero-cat-last' },
        ].map((cat, i) => (
          <button key={cat.label} className={cat.cls} onClick={() => goTo('features')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem 1.75rem', background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(22px)', border: 'none', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}>
            <span style={{ fontSize: '1.35rem', flexShrink: 0 }}>{cat.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 2, whiteSpace: 'nowrap' }}>{cat.label}</div>
              <div style={{ fontSize: '0.68rem', color: cat.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{cat.fee}</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.9rem', flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── Product Showcase (Adobe "Everything you need" section) ─────────────── */
function ProductShowcase() {
  const cards = [
    { color: '#00d4aa', icon: '🏦', tag: 'Communal',       title: 'Payment Pools',         body: 'For ajo groups, committees, and circles. Every member sees every naira paid, in real time, with no disputes.' },
    { color: '#f5a623', icon: '🔗', tag: 'Solo & Merchant', title: 'Payment Links',         body: 'One link. Card, transfer, or USSD. Clients pay in browser. Automatic receipt every time.' },
    { color: '#9b59b6', icon: '💼', tag: 'Business',        title: 'Enterprise Payroll',    body: 'Bulk salary runs. PIN approval. Per-employee status. Printable receipts. No monthly subscription.' },
    { color: '#2ed573', icon: '👁️', tag: 'Transparency',   title: 'Live Activity Feed',    body: 'See who paid, who has not, and the running total. All members, one source of truth.' },
    { color: '#4a90e2', icon: '🔐', tag: 'Security',        title: 'PIN-Secured Auth',      body: 'Every financial action requires your secure PIN. Five wrong attempts locks the account instantly.' },
    { color: '#f87171', icon: '📋', tag: 'Proof',           title: 'Webhook Receipts',      body: 'Flutterwave webhook confirmation is the source of truth. Not screenshots, not DMs.' },
  ];
  return (
    <section style={{ padding: '5.5rem 0', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Everything in one place</div>
          <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>
            Everything you need to collect, track, and pay.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 500, margin: '0 auto', lineHeight: 1.85 }}>
            Whether you are an ajo group of 5 or a company of 500, Qreek has the right product for how you move money.
          </p>
        </Reveal>
      </div>
      <div className="showcase-track" style={{ display: 'flex', gap: '1.1rem', overflowX: 'auto', padding: '0 2rem 0.5rem', scrollbarWidth: 'none' }}>
        {cards.map((p, i) => (
          <Link key={p.title} to="/register" style={{ textDecoration: 'none', color: 'inherit', flex: '0 0 310px', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.25s ease, transform 0.3s ease, box-shadow 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}40`; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 24px 64px ${p.color}16`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            {/* Card visual header */}
            <div style={{ background: `linear-gradient(155deg, ${p.color}14, ${p.color}05)`, padding: '2rem 1.75rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden style={{ position: 'absolute', top: -35, right: -35, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${p.color}25, transparent)`, animation: 'pulse 8s ease infinite' }} />
              <div style={{ fontSize: '2.25rem', marginBottom: '0.8rem', position: 'relative' }}>{p.icon}</div>
              <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: p.color, position: 'relative' }}>{p.tag}</div>
            </div>
            {/* Card text */}
            <div style={{ padding: '1.25rem 1.75rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{p.title}</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.78, margin: 0, flex: 1 }}>{p.body}</p>
              <div style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 800, color: p.color }}>Get started →</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Product Section (alternating full-width layout) ────────────────────── */
function ProductSection({ tag, headline, body, fee, cta, to, color, side, MockupComponent }) {
  const isRight = side !== 'left';
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
        <Reveal dx={isRight ? -28 : 28} style={{ order: isRight ? 0 : 1 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color, marginBottom: '1rem' }}>{tag}</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.65rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em', textWrap: 'balance' }}>{headline}</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.88, marginBottom: '1.75rem' }}>{body}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={to} style={{ background: color, color: '#000', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 800, padding: '0.75rem 1.75rem', borderRadius: 10, fontFamily: 'var(--font-display)' }}>
              {cta} →
            </Link>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color, fontWeight: 700 }}>{fee}</span>
          </div>
        </Reveal>
        <Reveal dx={isRight ? 28 : -28} delay={80} className="product-vis" style={{ order: isRight ? 1 : 0 }}>
          <MockupComponent />
        </Reveal>
      </div>
    </div>
  );
}

/* ─── Mode Carousel ──────────────────────────────────────────────────────── */
function ModeCarousel({ modes }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const go = useCallback((idx) => setActive((idx + modes.length) % modes.length), [modes.length]);

  useEffect(() => {
    timerRef.current = setTimeout(() => go(active + 1), 9000);
    return () => clearTimeout(timerRef.current);
  }, [active, go]);

  const mode = modes[active];

  return (
    <section id="modes" style={{ background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '5.5rem 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 28% 50%, ${mode.color}12, transparent 55%), radial-gradient(ellipse at 76% 50%, ${mode.alt}0c, transparent 45%)`, transition: 'background 0.7s ease', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.75rem' }}>One payment layer</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Tuned to how people collect</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
          {modes.map((m, i) => {
            const sel = i === active;
            return (
              <button key={m.name} onClick={() => { clearTimeout(timerRef.current); go(i); }}
                style={{ background: sel ? `${m.color}18` : 'rgba(255,255,255,0.04)', color: sel ? m.color : 'var(--text-3)', border: `1px solid ${sel ? m.color + '55' : 'rgba(255,255,255,0.07)'}`, borderRadius: 999, padding: '0.55rem 1.25rem', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{m.icon}</span><span>{m.name}</span>
              </button>
            );
          })}
        </div>
        <div className="modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }} key={mode.name}>
          <div style={{ animation: 'fadeUp 0.45s ease both' }}>
            <div style={{ color: mode.color, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{mode.kicker}</div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{mode.title}</h3>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-2)', lineHeight: 1.88, marginBottom: '1.5rem' }}>{mode.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {mode.actions.map(a => (
                <div key={a.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.85rem' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{a.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.81rem', marginBottom: '0.22rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{a.copy}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {mode.stats.map(s => (
                <div key={s.label} style={{ flex: 1, background: `${mode.color}0c`, border: `1px solid ${mode.color}28`, borderRadius: 10, padding: '0.65rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: mode.color, fontSize: '0.92rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(145deg,rgba(15,30,53,0.9),rgba(6,14,26,0.95))', border: `1px solid ${mode.color}38`, borderRadius: 20, padding: '1.75rem', boxShadow: `0 30px 80px ${mode.color}12`, position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.45s 0.08s ease both' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${mode.color}18, transparent 55%), radial-gradient(circle at 72% 70%, ${mode.alt}12, transparent 50%)`, pointerEvents: 'none' }} />
            <svg viewBox="0 0 420 240" style={{ width: '100%', height: 'auto', overflow: 'visible', position: 'relative' }} aria-hidden>
              <defs>
                <linearGradient id={`mg-${mode.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mode.color} /><stop offset="100%" stopColor={mode.alt} />
                </linearGradient>
              </defs>
              <path d="M82 120 C128 36, 236 40, 288 93 S390 190, 328 218 S152 228, 94 174 S34 154, 82 120"
                fill="none" stroke={`url(#mg-${mode.name})`} strokeWidth="2" strokeDasharray="10 8" opacity="0.55" />
              {mode.nodes.map((node, i) => (
                <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
                  <circle r={i === 0 ? 38 : 26} fill="rgba(6,14,26,0.92)" stroke={i === 0 ? mode.color : 'rgba(255,255,255,0.12)'} strokeWidth={i === 0 ? 1.5 : 1} />
                  <text y={i === 0 ? -2 : -1} textAnchor="middle" fontSize={i === 0 ? 20 : 14}>{node.icon}</text>
                  <text y={i === 0 ? 18 : 14} textAnchor="middle" fontSize="9" fill="#4a6a8a" fontWeight="700">{node.label}</text>
                </g>
              ))}
            </svg>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.85rem', marginTop: '0.5rem', position: 'relative' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>Flow</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {mode.path.map((step, i) => (
                  <span key={step} style={{ color: i === mode.path.length - 1 ? mode.color : 'var(--text-3)', background: i === mode.path.length - 1 ? `${mode.color}12` : 'rgba(255,255,255,0.04)', border: `1px solid ${i === mode.path.length - 1 ? mode.color + '38' : 'rgba(255,255,255,0.05)'}`, borderRadius: 999, padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontWeight: 800 }}>{step}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
          {modes.map((_, i) => (
            <button key={i} onClick={() => { clearTimeout(timerRef.current); go(i); }}
              style={{ width: i === active ? 20 : 7, height: 6, borderRadius: 99, background: i === active ? mode.color : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Create in 2 minutes', body: 'Sign up with your phone number. Create a pool, a payment link, or a payroll run. No forms, no bank visits, no approvals required.' },
    { n: '02', title: 'Share. They pay in browser.', body: 'Members or clients open your link on any device. They pay through Flutterwave: card, bank transfer, or USSD. No Qreek account needed to pay.' },
    { n: '03', title: 'Ledger updates instantly', body: 'The moment Flutterwave confirms, Qreek marks the payment. Payer gets a receipt. Funds settle bank-to-bank. Qreek never touches them.' },
  ];
  return (
    <section id="how-it-works" style={{ padding: '5.5rem 2rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Getting started</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Simple. Transparent. Trusted.</h2>
        </Reveal>
        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {steps.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#00d4aa', fontSize: '0.85rem', flexShrink: 0, marginTop: 2 }}>{n}</div>
                <div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.82, margin: 0 }}>{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={80} style={{ marginTop: '2.75rem', background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.12)', borderRadius: 14, padding: '1.35rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🔐</span>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.82 }}>
            Every naira paid through Qreek is processed by <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Flutterwave</strong>, a CBN-licensed Payment Solution Provider. Funds flow directly from payer bank to recipient bank.{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Qreek is never in the middle of your money.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Use Case Carousel ──────────────────────────────────────────────────── */
function UseCaseCarousel({ cases }) {
  const scrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  const handleScroll = () => {
    const el = scrollRef.current; if (!el) return;
    setCanLeft(el.scrollLeft > 12);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
  };
  const arrowStyle = (active) => ({ width: 40, height: 40, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: active ? 'var(--text)' : 'var(--text-3)', cursor: active ? 'pointer' : 'default', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 });
  return (
    <section style={{ padding: '5.5rem 0', background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ padding: '0 2rem', maxWidth: 1200, margin: '0 auto 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <Reveal>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5a623', marginBottom: '0.65rem' }}>Who uses Qreek</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>Built for how Nigeria pays</h2>
        </Reveal>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => scroll(-1)} disabled={!canLeft}  style={arrowStyle(canLeft)}>←</button>
          <button onClick={() => scroll(1)}  disabled={!canRight} style={arrowStyle(canRight)}>→</button>
        </div>
      </div>
      <div ref={scrollRef} onScroll={handleScroll} className="usecase-track" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 2rem 1.25rem', WebkitOverflowScrolling: 'touch' }}>
        {cases.map(c => (
          <div key={c.tag + c.title} className="case-card" style={{ flex: '0 0 310px', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}38`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${c.color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
            <div style={{ display: 'inline-block', background: `${c.color}18`, color: c.color, borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.75rem' }}>{c.tag}</div>
            <div style={{ fontWeight: 800, fontSize: '0.94rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{c.title}</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.78, margin: 0 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Trust Section ──────────────────────────────────────────────────────── */
function TrustSection() {
  const items = [
    { icon: '🏛️', color: '#00d4aa', title: 'CBN-licensed processing',   desc: 'Flutterwave is the PSP. Qreek records the event. It never handles the money.' },
    { icon: '🚫', color: '#f87171', title: 'Zero fund custody',          desc: 'Naira flows from payer to recipient bank. Qreek is not in the chain.' },
    { icon: '👁️', color: '#4a90e2', title: 'Full member transparency',   desc: 'Every member sees the same ledger. No hidden amounts, no hidden members.' },
    { icon: '🔐', color: '#f5a623', title: 'PIN-secured transactions',   desc: 'Five wrong PIN attempts locks the account. All actions require your PIN.' },
    { icon: '📋', color: '#2ed573', title: 'Immutable receipts',         desc: 'Flutterwave webhook is the source of truth. Not a screenshot or a claim.' },
    { icon: '🆘', color: '#9b59b6', title: 'Dispute reporting',          desc: 'Any member can flag a suspicious payment directly inside the pool.' },
  ];
  return (
    <section style={{ padding: '5.5rem 2rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Why trust Qreek</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>The accountability layer Nigeria was missing</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 460, margin: '0 auto', lineHeight: 1.85 }}>Not a new bank. Your community payments, finally with the infrastructure they deserve.</p>
        </Reveal>
        <div className="trust-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}
              style={{ background: 'var(--bg)', padding: '2.25rem 2rem', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.85rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: item.color, marginBottom: '0.45rem' }}>{item.title}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Section ────────────────────────────────────────────────────── */
function PricingSection() {
  const plans = [
    { label: 'Pool contributions', pct: '0.15%', note: 'Per contribution paid by a pool member',    color: '#00d4aa', featured: false },
    { label: 'Payment links',      pct: '0.25%', note: 'Per payment received through your link',    color: '#f5a623', featured: true  },
    { label: 'Payroll runs',       pct: '0.2%',  note: 'Per salary disbursed in a payroll run',     color: '#9b59b6', featured: false },
    { label: 'Monthly fee',        pct: 'None',  note: 'No subscription, no setup, no lock-in',     color: '#2ed573', featured: false },
  ];
  return (
    <section id="pricing" style={{ padding: '5.5rem 2rem', background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>Pay only when money moves.</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 440, margin: '0 auto 3rem', lineHeight: 1.85 }}>The fee is always shown before you confirm. No surprises. Flutterwave processing fees apply separately.</p>
        </Reveal>
        <div className="price-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {plans.map((p, i) => (
            <Reveal key={p.label} delay={i * 60}
              style={{ background: p.featured ? `${p.color}0e` : 'var(--surface)', border: `1px solid ${p.featured ? p.color + '45' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '1.75rem 1.25rem', boxShadow: p.featured ? `0 20px 60px ${p.color}12` : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: p.pct === 'None' ? '1.4rem' : '1.85rem', fontWeight: 900, color: p.color, marginBottom: '0.4rem', lineHeight: 1 }}>{p.pct}</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.38rem' }}>{p.label}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{p.note}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(0,212,170,0.07), transparent 60%)', pointerEvents: 'none' }} />
      <Reveal style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.85rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: '1.25rem', textWrap: 'balance' }}>
          Stop managing money with screenshots.
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: 420, margin: '0 auto 2.5rem', lineHeight: 1.88 }}>
          Join the ajo groups, merchants, and businesses using Qreek to bring transparency to every payment.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          <Link to="/register" style={{ background: '#00d4aa', color: '#000', textDecoration: 'none', fontSize: '1rem', fontWeight: 900, padding: '0.9rem 2.5rem', borderRadius: 999, fontFamily: 'var(--font-display)', boxShadow: '0 8px 32px rgba(0,212,170,0.3)' }}>
            Create your free account
          </Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.9rem 2rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No credit card. No monthly fee. Set up in 2 minutes.</p>
      </Reveal>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 2rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.65rem' }}>
        Qreek<span style={{ color: '#00d4aa' }}>Finance</span>
      </div>
      <p style={{ fontSize: '0.76rem', color: 'var(--text-3)', maxWidth: 560, margin: '0 auto 1.25rem', lineHeight: 1.7 }}>
        All payments processed by Flutterwave Technology Solutions Limited, a CBN-licensed Payment Solution Provider. Qreek Finance does not hold, custody, or transmit funds.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-3)' }}>
        {[['features','Products'],['pricing','Pricing']].map(([id, label]) => (
          <button key={id} onClick={() => goTo(id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>{label}</button>
        ))}
        <Link to="/register" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Sign up</Link>
        <Link to="/login"    style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Log in</Link>
        <a href="mailto:info@qreekfinance.org" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>info@qreekfinance.org</a>
        <span>© 2026 Qreek Finance</span>
      </div>
    </footer>
  );
}

/* ══════════════════════════ LANDING PAGE ════════════════════════════════════ */
export default function Landing() {
  const MODES = [
    { name: 'Communal', icon: '🤝', kicker: 'Groups and circles', color: '#00d4aa', alt: '#4a90e2',
      title: 'Collect together without losing trust in the room.',
      summary: 'For ajo, esusu, church drives, levies, and committee collections where everyone needs to see the same truth at the same time.',
      actions: [{ icon: '👥', title: 'Invite members', copy: 'Create a pool, add admins, share one invite link.' }, { icon: '📣', title: 'Request contributions', copy: 'Send payment requests with amount and due date.' }, { icon: '📊', title: 'Track the ledger', copy: 'See who paid, who is pending, and the running total.' }, { icon: '🧾', title: 'Resolve disputes', copy: 'Receipts and history stay attached to the pool.' }],
      stats: [{ value: '0.15%', label: 'per contribution' }, { value: 'Live', label: 'member ledger' }, { value: 'All', label: 'members visible' }],
      path: ['Create pool', 'Invite', 'Collect', 'Confirm', 'Ledger'],
      nodes: [{ x: 228, y: 118, icon: '🏦', label: 'Pool' }, { x: 88, y: 116, icon: '👤', label: 'Ada' }, { x: 328, y: 68, icon: '👤', label: 'Tunde' }, { x: 346, y: 192, icon: '👤', label: 'Ngozi' }] },
    { name: 'Solo', icon: '⚡', kicker: 'Personal collections', color: '#f5a623', alt: '#00d4aa',
      title: 'Move fast when one person needs to collect cleanly.',
      summary: 'Personal dues, deposits, one-off payments, and small business requests with automatic confirmation and record-keeping.',
      actions: [{ icon: '🔗', title: 'Generate a link', copy: 'Create a branded payment link for any amount.' }, { icon: '💬', title: 'Share anywhere', copy: 'Drop the link into WhatsApp, Instagram, or an invoice.' }, { icon: '✅', title: 'Get confirmation', copy: 'Payment confirmed by Flutterwave and recorded instantly.' }, { icon: '📥', title: 'Keep records', copy: 'Every payer, amount, and receipt stored automatically.' }],
      stats: [{ value: '0.25%', label: 'per payment' }, { value: '2 min', label: 'link setup' }, { value: 'No', label: 'account needed' }],
      path: ['Create link', 'Share', 'Pay', 'Receipt', 'Record'],
      nodes: [{ x: 228, y: 118, icon: '🔗', label: 'Link' }, { x: 88, y: 116, icon: '📱', label: 'Phone' }, { x: 328, y: 68, icon: '💳', label: 'Card' }, { x: 346, y: 192, icon: '🏦', label: 'Bank' }] },
    { name: 'Merchant', icon: '🛍️', kicker: 'Sales and deposits', color: '#2ed573', alt: '#f5a623',
      title: 'Turn everyday selling into organised payment operations.',
      summary: 'For sellers, agencies, and service providers who need command over deposits, repeat clients, and payment proof.',
      actions: [{ icon: '🏷️', title: 'Name each collection', copy: 'Label payments by client, order, or project.' }, { icon: '💸', title: 'Accept all channels', copy: 'Card, transfer, or USSD through Flutterwave checkout.' }, { icon: '🔔', title: 'See alerts instantly', copy: 'Confirmed payments show clear status. No uncertainty.' }, { icon: '📚', title: 'Review history', copy: 'Filter by customer, amount, date, and receipt state.' }],
      stats: [{ value: 'Any', label: 'channel' }, { value: 'Clean', label: 'receipts' }, { value: 'Fast', label: 'follow-up' }],
      path: ['Set purpose', 'Share', 'Confirm', 'Receipt', 'Follow up'],
      nodes: [{ x: 228, y: 118, icon: '🛍️', label: 'Shop' }, { x: 88, y: 116, icon: '🧑', label: 'Client' }, { x: 328, y: 68, icon: '🧾', label: 'Order' }, { x: 346, y: 192, icon: '✅', label: 'Paid' }] },
    { name: 'Enterprise', icon: '💼', kicker: 'Payroll and teams', color: '#9b59b6', alt: '#4a90e2',
      title: 'Run high-volume payouts with approval and evidence.',
      summary: 'For payroll, department reviews, bulk payment runs, and accounting teams that need per-employee status and printable proof.',
      actions: [{ icon: '📄', title: 'Import roster', copy: 'Upload employees, salaries, banks, and departments.' }, { icon: '🛡️', title: 'Approve with PIN', copy: 'Sensitive runs require a secure PIN before money moves.' }, { icon: '🚀', title: 'Disburse in bulk', copy: 'Salary transfers fire in parallel with live status per person.' }, { icon: '🧾', title: 'Export proof', copy: 'Download payroll receipts and run summaries for accounting.' }],
      stats: [{ value: '0.2%', label: 'per run' }, { value: 'Bulk', label: 'disbursement' }, { value: 'Per', label: 'employee status' }],
      path: ['Import', 'Review', 'Approve', 'Disburse', 'Export'],
      nodes: [{ x: 228, y: 118, icon: '💼', label: 'Run' }, { x: 88, y: 116, icon: '👩‍💼', label: 'HR' }, { x: 328, y: 68, icon: '🏢', label: 'Team' }, { x: 346, y: 192, icon: '📋', label: 'Audit' }] },
  ];

  const CASES = [
    { tag: 'Ajo Group',           color: '#00d4aa', title: 'Adaeze market women circle, 20 members',      body: 'Each member contributes ₦10,000 monthly via Flutterwave checkout. The activity feed shows who paid and who is pending. No more arguments, no more screenshots. Fee: ₦15 per contribution.' },
    { tag: 'Merchant',            color: '#f5a623', title: 'Tokunbo, a Lagos fashion designer',             body: 'Shares one Qreek link in her Instagram bio. Clients pay flexible amounts for deposits and custom orders. Every payment confirmed automatically. No account needed to pay.' },
    { tag: 'Church',              color: '#2ed573', title: 'Pastor James building fund committee',          body: 'Creates a Qreek pool for building fund contributions. Members pay from anywhere in Nigeria. The committee sees the running total live. Every naira is accounted for with a receipt.' },
    { tag: 'Enterprise',          color: '#9b59b6', title: 'TechBridge Solutions, 47 employees',            body: 'CFO confirms payroll in 4 minutes. All 47 salary transfers fire in parallel. Each employee gets a bank alert. Printable receipt for accounting. No subscription required.' },
    { tag: 'Student Association', color: '#00d4aa', title: 'UNILAG Engineering, Final Year Levy',           body: 'Collects ₦15,000 project levy from 300 students via a Qreek pool. Members pay from their phones. Committee sees exactly who paid and who is outstanding. No cash-handling.' },
    { tag: 'Small Business',      color: '#f5a623', title: 'Chidi web agency, collecting project deposits',  body: 'Sends a Qreek payment link to each client instead of sharing account numbers. Client pays via card or bank transfer. Instant confirmation and a clean receipt every time.' },
  ];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'clip' }}>
      <style>{GLOBAL_CSS}</style>
      <Nav />
      <HeroSlider />
      <Marquee />
      <ProductShowcase />
      <section id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <ProductSection tag="Payment Pools" headline="Ajo, esusu, and group collections, with a live ledger" body="Create a pool, share the invite code in your WhatsApp group, and request contributions. Every member pays through Flutterwave checkout. The activity feed shows who paid, how much, and when, in real time, visible to all members." fee="0.15% per contribution" cta="Create a pool" to="/register" color="#00d4aa" side="right" MockupComponent={PoolMockup} />
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--bg-2)' }}>
          <ProductSection tag="Payment Links" headline="One link. Card, transfer, or USSD. Automatic records." body="Create a Qreek link in 2 minutes. Share it on WhatsApp or Instagram. Clients open it in the browser, pay through Flutterwave secure checkout, and you get instant confirmation. No bank alert chasing, no manual reconciliation." fee="0.25% per payment" cta="Create a link" to="/register" color="#f5a623" side="left" MockupComponent={LinkMockup} />
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <ProductSection tag="Enterprise Payroll" headline="Pay 500 employees in 4 minutes. 0.2% fee. No subscription." body="Import your employee roster via CSV, review salaries by department, confirm with your PIN, and every salary hits every bank account in parallel. Real-time status per employee. Printable receipt for accounting." fee="0.2% per payroll run" cta="Set up payroll" to="/register" color="#9b59b6" side="right" MockupComponent={PayrollMockup} />
        </div>
      </section>
      <ModeCarousel modes={MODES} />
      <HowItWorks />
      <UseCaseCarousel cases={CASES} />
      <TrustSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
