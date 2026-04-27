import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPools, createPool, joinPool } from '../api/pools.js';

export default function Pools() {
  const [pools,   setPools]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining,  setJoining]  = useState(false);
  const [name,     setName]     = useState('');
  const [type,     setType]     = useState('crypto');
  const [code,     setCode]     = useState('');

  useEffect(() => {
    getPools().then(d => setPools(d.pools || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Pool name required'); return; }
    setCreating(true);
    try {
      const pool = await createPool({ name: name.trim(), pool_type: type });
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
    if (!code.trim()) { toast.error('Invite code required'); return; }
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
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Trading Pools</h1>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div> : (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>My pools</h2>
            {pools.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                You're not in any pool yet. Create or join one below.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {pools.map(pool => (
                  <div key={pool.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{pool.name}</div>
                        <Badge variant={pool.role === 'admin' ? 'teal' : 'info'}>{pool.role}</Badge>
                      </div>
                      <Badge variant="info">{pool.pool_type}</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.75rem' }}>
                      {pool.member_count} member{pool.member_count !== 1 ? 's' : ''} · {pool.pool_type === 'crypto' ? '0.25% fee' : 'Shared NGN'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', flex: 1, color: 'var(--teal)' }}>{pool.invite_code}</span>
                      <CopyButton value={pool.invite_code} label="invite code" />
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
                <Input label="Pool name" value={name} onChange={e => setName(e.target.value)} placeholder="My Trading Group" />
                <div>
                  <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                    <option value="crypto">Crypto (0.25% fee)</option>
                    <option value="fiat">Fiat / Family NGN pool</option>
                  </select>
                </div>
                <Button type="submit" loading={creating} fullWidth>Create pool</Button>
              </form>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Join pool</h3>
              <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Invite code"
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
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
