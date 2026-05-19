import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Global animation keyframes + responsive rules ──────────────────────── */
const GLOBAL_CSS = `
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.85; transform: scale(1.06); }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes modeAura {
    0%   { transform: translate3d(-4%, -2%, 0) scale(1); filter: hue-rotate(0deg); }
    33%  { transform: translate3d(5%, 3%, 0) scale(1.08); filter: hue-rotate(18deg); }
    66%  { transform: translate3d(2%, -4%, 0) scale(0.96); filter: hue-rotate(-14deg); }
    100% { transform: translate3d(-4%, -2%, 0) scale(1); filter: hue-rotate(0deg); }
  }
  @keyframes modeSweep {
    0%   { transform: translateX(-110%) rotate(8deg); opacity: 0; }
    18%  { opacity: 0.55; }
    55%  { opacity: 0.25; }
    100% { transform: translateX(110%) rotate(8deg); opacity: 0; }
  }
  @keyframes modeTrace {
    0%, 100% { stroke-dashoffset: 120; opacity: 0.25; }
    50%      { stroke-dashoffset: 0; opacity: 0.85; }
  }
  html { scroll-behavior: smooth; }

  /* Mobile layout fixes — all buttons visible on every screen */
  @media (max-width: 640px) {
    .hero-ctas          { flex-direction: column !important; width: 100% !important; }
    .hero-ctas a,
    .hero-ctas button   { width: 100% !important; text-align: center !important; }
    .pillars            { flex-direction: column !important; }
    .cases-grid         { grid-template-columns: 1fr !important; }
    .trust-grid         { grid-template-columns: 1fr !important; }
    .price-grid         { grid-template-columns: 1fr 1fr !important; }
    .modes-shell        { grid-template-columns: 1fr !important; }
    .modes-panel        { min-height: 420px !important; }
    .mode-action-grid   { grid-template-columns: 1fr !important; }
    .mode-tabs          { grid-template-columns: 1fr 1fr !important; }
    .cta-btns           { flex-direction: column !important; align-items: center !important; }
    .cta-btns a         { width: 100% !important; max-width: 360px; text-align: center; }
    .fee-pills          { justify-content: center !important; }
    .trust-strip        { gap: 0.75rem !important; }
  }
  @media (max-width: 360px) {
    .price-grid         { grid-template-columns: 1fr !important; }
  }

  /* Desktop nav links hidden on mobile */
  .desktop-nav { display: flex; }
  @media (max-width: 768px) { .desktop-nav { display: none !important; } }
  .mobile-menu-btn { display: none; }
  @media (max-width: 768px) { .mobile-menu-btn { display: flex !important; } }
`;

