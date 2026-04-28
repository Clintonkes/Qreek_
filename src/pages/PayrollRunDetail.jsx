// PayrollRunDetail.jsx shows the full breakdown of one payroll batch and its entry-level outcomes.
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, DownloadSimple } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPayrollRun } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const STATUS_ICONS = {
  completed:  <CheckCircle size={16} color="var(--green)" weight="fill" />,
  failed:     <XCircle size={16} color="var(--red)" weight="fill" />,
  pending:    <Clock size={16} color="var(--text-3)" />,
  processing: <Clock size={16} color="var(--amber)" />,
};

export default function PayrollRunDetail() {
  const { runId }   = useParams();
  const navigate    = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayrollRun(runId)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [runId]);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !data) return;
    const { run, entries } = data;
    win.document.write(`
      <html><head><title>Payroll Receipt — ${run.period_label}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; color: #111; }
        h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
        .sub { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
        th { background: #f5f5f5; font-weight: 700; }
        .mono { font-family: monospace; }
        .totals { margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .total-box { background: #f9f9f9; padding: 1rem; border-radius: 6px; }
        .total-box strong { font-family: monospace; font-size: 1.1rem; }
        .ok { color: green; } .fail { color: red; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>Payroll Receipt — ${run.period_label}</h1>
      <div class="sub">Run ID: ${run.id} · Processed: ${run.completed_at ? new Date(run.completed_at).toLocaleString('en-NG') : 'In progress'}</div>
      <div class="totals">
        <div class="total-box"><div style="color:#666;font-size:0.75rem">Total gross</div><strong>${FMT(run.total_gross)}</strong></div>
        <div class="total-box"><div style="color:#666;font-size:0.75rem">Fee (0.3%)</div><strong style="color:#c00">${FMT(run.total_fee)}</strong></div>
        <div class="total-box"><div style="color:#666;font-size:0.75rem">Total disbursed</div><strong style="color:green">${FMT(run.total_net)}</strong></div>
      </div>
      <br/>
      <table>
        <tr><th>Employee</th><th>Bank</th><th>Account</th><th>Gross</th><th>Fee</th><th>Net</th><th>Status</th><th>Reference</th></tr>
        ${entries.map(e => `<tr>
          <td>${e.employee_name}</td>
          <td>${e.bank_name}</td>
          <td class="mono">${e.bank_account}</td>
          <td class="mono">${FMT(e.gross_amount)}</td>
          <td class="mono" style="color:#c00">${FMT(e.fee)}</td>
          <td class="mono" style="color:green">${FMT(e.net_amount)}</td>
          <td class="${e.status === 'completed' ? 'ok' : 'fail'}">${e.status}</td>
          <td class="mono" style="font-size:0.75rem">${e.reference || '—'}</td>
        </tr>`).join('')}
      </table>
      <br/><button onclick="window.print()">Print / Save as PDF</button>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <AppShell title="Payroll run">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
    </AppShell>
  );

  if (!data) return (
    <AppShell title="Payroll run">
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>Run not found.</div>
    </AppShell>
  );

  const { run, entries } = data;

  return (
    <AppShell title={`Payroll — ${run.period_label}`}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/enterprise/payroll')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.4rem' }}>{run.period_label}</h1>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Run ID: {run.id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Badge status={run.status}>{run.status}</Badge>
            <Button variant="secondary" onClick={handlePrint}><DownloadSimple size={16} /> Export receipt</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            ['Employees', run.entry_count, 'var(--text)'],
            ['Paid', run.paid_count, 'var(--green)'],
            ['Failed', run.failed_count, run.failed_count > 0 ? 'var(--red)' : 'var(--text-3)'],
            ['Total gross', FMT(run.total_gross), 'var(--text)'],
            ['Fee (0.3%)', FMT(run.total_fee), 'var(--text-2)'],
            ['Total net', FMT(run.total_net), 'var(--teal)'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.35rem' }}>{l}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {run.note && (
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>
            Note: {run.note}
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0', padding: '0.6rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>
            <span>Employee</span><span>Gross</span><span>Net</span><span>Reference</span><span>Status</span>
          </div>
          {entries.map((entry, i) => (
            <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0', padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{entry.employee_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{entry.bank_name} {entry.bank_account}</div>
                {entry.error_msg && <div style={{ fontSize: '0.72rem', color: 'var(--red)', marginTop: '0.2rem' }}>{entry.error_msg}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-2)' }}>{FMT(entry.gross_amount)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600 }}>{FMT(entry.net_amount)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)' }}>{entry.reference || '—'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {STATUS_ICONS[entry.status] || STATUS_ICONS.pending}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
