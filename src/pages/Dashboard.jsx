import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Buildings, Link as LinkIcon, Users } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import { getPools } from '../api/pools.js';
import { getLinks } from '../api/paymentLinks.js';
import { getCompany, getAnalytics } from '../api/payroll.js';
import useAuthStore from '../store/authStore.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmtNgn(value) {
  return `₦${(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function StatCard({ label, value, sub, accent = 'var(--teal)' }) {
  return (
    <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700, color: accent, marginBottom: '0.2rem' }}>
        {value}
      </div>
      {sub ? <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{sub}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || '';

  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState([]);
  const [links, setLinks] = useState([]);
  const [company, setCompany] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.allSettled([getPools(), getLinks(), getCompany()])
      .then(async ([poolsResult, linksResult, companyResult]) => {
        const nextPools = poolsResult.status === 'fulfilled' ? poolsResult.value.pools || [] : [];
        const nextLinks = linksResult.status === 'fulfilled' ? linksResult.value.links || [] : [];
        const nextCompany = companyResult.status === 'fulfilled' ? companyResult.value.company || null : null;

        setPools(nextPools);
        setLinks(nextLinks);
        setCompany(nextCompany);

        if (nextCompany) {
          try {
            const metrics = await getAnalytics();
            setAnalytics(metrics);
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const activeLinks = links.filter(link => link.is_active);
  const totalCollected = links.reduce((sum, link) => sum + (link.total_collected || 0), 0);
  const totalMembers = pools.reduce((sum, pool) => sum + (pool.member_count || 0), 0);
  const activePools = pools.filter(pool => pool.pool_type === 'fiat').length || pools.length;

  return (
    <AppShell title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            {greeting()}, {firstName}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
            Your payment overview across pools, collections, and enterprise payouts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => navigate('/payment-links')}>
            <LinkIcon size={16} /> Payment links
          </Button>
          <Button onClick={() => navigate('/pools')}>
            <Users size={16} /> Open pools
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
      ) : (
        <>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.16), rgba(245,166,35,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
                  Payment activity snapshot
                </div>
                <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {fmtNgn(totalCollected)}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
                  Total collected across your active payment links and pool-led flows.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '0.55rem', minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Active payment links</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{activeLinks.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Payment pools</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{activePools}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>People across pools</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{totalMembers}</span>
                </div>
              </div>
            </div>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard label="Payment pools" value={activePools} sub="Active money groups" accent="var(--teal)" />
            <StatCard label="Contributors" value={totalMembers} sub="Members across joined pools" accent="var(--green)" />
            <StatCard label="Collections" value={activeLinks.length} sub="Links currently active" accent="var(--amber)" />
            <StatCard label="Enterprise" value={company ? (company.is_verified ? 'Verified' : 'Active') : 'Not set'} sub={company ? `${analytics?.runs_history?.length || 0} payroll runs recorded` : 'Set up business payouts when ready'} accent="var(--blue)" />
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Recent pools</h2>
                <Link to="/pools" style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>View all</Link>
              </div>
              {pools.length === 0 ? (
                <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem 0' }}>
                  No pools yet. Create your first shared payment flow.
                </div>
              ) : (
                pools.slice(0, 3).map(pool => (
                  <div key={pool.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pool.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{pool.member_count || 0} members</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: 'var(--teal-faint)', color: 'var(--teal)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {pool.role || 'member'}
                    </span>
                  </div>
                ))
              )}
            </section>

            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Payment links</h2>
                <Link to="/payment-links" style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>Manage</Link>
              </div>
              {links.length === 0 ? (
                <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem 0' }}>
                  No payment links yet. Create one to start collecting.
                </div>
              ) : (
                links.slice(0, 3).map(link => (
                  <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                        {link.is_flexible ? 'Flexible amount' : fmtNgn(link.amount)} · {link.use_count || 0} uses
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--green)' }}>
                      {fmtNgn(link.total_collected)}
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Open payment pools', desc: 'Create or join a pool for family, teams, or contribution circles.', to: '/pools', icon: Users, accent: 'var(--teal)' },
              { title: 'Create payment links', desc: 'Collect money through shareable links and keep inflows organized.', to: '/payment-links', icon: LinkIcon, accent: 'var(--amber)' },
              { title: 'Manage enterprise payouts', desc: 'Run payroll and structured business disbursements from one place.', to: '/enterprise', icon: Buildings, accent: 'var(--blue)' },
            ].map(item => (
              <Link key={item.title} to={item.to} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.2rem', minHeight: 140, transition: 'var(--trans-fast)' }}>
                  <item.icon size={20} color={item.accent} />
                  <h3 style={{ fontSize: '0.96rem', margin: '0.85rem 0 0.35rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>{item.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: item.accent, fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </section>
        </>
      )}
    </AppShell>
  );
}
