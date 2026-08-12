import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'phosphor-react';
import Photo from './Photo';
import Reveal from './Reveal';

export default function FinalCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Full-bleed closing photograph */}
      <Photo
        slot="ctaBand"
        ratio="auto"
        scrim="none"
        eager={false}
        sizes="100vw"
        style={{ position: 'absolute', inset: 0 }}
        imgStyle={{ filter: 'saturate(0.55) contrast(1.05) brightness(0.42)' }}
      />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--bg) 0%, rgba(6,14,26,0.78) 42%, rgba(6,14,26,0.9) 100%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(0,212,170,0.16), transparent 62%)', pointerEvents: 'none' }} />

      <Reveal style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto', padding: '9rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.85rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: '1.25rem', textWrap: 'balance', textShadow: '0 2px 30px rgba(6,14,26,0.9)' }}>
          Stop managing money with screenshots.
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: 420, margin: '0 auto 2.5rem', lineHeight: 1.88, textShadow: '0 1px 14px rgba(6,14,26,0.9)' }}>
          Join the ajo groups, merchants, and businesses using Qreek to bring transparency to every payment.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#00d4aa', color: '#000', textDecoration: 'none', fontSize: '1rem', fontWeight: 900, padding: '0.9rem 2.5rem', borderRadius: 999, fontFamily: 'var(--font-display)', boxShadow: '0 8px 32px rgba(0,212,170,0.35)' }}>
            Create your free account <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: 'var(--text)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.9rem 2rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.16)' }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No credit card. No monthly fee. Set up in 2 minutes.</p>
      </Reveal>
    </section>
  );
}
