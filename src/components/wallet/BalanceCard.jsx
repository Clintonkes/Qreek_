import React from 'react';
import { motion } from 'framer-motion';

const COIN_COLORS = {
  NGN:  '#00D4AA', USDT: '#26A17B', USDC: '#2775CA',
  BTC:  '#F7931A', ETH:  '#627EEA', BNB:  '#F3BA2F', SOL: '#9945FF',
};

const COIN_SYMBOLS = {
  NGN: '₦', USDT: '$', USDC: '$', BTC: '₿', ETH: 'Ξ', BNB: 'BNB', SOL: '◎',
};

function fmtBalance(bal, coin) {
  if (['BTC','ETH'].includes(coin)) return bal.toFixed(6);
  if (['SOL','BNB'].includes(coin)) return bal.toFixed(4);
  return bal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNGN(v) {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function BalanceCard({ coin, balance, ngnValue, index = 0 }) {
  const color = COIN_COLORS[coin] || 'var(--teal)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
        position: 'relative', overflow: 'hidden', cursor: 'default',
        transition: 'var(--trans)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3,
        height: '100%', background: color, borderRadius: '3px 0 0 3px',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: color + '22', border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 700, color,
        }}>
          {COIN_SYMBOLS[coin] || coin[0]}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>{coin}</span>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        {fmtBalance(balance, coin)}
      </div>
      {coin !== 'NGN' && ngnValue !== undefined && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
          ≈ {fmtNGN(ngnValue)}
        </div>
      )}
    </motion.div>
  );
}
