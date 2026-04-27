import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightning } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import BalanceCard from '../components/wallet/BalanceCard.jsx';
import RateCard from '../components/wallet/RateCard.jsx';
import TxRow from '../components/wallet/TxRow.jsx';
import PortfolioChart from '../components/wallet/PortfolioChart.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import useAuthStore from '../store/authStore.js';
import useRatesStore from '../store/ratesStore.js';
import { getPortfolioValue, getHistory } from '../api/wallet.js';

function CountUp({ target, duration = 1500 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const COINS = ['NGN','USDT','USDC','BTC','ETH','BNB','SOL'];

export default function Dashboard() {
  const { user }  = useAuthStore();
  const rates     = useRatesStore(s => s.rates);
  const navigate  = useNavigate();
  const firstName = user?.name?.split(' ')[0] || '';

  const [portfolio, setPortfolio] = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getPortfolioValue(), getHistory(1)])
      .then(([pv, hist]) => {
        setPortfolio(pv);
        setHistory(hist.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const balances = portfolio?.breakdown || {};

  const balanceCards = useMemo(() => COINS.filter(c => {
    if (c === 'NGN') return true;
    return (balances[c]?.balance || 0) > 0;
  }), [balances]);

  return (
    <AppShell title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.4rem' }}>
          {greeting()}, {firstName} 👋
        </h1>
        <Button variant="amber" onClick={() => navigate('/trade')}>
          <Lightning size={16} weight="fill" /> Trade now →
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
      ) : (
        <>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--teal)', borderRadius: 'var(--radius-lg)',
            padding: '1.5rem', marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Total portfolio value
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}>
              ₦<CountUp target={portfolio?.total_ngn || 0} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
              Updated live · {new Date().toLocaleTimeString()}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <PortfolioChart totalNGN={portfolio?.total_ngn || 0} />
            </div>
          </div>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Balances</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {balanceCards.map((coin, i) => (
                <BalanceCard
                  key={coin} coin={coin} index={i}
                  balance={balances[coin]?.balance || 0}
                  ngnValue={balances[coin]?.ngn_value}
                />
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Live Rates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {['USDT','BTC','ETH','BNB','SOL','USDC'].map(coin => (
                <RateCard key={coin} coin={coin} rate={rates[coin]?.rate || 0} change={rates[coin]?.change || 0} />
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Recent activity</h2>
              <Link to="/wallet" style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>View all →</Link>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No transactions yet. Make your first trade!
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0 1rem' }}>
                {history.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} />)}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
