import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import useRatesStore from '../../store/ratesStore.js';

const COINS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'SOL'];
const FEE_SEND = 0.001;

function fmtCrypto(v, coin) {
  if (!v || isNaN(v)) return `0 ${coin}`;
  if (['BTC','ETH'].includes(coin)) return `${v.toFixed(6)} ${coin}`;
  if (['SOL','BNB'].includes(coin)) return `${v.toFixed(4)} ${coin}`;
  return `${v.toFixed(2)} ${coin}`;
}

export default function SendForm() {
  const rates = useRatesStore(s => s.rates);
  const [coin, setCoin]   = useState('USDT');
  const [amount, setAmount] = useState('');
  const [phone, setPhone]   = useState('');

  const fee = parseFloat(amount || 0) * FEE_SEND;
  const net = parseFloat(amount || 0) - fee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter an amount'); return; }
    if (!phone) { toast.error('Enter recipient phone number'); return; }
    toast.success('Send request noted! Use chat to confirm with PIN.');
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>
            Coin
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
        />

        <Input
          label="Recipient phone number"
          type="tel"
          value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+2348012345678"
          hint="Must be a registered Qreek Finance user"
        />

        {parseFloat(amount) > 0 && (
          <div style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-2)' }}>
              <span>Fee (0.1%)</span>
              <span className="mono">{fmtCrypto(fee, coin)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Recipient gets</span>
              <span className="mono" style={{ color: 'var(--teal)' }}>{fmtCrypto(net, coin)}</span>
            </div>
          </div>
        )}

        <Button type="submit" fullWidth disabled={!amount || !phone}>
          Send {coin}
        </Button>
      </form>
    </div>
  );
}
