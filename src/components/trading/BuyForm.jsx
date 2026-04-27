import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import useRatesStore from '../../store/ratesStore.js';

const COINS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'SOL'];

function fmtNGN(v) {
  if (!v || isNaN(v)) return '₦0.00';
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BuyForm() {
  const rates = useRatesStore(s => s.rates);
  const [coin, setCoin]   = useState('USDT');
  const [amount, setAmount] = useState('');

  const rate      = rates[coin]?.rate || 0;
  const buyRate   = rate * 1.01;
  const totalNGN  = parseFloat(amount || 0) * buyRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter an amount'); return; }
    toast.success('Order noted! Use chat to complete the buy flow with a virtual account.');
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>
            Coin to buy
          </label>
          <select value={coin} onChange={e => setCoin(e.target.value)} style={{ width: '100%' }}>
            {COINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Input
          label="Amount"
          type="number" min="0" step="any"
          value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          hint={rate > 0 ? `Buy rate: ${fmtNGN(buyRate)}/${coin} (incl. 1% spread)` : 'Fetching rate…'}
        />

        {parseFloat(amount) > 0 && rate > 0 && (
          <div style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '1rem',
            display: 'flex', justifyContent: 'space-between', fontWeight: 600,
          }}>
            <span>Total to pay</span>
            <span className="mono" style={{ color: 'var(--amber)', fontSize: '1.1rem' }}>{fmtNGN(totalNGN)}</span>
          </div>
        )}

        <Button type="submit" variant="amber" fullWidth disabled={!amount || parseFloat(amount) <= 0}>
          Get payment details →
        </Button>
      </form>
    </div>
  );
}
