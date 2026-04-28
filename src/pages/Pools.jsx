// Pools.jsx lets authenticated users create, join, and browse payment pools
// that power group collections and coordinated disbursement flows.
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPools, createPool, joinPool } from '../api/pools.js';

export default function Pools() {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    getPools().then(d => setPools(d.pools || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Pool name required');
      return;
    }

    setCreating(true);
    try {
      const pool = await createPool({ name: name.trim(), pool_type: 'fiat' });
      setPools(prev => [...prev, pool]);
      toast.success(`Pool "${pool.name}" created!`);
      setName('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create pool');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Invite code required');
      return;
    }

    setJoining(true);
    try {
      const data = await joinPool(code.trim());
      toast.success(data.message || 'Joined pool!');
      const refresh = await getPools();
      setPools(refresh.pools || []);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid invite code');
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppShell title="Pools">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Payment Pools</h1>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div> : (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>My pools</h2>
            {pools.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                You are not in any payment pool yet. Create one for collections or join one with an invite code.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {pools.map(pool => (
                  <div
                    key={pool.id}
                    onClick={() => navigate(`/pools/${pool.id}`)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', cursor: 'pointer', transition: 'var(--trans-fast)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{pool.name}</div>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: pool.role === 'admin' ? 'var(--teal-faint)' : 'var(--surface-2)', color: pool.role === 'admin' ? 'var(--teal)' : 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                          {pool.role}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', background: 'var(--surface-2)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                          {pool.pool_type === 'fiat' ? 'Payment pool' : 'Legacy pool'}
                        </span>
                        <ArrowRight size={14} color="var(--teal)" />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.75rem' }}>
                      {pool.member_count} member{pool.member_count !== 1 ? 's' : ''} · Organized collections and disbursements
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', flex: 1, color: 'var(--teal)', letterSpacing: '0.08em' }}>{pool.invite_code}</span>
                      <CopyButton text={pool.invite_code} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Create pool</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Pool name" value={name} onChange={e => setName(e.target.value)} placeholder="Rent Contribution Circle" />
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--text-2)' }}>
                  New pools are created as Qreek payment pools for collections, member contributions, and payouts.
                </div>
                <Button type="submit" loading={creating} fullWidth>Create payment pool</Button>
              </form>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Join pool</h3>
              <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Invite code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  hint="6-character code from the pool admin"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}
                />
                <Button type="submit" variant="secondary" loading={joining} fullWidth>Join pool</Button>
              </form>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