/* ─── Smooth scroll — no # in URL ───────────────────────────────────────── */
function goTo(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── NAV ────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const sections = [
    ['modes',        'Modes'],
    ['features',     'Features'],
    ['how-it-works', 'How it works'],
    ['use-cases',    'Use cases'],
    ['pricing',      'Pricing'],
  ];

  const navBtnStyle = {
    background: 'none', border: 'none',
    color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font-display)',
    padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)',
    transition: 'color 0.15s',
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background:  scrolled ? 'rgba(6,14,26,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom:   scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 1.5rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button onClick={() => goTo('hero')} style={{ ...navBtnStyle, color: 'var(--text)', fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.01em', padding: '0.4rem 0' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
        </button>

        {/* Desktop section links */}
        <div className="desktop-nav" style={{ gap: '0.15rem' }}>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => goTo(id)} style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}>
              {label}
            </button>
          ))}
        </div>

        {/* Auth + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/login" className="desktop-nav" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>
            Sign in
          </Link>
          <Link to="/register" style={{ background: 'var(--teal)', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: 'var(--radius)', whiteSpace: 'nowrap' }}>
            Get started free
          </Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', flexDirection: 'column', gap: '5px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--text-2)', borderRadius: 2 }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 190,
          background: 'rgba(10,22,40,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.2rem',
        }}>
          {sections.map(([id, label]) => (
            <button key={id} onClick={() => { goTo(id); setMenuOpen(false); }}
              style={{ ...navBtnStyle, textAlign: 'left', padding: '0.75rem 0.6rem', fontSize: '1rem', color: 'var(--text-2)' }}>
              {label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)}
              style={{ flex: 1, textAlign: 'center', color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, padding: '0.65rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              Sign in
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              style={{ flex: 1, textAlign: 'center', background: 'var(--teal)', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, padding: '0.65rem', borderRadius: 'var(--radius)' }}>
              Get started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Animated Pillar Card ───────────────────────────────────────────────── */
function PillarCard({ icon, tag, title, desc, fee, cta, to, color, g1, g2 }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', flex: '1 1 260px', maxWidth: 380,
        background: 'var(--surface)',
        border: `1px solid ${hov ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        transform: hov ? 'translateY(-6px)' : 'none',
        boxShadow: hov ? `0 20px 60px ${color}28` : '0 4px 24px rgba(0,0,0,0.25)',
        cursor: 'default',
      }}>
      {/* Animated gradient bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${g1}20, ${g2}08, transparent)`,
        backgroundSize: '200% 200%',
        animation: hov ? 'gradientShift 3s ease infinite' : 'none',
        opacity: hov ? 1 : 0, transition: 'opacity 0.35s',
        borderRadius: 'inherit', pointerEvents: 'none',
      }} />
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -32, right: -32, width: 130, height: 130,
        borderRadius: '50%', background: color, filter: 'blur(44px)',
        opacity: hov ? 0.28 : 0.07,
        transition: 'opacity 0.4s',
        animation: hov ? 'pulseGlow 3s ease infinite' : 'none',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{ fontSize: '2.2rem', position: 'relative', display: 'inline-block', animation: hov ? 'floatUp 2s ease infinite' : 'none' }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color, marginBottom: '0.5rem' }}>{tag}</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: '0.87rem', color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>{desc}</p>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: `1px solid ${hov ? color + '40' : 'var(--border)'}`, transition: 'border-color 0.3s' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color, fontWeight: 700 }}>{fee}</span>
        <Link to={to} style={{ fontSize: '0.82rem', fontWeight: 700, color, textDecoration: 'none', background: `${color}14`, border: `1px solid ${color}38`, borderRadius: 'var(--radius)', padding: '0.4rem 0.85rem' }}>
          {cta} →
        </Link>
      </div>
    </div>
  );
}

