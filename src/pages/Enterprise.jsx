// Enterprise.jsx — Multi-business payroll dashboard for enterprise account owners.
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Buildings, Users, Money, ChartBar, ArrowRight, Plus, Lightning,
  Wallet, UserPlus, ShareNetwork, Check, CaretRight, ArrowLeft,
} from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import {
  getCompany, getAnalytics, depositToWallet, getWalletBalance, generateEmployeeInvite,
} from '../api/payroll.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmtNgn = (v) =>
  v >= 1_000_000
    ? `₦${(v / 1_000_000).toFixed(2)}M`
    : `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

// ── Sub-components ───────────────────────────────────────────────────────────

/**
 * A metric card used in the stats grid.
 */
function StatCard({ icon: Icon, label, value, color = 'var(--teal)', sub }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.4rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-2)', fontSize: '0.8rem' }}>
        <Icon size={15} color={color} weight="duotone" />
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

/**
 * A single recent payroll run row.
 */
function RunBar({ run }) {
  const color = run.status === 'completed' ? 'var(--green)'
    : run.status === 'partial' ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{run.period}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{run.count} employees</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
        {fmtNgn(run.total_net || 0)}
      </div>
      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: color + '22', color }}>
        {run.status}
      </span>
    </div>
  );
}

/**
 * Business selection card shown in the "all businesses" overview.
 */
function BusinessCard({ company, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        background: isActive ? 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,212,170,0.02))' : 'var(--surface)',
        border: `1px solid ${isActive ? 'var(--teal)' : hovered ? 'var(--teal-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
        transition: 'all 0.18s ease', textAlign: 'left', width: '100%', boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius)',
            background: isActive ? 'rgba(0,212,170,0.15)' : 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            🏢
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{company.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              {company.industry || 'Enterprise'}{company.rc_number ? ` · RC ${company.rc_number}` : ''}
            </div>
          </div>
        </div>
        {isActive && (
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'rgba(0,212,170,0.15)', color: 'var(--teal)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            Active
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Employees</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{company.employee_count || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Total paid</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{fmtNgn(company.total_paid_ngn || 0)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Wallet</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmtNgn(company.wallet_balance_ngn || 0)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: isActive ? 'var(--teal)' : 'var(--text-3)', fontWeight: 600 }}>
        {isActive ? 'Currently viewing' : 'Click to manage'} <CaretRight size={12} weight="bold" />
      </div>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

/**
 * Enterprise dashboard. Shows all of the authenticated owner's businesses,
 * allows switching between them, and displays per-business analytics.
 */
export default function Enterprise() {
  const [companies,     setCompanies]     = useState([]);
  const [company,       setCompany]       = useState(null);   // active company
  const [analytics,     setAnalytics]     = useState(null);
  const [walletBal,     setWalletBal]     = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showDeposit,   setShowDeposit]   = useState(false);
  const [depositAmt,    setDepositAmt]    = useState('');
  const [depositing,    setDepositing]    = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [view,          setView]          = useState('overview'); // 'overview' | 'detail'
  const navigate = useNavigate();

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadCompanyList = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getCompany();
      const cos = d.companies || [];
      setCompanies(cos);

      let active = null;
      const savedId = localStorage.getItem('qreek_active_company');
      if (savedId && cos.length) {
        active = cos.find(c => c.id === savedId) || cos[0];
      } else if (cos.length) {
        active = cos[0];
      }

      if (active) {
        localStorage.setItem('qreek_active_company', active.id);
        setCompany(active);
        // If only 1 company, jump straight to detail
        if (cos.length === 1) setView('detail');
      }
    } catch {
      toast.error('Could not load enterprise data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!company) return;
    setAnalyticsLoading(true);
    try {
      const [w, a] = await Promise.all([
        getWalletBalance().catch(() => ({ wallet_balance_ngn: company.wallet_balance_ngn || 0 })),
        getAnalytics().catch(() => null),
      ]);
      setWalletBal(w.wallet_balance_ngn || 0);
      if (a) setAnalytics(a);
    } catch {
      // non-critical; page still shows with company data
    } finally {
      setAnalyticsLoading(false);
    }
  }, [company]);

  useEffect(() => { loadCompanyList(); }, [loadCompanyList]);
  useEffect(() => { if (company && view === 'detail') loadAnalytics(); }, [company, view]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectBusiness = (c) => {
    localStorage.setItem('qreek_active_company', c.id);
    setCompany(c);
    setAnalytics(null);
    setView('detail');
  };

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    try {
      await generateEmployeeInvite();
      toast.success('Invite link generated!');
      await loadCompanyList();
      // Re-apply active company after reload
      setView('detail');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create invite link.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
    if (amt > 10_000_000) { toast.error('Max ₦10,000,000 per deposit.'); return; }
    setDepositing(true);
    try {
      const res = await depositToWallet({ amount: amt });
      if (res.checkout_url) {
        window.open(res.checkout_url, '_blank');
        toast.success('Deposit checkout opened.');
      }
      setShowDeposit(false);
      setDepositAmt('');
      setTimeout(() => loadAnalytics(), 5000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed.');
    } finally {
      setDepositing(false);
    }
  };

  // ── Render: loading ───────────────────────────────────────────────────────

  if (loading) return (
    <AppShell title="Enterprise">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Spinner size={36} />
      </div>
    </AppShell>
  );

  // ── Render: no companies ──────────────────────────────────────────────────

  if (!companies.length) return (
    <AppShell title="Enterprise">
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏢</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Set up your enterprise account</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Manage employee payroll, stage funds, and run structured batch payouts to any Nigerian bank — all from one dashboard.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 320, margin: '0 auto 2rem' }}>
          {['Manage salary for multiple businesses', '0.2% payroll fee, no surprises', 'PIN-secured payout execution', 'Bulk import up to 500 employees'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.84rem', color: 'var(--text-2)' }}>
              <span style={{ fontSize: '1rem' }}>✅</span> {t}
            </div>
          ))}
        </div>
        <Button style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/enterprise/setup')}>
          Get started — it&apos;s free <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );

  // ── Render: overview (multiple businesses) ────────────────────────────────

  if (view === 'overview' || !company) return (
    <AppShell title="Enterprise">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem' }}>My businesses</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', margin: 0 }}>
              {companies.length} {companies.length === 1 ? 'business' : 'businesses'} registered to your account
            </p>
          </div>
          <Button onClick={() => navigate('/enterprise/setup')}>
            <Plus size={16} /> Add business
          </Button>
        </div>
      </div>

      {/* Business cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {companies.map(c => (
          <BusinessCard
            key={c.id}
            company={c}
            isActive={company?.id === c.id}
            onSelect={() => handleSelectBusiness(c)}
          />
        ))}
      </div>
    </AppShell>
  );

  // ── Render: detail view (single business) ─────────────────────────────────

  const activeCompany = companies.find(c => c.id === company.id) || company;

  return (
    <AppShell title="Enterprise">
      {/* Back / business switcher header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {companies.length > 1 ? (
          <button
            onClick={() => setView('overview')}
            style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-2)', fontSize: '0.83rem', fontWeight: 600, transition: 'var(--trans-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <ArrowLeft size={14} weight="bold" /> All businesses
          </button>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowDeposit(true)}>
            <Wallet size={15} /> Fund wallet
          </Button>
          <Button variant="secondary" onClick={() => navigate('/enterprise/employees')}>
            <Users size={15} /> Employees
          </Button>
          <Button onClick={() => navigate('/enterprise/payroll/run')}>
            <Lightning size={15} /> Run payroll
          </Button>
        </div>
      </div>

      {/* Business identity bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(0,212,170,0.04) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'rgba(0,212,170,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
          🏢
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{activeCompany.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
            {activeCompany.industry || 'Enterprise account'}
            {activeCompany.rc_number ? ` · RC ${activeCompany.rc_number}` : ''}
            {activeCompany.is_verified ? ' · ✓ Verified' : ''}
          </div>
        </div>
        {companies.length > 1 && (
          <select
            value={company.id}
            onChange={e => {
              const found = companies.find(c => c.id === e.target.value);
              if (found) handleSelectBusiness(found);
            }}
            style={{ fontSize: '0.83rem', padding: '0.35rem 1.5rem 0.35rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer' }}
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Wallet}    label="Wallet balance" value={fmtNgn(walletBal)}                           color="var(--teal)"  sub="company wallet" />
        <StatCard icon={Money}     label="Total paid"     value={fmtNgn(analytics?.total_paid_ngn || activeCompany.total_paid_ngn)} color="var(--teal)" />
        <StatCard icon={Users}     label="Employees"      value={analytics?.employee_count ?? activeCompany.employee_count ?? 0}   color="var(--blue)"  sub="active on payroll" />
        <StatCard icon={ChartBar}  label="Payroll runs"   value={analytics?.runs_history?.length || 0}        color="var(--amber)" />
        <StatCard icon={Buildings} label="Status"         value={activeCompany.is_verified ? 'Verified' : 'Active'} color="var(--green)" sub="0.2% payroll fee" />
      </div>

      {/* Employee invite link section */}
      {activeCompany.invite_link ? (
        <div style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(0,212,170,0.05) 100%)',
          border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <ShareNetwork size={20} color="var(--teal)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>
              {activeCompany.name} · Employee invite link
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.35rem' }}>
              Share this link with your team so they can submit their payroll details
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeCompany.invite_link}
            </div>
          </div>
          <CopyButton text={activeCompany.invite_link} style={{ flexShrink: 0 }} />
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <ShareNetwork size={20} color="var(--text-3)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>Employee invite link</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Generate a permanent link to share with your team
              </div>
            </div>
          </div>
          <Button onClick={handleGenerateInvite} disabled={creatingInvite} style={{ fontSize: '0.85rem', flexShrink: 0 }}>
            {creatingInvite ? 'Generating…' : <><UserPlus size={15} /> Generate link</>}
          </Button>
        </div>
      )}

      {/* Two-column: recent runs + department breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Recent payroll runs */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Recent payroll runs</h3>
            <Link to="/enterprise/payroll" style={{ fontSize: '0.78rem', color: 'var(--teal)' }}>View all</Link>
          </div>
          {analyticsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner size={24} /></div>
          ) : analytics?.runs_history?.length ? (
            analytics.runs_history.slice(-5).reverse().map((r, i) => <RunBar key={i} run={r} />)
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              No payroll runs yet.<br />
              <Link to="/enterprise/payroll/run" style={{ color: 'var(--teal)' }}>Run your first payroll</Link>
            </div>
          )}
        </div>

        {/* Department breakdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.4rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1.1rem' }}>Department breakdown</h3>
          {analyticsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner size={24} /></div>
          ) : analytics?.department_breakdown?.length ? (
            analytics.department_breakdown.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-2)' }}>{d.department}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {fmtNgn(d.total_salary)} <span style={{ color: 'var(--text-3)' }}>· {d.count}</span>
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              Add employees with departments to see breakdown.
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
        {[
          { to: '/enterprise/employees', icon: Users,     label: 'Manage employees', color: 'var(--teal)' },
          { to: '/enterprise/setup',     icon: Buildings, label: 'Add / edit business', color: 'var(--amber)' },
          { to: '/enterprise/payroll',   icon: ChartBar,  label: 'Payroll history',  color: 'var(--blue)' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}0a`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={18} color={color} weight="duotone" />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</span>
              </div>
              <ArrowRight size={15} color="var(--text-3)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Fund wallet modal */}
      <Modal open={showDeposit} onClose={() => setShowDeposit(false)} title="Fund company wallet" maxWidth={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
            Deposit NGN into <strong>{activeCompany.name}</strong>'s wallet to cover payroll runs.
            Funds are processed via Flutterwave secure checkout.
          </p>
          <Input
            label="Amount (₦)"
            type="number"
            value={depositAmt}
            onChange={e => setDepositAmt(e.target.value)}
            placeholder="e.g. 500000"
            min={1}
            max={10_000_000}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowDeposit(false)}>Cancel</Button>
            <Button onClick={handleDeposit} disabled={depositing || !depositAmt}>
              {depositing ? 'Opening checkout…' : `Deposit ${depositAmt ? `₦${parseFloat(depositAmt).toLocaleString()}` : ''}`}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
