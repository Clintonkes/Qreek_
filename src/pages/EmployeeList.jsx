import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash, MagnifyingGlass, CopySimple, UserPlus, UploadSimple, Check, ArrowLeft, Bank, CaretRight, CaretLeft, PencilSimple } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getEmployees, removeEmployee, generateEmployeeInvite, getCompany, addEmployee, updateEmployee, getBanks, verifyAccount } from '../api/payroll.js';

const FMT = v => v ? `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 0 })}` : '—';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [deptFilter,setDeptFilter]= useState('');
  
  const [company, setCompany] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const [removing,  setRemoving]  = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [addStep, setAddStep] = useState(1);
  const [banks, setBanks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [addForm, setAddForm] = useState({
    name: '', email: '', phone: '',
    department: '', job_title: '', salary: '',
    bank_account: '', bank_code: '',
  });

  const setForm = (key, value) => setAddForm(prev => ({ ...prev, [key]: value }));

  const resetAddForm = () => {
    setAddForm({ name: '', email: '', phone: '', department: '', job_title: '', salary: '', bank_account: '', bank_code: '' });
    setAddStep(1);
    setVerifiedName('');
    setEditingEmp(null);
  };

  const handleOpenAdd = () => {
    if (banks.length === 0) {
      getBanks().then(d => setBanks(d.banks || [])).catch(() => {});
    }
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp) => {
    if (banks.length === 0) {
      getBanks().then(d => setBanks(d.banks || [])).catch(() => {});
    }
    setEditingEmp(emp);
    setAddForm({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      job_title: emp.job_title || '',
      salary: emp.salary ? String(emp.salary) : '',
      bank_account: emp.bank_account_full || emp.bank_account || '',
      bank_code: emp.bank_code || '',
    });
    setVerifiedName('');
    setAddStep(1);
    setShowAddModal(true);
  };

  const handleVerifyAccount = async () => {
    if (!addForm.bank_account || addForm.bank_account.length !== 10 || !addForm.bank_code) {
      toast.error('Enter a valid 10-digit account number and select a bank.');
      return;
    }
    setVerifying(true);
    setVerifiedName('');
    try {
      const res = await verifyAccount(addForm.bank_account, addForm.bank_code);
      setVerifiedName(res.account_name);
      toast.success('Account verified!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveEmployee = async () => {
    if (!addForm.name.trim()) { toast.error('Full name is required.'); return; }
    if (!addForm.salary || parseFloat(addForm.salary) <= 0) { toast.error('Salary must be greater than 0.'); return; }
    if (!addForm.bank_account || !addForm.bank_code) { toast.error('Bank account and bank are required.'); return; }
    if (!verifiedName && !editingEmp) { toast.error('Please verify the bank account before submitting.'); return; }

    const payload = {
      name: addForm.name.trim(),
      email: addForm.email || undefined,
      phone: addForm.phone || undefined,
      department: addForm.department || undefined,
      job_title: addForm.job_title || undefined,
      salary: parseFloat(addForm.salary),
      bank_account: addForm.bank_account,
      bank_code: addForm.bank_code,
    };

    setSaving(true);
    try {
      if (editingEmp) {
        await updateEmployee(editingEmp.id, payload);
        toast.success(`${addForm.name.trim()} updated.`);
      } else {
        await addEmployee(payload);
        toast.success(`${addForm.name.trim()} added to payroll.`);
      }
      setShowAddModal(false);
      resetAddForm();
      load();
    } catch (err) {
      const msg = editingEmp ? 'Failed to update employee.' : 'Failed to add employee.';
      toast.error(err.response?.data?.detail || err.message || msg);
    } finally {
      setSaving(false);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      getEmployees({ active_only: false }),
      getCompany().catch(() => ({ company: null, companies: [] })),
    ])
      .then(([d, c]) => {
        setEmployees(d.employees || []);
        // Prefer the active company from localStorage so the invite link is correct
        const activeId = localStorage.getItem('qreek_active_company');
        const allCos = c?.companies || [];
        let active = c?.company || null;
        if (activeId && allCos.length) {
          const found = allCos.find(x => x.id === activeId);
          if (found) active = found;
        }
        setCompany(active);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const getCompanyId = () => company?.id || 'default';

  const handleOpenInvite = () => {
    setShowInviteModal(true);
    setCopied(false);
  };

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    try {
      await generateEmployeeInvite();
      setShowInviteModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create invitation.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const copyToClipboard = async () => {
    if (!company?.invite_link) return;
    try {
      await navigator.clipboard.writeText(company.invite_link);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const handleRemove = async (emp) => {
    setRemoving(emp.id);
    try {
      await removeEmployee(emp.id);
      toast.success(`${emp.name || 'Employee'} removed.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove.');
    } finally {
      setRemoving(null);
    }
  };

  const depts     = useMemo(() => [...new Set(employees.filter(e => e.department).map(e => e.department).filter(Boolean))].sort(), [employees]);
  const filtered  = useMemo(() => employees.filter(e => {
    if (!e.is_active) return false;
    const q = search.toLowerCase();
    const name = (e.name || '').toLowerCase();
    return (!q || name.includes(q) || (e.email || '').toLowerCase().includes(q)) && (!deptFilter || e.department === deptFilter);
  }), [employees, search, deptFilter]);
  const totalPayroll = useMemo(() => employees.filter(e => e.is_active && e.salary).reduce((s, e) => s + (e.salary || 0), 0), [employees]);

  return (
    <AppShell title="Employees">
      <Link to="/enterprise" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--trans-fast)', marginBottom: '1.25rem' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <ArrowLeft size={16} weight="bold" /> Back to Enterprise
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Employee roster</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {employees.filter(e => e.is_active).length} active · Monthly payroll: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalPayroll)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => toast('Bulk import coming soon')}>
            <UploadSimple size={16} /> Bulk import
          </Button>
          {!company?.invite_link && (
            <Button variant="secondary" onClick={handleOpenInvite}>
              <UserPlus size={16} /> Invite link
            </Button>
          )}
          <Button onClick={handleOpenAdd}>
            <UserPlus size={16} /> Add employee
          </Button>
        </div>
      </div>

      {company?.invite_link && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--teal)', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.25rem' }}>
              QreekPay {company?.name ? `/ ${company.name}` : ''} · Shareable invite link
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', fontFamily: 'var(--font-mono)' }}>{company.invite_link}</div>
          </div>
          <Button variant="secondary" onClick={copyToClipboard} style={{ flexShrink: 0 }}>
            {copied ? <><Check size={16} /> Copied</> : <><CopySimple size={16} /> Copy</>}
          </Button>
        </div>
      )}

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
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📨</div>
          <h3 style={{ marginBottom: '0.5rem' }}>{company?.invite_link ? 'Share your invitation link' : 'Invite your employees'}</h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {company?.invite_link 
              ? 'Share this secure QreekPay link with your team. They can fill in their details and verify their bank accounts directly.'
              : 'Generate a secure link to invite your team. Employees will fill in their own details — no manual data entry needed.'
            }
          </p>
          {!company?.invite_link && (
            <Button onClick={handleGenerateInvite} disabled={creatingInvite}>
              {creatingInvite ? 'Generating…' : <><UserPlus size={16} /> Generate link</>}
            </Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          No employees match your search.
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 72px', minWidth: 800, gap: '0', padding: '0.75rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Employee</span><span>Bank</span><span>Department</span><span>Salary / mo</span><span></span>
          </div>
          {filtered.map((emp, i) => (
            <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 72px', minWidth: 800, gap: '0', padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{emp.job_title || emp.email || emp.phone || '—'}</div>
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                <div style={{ color: 'var(--text-2)' }}>{emp.bank_name || '—'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontSize: '0.75rem' }}>{emp.bank_account || ''}</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{emp.department || '—'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--teal)' }}>{FMT(emp.salary)}</div>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button onClick={() => handleOpenEdit(emp)} title="Edit employee" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <PencilSimple size={14} />
                </button>
                <button onClick={() => handleRemove(emp)} disabled={removing === emp.id} title="Remove employee" style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                  {removing === emp.id ? <Spinner size={14} /> : <Trash size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showInviteModal} onClose={creatingInvite ? undefined : () => setShowInviteModal(false)} title="Invite your team" maxWidth={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            Generate a secure link to invite your team. Once shared, your employees can instantly fill out their details and verify their bank accounts—no manual data entry required!
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button onClick={handleGenerateInvite} disabled={creatingInvite}>
              {creatingInvite ? 'Generating link…' : 'Generate link'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tripartite (3-step) employee addition / edit form */}
      <Modal open={showAddModal} onClose={() => { if (!saving) { setShowAddModal(false); resetAddForm(); } }} title={editingEmp ? 'Edit employee' : 'Add employee'} maxWidth={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            {['Personal info', 'Employment', 'Bank details'].map((label, i) => {
              const step = i + 1;
              const done = addStep > step;
              const active = addStep === step;
              return (
                <React.Fragment key={step}>
                  {i > 0 && <div style={{ flex: 1, height: 2, background: done ? 'var(--teal)' : 'var(--border)', borderRadius: 1 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: done ? 'var(--teal)' : active ? 'var(--teal)' : 'var(--surface-2)',
                      border: `2px solid ${done || active ? 'var(--teal)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: done || active ? '#fff' : 'var(--text-3)',
                      transition: 'var(--trans-fast)',
                    }}>
                      {done ? <Check size={12} weight="bold" /> : step}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: active || done ? 600 : 400, color: active || done ? 'var(--text)' : 'var(--text-3)' }}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1: Personal info */}
          {addStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Full name *" value={addForm.name} onChange={e => setForm('name', e.target.value)} placeholder="e.g. Chisom Okafor" />
              <Input label="Email" type="email" value={addForm.email} onChange={e => setForm('email', e.target.value)} placeholder="e.g. chisom@example.com" />
              <Input label="Phone" type="tel" value={addForm.phone} onChange={e => setForm('phone', e.target.value)} placeholder="e.g. 08031234567" />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button onClick={() => setAddStep(2)} disabled={!addForm.name.trim()}>
                  Next <CaretRight size={14} weight="bold" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Employment details */}
          {addStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Department" value={addForm.department} onChange={e => setForm('department', e.target.value)} placeholder="e.g. Engineering" />
              <Input label="Job title" value={addForm.job_title} onChange={e => setForm('job_title', e.target.value)} placeholder="e.g. Senior Developer" />
              <Input label="Monthly salary (₦) *" type="text" inputMode="numeric" value={addForm.salary} onChange={e => setForm('salary', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 500000" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setAddStep(1)}>
                  <CaretLeft size={14} weight="bold" /> Back
                </Button>
                <Button onClick={() => setAddStep(3)} disabled={!addForm.salary || parseFloat(addForm.salary) <= 0}>
                  Next <CaretRight size={14} weight="bold" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Bank details */}
          {addStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>
                  Bank *
                </label>
                <select
                  value={addForm.bank_code}
                  onChange={e => { setForm('bank_code', e.target.value); setVerifiedName(''); }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem' }}
                >
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>

              <Input
                label="Account number *"
                value={addForm.bank_account}
                onChange={e => { setForm('bank_account', e.target.value.replace(/\D/g, '').slice(0, 10)); setVerifiedName(''); }}
                placeholder="10-digit account number"
                maxLength={10}
                containerStyle={{ fontFamily: 'var(--font-mono)' }}
              />

              <Button
                variant="secondary"
                onClick={handleVerifyAccount}
                disabled={!addForm.bank_account || addForm.bank_account.length !== 10 || !addForm.bank_code || verifying}
                fullWidth
              >
                {verifying ? 'Verifying…' : 'Verify account'}
              </Button>

              {verifiedName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.9rem', background: 'rgba(0,212,170,0.1)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', color: 'var(--teal)', fontSize: '0.85rem' }}>
                  <Check size={16} weight="bold" />
                  <span><strong>{verifiedName}</strong> — account verified</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setAddStep(2)}>
                  <CaretLeft size={14} weight="bold" /> Back
                </Button>
                <Button onClick={handleSaveEmployee} disabled={saving || (!verifiedName && !editingEmp)}>
                  {saving ? 'Saving…' : editingEmp ? 'Save changes' : 'Add to payroll'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}

