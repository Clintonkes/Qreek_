import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Buildings, Users, Money, ChartBar, ArrowRight, Plus, Lightning } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import { getCompany, getAnalytics } from '../api/payroll.js';

function StatCard({ icon: Icon, label, value, color = 'var(--teal)', sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-2)', fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
        <Icon size={16} color={color} />
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

function RunBar({ run }) {
  const pct = run.count ? 100 : 0;
  const color = run.status === 'completed' ? 'var(--green)' : run.status === 'partial' ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{run.period}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{run.count} employees</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text)' }}>
        ₦{(run.total_net || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
      </div>
      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: color + '20', color }}>{run.status}</span>
    </div>
  );
}

export default function Enterprise() {
  const [company,   setCompany]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCompany()
      .then(d => {
        setCompany(d.company);
        if (d.company) return getAnalytics();
      })
      .then(d => { if (d) setAnalytics(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppShell title="Enterprise">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
    </AppShell>
  );

  if (!company) return (
    <AppShell title="Enterprise">
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Set up your enterprise payment pool</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Organize salaries, vendor settlements, and recurring team payouts from one Qreek pool. Add employees, stage funds, and run structured disbursements to any Nigerian bank.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> Salaries and vendor payouts from one pool
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> 0.3% payout fee with cleaner visibility
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> Bulk import up to 500 employees
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> PIN-secured payout execution
          </div>
        </div>
        <Button style={{ marginTop: '2rem', padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/enterprise/setup')}>
          Get started — it&apos;s free <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );

  const fmtNgn = v => v >= 1_000_000
    ? `₦${(v / 1_000_000).toFixed(2)}M`
    : `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

  return (
    <AppShell title="Enterprise">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{company.name}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{company.industry || 'Enterprise account'} {company.rc_number ? `· RC ${company.rc_number}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate('/enterprise/employees')}><Users size={16} /> Employees</Button>
          <Button onClick={() => navigate('/enterprise/payroll/run')}><Lightning size={16} /> Run payroll</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Money}    label="Total paid"    value={fmtNgn(analytics?.total_paid_ngn)}  color="var(--teal)" />
        <StatCard icon={Users}    label="Employees"     value={company.employee_count || 0}           color="var(--blue)" sub="active on payroll" />
        <StatCard icon={ChartBar} label="Payroll runs"  value={analytics?.runs_history?.length || 0}  color="var(--amber)" />
        <StatCard icon={Buildings}label="Status"        value={company.is_verified ? 'Verified' : 'Active'} color="var(--green)" sub="0.3% payroll fee" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Recent payroll runs</h3>
            <Link to="/enterprise/payroll" style={{ fontSize: '0.8rem', color: 'var(--teal)' }}>View all</Link>
          </div>
          {analytics?.runs_history?.length ? (
            analytics.runs_history.slice(-5).reverse().map((r, i) => <RunBar key={i} run={r} />)
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
              No payroll runs yet.<br />
              <Link to="/enterprise/payroll/run" style={{ color: 'var(--teal)' }}>Run your first payroll</Link>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Department breakdown</h3>
          {analytics?.department_breakdown?.length ? (
            analytics.department_breakdown.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-2)' }}>{d.department}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtNgn(d.total_salary)} <span style={{ color: 'var(--text-3)' }}>· {d.count}</span></span>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
              Add employees with departments to see breakdown.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/enterprise/employees" style={{ flex: 1, minWidth: 200, textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={20} color="var(--teal)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Manage employees</span>
            </div>
            <ArrowRight size={16} color="var(--text-3)" />
          </div>
        </Link>
        <Link to="/payment-links" style={{ flex: 1, minWidth: 200, textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Plus size={20} color="var(--amber)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Payment links</span>
            </div>
            <ArrowRight size={16} color="var(--text-3)" />
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
