import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Warning, CheckCircle, Lock } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getEmployees, createPayrollRun, executePayrollRun } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS  = [2025, 2026, 2027];

function SummaryRow({ entry }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '0', padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{entry.employee_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{entry.bank_name} ****{entry.bank_account?.slice(-4)}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{FMT(entry.gross_amount)}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--red)' }}>-{FMT(entry.fee)}</div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 600 }}>{FMT(entry.net_amount)}</div>
    </div>
  );
}

export default function PayrollRunCreate() {
  const navigate = useNavigate();
  const now      = new Date();
  const [step,        setStep]       = useState(0);
  const [employees,   setEmployees]  = useState([]);
  const [selected,    setSelected]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [month,       setMonth]      = useState(MONTHS[now.getMonth()]);
  const [year,        setYear]       = useState(now.getFullYear());
  const [note,        setNote]       = useState('');
  const [run,         setRun]        = useState(null);
  const [preview,     setPreview]    = useState([]);
  const [building,    setBuilding]   = useState(false);
  const [pin,         setPin]        = useState('');
  const [executing,   setExecuting]  = useState(false);
  const [done,        setDone]       = useState(false);
  const [selectAll,   setSelectAll]  = useState(true);

  useEffect(() => {
    getEmployees({ active_only: true })
      .then(d => { setEmployees(d.employees || []); setSelected((d.employees || []).map(e => e.id)); })
      .finally(() => setLoading(false));
  }, []);

  const toggleEmp = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => { setSelectAll(!selectAll); setSelected(!selectAll ? employees.map(e => e.id) : []); };

  const handleBuildRun = async () => {
    if (!selected.length) { toast.error('Select at least one employee.'); return; }
    setBuilding(true);
    try {
      const periodLabel = `${month} ${year}`;
      const data = await createPayrollRun({ period_label: periodLabel, note: note || undefined, employee_ids: selected.length === employees.length ? undefined : selected });
      setRun(data.run);
      setPreview(data.preview);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to build payroll.');
    } finally {
      setBuilding(false);
    }
  };

  const handleExecute = async () => {
    if (!pin || pin.length < 4) { toast.error('Enter your PIN.'); return; }
    if (!run) return;
    setExecuting(true);
    try {
      await executePayrollRun(run.id, { pin });
      setDone(true);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Execution failed. Check your PIN.');
    } finally {
      setExecuting(false);
    }
  };

  const totalGross = run?.total_gross || 0;
  const totalFee   = run?.total_fee   || 0;
  const totalNet   = run?.total_net   || 0;

  return (
    <AppShell title="New payroll run">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {step > 0 && step < 3 && (
            <button onClick={() => setStep(s => s - 1)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.4rem' }}>New payroll run</h1>
            <div style={{ display: 'flex', gap: '0', marginTop: '0.5rem' }}>
              {['Period', 'Employees', 'Review', 'Done'].map((lbl, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', color: i <= step ? 'var(--teal)' : 'var(--text-3)', fontWeight: i === step ? 700 : 400 }}>{lbl}</div>
                  {i < 3 && <div style={{ width: 24, height: 1, background: i < step ? 'var(--teal)' : 'var(--border)', margin: '0 0.4rem' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-2)' }}>Step 1 — Select payroll period</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Month</label>
                  <select value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%' }}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Year</label>
                  <select value={year} onChange={e => setYear(+e.target.value)} style={{ width: '100%' }}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <Input label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Includes performance bonus for Q1" />
              <Button onClick={() => setStep(1)} style={{ alignSelf: 'flex-end' }}>Select employees <ArrowRight size={16} /></Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>Step 2 — Select employees ({selected.length} of {employees.length})</h2>
              {loading ? <Spinner size={28} /> : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius) var(--radius) 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input type="checkbox" checked={selected.length === employees.length} onChange={toggleAll} />
                      Select all
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Monthly total: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(employees.filter(e => selected.includes(e.id)).reduce((s, e) => s + e.salary, 0))}</strong></span>
                  </div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0 0 var(--radius) var(--radius)', maxHeight: 400, overflowY: 'auto' }}>
                    {employees.map((emp, i) => (
                      <label key={emp.id} style={{ display: 'grid', gridTemplateColumns: 'auto 2fr 1fr 1fr', gap: '1rem', padding: '0.85rem 1rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', alignItems: 'center' }}>
                        <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleEmp(emp.id)} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{emp.department || emp.job_title || '—'}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{emp.bank_name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--teal)' }}>{FMT(emp.salary)}</div>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                    <Button onClick={handleBuildRun} disabled={building || !selected.length}>
                      {building ? <><Spinner size={16} /> Building…</> : <>Preview payroll <ArrowRight size={16} /></>}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && run && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>Step 3 — Review & confirm</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {[['Total gross', FMT(totalGross), 'var(--text)'], ['Fee (0.3%)', FMT(totalFee), 'var(--red)'], ['Employees receive', FMT(totalNet), 'var(--teal)']].map(([l, v, c]) => (
                  <div key={l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '0', padding: '0.6rem 1rem', background: 'var(--surface-2)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                  <span>Employee</span><span>Gross</span><span>Fee</span><span>Net</span>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {preview.map((e, i) => <SummaryRow key={i} entry={e} />)}
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-2)', fontSize: '0.88rem' }}>
                  <Lock size={16} color="var(--teal)" />
                  Enter your Qreek PIN to authorise this payroll
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Input
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    maxLength={6}
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', fontSize: '1.2rem', maxWidth: 160 }}
                    containerStyle={{ flex: 0 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleExecute(); }}
                  />
                  <Button onClick={handleExecute} disabled={executing || pin.length < 4} style={{ height: 46 }}>
                    {executing ? <><Spinner size={16} /> Sending payments…</> : `Pay ${preview.length} employees`}
                  </Button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Warning size={13} color="var(--amber)" /> This will immediately initiate {preview.length} bank transfers totalling {FMT(totalNet)}. This action cannot be undone.
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle size={56} color="var(--green)" weight="fill" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payroll is processing!</h2>
              <p style={{ color: 'var(--text-2)', maxWidth: 420, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                {preview.length} salary payments are being sent now. Each employee will receive their money within 5 minutes.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => navigate('/enterprise/payroll')}>View all runs</Button>
                <Button onClick={() => navigate('/enterprise')}>Back to dashboard</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
