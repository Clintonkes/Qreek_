import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Buildings, Users, Money, ChartBar, ArrowRight, Plus, Lightning,
  UserPlus, ShareNetwork, CaretRight, ArrowLeft,
} from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import {
  getCompany, getAnalytics, generateEmployeeInvite,
} from '../api/payroll.js';

const fmtNgn = (v) =>
  v >= 1_000_000
    ? `₦${(v / 1_000_000).toFixed(2)}M`
    : `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

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

function BusinessCard({ company }) {
  return (
    <Link to={`/enterprise/${company.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
        cursor: 'pointer', transition: 'all 0.18s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,212,170,0.02))'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
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
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Status</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{company.is_verified ? 'Verified' : 'Active'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>
          Manage business <CaretRight size={12} weight="bold" />
        </div>
      </div>
    </Link>
  );
}

export default function Enterprise() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [companies,     setCompanies]     = useState([]);
  const [company,       setCompany]       = useState(null);
  const [analytics,     setAnalytics]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const loadCompanyList = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getCompany();
      const cos = d.companies || [];
      setCompanies(cos);

      if (businessId) {
        const found = cos.find(c => c.id === businessId);
        if (found) {
          setCompany(found);
        } else {
          toast.error('Business not found.');
          navigate('/enterprise');
        }
      } else if (cos.length === 1) {
        setCompany(cos[0]);
      } else if (cos.length > 0) {
        const savedId = localStorage.getItem('qreek_active_company');
        const active = cos.find(c => c.id === savedId) || cos[0];
        setCompany(active);
      }
    } catch {
      toast.error('Could not load enterprise data.');
    } finally {
      setLoading(false);
    }
  }, [businessId, navigate]);

  const loadAnalytics = useCallback(async () => {
    if (!company) return;
    setAnalyticsLoading(true);
    try {
      const a = await getAnalytics().catch(() => null);
      if (a) setAnalytics(a);
    } catch {
      // non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  }, [company]);

  useEffect(() => { loadCompanyList(); }, [loadCompanyList]);
  useEffect(() => { if (company) loadAnalytics(); }, [company, loadAnalytics]);

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    try {
      await generateEmployeeInvite();
      toast.success('Invite link generated!');
      await loadCompanyList();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create invite link.');
    } finally {
      setCreatingInvite(false);
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

  // ── Render: business list view (no businessId) ───────────────────────────

  if (!businessId) return (
    <AppShell title="Enterprise">
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {companies.map(c => (
          <BusinessCard key={c.id} company={c} />
        ))}
      </div>
    </AppShell>
  );

  // ── Render: single business detail ───────────────────────────────────────

  const activeCompany = companies.find(c => c.id === company?.id) || company;

  return (
    <AppShell title={activeCompany?.name || 'Business'}>
      {/* Back to all businesses */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/enterprise" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-2)', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--trans-fast)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <ArrowLeft size={14} weight="bold" /> All businesses
        </Link>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
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
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{activeCompany?.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
            {activeCompany?.industry || 'Enterprise account'}
            {activeCompany?.rc_number ? ` · RC ${activeCompany.rc_number}` : ''}
            {activeCompany?.is_verified ? ' · ✓ Verified' : ''}
          </div>
        </div>
        {companies.length > 1 && (
          <select
            value={activeCompany?.id}
            onChange={e => navigate(`/enterprise/${e.target.value}`)}
            style={{ fontSize: '0.83rem', padding: '0.35rem 1.5rem 0.35rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer' }}
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Stats grid — no wallet */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Money}     label="Total paid"     value={fmtNgn(analytics?.total_paid_ngn || activeCompany?.total_paid_ngn)} color="var(--teal)" />
        <StatCard icon={Users}     label="Employees"      value={analytics?.employee_count ?? activeCompany?.employee_count ?? 0}   color="var(--blue)"  sub="active on payroll" />
        <StatCard icon={ChartBar}  label="Payroll runs"   value={analytics?.runs_history?.length || 0}        color="var(--amber)" />
        <StatCard icon={Buildings} label="Status"         value={activeCompany?.is_verified ? 'Verified' : 'Active'} color="var(--green)" sub="0.2% payroll fee" />
      </div>

      {/* Employee invite link section */}
      {activeCompany?.invite_link ? (
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
    </AppShell>
  );
}
