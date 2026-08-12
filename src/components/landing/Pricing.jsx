import React from 'react';
import Reveal from './Reveal';

const PLANS = [
  { label: 'Pool contributions', pct: '0.15%', note: 'Per contribution paid by a pool member', color: '#00d4aa', featured: false },
  { label: 'Payment links',      pct: '0.25%', note: 'Per payment received through your link', color: '#f5a623', featured: true  },
  { label: 'Payroll runs',       pct: '0.2%',  note: 'Per salary disbursed in a payroll run',  color: '#9b59b6', featured: false },
  { label: 'Monthly fee',        pct: 'None',  note: 'No subscription, no setup, no lock-in',  color: '#2ed573', featured: false },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: '6.5rem 2rem', background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>Pay only when money moves.</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 440, margin: '0 auto 3rem', lineHeight: 1.85 }}>The fee is always shown before you confirm. No surprises. Flutterwave processing fees apply separately.</p>
        </Reveal>

        <div className="price-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {PLANS.map((p, i) => (
            <Reveal key={p.label} delay={i * 60}
              style={{ background: p.featured ? `${p.color}0e` : 'var(--surface)', border: `1px solid ${p.featured ? p.color + '45' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '1.9rem 1.25rem', boxShadow: p.featured ? `0 20px 60px ${p.color}12` : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: p.pct === 'None' ? '1.4rem' : '1.85rem', fontWeight: 900, color: p.color, marginBottom: '0.5rem', lineHeight: 1 }}>{p.pct}</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>{p.label}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.55 }}>{p.note}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
