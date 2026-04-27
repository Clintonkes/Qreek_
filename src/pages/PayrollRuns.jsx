import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lightning, Clock, CheckCircle, XCircle, Warning } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPayrollRuns } from '../api/payroll.js';

const STATUS_MAP = {
  pending:    { label: 'Pending',    color: 'var(--text-3)',  icon: Clock },
  processing: { label: 'Processing', color: 'var(--amber)',   icon: Clock },
  completed:  { label: 'Completed',  color: 'var(--green)',   icon: CheckCircle },
  partial:    { label: 'Partial',    color: 'var(--amber)',   icon: Warning },
  failed:     { label: 'Failed',     color: 'var(--red)',     icon: XCircle },
};

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

function RunCard({ run }) {
  const s    = STATUS_MAP[run.status] || STATUS_MAP.pending;
  const Icon = s.icon;

  return (
    <Link to={`/enterprise/payroll/${run.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', transition: 'var(--trans-fast)', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{run.period_label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
              {new Date(run.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: s.color, fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            <Icon size={15} weight="fill" />
            {s.label}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.15rem' }}>Total net</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--teal)' }}>{FMT(run.total_net)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.15rem' }}>Employees</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{run.entry_count}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.15rem' }}>Fee (0.3%)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-2)' }}>{FMT(run.total_fee)}</div>
          </div>
        </div>

        {run.status === 'partial' && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--amber)', background: 'var(--amber-faint)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }}>
            {run.paid_count} paid · {run.failed_count} failed — click to view details
          </div>
        )}
        {run.note && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>{run.note}</div>
        )}
      </div>
    </Link>
  );
}

export default function PayrollRuns() {
  const [runs,    setRuns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPayrollRuns().then(d => setRuns(d.runs || [])).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Payroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Payroll runs</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{runs.length} total runs</p>
        </div>
        <Button onClick={() => navigate('/enterprise/payroll/run')}><Lightning size={16} /> New payroll run</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>
      ) : runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💸</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>No payroll runs yet.</div>
          <Button onClick={() => navigate('/enterprise/payroll/run')}>Run your first payroll</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {runs.map(run => <RunCard key={run.id} run={run} />)}
        </div>
      )}
    </AppShell>
  );
}
