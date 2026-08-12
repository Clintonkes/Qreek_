import React from 'react';
import { CreditCard, Bank, DeviceMobile, LockKey, ArrowRight } from 'phosphor-react';
import { Avatar } from '../Photo';

const C = '#f5a623';

const methods = [
  { Icon: CreditCard,   label: 'Card' },
  { Icon: Bank,         label: 'Transfer' },
  { Icon: DeviceMobile, label: 'USSD' },
];

export default function LinkMockup() {
  return (
    <div style={{ background: 'linear-gradient(160deg,#0a1628,#060e1a)', borderRadius: 20, border: `1px solid ${C}28`, padding: '1.5rem', boxShadow: `0 40px 100px ${C}10`, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
      <div aria-hidden style={{ position: 'absolute', top: -50, left: -50, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${C}14, transparent)`, pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Avatar slot="panelLinks" size={50} accent={C} />
        </div>
        <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: 3 }}>Tokunbo Fashion</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>qreekfinance.org/p/tokunbo</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 900, color: C }}>₦25,000</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>Custom order deposit</div>
      </div>

      <button style={{ width: '100%', background: `linear-gradient(135deg, ${C}, #ffb84d)`, color: '#000', fontWeight: 900, fontSize: '0.92rem', border: 'none', borderRadius: 11, padding: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: `0 8px 24px ${C}30`, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        Pay with Flutterwave <ArrowRight size={16} weight="bold" aria-hidden />
      </button>

      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', position: 'relative' }}>
        {methods.map(({ Icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '0.3rem 0.55rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
            <Icon size={13} aria-hidden />{label}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-3)', position: 'relative' }}>
        <LockKey size={13} aria-hidden /> Secured by Flutterwave, CBN-licensed
      </div>
    </div>
  );
}
