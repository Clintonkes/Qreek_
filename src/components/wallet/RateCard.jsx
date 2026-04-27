import React, { useState, useEffect, useRef } from 'react';
import { TrendUp, TrendDown } from 'phosphor-react';

function fmtRate(rate) {
  if (rate >= 1_000_000) return `₦${(rate / 1_000_000).toFixed(2)}M`;
  return `₦${rate.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function RateCard({ coin, rate, change }) {
  const [flash, setFlash] = useState(false);
  const prevRate = useRef(rate);

  useEffect(() => {
    if (prevRate.current !== rate && prevRate.current !== 0) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
    prevRate.current = rate;
  }, [rate]);

  const up = change >= 0;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
      transition: 'var(--trans)',
      boxShadow: flash ? '0 0 0 2px var(--teal-border)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>{coin}</span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.2rem',
          fontSize: '0.75rem', fontWeight: 600,
          color: up ? 'var(--green)' : 'var(--red)',
        }}>
          {up ? <TrendUp size={12} /> : <TrendDown size={12} />}
          {up ? '+' : ''}{change?.toFixed(2)}%
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 600,
        color: flash ? 'var(--teal)' : 'var(--text)',
        transition: 'color 0.3s ease',
      }}>
        {rate > 0 ? fmtRate(rate) : '—'}
      </div>
    </div>
  );
}
