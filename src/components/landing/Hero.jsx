import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bank, Link as LinkIcon, Briefcase, PlayCircle, ArrowRight } from 'phosphor-react';
import Photo, { Avatar } from './Photo';
import { goTo, prefersReducedMotion } from './landingCss';
import PoolMockup from './mockups/PoolMockup';
import LinkMockup from './mockups/LinkMockup';
import PayrollMockup from './mockups/PayrollMockup';

const SLIDES = [
  {
    tag: 'Payment Pools',
    lines: ['Your ajo group,', 'now with a', 'live ledger.'],
    sub: 'Every member sees every naira. Who paid, how much, and when. Powered by Flutterwave.',
    cta: 'Create a pool',
    accent: '#00d4aa',
    slot: 'heroPool',
    Mockup: PoolMockup,
  },
  {
    tag: 'Payment Links',
    lines: ['One link.', 'Any payment.', 'Instant receipt.'],
    sub: 'Create a link in 2 minutes. Clients pay via card, transfer, or USSD. No Qreek account needed.',
    cta: 'Create a link',
    accent: '#f5a623',
    slot: 'heroLink',
    Mockup: LinkMockup,
  },
  {
    tag: 'Enterprise Payroll',
    lines: ['500 salaries.', '4 minutes.', 'No subscription.'],
    sub: 'Import your team, approve with your PIN, and every salary hits every bank account in parallel.',
    cta: 'Set up payroll',
    accent: '#9b59b6',
    slot: 'heroPayroll',
    Mockup: PayrollMockup,
  },
];

const CATEGORIES = [
  { Icon: Bank,      slot: 'railPools',   label: 'Payment Pools',     fee: '0.15% per contribution', color: '#00d4aa', cls: '' },
  { Icon: LinkIcon,  slot: 'railLinks',   label: 'Payment Links',     fee: '0.25% per payment',      color: '#f5a623', cls: 'hero-cat-mid' },
  { Icon: Briefcase, slot: 'railPayroll', label: 'Enterprise Payroll', fee: '0.2% per payroll run',  color: '#9b59b6', cls: 'hero-cat-last' },
];

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const [vis, setVis] = useState(true);
  const timer = useRef(null);

  const go = useCallback((idx) => {
    const n = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setVis(false);
    setTimeout(() => { setSlide(n); setVis(true); }, 320);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    timer.current = setTimeout(() => go(slide + 1), 7500);
    return () => clearTimeout(timer.current);
  }, [slide, go]);

  const s = SLIDES[slide];
  const M = s.Mockup;

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Full-bleed photography, one layer per slide, cross-faded */}
      {SLIDES.map((sl, i) => (
        <Photo
          key={sl.slot}
          slot={sl.slot}
          ratio="auto"
          scrim="hero"
          accent={sl.accent}
          eager={i === 0}
          sizes="100vw"
          aria-hidden={i !== slide}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 1.1s ease',
          }}
        />
      ))}

      {/* Grid overlay, kept from the original hero */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }} aria-hidden>
        <defs>
          <pattern id="hgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hgrid)" />
      </svg>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 5vw', paddingTop: 80, paddingBottom: 16, position: 'relative', zIndex: 2 }}>
        <div className="hero-layout" style={{ width: '100%', maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>

          <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: `${s.accent}1f`, border: `1px solid ${s.accent}45`, backdropFilter: 'blur(8px)', borderRadius: 999, padding: '0.3rem 0.9rem', fontSize: '0.7rem', fontWeight: 800, color: s.accent, marginBottom: '1.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              {s.tag}
            </div>

            <h1 style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.035em', color: 'var(--text)', marginBottom: '1.4rem', fontFamily: 'var(--font-display)', textAlign: 'left', textShadow: '0 2px 24px rgba(6,14,26,0.8)' }}>
              {s.lines[0]}<br />{s.lines[1]}<br />
              <span style={{ color: s.accent }}>{s.lines[2]}</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.88, maxWidth: 460, marginBottom: '2rem', textAlign: 'left', textShadow: '0 1px 12px rgba(6,14,26,0.9)' }}>
              {s.sub}
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: s.accent, color: '#000', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 900, padding: '0.82rem 2.1rem', borderRadius: 999, fontFamily: 'var(--font-display)', boxShadow: `0 8px 28px ${s.accent}45`, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {s.cta} <ArrowRight size={17} weight="bold" aria-hidden />
              </Link>
              <button onClick={() => goTo('how-it-works')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlayCircle size={20} aria-hidden /> See how it works
              </button>
            </div>
          </div>

          {/* Product UI, floated over the photograph */}
          <div className="hero-mockup" style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateX(14px)', transition: 'opacity 0.45s 0.1s ease, transform 0.45s 0.1s ease', filter: 'drop-shadow(0 40px 90px rgba(0,0,0,0.55))' }}>
            <M />
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div style={{ padding: '0.75rem 5vw 1.1rem', position: 'relative', zIndex: 3, display: 'flex', gap: '0.4rem' }}>
        {SLIDES.map((sl, i) => (
          <button key={sl.slot} onClick={() => { clearTimeout(timer.current); go(i); }}
            aria-label={`Show ${sl.tag}`}
            style={{ width: i === slide ? 28 : 7, height: 4, borderRadius: 99, background: i === slide ? s.accent : 'rgba(255,255,255,0.28)', border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', padding: 0 }} />
        ))}
      </div>

      {/* Category strip */}
      <div className="hero-cats" style={{ position: 'relative', zIndex: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        {CATEGORIES.map(({ Icon, slot, label, fee, color, cls }, i) => (
          <button key={label} className={cls} onClick={() => goTo('features')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.75rem', background: 'rgba(6,14,26,0.62)', backdropFilter: 'blur(22px)', border: 'none', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.09)' : 'none', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,14,26,0.62)'}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar slot={slot} size={46} radius={10} accent={color} />
              {/* Icon badge on the corner rather than a full cover, so the
                  thumbnail still reads as a photograph at 46px. */}
              <span aria-hidden style={{ position: 'absolute', right: -6, bottom: -6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,14,26,0.92)', border: `1px solid ${color}55`, borderRadius: 8 }}>
                <Icon size={14} weight="duotone" color={color} />
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 2, whiteSpace: 'nowrap' }}>{label}</div>
              <div style={{ fontSize: '0.68rem', color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{fee}</div>
            </div>
            <ArrowRight size={16} color="rgba(255,255,255,0.32)" aria-hidden style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </section>
  );
}
