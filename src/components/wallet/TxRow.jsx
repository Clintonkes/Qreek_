import React from 'react';
import { ArrowDown, ArrowUp, ArrowsLeftRight, CircleWavyCheck } from 'phosphor-react';
import Badge from '../ui/Badge.jsx';
import dayjs from 'dayjs';

const TYPE_META = {
  sell:        { icon: ArrowUp,            label: 'Sell',        color: 'var(--teal)' },
  buy:         { icon: ArrowDown,          label: 'Buy',         color: 'var(--amber)' },
  crypto_send: { icon: ArrowsLeftRight,    label: 'Send',        color: 'var(--blue)' },
  pool_trade:  { icon: CircleWavyCheck,    label: 'Pool Trade',  color: 'var(--purple)' },
  fiat_send:   { icon: ArrowUp,            label: 'NGN Send',    color: 'var(--text-2)' },
  bridge:      { icon: ArrowsLeftRight,    label: 'Bridge',      color: 'var(--purple)' },
  deposit:     { icon: ArrowDown,          label: 'Deposit',     color: 'var(--green)' },
};

function fmtNGN(v) {
  if (!v) return '—';
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TxRow({ tx }) {
  const meta = TYPE_META[tx.tx_type] || TYPE_META.sell;
  const Icon = meta.icon;
  const statusVariant = tx.status === 'completed' ? 'completed' : tx.status === 'processing' || tx.status === 'pending' ? 'processing' : 'failed';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.85rem 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: meta.color + '18', border: `1px solid ${meta.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: meta.color,
      }}>
        <Icon size={16} weight="bold" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>
          {meta.label} {tx.amount} {tx.currency}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>
          {tx.bank_name ? `${tx.bank_name} ${tx.bank_account || ''}` : dayjs(tx.created_at).format('D MMM YYYY HH:mm')}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--teal)' }}>
          {fmtNGN(tx.ngn_amount)}
        </div>
        <Badge variant={statusVariant} style={{ marginTop: '0.2rem', fontSize: '0.68rem' }}>
          {tx.status}
        </Badge>
      </div>
    </div>
  );
}
