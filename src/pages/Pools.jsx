import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UsersThree } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPools, createPool, joinPool } from '../api/pools.js';
import useAuthStore from '../store/authStore.js';

function PoolCard({ pool, onNavigate }) {
  const isAdmin = pool.role === 'admin';
  return (
    <div
      onClick={() => onNavigate(`/pools/${pool.id}`)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
        cursor: 'pointer', transition: 'var(--trans-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{pool.name}</div>
          <span style={{
            fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)',
            background: isAdmin ? 'var(--teal-faint)' : 'var(--surface-2)',
            color: isAdmin ? 'var(--teal)' : 'var(--text-3)',
            fontFamily: 'var(--font-display)', fontWeight: 600,
          }}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
        <ArrowRight size={14} color="var(--teal)" />
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <UsersThree size={13} />
        {pool.member_count} member{pool.member_count !== 1 ? 's' : ''} · 0.3% fee
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', flex: 1, color: 'var(--teal)', letterSpacing: '0.1em' }}>
          {pool.invite_code}
        </span>
        <CopyButton text={pool.invite_code} />
      </div>
    </div>
  );
}

export default function Pools() {
  const navigate   = useNavigate();
  const userPhone  = useAuthStore(s => s.user?.phone);
  const [pools,    setPools]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining,  setJoining]  = useState(false);
  const [name,     setName]     = useState('');
  const [type,     setType]     = useState('fiat');
  const [code,     setCode]     = useState('');
  const [codeErr,  setCodeErr]  = useState('');

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
      // Navigate straight to fiat pool detail
      if (pool.pool_type === 'fiat' && pool.id) navigate(`/pools/${pool.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create pool');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setCodeErr('');
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setCodeErr('Enter an invite code'); return; }
    if (trimmed.length !== 6) { setCodeErr('Invite codes are 6 characters'); return; }

    // Client-side guard: check if this code belongs to a pool the user already owns
    const owned = pools.find(p => p.invite_code === trimmed && p.role === 'admin');
    if (owned) {
      setCodeErr(`You created "${owned.name}" — you're already the admin.`);
      return;
    }
    const member = pools.find(p => p.invite_code === trimmed);
    if (member) {
      setCodeErr(`You're already in "${member.name}".`);
      return;
    }

    setJoining(true);
    try {
      const data = await joinPool(trimmed);
      toast.success(data.message || 'Joined pool!');
      const refresh = await getPools();
      setPools(refresh.pools || []);
      setCode('');
      // Navigate into the fiat pool if we got an id back
      if (data.pool_id || data.id) navigate(`/pools/${data.pool_id || data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid invite code';
      setCodeErr(msg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Payment Pools</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            Group collections, ajo contributions, and shared payments — all in one pool.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>
      ) : (
        <>
          {/* My pools */}
          <section style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              My pools ({pools.length})
            </p>
            {pools.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                No pools yet. Create one below or join with an invite code.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {pools.map(pool => (
                  <PoolCard key={pool.id} pool={pool} onNavigate={navigate} />
                ))}
              </div>
            )}
          </section>

          {/* Create / Join */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Create a pool</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Pool name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Family Contributions"
                />
                <div>
                  <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                    <option value="fiat">NGN Payment Pool (0.3% fee)</option>
                    <option value="crypto">Crypto Trading Pool (0.25% fee)</option>
                  </select>
                </div>
                <Button type="submit" disabled={creating} style={{ width: '100%', justifyContent: 'center' }}>
                  {creating ? 'Creating…' : 'Create pool'}
                </Button>
              </form>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Join a pool</h3>
              <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
                    Invite code
                  </label>
                  <input
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setCodeErr(''); }}
                    placeholder="ABC123"
                    maxLength={6}
                    style={{
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: '1.1rem',
                      textAlign: 'center', textTransform: 'uppercase',
                      borderColor: codeErr ? 'var(--red)' : undefined,
                      boxShadow: codeErr ? '0 0 0 3px var(--red-faint)' : undefined,
                    }}
                  />
                  {codeErr && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{codeErr}</span>
                  )}
                </div>
                <Button type="submit" variant="secondary" disabled={joining} style={{ width: '100%', justifyContent: 'center' }}>
                  {joining ? 'Joining…' : 'Join pool'}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
