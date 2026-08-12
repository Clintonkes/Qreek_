import React from 'react';
import { CheckCircle, Circle } from 'phosphor-react';

const C = '#00d4aa';

const members = [
  { name: 'Adaeze O.', paid: true,  amount: '₦10,000' },
  { name: 'Tunde K.',  paid: true,  amount: '₦10,000' },
  { name: 'Ngozi B.',  paid: false, amount: 'Pending'  },
  { name: 'James E.',  paid: true,  amount: '₦10,000' },
  { name: 'Chisom A.', paid: true,  amount: '₦10,000' },
];

export default function PoolMockup() {
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
              {m.paid
                ? <CheckCircle size={15} weight="fill" color={C} aria-hidden />
                : <Circle size={15} color="var(--text-3)" aria-hidden />}
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
