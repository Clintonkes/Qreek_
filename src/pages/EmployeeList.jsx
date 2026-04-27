import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, UploadSimple, MagnifyingGlass, Pencil, Trash, X, Check } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getEmployees, addEmployee, removeEmployee, updateEmployee, getBanks, bulkAddEmployees } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

function EmployeeModal({ open, onClose, onSaved, banks, editing }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', bank_account: '', bank_code: '', department: '', job_title: '', salary: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) setForm({ name: editing.name || '', email: editing.email || '', phone: editing.phone || '', bank_account: editing.bank_account_full || '', bank_code: editing.bank_code || '', department: editing.department || '', job_title: editing.job_title || '', salary: editing.salary || '' });
    else setForm({ name: '', email: '', phone: '', bank_account: '', bank_code: '', department: '', job_title: '', salary: '' });
    setErrors({});
  }, [editing, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name = 'Required';
    if (!form.bank_account.trim()) e.bank_account = 'Required';
    if (!/^\d{10}$/.test(form.bank_account)) e.bank_account = 'Must be 10 digits';
    if (!form.bank_code.trim())    e.bank_code = 'Required';
    if (!form.salary || +form.salary <= 0) e.salary = 'Must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { name: form.name, email: form.email || undefined, phone: form.phone || undefined, bank_account: form.bank_account, bank_code: form.bank_code, department: form.department || undefined, job_title: form.job_title || undefined, salary: parseFloat(form.salary) };
      if (editing) await updateEmployee(editing.id, data);
      else await addEmployee(data);
      toast.success(editing ? 'Employee updated.' : 'Employee added.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit employee' : 'Add employee'} maxWidth={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input label="Full name *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="Emeka Johnson" />
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="emeka@company.com" />
          <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 801 234 5678" />
          <Input label="Monthly salary (₦) *" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} error={errors.salary} placeholder="250000" />
          <Input label="Account number *" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} error={errors.bank_account} placeholder="0123456789" maxLength={10} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
          <div>
            <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: errors.bank_code ? 'var(--red)' : 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Bank *</label>
            <select value={form.bank_code} onChange={e => set('bank_code', e.target.value)} style={{ width: '100%', borderColor: errors.bank_code ? 'var(--red)' : undefined }}>
              <option value="">Select bank</option>
              {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            {errors.bank_code && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.bank_code}</span>}
          </div>
          <Input label="Department" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
          <Input label="Job title" value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Software Engineer" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : (editing ? 'Save changes' : 'Add employee')}</Button>
        </div>
      </div>
    </Modal>
  );
}

function BulkImportModal({ open, onClose, onImported, banks }) {
  const [csv, setCsv]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleImport = async () => {
    const lines = csv.trim().split('\n').filter(Boolean);
    if (!lines.length) { toast.error('Paste CSV data first.'); return; }
    const employees = lines.map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return { name: cols[0], bank_account: cols[1], bank_code: cols[2], salary: parseFloat(cols[3]) || 0, department: cols[4] || undefined, job_title: cols[5] || undefined, email: cols[6] || undefined, phone: cols[7] || undefined };
    });
    setLoading(true);
    try {
      const res = await bulkAddEmployees({ employees });
      setResult(res);
      if (res.added > 0) onImported();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk import employees" maxWidth={600}>
      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--green-faint)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', padding: '1rem', color: 'var(--green)' }}>
            ✅ {result.added} employee(s) imported successfully.
          </div>
          {result.errors?.length > 0 && (
            <div style={{ background: 'var(--red-faint)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '1rem', fontSize: '0.82rem' }}>
              <strong style={{ color: 'var(--red)' }}>Errors ({result.errors.length}):</strong>
              {result.errors.map((e, i) => <div key={i} style={{ color: 'var(--red)', marginTop: '0.25rem' }}>Row {e.row}: {e.name} — {e.error}</div>)}
            </div>
          )}
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            CSV format: Name, AccountNumber, BankCode, Salary, Department, JobTitle, Email, Phone<br />
            Example: Emeka Johnson,0123456789,058,250000,Engineering,Developer,emeka@co.com,
          </div>
          <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={10} placeholder="Paste CSV rows here, one employee per line..." style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={loading || !csv.trim()}>{loading ? 'Importing…' : `Import ${csv.trim().split('\n').filter(Boolean).length} rows`}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [banks,     setBanks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [deptFilter,setDeptFilter]= useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [showBulk,  setShowBulk]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [removing,  setRemoving]  = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getEmployees({ active_only: false }), getBanks()])
      .then(([ed, bd]) => { setEmployees(ed.employees || []); setBanks(bd.banks || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const depts     = useMemo(() => [...new Set(employees.map(e => e.department).filter(Boolean))].sort(), [employees]);
  const filtered  = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.name.toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q))
      && (!deptFilter || e.department === deptFilter);
  }), [employees, search, deptFilter]);

  const handleRemove = async (emp) => {
    setRemoving(emp.id);
    try {
      await removeEmployee(emp.id);
      toast.success(`${emp.name} removed.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove.');
    } finally {
      setRemoving(null);
    }
  };

  const totalPayroll = useMemo(() => employees.filter(e => e.is_active).reduce((s, e) => s + (e.salary || 0), 0), [employees]);

  return (
    <AppShell title="Employees">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Employee roster</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {employees.filter(e => e.is_active).length} active · Monthly payroll: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalPayroll)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setShowBulk(true)}><UploadSimple size={16} /> Bulk import</Button>
          <Button onClick={() => { setEditing(null); setShowAdd(true); }}><UserPlus size={16} /> Add employee</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <MagnifyingGlass size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" style={{ paddingLeft: '2.25rem' }} />
        </div>
        {depts.length > 0 && (
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">All departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          {employees.length === 0 ? 'No employees yet. Add your first employee to get started.' : 'No employees match your search.'}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: '0', padding: '0.75rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Employee</span><span>Bank</span><span>Department</span><span>Salary / mo</span><span>Actions</span>
          </div>
          {filtered.map((emp, i) => (
            <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: '0', padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'center', opacity: emp.is_active ? 1 : 0.5 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{emp.job_title || emp.email || emp.phone || '—'}</div>
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                <div style={{ color: 'var(--text-2)' }}>{emp.bank_name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontSize: '0.75rem' }}>{emp.bank_account}</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{emp.department || '—'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--teal)' }}>{FMT(emp.salary)}</div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => { setEditing(emp); setShowAdd(true); }} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleRemove(emp)} disabled={removing === emp.id || !emp.is_active} style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                  {removing === emp.id ? <Spinner size={14} /> : <Trash size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EmployeeModal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} onSaved={load} banks={banks} editing={editing} />
      <BulkImportModal open={showBulk} onClose={() => setShowBulk(false)} onImported={load} banks={banks} />
    </AppShell>
  );
}
