import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import useRatesStore from '../../store/ratesStore.js';

const COINS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'SOL'];
const FEE_POOL     = 0.0025;
const FEE_EXTERNAL = 0.004;

function fmtNGN(v) {
  if (!v || isNaN(v)) return '₦0.00';
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SellForm({ inPool = false }) {
  const rates = useRatesStore(s => s.rates);
  const [coin, setCoin]   = useState('USDT');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [step, setStep]   = useState('form');
  const [loading, setLoading] = useState(false);

  const rate    = rates[coin]?.rate || 0;
  const feePct  = inPool ? FEE_POOL : FEE_EXTERNAL;
  const gross   = parseFloat(amount || 0) * rate;
  const fee     = gross * feePct;
  const net     = gross - fee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter an amount'); return; }
    if (step === 'form') { setStep('account'); return; }
    if (!account || !bankCode) { toast.error('Enter account number and bank code'); return; }
    toast.success('Sell order submitted! Use chat for PIN confirmation.');
    setStep('form');
    setAmount('');
    setAccount('');
    setBankCode('');
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
          <select
            value={coin} onChange={e => setCoin(e.target.value)}
            style={{ width: '100%' }}
          >
            {COINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {step === 'form' ? (
          <>
            <Input
              label="Amount"
              type="number" min="0" step="any"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              hint={rate > 0 ? `Rate: ${fmtNGN(rate)}/${coin}` : 'Fetching rate…'}
            />

            {parseFloat(amount) > 0 && rate > 0 && (
              <div style={{
                background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                  <span>Gross value</span>
                  <span className="mono">{fmtNGN(gross)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                  <span>Fee ({(feePct * 100).toFixed(2)}%{inPool ? ' pool' : ''})</span>
                  <span className="mono" style={{ color: 'var(--red)' }}>{fmtNGN(fee)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>You receive</span>
                  <span className="mono" style={{ color: 'var(--teal)', fontSize: '1.1rem' }}>{fmtNGN(net)}</span>
                </div>
              </div>
            )}

            <Button type="submit" fullWidth disabled={!amount || parseFloat(amount) <= 0}>
              Continue →
            </Button>
          </>
        ) : (
          <>
            <Input
              label="Account Number"
              type="text" maxLength={10} inputMode="numeric"
              value={account} onChange={e => setAccount(e.target.value.replace(/\D/g, ''))}
              placeholder="0123456789"
            />
            <Input
              label="Bank Code"
              type="text" maxLength={6}
              value={bankCode} onChange={e => setBankCode(e.target.value.replace(/\D/g, ''))}
              placeholder="058 (GTBank)"
              hint="3-digit NUBAN bank code"
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setStep('form')} fullWidth>Back</Button>
              <Button type="submit" loading={loading} fullWidth>Sell {coin}</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
