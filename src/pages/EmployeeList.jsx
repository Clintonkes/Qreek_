import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LinkSimple, Trash, MagnifyingGlass, CopySimple, UserPlus, UploadSimple, Check } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getEmployees, removeEmployee, generateEmployeeLink, generateEmployeeInvite } from '../api/payroll.js';

const FMT = v => v ? `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 0 })}` : '—';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [deptFilter,setDeptFilter]= useState('');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const [generating, setGenerating] = useState(null);
  const [removing,  setRemoving]  = useState(null);

  const load = () => {
    setLoading(true);
    getEmployees({ active_only: false })
      .then(d => setEmployees(d.employees || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpenInvite = () => {
    setShowInviteModal(true);
    setInviteLink('');
    setCopied(false);
  };

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    try {
      const res = await generateEmployeeInvite();
      setInviteLink(res.link);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create invitation.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const handleGenerateLink = async (emp) => {
    setGenerating(emp.id);
    try {
      const res = await generateEmployeeLink(emp.id);
      try {
        await navigator.clipboard.writeText(res.link);
        toast.success(`Link copied for ${emp.name || 'employee'}`);
      } catch {
        toast.success(`Link: ${res.link}`, { duration: 10000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate link.');
    } finally {
      setGenerating(null);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Employee roster</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {employees.filter(e => e.is_active).length} active · Monthly payroll: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalPayroll)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => toast('Bulk import coming soon')}>
            <UploadSimple size={16} /> Bulk import
          </Button>
          <Button onClick={handleOpenInvite}>
            <UserPlus size={16} /> Add employee
          </Button>
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
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📨</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Invite your employees</h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Create one invitation link and share it with all your employees.<br />
            Each employee fills in their own details — no manual data entry needed.
          </p>
          <Button onClick={handleOpenInvite}>
            <UserPlus size={16} /> Add employee
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          No employees match your search.
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', minWidth: 800, gap: '0', padding: '0.75rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Employee</span><span>Bank</span><span>Department</span><span>Salary / mo</span><span>Actions</span>
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
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => handleGenerateLink(emp)} disabled={generating === emp.id} title="Generate self-service edit link" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--teal)', display: 'flex', alignItems: 'center' }}>
                  {generating === emp.id ? <Spinner size={14} /> : <LinkSimple size={14} />}
                </button>
                <button onClick={() => handleRemove(emp)} disabled={removing === emp.id} style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                  {removing === emp.id ? <Spinner size={14} /> : <Trash size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Add employee" maxWidth={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            Instead of adding employees manually, generate an invitation link and share it with your team. Employees will fill in their own details and verify their bank accounts.
          </p>
          
          {inviteLink ? (
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.4rem', display: 'block' }}>Invitation Link</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input value={inviteLink} readOnly style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
                <Button variant="secondary" onClick={copyToClipboard} style={{ padding: '0 1rem' }}>
                  {copied ? <Check size={18} color="var(--green)" /> : <CopySimple size={18} />}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button onClick={handleGenerateInvite} disabled={creatingInvite}>
                {creatingInvite ? 'Generating link…' : 'Generate link'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}

