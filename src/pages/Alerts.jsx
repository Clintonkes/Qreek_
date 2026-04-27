import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getAlerts, setAlert, deleteAlert } from '../api/rates.js';
import useRatesStore from '../store/ratesStore.js';

const COINS = ['USDT','BTC','ETH','BNB','SOL','USDC'];

function fmtRate(rate, coin) {
  if (!rate) return '—';
  if (rate >= 1_000_000) return `₦${(rate/1_000_000).toFixed(2)}M`;
  return `₦${rate.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function Alerts() {
  const rates = useRatesStore(s => s.rates);
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [coin,     setCoin]     = useState('BTC');
  const [target,   setTarget]   = useState('');

  useEffect(() => {
    getAlerts().then(d => setAlerts(d.alerts || [])).finally(() => setLoading(false));
  }, []);

  const currentRate = rates[coin]?.rate || 0;
  const direction = target && currentRate ? (parseFloat(target) > currentRate ? 'above' : 'below') : null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!target || parseFloat(target) <= 0) { toast.error('Enter a target price'); return; }
    setCreating(true);
    try {
      const data = await setAlert({ currency: coin, target_price: parseFloat(target), direction });
      setAlerts(prev => [...prev, data]);
      toast.success(data.message || 'Alert set!');
      setTarget('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set alert');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <AppShell title="Alerts">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Price Alerts</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Set new alert</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Coin</label>
              <select value={coin} onChange={e => setCoin(e.target.value)} style={{ width: '100%' }}>
                {COINS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input
              label="Target price (₦)"
              type="number" min="0" step="any"
              value={target} onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 150000000"
              hint={currentRate ? `Current: ${fmtRate(currentRate, coin)}` : 'Fetching rate…'}
            />
            {direction && target && (
              <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: 'var(--teal)' }}>
                🔔 Notify me when {coin} goes <strong>{direction}</strong> ₦{parseFloat(target).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
              </div>
            )}
            <Button type="submit" loading={creating} fullWidth>Set alert</Button>
          </form>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active alerts</h3>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner size={24} /></div> : (
            alerts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.88rem' }}>
                No active alerts. Set one to get notified when prices move.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map(a => {
                  const current = rates[a.currency]?.rate || 0;
                  const pct = current > 0 ? Math.abs(((a.target_price - current) / current) * 100).toFixed(1) : null;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          {a.currency} <span style={{ color: a.direction === 'above' ? 'var(--green)' : 'var(--red)' }}>{a.direction}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                          {fmtRate(a.target_price, a.currency)}
                          {pct && <span style={{ color: 'var(--text-3)', marginLeft: '0.5rem' }}>({pct}% away)</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(a.id)}
                        aria-label="Delete alert"
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)', transition: 'var(--trans-fast)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-faint)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