/* ─── Trust feature card with top-border reveal + bg fill ────────────────── */
function TrustCard({ icon, title, desc, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '1.4rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 10px 36px ${color}1e` : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
      {/* Tinted top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: hov ? 1 : 0, transition: 'opacity 0.25s' }} />
      {/* Subtle tinted fill */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}07, transparent)`, opacity: hov ? 1 : 0, transition: 'opacity 0.25s', pointerEvents: 'none' }} />
      <div style={{ fontSize: '1.5rem', position: 'relative' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: hov ? color : 'var(--text)', transition: 'color 0.25s', position: 'relative' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.65, position: 'relative' }}>{desc}</div>
    </div>
  );
}

/* ─── Use-case card ──────────────────────────────────────────────────────── */
function UseCase({ tag, color, title, body }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 10px 36px ${color}1a` : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}07, transparent)`, opacity: hov ? 1 : 0, transition: 'opacity 0.25s', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', background: `${color}18`, color, borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{tag}</div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{title}</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

/* ─── Price box with hover lift + gradient text ───────────────────────────── */
function PriceBox({ label, pct, note, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${hov ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-5px) scale(1.02)' : 'none',
        boxShadow: hov ? `0 12px 40px ${color}20` : 'none',
      }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: pct === 'Free' ? '1.35rem' : '1.75rem', fontWeight: 800, color, marginBottom: '0.35rem' }}>{pct}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

/* ─── How-it-works step ──────────────────────────────────────────────────── */
function Step({ n, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))', color: 'var(--text-inv)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0, fontFamily: 'var(--font-mono)', boxShadow: '0 4px 16px rgba(0,212,170,0.3)' }}>{n}</div>
      <div style={{ paddingTop: '0.2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{title}</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SL({ children, color = 'var(--teal)' }) {
  return <div style={{ fontSize: '0.73rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color, marginBottom: '0.75rem' }}>{children}</div>;
}

function ModeAction({ action }) {
  return (
    <div style={{
      background: 'rgba(6,14,26,0.42)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius)',
      padding: '0.9rem',
      minHeight: 104,
    }}>
      <div style={{ fontSize: '1.3rem', marginBottom: '0.45rem' }}>{action.icon}</div>
      <div style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '0.25rem' }}>{action.title}</div>
      <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.78rem', lineHeight: 1.55 }}>{action.copy}</p>
    </div>
  );
}

function ModeShowcase({ modes }) {
  const [active, setActive] = useState(0);
  const mode = modes[active];

  return (
    <section id="modes" style={{ padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{
        position: 'absolute',
        inset: '-20% -10%',
        background: `radial-gradient(circle at 18% 24%, ${mode.color}22, transparent 28%), radial-gradient(circle at 82% 20%, ${mode.alt}1f, transparent 26%), radial-gradient(circle at 50% 86%, rgba(46,213,115,0.13), transparent 30%)`,
        animation: 'modeAura 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <SL color={mode.color}>Modes of operation</SL>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: '0.8rem' }}>
            One payment layer, tuned to how people collect
          </h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 650, margin: '0 auto', lineHeight: 1.8, fontSize: '1rem' }}>
            Switch between communal, solo, merchant, and enterprise workflows. The interface changes emphasis, but the promise stays the same: clear actions, visible records, and confirmed payments.
          </p>
        </div>

        <div className="mode-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {modes.map((m, i) => {
            const selected = i === active;
            return (
              <button
                key={m.name}
                onClick={() => setActive(i)}
                style={{
                  background: selected ? `${m.color}18` : 'rgba(15,30,53,0.72)',
                  color: selected ? m.color : 'var(--text-2)',
                  border: `1px solid ${selected ? m.color + '80' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '0.8rem 0.9rem',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: selected ? `0 12px 38px ${m.color}22` : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        <div className="modes-shell" style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}>
          <div className="modes-panel" style={{
            minHeight: 500,
            borderRadius: 'var(--radius-xl)',
            border: `1px solid ${mode.color}55`,
            background: 'linear-gradient(145deg, rgba(15,30,53,0.94), rgba(6,14,26,0.96))',
            boxShadow: `0 30px 90px ${mode.color}18`,
            position: 'relative',
            overflow: 'hidden',
            padding: '1.4rem',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, transparent 20%, ${mode.color}18 45%, transparent 68%)`, animation: 'modeSweep 6s ease-in-out infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 26% 28%, ${mode.color}22, transparent 30%), radial-gradient(circle at 78% 72%, ${mode.alt}20, transparent 34%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <div>
                <div style={{ color: mode.color, fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{mode.kicker}</div>
                <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, margin: 0 }}>{mode.name} mode</h3>
              </div>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: `${mode.color}18`, border: `1px solid ${mode.color}70`, display: 'grid', placeItems: 'center', fontSize: '1.7rem', boxShadow: `0 0 36px ${mode.color}22` }}>
                {mode.icon}
              </div>
            </div>

            <div style={{ position: 'relative', minHeight: 250, display: 'grid', placeItems: 'center', margin: '1rem 0 1.35rem' }}>
              <svg viewBox="0 0 460 260" style={{ width: '100%', maxWidth: 520, height: 'auto', overflow: 'visible' }} aria-hidden="true">
                <defs>
                  <linearGradient id={`modeGradient-${mode.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={mode.color} />
                    <stop offset="55%" stopColor={mode.alt} />
                    <stop offset="100%" stopColor="#2ed573" />
                  </linearGradient>
                  <filter id={`modeGlow-${mode.name}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M82 128 C128 38, 238 42, 290 95 S392 194, 330 222 S154 232, 96 178 S35 160, 82 128" fill="none" stroke={`url(#modeGradient-${mode.name})`} strokeWidth="2.5" strokeDasharray="12 10" style={{ animation: 'modeTrace 5s ease-in-out infinite' }} />
                {[mode.nodes[0], mode.nodes[1], mode.nodes[2], mode.nodes[3]].map((node, i) => (
                  <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
                    <circle r={i === 0 ? 43 : 31} fill="rgba(6,14,26,0.9)" stroke={i === 0 ? mode.color : 'rgba(255,255,255,0.18)'} strokeWidth="2" filter={`url(#modeGlow-${mode.name})`} />
                    <text y="-2" textAnchor="middle" fontSize={i === 0 ? 25 : 18}>{node.icon}</text>
                    <text y={i === 0 ? 22 : 18} textAnchor="middle" fontSize="10" fill="#8ba4c0" fontWeight="700">{node.label}</text>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              {mode.stats.map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: mode.color, fontWeight: 900, fontSize: '0.98rem' }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(15,30,53,0.72)',
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 18px 60px rgba(0,0,0,0.24)',
          }}>
            <div>
              <div style={{ color: mode.color, fontWeight: 900, fontSize: '0.76rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>What users do here</div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', lineHeight: 1.2 }}>{mode.title}</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.92rem', margin: 0 }}>{mode.summary}</p>
            </div>

            <div className="mode-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {mode.actions.map(action => <ModeAction key={action.title} action={action} />)}
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.55rem' }}>Live operation path</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {mode.path.map((step, i) => (
                  <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: i === mode.path.length - 1 ? mode.color : 'var(--text-2)', background: i === mode.path.length - 1 ? `${mode.color}14` : 'rgba(255,255,255,0.045)', border: `1px solid ${i === mode.path.length - 1 ? mode.color + '50' : 'rgba(255,255,255,0.08)'}`, borderRadius: 'var(--radius-full)', padding: '0.35rem 0.7rem', fontSize: '0.75rem', fontWeight: 800 }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════ MAIN PAGE ════════════════════════════════ */
export default function Landing() {
  const C   = { textAlign: 'center' };
  const H2  = { fontSize: 'clamp(1.7rem, 4vw, 2.55rem)', fontWeight: 900, letterSpacing: '-0.015em', lineHeight: 1.1 };
  const SEC = (extra = {}) => ({ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem', ...extra });

  const PILLARS = [
    { icon: '🏦', tag: 'Payment Pools',    color: 'var(--teal)',   g1: '#00D4AA', g2: '#00ffca', fee: '0.30% per contribution', cta: 'Create a pool',    title: 'Ajo, esusu, and group collections — with a live ledger',          desc: 'Create a pool, share the invite code in your WhatsApp group, and request contributions. Every member pays through Monnify checkout. The activity feed shows who paid, how much, and when — in real time, visible to all members.' },
    { icon: '🔗', tag: 'Payment Links',    color: 'var(--amber)',  g1: '#F5A623', g2: '#FFD700', fee: '0.40% per payment',      cta: 'Create a link',    title: 'One link. Card, transfer, or USSD. Automatic records.',           desc: 'Create a Qreek link in 2 minutes. Share it on WhatsApp or Instagram. Clients open it in the browser, pay through Monnify secure checkout, and you get instant confirmation — no bank alert chasing.' },
    { icon: '💼', tag: 'Enterprise Payroll', color: 'var(--purple)', g1: '#9B59B6', g2: '#6C3483', fee: '0.30% per payroll run',  cta: 'Set up payroll',   title: 'Pay 500 employees in 4 minutes. 0.3% fee. No subscription.',      desc: 'Import your employee roster via CSV, review salaries by department, confirm with your PIN, and every salary hits every bank account in parallel. Real-time status per employee. Printable receipt for accounting.' },
  ];

  const TRUST = [
    { icon: '🏛️', color: 'var(--teal)',   title: 'CBN-licensed processing',   desc: 'All payments processed by Monnify, a CBN-licensed PSP and Moniepoint company. Qreek operates as their merchant — not a separate payment institution.' },
    { icon: '🚫', color: 'var(--red)',    title: 'Zero fund custody',          desc: 'Qreek never touches your money. Naira flows from payer bank to recipient bank. Qreek records the event — that is its only role.' },
    { icon: '👁️', color: 'var(--blue)',   title: 'Full member transparency',   desc: 'Every pool member sees the complete activity feed — every payment, every request, every receipt. Nothing is hidden from the group.' },
    { icon: '🔐', color: 'var(--amber)',  title: 'PIN-secured transactions',   desc: 'All financial actions require your personal PIN. Five wrong attempts locks the account automatically. Your money is protected even if your phone is stolen.' },
    { icon: '📋', color: 'var(--green)',  title: 'Immutable receipts',         desc: 'Every confirmed payment generates an automatic receipt for payer and recipient. Monnify webhook confirmation is the source of truth — not a screenshot.' },
    { icon: '🆘', color: 'var(--purple)', title: 'Dispute reporting built in', desc: 'Any pool member can flag a suspicious payment directly in the app. Support responds within 24 hours. Admins cannot act unilaterally on large sums.' },
  ];

  const CASES = [
    { tag: 'Ajo Group',         color: 'var(--teal)',   title: 'Adaeze market women circle — 20 members',       body: 'Each member contributes 10,000 monthly via Monnify checkout. The activity feed shows who paid and who has not — no more arguments, no more screenshots. Fee: 30 per contribution.' },
    { tag: 'Merchant',          color: 'var(--amber)',  title: 'Tokunbo, a Lagos fashion designer',              body: 'Shares one Qreek link in her Instagram bio. Clients pay flexible amounts for deposits and custom orders. She sees every payment confirmed automatically — no bank alert chasing.' },
    { tag: 'Church',            color: 'var(--green)',  title: 'Pastor James building fund committee',           body: 'Creates a Qreek pool for building fund contributions. Members pay from anywhere. The committee sees the running total live. Every naira is accounted for.' },
    { tag: 'Enterprise',        color: 'var(--purple)', title: 'TechBridge Solutions — 47 employees',            body: 'CFO confirms payroll in 4 minutes. All 47 salary transfers fire in parallel. Each employee gets a bank alert. Printable receipt for accounting. Total fee: 61,200. No monthly subscription.' },
    { tag: 'Student Association',color:'var(--teal)',   title: 'UNILAG Engineering — Final Year Levy',           body: 'Collects 15,000 project levy from 300 students via a Qreek pool. Members pay from their phones. The committee sees exactly who has paid and who is outstanding.' },
    { tag: 'Small Business',    color: 'var(--amber)',  title: 'Chidi web agency — collecting project deposits', body: 'Sends a Qreek payment link to each client instead of sharing account numbers. Client pays via card or bank transfer. Chidi gets instant confirmation and a clean receipt.' },
  ];

  const MODES = [
    {
      name: 'Communal',
      icon: '🤝',
      kicker: 'Groups and circles',
      color: '#00d4aa',
      alt: '#4a90e2',
      title: 'Collect together without losing trust in the room.',
      summary: 'Communal mode is for ajo, esusu, church drives, levies, and committee collections where everyone needs to see the same truth at the same time.',
      actions: [
        { icon: '👥', title: 'Invite members', copy: 'Create a pool, add admins, and share one invite link with the whole group.' },
        { icon: '📣', title: 'Request contributions', copy: 'Send payment requests with amount, purpose, due date, and reminders.' },
        { icon: '📊', title: 'Track the ledger', copy: 'See who has paid, who is pending, and the running total without screenshots.' },
        { icon: '🧾', title: 'Resolve disputes', copy: 'Receipts, activity history, and flagged issues stay attached to the pool.' },
      ],
      stats: [
        { value: '0.30%', label: 'per contribution' },
        { value: 'Live', label: 'member ledger' },
        { value: 'All', label: 'members visible' },
      ],
      path: ['Create pool', 'Invite members', 'Collect', 'Confirm', 'Share ledger'],
      nodes: [
        { x: 230, y: 125, icon: '🏦', label: 'Pool' },
        { x: 92, y: 122, icon: '👤', label: 'Ada' },
        { x: 330, y: 72, icon: '👤', label: 'Tunde' },
        { x: 350, y: 200, icon: '👤', label: 'Ngozi' },
      ],
    },
    {
      name: 'Solo',
      icon: '⚡',
      kicker: 'Personal collections',
      color: '#f5a623',
      alt: '#00d4aa',
      title: 'Move fast when one person needs to collect cleanly.',
      summary: 'Solo mode keeps individual collections sharp: personal dues, deposits, one-off payments, and small business requests with automatic confirmation.',
      actions: [
        { icon: '🔗', title: 'Generate a link', copy: 'Create a branded payment link for any amount or leave it flexible.' },
        { icon: '💬', title: 'Share anywhere', copy: 'Drop the link into WhatsApp, Instagram, email, or an invoice.' },
        { icon: '✅', title: 'Get confirmation', copy: 'The payment is confirmed by Monnify and recorded instantly in Qreek.' },
        { icon: '📥', title: 'Keep records', copy: 'Every payer, amount, purpose, and receipt is stored for follow-up.' },
      ],
      stats: [
        { value: '0.40%', label: 'per payment' },
        { value: '2 min', label: 'link setup' },
        { value: 'No', label: 'account needed' },
      ],
      path: ['Create link', 'Share', 'Customer pays', 'Receipt', 'Record'],
      nodes: [
        { x: 230, y: 125, icon: '🔗', label: 'Link' },
        { x: 92, y: 122, icon: '📱', label: 'Phone' },
        { x: 330, y: 72, icon: '💳', label: 'Card' },
        { x: 350, y: 200, icon: '🏦', label: 'Bank' },
      ],
    },
    {
      name: 'Merchant',
      icon: '🛍️',
      kicker: 'Sales and deposits',
      color: '#2ed573',
      alt: '#f5a623',
      title: 'Turn everyday selling into organized payment operations.',
      summary: 'Merchant mode gives sellers, agencies, and service providers a lightweight command center for deposits, balances, repeat clients, and payment proof.',
      actions: [
        { icon: '🏷️', title: 'Name each collection', copy: 'Label payments by client, order, event, project, or invoice purpose.' },
        { icon: '💸', title: 'Accept channels', copy: 'Customers can pay by card, transfer, or USSD through secure checkout.' },
        { icon: '🔔', title: 'See alerts', copy: 'Confirmed payments show up with clear status instead of uncertain bank alerts.' },
        { icon: '📚', title: 'Review history', copy: 'Filter collections by customer, amount, date, and receipt state.' },
      ],
      stats: [
        { value: 'Any', label: 'customer channel' },
        { value: 'Clean', label: 'receipts' },
        { value: 'Fast', label: 'follow-up' },
      ],
      path: ['Set purpose', 'Share checkout', 'Confirm', 'Receipt', 'Follow up'],
      nodes: [
        { x: 230, y: 125, icon: '🛍️', label: 'Shop' },
        { x: 92, y: 122, icon: '🧑', label: 'Client' },
        { x: 330, y: 72, icon: '🧾', label: 'Order' },
        { x: 350, y: 200, icon: '✅', label: 'Paid' },
      ],
    },
    {
      name: 'Enterprise',
      icon: '💼',
      kicker: 'Payroll and teams',
      color: '#9b59b6',
      alt: '#4a90e2',
      title: 'Run high-volume payouts with approval and evidence.',
      summary: 'Enterprise mode is built for payroll, department reviews, bulk payment runs, and accounting teams that need status per employee and printable proof.',
      actions: [
        { icon: '📄', title: 'Import roster', copy: 'Upload employees, salaries, banks, departments, and payment references.' },
        { icon: '🛡️', title: 'Approve with PIN', copy: 'Sensitive runs require a secure confirmation step before money moves.' },
        { icon: '🚀', title: 'Disburse in bulk', copy: 'Salary transfers are submitted in parallel with per-person status updates.' },
        { icon: '🧾', title: 'Export proof', copy: 'Download payroll receipts and run summaries for accounting records.' },
      ],
      stats: [
        { value: '0.30%', label: 'per run' },
        { value: 'Bulk', label: 'disbursement' },
        { value: 'Per', label: 'employee status' },
      ],
      path: ['Import', 'Review', 'PIN approve', 'Disburse', 'Export'],
      nodes: [
        { x: 230, y: 125, icon: '💼', label: 'Run' },
        { x: 92, y: 122, icon: '👩‍💼', label: 'HR' },
        { x: 330, y: 72, icon: '🏢', label: 'Team' },
        { x: 350, y: 200, icon: '📋', label: 'Audit' },
      ],
    },
  ];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{GLOBAL_CSS}</style>
      <Nav />

      {/* ════════ HERO ════════ */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 4rem', ...C, position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '12%', left: '8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.09), transparent)', pointerEvents: 'none', animation: 'pulseGlow 7s ease infinite' }} />
        <div style={{ position: 'absolute', bottom: '8%', right: '4%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07), transparent)', pointerEvents: 'none', animation: 'pulseGlow 9s ease infinite 2s' }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '2.5rem', letterSpacing: '0.06em', position: 'relative' }}>
          🇳🇬 THE TRUST INFRASTRUCTURE FOR NIGERIAN PAYMENTS
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.03, marginBottom: '1.5rem', maxWidth: 860, letterSpacing: '-0.025em', position: 'relative' }}>
          Stop chasing bank alerts.<br />
          <span style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #00ffca 50%, var(--teal) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }}>
            See who paid.
          </span>{' '}Instantly.
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-2)', maxWidth: 600, lineHeight: 1.85, marginBottom: '2.5rem', position: 'relative' }}>
          Qreek gives your ajo group, your business, and your team a transparent payment ledger —
          no more screenshots, no more disputes. Powered by Monnify.{' '}
          <strong style={{ color: 'var(--text)' }}>Qreek never holds your funds.</strong>
        </p>

        {/* CTA buttons — always visible on all screens */}
        <div className="hero-ctas" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', width: '100%', maxWidth: 440 }}>
          <Link to="/register" style={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '1rem', fontWeight: 800, padding: '0.9rem 1.5rem', borderRadius: 'var(--radius)', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,212,170,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Start free — no monthly fees
          </Link>
          <button onClick={() => goTo('features')} style={{ flex: 1, minWidth: 160, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem', fontWeight: 600, padding: '0.9rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
            Explore features
          </button>
        </div>

        {/* Trust strip */}
        <div className="trust-strip" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0.8rem 1.25rem', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.14)', borderRadius: 'var(--radius)', marginBottom: '2rem', maxWidth: 780 }}>
          {[['🔒','Monnify (CBN-licensed) processes all payments'],['🏦','Funds go bank-to-bank directly'],['✅','Qreek never holds your money'],['📋','Every naira tracked']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.77rem', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        {/* Fee pills */}
        <div className="fee-pills" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          {[['Pool contributions','0.30%','var(--teal)'],['Payment links','0.40%','var(--amber)'],['Payroll','0.30%','var(--purple)'],['No monthly fee','Ever','var(--green)']].map(([label, fee, col]) => (
            <div key={label} style={{ background: 'var(--surface)', border: `1px solid ${col}40`, borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem', fontSize: '0.78rem', color: 'var(--text-2)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: col }}>{fee}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <ModeShowcase modes={MODES} />

      {/* ════════ FEATURES / THREE PILLARS ════════ */}
      <section id="features" style={SEC()}>
        <div style={{ ...C, marginBottom: '3rem' }}>
          <SL>Three products. One platform.</SL>
          <h2 style={H2}>Built for how Nigeria moves money</h2>
        </div>
        <div className="pillars" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PILLARS.map(p => <PillarCard key={p.tag} {...p} />)}
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ ...C, marginBottom: '3rem' }}>
            <SL>How it works</SL>
            <h2 style={H2}>Simple. Transparent. Trusted.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
            <Step n="01" title="Create a pool or link in 2 minutes" desc="Sign up with your phone number. Create a payment pool for your group, or a payment link for your clients. No forms, no bank visit, no approvals needed." />
            <Step n="02" title="Share — your people pay in their browser" desc="Group members or clients open the link on any device. They pay using card, bank transfer, or USSD through Monnify secure checkout. No Qreek account needed to pay." />
            <Step n="03" title="Qreek records it. Everyone sees it." desc="The moment Monnify confirms the payment, Qreek updates your ledger in real time. Payer gets a receipt. Pool shows who paid. Funds settle from Monnify directly to the recipient bank." />
          </div>

          {/* Custody disclaimer card */}
          <div style={{ marginTop: '3rem', background: 'var(--surface)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', boxShadow: '0 0 40px rgba(0,212,170,0.07)' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>🔐</div>
            <div>
              <div style={{ fontWeight: 800, marginBottom: '0.4rem', color: 'var(--teal)', fontSize: '1rem' }}>Qreek never holds your money</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
                Every naira paid through Qreek is processed by <strong style={{ color: 'var(--text)' }}>Monnify</strong> — a CBN-licensed Payment Solution Provider (a Moniepoint company). Funds flow directly from payer bank to recipient bank. Qreek is never in the middle of your money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ USE CASES ════════ */}
      <section id="use-cases" style={SEC()}>
        <div style={{ ...C, marginBottom: '3rem' }}>
          <SL color="var(--amber)">Who uses Qreek</SL>
          <h2 style={H2}>Built for the way Nigeria actually pays</h2>
        </div>
        <div className="cases-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {CASES.map(c => <UseCase key={c.tag + c.title} {...c} />)}
        </div>
      </section>

      {/* ════════ TRUST SIGNALS ════════ */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', ...C }}>
          <SL>Why trust Qreek</SL>
          <h2 style={{ ...H2, marginBottom: '0.75rem' }}>The accountability layer Nigeria was missing</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 3rem', lineHeight: 1.8 }}>
            Not a new bank. Your community payments, finally with the infrastructure they deserve.
          </p>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.1rem', textAlign: 'left' }}>
            {TRUST.map(t => <TrustCard key={t.title} {...t} />)}
          </div>
        </div>
      </section>

      {/* ════════ PRICING ════════ */}
      <section id="pricing" style={SEC({ ...C })}>
        <SL>Pricing</SL>
        <h2 style={{ ...H2, marginBottom: '0.75rem' }}>The most affordable transparent rates in Nigeria</h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.8, fontSize: '1rem' }}>
          No monthly fees. No setup costs. You only pay when money moves — and the fee is always shown before you confirm.
        </p>
        <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '1.1rem', maxWidth: 860, margin: '0 auto 1.5rem' }}>
          <PriceBox label="Pool contributions" pct="0.30%" color="var(--teal)"   note="Per contribution paid by pool member" />
          <PriceBox label="Payment links"      pct="0.40%" color="var(--amber)"  note="Per payment received through your link" />
          <PriceBox label="Enterprise payroll" pct="0.30%" color="var(--purple)" note="Per salary disbursed in a payroll run" />
          <PriceBox label="No monthly fee"     pct="Free"  color="var(--green)"  note="No subscription, no setup, no withdrawal fee" />
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', maxWidth: 600, margin: '0 auto' }}>
          All payments processed by Monnify. Monnify processing fees apply separately. Bank transfer payments are typically ₦10–₦30 flat — the most affordable option for your group.
        </p>
      </section>

      {/* ════════ CTA ════════ */}
      <section style={{ padding: '6rem 1.5rem', ...C, background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(245,166,35,0.04) 100%)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.05), transparent)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'pulseGlow 9s ease infinite' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Stop managing money with screenshots.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Join the ajo groups, merchants, and businesses using Qreek to bring transparency to every payment.
          </p>
          <div className="cta-btns" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '1.05rem', fontWeight: 800, padding: '0.95rem 2.5rem', borderRadius: 'var(--radius)', boxShadow: '0 8px 32px rgba(0,212,170,0.28)' }}>
              Create your free account →
            </Link>
            <Link to="/login" style={{ background: 'var(--surface-2)', color: 'var(--text)', textDecoration: 'none', fontSize: '1.05rem', fontWeight: 600, padding: '0.95rem 2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              Sign in
            </Link>
          </div>
          <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-3)' }}>No credit card. No monthly fee. Set up in 2 minutes.</p>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '2.5rem 1.5rem', ...C }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.75rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', maxWidth: 600, margin: '0 auto 1.25rem', lineHeight: 1.7 }}>
          All payments processed by Monnify (TeamApt Ltd), a CBN-licensed Payment Solution Provider. Qreek Finance does not hold, custody, or transmit funds.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-3)' }}>
          <button onClick={() => goTo('features')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>Features</button>
          <button onClick={() => goTo('pricing')}  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>Pricing</button>
          <Link to="/register" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Sign up</Link>
          <Link to="/login"    style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Log in</Link>
          <span>support@qreekfinance.org</span>
          <span>© 2026 Qreek Finance</span>
        </div>
      </footer>
    </div>
  );
}
