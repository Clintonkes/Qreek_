import React from 'react';
import { Bank, Prohibit, Eye, LockKey, Receipt, Lifebuoy } from 'phosphor-react';
import Reveal from './Reveal';

const ITEMS = [
  { Icon: Bank,     color: '#00d4aa', title: 'CBN-licensed processing', desc: 'Flutterwave is the PSP. Qreek records the event. It never handles the money.' },
  { Icon: Prohibit, color: '#f87171', title: 'Zero fund custody',       desc: 'Naira flows from payer to recipient bank. Qreek is not in the chain.' },
  { Icon: Eye,      color: '#4a90e2', title: 'Full member transparency', desc: 'Every member sees the same ledger. No hidden amounts, no hidden members.' },
  { Icon: LockKey,  color: '#f5a623', title: 'PIN-secured transactions', desc: 'Five wrong PIN attempts locks the account. All actions require your PIN.' },
  { Icon: Receipt,  color: '#2ed573', title: 'Immutable receipts',      desc: 'Flutterwave webhook is the source of truth. Not a screenshot or a claim.' },
  { Icon: Lifebuoy, color: '#9b59b6', title: 'Dispute reporting',       desc: 'Any member can flag a suspicious payment directly inside the pool.' },
];

export default function TrustGrid() {
  return (
    <section style={{ padding: '5.5rem 2rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Why trust Qreek</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>The accountability layer Nigeria was missing</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 460, margin: '0 auto', lineHeight: 1.85 }}>Not a new bank. Your community payments, finally with the infrastructure they deserve.</p>
        </Reveal>

        <div className="trust-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
          {ITEMS.map(({ Icon, color, title, desc }, i) => (
            <Reveal key={title} delay={i * 60}
              style={{ background: 'var(--bg)', padding: '2.25rem 2rem', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}14`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={22} weight="duotone" color={color} aria-hidden />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color, marginBottom: '0.45rem' }}>{title}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.8, margin: 0 }}>{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
