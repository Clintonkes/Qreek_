import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Buildings, Link as LinkIcon, Users, UsersThree, Clock } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import { getPools } from '../api/pools.js';
import { getFamilies } from '../api/family.js';
import { getLinks } from '../api/paymentLinks.js';
import { getCompany, getAnalytics } from '../api/payroll.js';
import useAuthStore from '../store/authStore.js';

// greeting personalizes the dashboard header based on the user's local time of day.
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// fmtNgn keeps NGN figures readable anywhere the dashboard surfaces money values.
function fmtNgn(value) {
  return `₦${(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function timeRemaining(expiresAt) {
  if (!expiresAt) return '';
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// StatCard is a compact summary tile used for the top-level health indicators.
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

/**
 * Dashboard component - The primary landing page for authenticated users.
 * Aggregates and displays a summary of:
 * - Investment pools and membership statistics.
 * - Payment links and collection performance.
 * - Enterprise payroll metrics (if applicable).
 * Provides quick-access navigation to core application features.
 *
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  // Pull lightweight auth context so the page can greet the current user by name.
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || '';

  // Keep each backend slice separate so the dashboard can fail softly if one endpoint is unavailable.
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState([]);
  const [families, setFamilies] = useState([]);
  const [links, setLinks] = useState([]);
  const [company, setCompany] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Load the main payment data in parallel, then enrich enterprise metrics only if a company exists.
    Promise.allSettled([getPools(), getFamilies(), getLinks(), getCompany()])
      .then(async ([poolsResult, familiesResult, linksResult, companyResult]) => {
        const nextPools = poolsResult.status === 'fulfilled' ? poolsResult.value.pools || [] : [];
        const nextFamilies = familiesResult.status === 'fulfilled' ? familiesResult.value.families || [] : [];
        const nextLinks = linksResult.status === 'fulfilled' ? linksResult.value.links || [] : [];
        const nextCompany = companyResult.status === 'fulfilled' ? companyResult.value.company || null : null;

        setPools(nextPools);
        setFamilies(nextFamilies);
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

  // Derive lightweight dashboard figures once the remote data has loaded.
  const activeLinks = links.filter(link => link.is_active);
  const totalCollected = links.reduce((sum, link) => sum + (link.total_collected || 0), 0);
  const totalMembers = pools.reduce((sum, pool) => sum + (pool.member_count || 0), 0);
  const totalFamilyMembers = families.reduce((sum, family) => sum + (family.member_count || 0), 0);
  const activePools = pools.filter(pool => pool.pool_type === 'fiat').length || pools.length;

  return (
    <AppShell title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            {greeting()}, {firstName}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
            Your payment overview across pools, families, collections, and enterprise payouts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => navigate('/payment-links')}>
            <LinkIcon size={16} /> Payment links
          </Button>
          <Button variant="secondary" onClick={() => navigate('/pools')}>
            <Users size={16} /> Open pools
          </Button>
          <Button variant="secondary" onClick={() => navigate('/family')}>
            <UsersThree size={16} /> Family
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
      ) : (
        <>
          {/* Hero summary surfaces the most important collection totals before lower-detail cards. */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>People in family groups</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{totalFamilyMembers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards translate the broader dataset into quick-glance operational indicators. */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard label="Payment pools" value={activePools} sub="Active money groups" accent="var(--teal)" />
            <StatCard label="Contributors" value={totalMembers} sub="Members across joined pools" accent="var(--green)" />
            <StatCard label="Family groups" value={families.length} sub="Shared family ledgers" accent="var(--amber)" />
            <StatCard label="Collections" value={activeLinks.length} sub="Links currently active" accent="var(--amber)" />
            <StatCard label="Enterprise" value={company ? (company.is_verified ? 'Verified' : 'Active') : 'Not set'} sub={company ? `${analytics?.runs_history?.length || 0} payroll runs recorded` : 'Set up business payouts when ready'} accent="var(--blue)" />
          </section>

          {/* Activity lists help users jump into recent pools and collection links without extra searching. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
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
                  <div key={pool.id} onClick={() => navigate(`/pools/${pool.id}`)} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}>
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
                  <div key={link.id} onClick={() => navigate(`/payment-links/${link.id}/settlements`)} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                        {link.is_flexible ? 'Flexible amount' : fmtNgn(link.amount)} · {link.use_count || 0} uses
                      </div>
                      {link.pool_id && link.expires_at && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <Clock size={12} /> {timeRemaining(link.expires_at)}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--green)' }}>
                      {fmtNgn(link.total_collected)}
                    </span>
                  </div>
                ))
              )}
            </section>

            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Family groups</h2>
                <Link to="/family" style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>Manage</Link>
              </div>
              {families.length === 0 ? (
                <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem 0' }}>
                  No family groups yet. Create one for shared requests and transfers.
                </div>
              ) : (
                families.slice(0, 3).map(family => (
                  <div key={family.id} onClick={() => navigate(`/family/${family.id}`)} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{family.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                        {family.member_count || 0} members · {fmtNgn(family.balance_ngn || 0)}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: 'rgba(245,166,35,0.12)', color: 'var(--amber)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {family.role || 'member'}
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Action cards turn the dashboard into a launch point for the main payment workflows. */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Open payment pools', desc: 'Create or join a pool for family, teams, or contribution circles.', to: '/pools', icon: Users, accent: 'var(--teal)' },
              { title: 'Open family ledger', desc: 'Manage shared family contributions, requests, and recorded transfers.', to: '/family', icon: UsersThree, accent: 'var(--amber)' },
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
