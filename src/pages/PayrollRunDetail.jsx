// PayrollRunDetail.jsx shows the full breakdown of one payroll batch and its entry-level outcomes.
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, DownloadSimple, Repeat } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPayrollRun, retryPayrollEntry, retryAllFailed, exportRunCsv, getPayslip } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const STATUS_ICONS = {
  completed:  <CheckCircle size={16} color="var(--green)" weight="fill" />,
  failed:     <XCircle size={16} color="var(--red)" weight="fill" />,
  pending:    <Clock size={16} color="var(--text-3)" />,
  processing: <Clock size={16} color="var(--amber)" />,
};

/**
 * PayrollRunDetail component - Displays comprehensive details for a specific payroll batch.
 * Features include overall aggregate metrics (gross, fees, failed vs completed counts),
 * a granular list of individual employee disbursement statuses, and an exportable receipt view.
 *
 * @returns {JSX.Element}
 */
export default function PayrollRunDetail() {
  const { runId }   = useParams();
  const navigate    = useNavigate();
  const [data,      setData]    = useState(null);
  const [loading,   setLoading] = useState(true);
  const [retrying,  setRetrying] = useState(null);

  const load = () => {
    setLoading(true);
    getPayrollRun(runId).then(d => setData(d)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [runId]);

  const handleRetry = async (entryId) => {
    setRetrying(entryId);
    try {
      await retryPayrollEntry(runId, entryId);
      toast.success('Entry retried successfully.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Retry failed.');
    } finally {
      setRetrying(null);
    }
  };

  const handleRetryAll = async () => {
    setRetrying('all');
    try {
      const res = await retryAllFailed(runId);
      toast.success(res.message || 'Retried all failed entries.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bulk retry failed.');
    } finally {
      setRetrying(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportRunCsv(runId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${data?.run?.period_label?.replace(/\s/g, '_') || runId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded.');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const handlePayslip = async (entry) => {
    try {
      const slip = await getPayslip(runId, entry.id);
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`
        <html><head><title>Payslip — ${slip.employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; color: #111; max-width: 500px; margin: 0 auto; }
          h1 { font-size: 1.3rem; margin-bottom: 0.25rem; }
          .co { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
          th { background: #f5f5f5; }
          .mono { font-family: monospace; }
          .total { font-weight: 700; font-size: 1rem; }
          @media print { button { display: none; } }
        </style></head><body>
        <h1>Payslip</h1>
        <div class="co">${slip.company} · ${slip.period} · RC ${slip.company_rc || 'N/A'}</div>
        <table>
          <tr><th colspan="2">Employee</th></tr>
          <tr><td>Name</td><td>${slip.employee.name}</td></tr>
          <tr><td>Bank</td><td>${slip.employee.bank_name} ${slip.employee.bank_account}</td></tr>
          <tr><th colspan="2">Earnings</th></tr>
          <tr><td>Gross</td><td class="mono">${FMT(slip.earnings.gross)}</td></tr>
          <tr><td>Fee</td><td class="mono" style="color:#c00">-${FMT(slip.earnings.fee)}</td></tr>
          <tr><td class="total">Net</td><td class="mono total" style="color:green">${FMT(slip.earnings.net)}</td></tr>
          <tr><th colspan="2">Details</th></tr>
          <tr><td>Status</td><td>${slip.status}</td></tr>
          <tr><td>Reference</td><td class="mono" style="font-size:0.75rem">${slip.reference || '—'}</td></tr>
          <tr><td>Paid at</td><td>${slip.paid_at ? new Date(slip.paid_at).toLocaleString('en-NG') : '—'}</td></tr>
        </table>
        <br/><button onclick="window.print()">Print / Save as PDF</button>
        </body></html>
      `);
      win.document.close();
    } catch (err) {
      toast.error('Failed to load payslip.');
    }
  };

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
        <div class="total-box"><div style="color:#666;font-size:0.75rem">Fee (0.2%)</div><strong style="color:#c00">${FMT(run.total_fee)}</strong></div>
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
            {(run.status === 'partial' || run.status === 'failed') && (
              <Button variant="secondary" onClick={handleRetryAll} disabled={retrying === 'all'}>
                <Repeat size={16} /> {retrying === 'all' ? 'Retrying…' : `Retry all (${run.failed_count})`}
              </Button>
            )}
            <Button variant="secondary" onClick={handleExportCsv}><DownloadSimple size={16} /> CSV</Button>
            <Button variant="secondary" onClick={handlePrint}><DownloadSimple size={16} /> Print receipt</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            ['Employees', run.entry_count, 'var(--text)'],
            ['Paid', run.paid_count, 'var(--green)'],
            ['Failed', run.failed_count, run.failed_count > 0 ? 'var(--red)' : 'var(--text-3)'],
            ['Total gross', FMT(run.total_gross), 'var(--text)'],
            ['Fee (0.2%)', FMT(run.total_fee), 'var(--text-2)'],
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

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto auto', minWidth: 800, gap: '0', padding: '0.6rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>
            <span>Employee</span><span>Gross</span><span>Net</span><span>Reference</span><span>Status</span><span />
          </div>
          {entries.map((entry, i) => (
            <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto auto', minWidth: 800, gap: '0', padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
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
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {entry.status === 'failed' && (
                  <button onClick={() => handleRetry(entry.id)} disabled={retrying === entry.id} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'var(--teal)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Repeat size={12} /> {retrying === entry.id ? '…' : 'Retry'}
                  </button>
                )}
                <button onClick={() => handlePayslip(entry)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  📄 Payslip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
