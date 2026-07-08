// Wallet.jsx is a legacy balance page retained while the product shifts toward payment-first dashboards.
import React, { useEffect, useState, useMemo } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import BalanceCard from '../components/wallet/BalanceCard.jsx';
import TxRow from '../components/wallet/TxRow.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import { getPortfolioValue, getHistory } from '../api/wallet.js';

const COINS = ['NGN','USDT','USDC','BTC','ETH','BNB','SOL'];
const FILTERS = ['all','sell','buy','crypto_send','pool_trade','bridge'];

/**
 * Wallet component - Provides a comprehensive view of the user's financial holdings.
 * Displays:
 * - Real-time balances for NGN and multiple cryptocurrencies (USDT, BTC, etc.).
 * - Estimated NGN valuation for crypto assets.
 * - Paginated and filterable transaction history (Sell, Buy, Send, Pool Trades, Bridge).
 *
 * @returns {JSX.Element}
 */
export default function Wallet() {
  const [portfolio, setPortfolio] = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [showZero,  setShowZero]  = useState(false);
  const TX_PAGE_SIZE = 25;

  useEffect(() => {
    getPortfolioValue().then(setPortfolio).finally(() => setLoading(false));
    loadHistory(1);
  }, []);

  const loadHistory = async (p = 1) => {
    setTxLoading(true);
    try {
      const data = await getHistory(p);
      if (p === 1) setHistory(data.transactions || []);
      else setHistory(prev => [...prev, ...(data.transactions || [])]);
      setHasMore(data.has_more);
      setPage(p);
    } finally {
      setTxLoading(false);
    }
  };

  const balances = portfolio?.breakdown || {};
  const visibleCoins = COINS.filter(c => showZero || c === 'NGN' || (balances[c]?.balance || 0) > 0);
  const filtered = useMemo(() => (filter === 'all' ? history : history.filter(tx => tx.tx_type === filter)), [history, filter]);
  const [txPage, setTxPage] = useState(1);
  const txTotalPages = Math.max(1, Math.ceil(filtered.length / TX_PAGE_SIZE));
  const currentTxPage = Math.min(txPage, txTotalPages);
  const visibleHistory = useMemo(() => {
    const start = (currentTxPage - 1) * TX_PAGE_SIZE;
    return filtered.slice(start, start + TX_PAGE_SIZE);
  }, [filtered, currentTxPage]);

  useEffect(() => {
    setTxPage(1);
  }, [filter]);

  useEffect(() => {
    if (txPage > txTotalPages) setTxPage(txTotalPages);
  }, [txPage, txTotalPages]);

  return (
    <AppShell title="Wallet">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Wallet</h1>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div> : (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Balances</h2>
              <button
                onClick={() => setShowZero(v => !v)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                {showZero ? 'Hide empty' : 'Show all'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.75rem' }}>
              {visibleCoins.map((coin, i) => (
                <BalanceCard
                  key={coin} coin={coin} index={i}
                  balance={balances[coin]?.balance || 0}
                  ngnValue={balances[coin]?.ngn_value}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Transaction History</h2>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {FILTERS.map(f => (
                <button
                  key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    background: filter === f ? 'var(--teal-faint)' : 'var(--surface)',
                    color: filter === f ? 'var(--teal)' : 'var(--text-2)',
                    border: `1px solid ${filter === f ? 'var(--teal-border)' : 'var(--border)'}`,
                    fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 500, transition: 'var(--trans-fast)',
                  }}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>

            {filtered.length === 0 && !txLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No transactions yet. Make your first trade!
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0 1rem' }}>
                {visibleHistory.map(tx => <TxRow key={tx.id} tx={tx} />)}
                {txLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}><Spinner size={24} /></div>}
              </div>
            )}

            {filtered.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem', padding: '0.9rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                  Showing <strong style={{ color: 'var(--text-1)' }}>{(currentTxPage - 1) * TX_PAGE_SIZE + 1}</strong>-<strong style={{ color: 'var(--text-1)' }}>{Math.min(currentTxPage * TX_PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--text-1)' }}>{filtered.length}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={currentTxPage <= 1}>
                    Prev
                  </Button>
                  <Button variant="secondary" onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))} disabled={currentTxPage >= txTotalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {hasMore && !txLoading && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Button variant="secondary" onClick={() => loadHistory(page + 1)}>Load more</Button>
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
