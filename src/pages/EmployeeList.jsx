import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash, MagnifyingGlass, CopySimple, UserPlus, UploadSimple, Check, ArrowLeft, ArrowSquareOut } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getEmployees, removeEmployee, generateEmployeeInvite, getCompany } from '../api/payroll.js';

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

  const load = () => {
    setLoading(true);
    Promise.all([
      getEmployees({ active_only: false }),
      getCompany().catch(() => ({ company: null })),
    ])
      .then(([d, c]) => {
        setEmployees(d.employees || []);
        setCompany(c?.company || null);
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
            <Button onClick={handleOpenInvite}>
              <UserPlus size={16} /> Add employee
            </Button>
          )}
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', minWidth: 800, gap: '0', padding: '0.75rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Employee</span><span>Bank</span><span>Department</span><span>Salary / mo</span><span></span>
          </div>
          {filtered.map((emp, i) => (
            <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', minWidth: 800, gap: '0', padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
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
              <button onClick={() => handleRemove(emp)} disabled={removing === emp.id} title="Remove employee" style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                {removing === emp.id ? <Spinner size={14} /> : <Trash size={14} />}
              </button>
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
    </AppShell>
  );
}

