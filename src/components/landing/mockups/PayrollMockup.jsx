import React from 'react';
import { CheckCircle } from 'phosphor-react';

const C = '#9b59b6';

const depts = [
  { name: 'Engineering', n: 12 },
  { name: 'Design',      n: 6  },
  { name: 'Sales',       n: 18 },
  { name: 'Operations',  n: 11 },
];

export default function PayrollMockup() {
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
        {[{ v: '47', l: 'Employees', c: C }, { v: '47', l: 'Paid', c: '#2ed573', check: true }, { v: '4m', l: 'Run time', c: 'var(--text-2)' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: `${s.c}0e`, border: `1px solid ${s.c}28`, borderRadius: 11, padding: '0.7rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              {s.l}{s.check && <CheckCircle size={11} weight="fill" color="#2ed573" aria-hidden />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', position: 'relative' }}>
        {depts.map(d => (
          <div key={d.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.22rem' }}>
              <span style={{ color: 'var(--text-2)' }}>{d.name}</span>
              <span style={{ color: '#2ed573', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {d.n} paid <CheckCircle size={12} weight="fill" aria-hidden />
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${C}, #2ed573)`, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.65rem 0.75rem', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.18)', borderRadius: 10, fontSize: '0.76rem', color: '#2ed573', display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
        <CheckCircle size={14} weight="fill" aria-hidden /> All 47 transfers confirmed. Receipt ready
      </div>
    </div>
  );
}
