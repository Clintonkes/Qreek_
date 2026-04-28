// Trade.jsx is a legacy route kept for compatibility; the main product now centers payment flows instead.
import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import TradeChat from '../components/trading/TradeChat.jsx';
import SellForm from '../components/trading/SellForm.jsx';
import BuyForm from '../components/trading/BuyForm.jsx';
import SendForm from '../components/trading/SendForm.jsx';
import useRatesStore from '../store/ratesStore.js';

const TABS = [
  { id: 'chat', label: '💬 Chat' },
  { id: 'sell', label: '💸 Sell' },
  { id: 'buy',  label: '🛒 Buy' },
  { id: 'send', label: '📤 Send' },
];

function RateTicker({ rates }) {
  const coins = ['USDT','BTC','ETH','BNB','SOL','USDC'];
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '0.6rem 1rem',
      display: 'flex', gap: '1.5rem', overflowX: 'auto', marginBottom: '1.5rem',
    }}>
      {coins.map(coin => {
        const r = rates[coin];
        if (!r?.rate) return null;
        const up = (r.change || 0) >= 0;
        const fmt = r.rate >= 1_000_000
          ? `₦${(r.rate/1_000_000).toFixed(2)}M`
          : `₦${r.rate.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
        return (
          <div key={coin} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8rem' }}>{coin}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{fmt}</span>
            <span style={{ fontSize: '0.72rem', color: up ? 'var(--green)' : 'var(--red)' }}>
              {up ? '+' : ''}{(r.change || 0).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Trade() {
  const [tab, setTab] = useState('chat');
  const rates = useRatesStore(s => s.rates);

  return (
    <AppShell title="Trade">
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.25rem' }}>
        {TABS.map(t => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '0.55rem 0.5rem', border: 'none',
              background: tab === t.id ? 'var(--surface-2)' : 'transparent',
              color: tab === t.id ? 'var(--teal)' : 'var(--text-2)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.82rem',
              transition: 'var(--trans-fast)',
              borderBottom: tab === t.id ? '2px solid var(--teal)' : '2px solid transparent',
            }}
          >{t.label}</button>
        ))}
      </div>

      <RateTicker rates={rates} />

      {tab === 'chat' && <TradeChat />}
      {tab === 'sell' && <SellForm />}
      {tab === 'buy'  && <BuyForm />}
      {tab === 'send' && <SendForm />}
    </AppShell>
  );
}
