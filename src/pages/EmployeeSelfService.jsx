import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Check, Buildings, Bank } from 'phosphor-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getEmployeeByToken, updateEmployeeByToken, verifyAccount, getBanks } from '../api/payroll.js';

export default function EmployeeSelfService() {
  const { company: companySlug, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState(null); // 'invite' | 'edit'
  const [companyName, setCompanyName] = useState('');
  const [banks, setBanks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', bank_account: '', bank_code: '', department: '', job_title: '', salary: '' });
  const [verifiedName, setVerifiedName] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getBanks()
      .then(d => setBanks(d.banks || []))
      .catch(() => {});
    getEmployeeByToken(token)
      .then(d => {
        if (d.mode === 'invite') {
          setMode('invite');
          setCompanyName(d.company_name || 'your company');
        } else {
          setMode('edit');
          const emp = d.employee;
          setEmployee(emp);
          setForm({
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            bank_account: '',
            bank_code: emp.bank_code || '',
            department: emp.department || '',
            job_title: emp.job_title || '',
            salary: emp.salary || '',
          });
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.detail || 'Invalid or expired link.');
        navigate('/', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleBankChange = (field, value) => {
    set(field, value);
    setVerifiedName(null);
  };

  const handleVerify = async () => {
    if (!form.bank_account || !/^\d{10}$/.test(form.bank_account)) {
      toast.error('Enter a valid 10-digit account number.');
      return;
    }
    if (!form.bank_code) {
      toast.error('Select a bank.');
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyAccount(form.bank_account, form.bank_code);
      setVerifiedName(res.account_name);
      toast.success(`Account verified: ${res.account_name}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed. Check the bank details.');
    } finally {
      setVerifying(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.salary || +form.salary <= 0) e.salary = 'Enter a valid salary';
    if (!form.bank_account) e.bank_account = 'Required';
    else if (!/^\d{10}$/.test(form.bank_account)) e.bank_account = 'Must be 10 digits';
    else if (!verifiedName) e.bank_account = 'Verify bank account first';
    if (!form.bank_code) e.bank_code = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        name: form.name,
        salary: parseFloat(form.salary),
        bank_account: form.bank_account,
        bank_code: form.bank_code,
        email: form.email || undefined,
        phone: form.phone || undefined,
        department: form.department || undefined,
        job_title: form.job_title || undefined,
      };
      await updateEmployeeByToken(token, data);
      toast.success(mode === 'invite' ? 'Welcome! Your details have been submitted.' : 'Your details have been updated!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', padding: '1rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 440, width: '100%', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Check size={28} color="var(--green)" />
          </div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{mode === 'invite' ? 'Welcome aboard!' : 'Details saved!'}</h1>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {mode === 'invite'
              ? `Your information has been submitted to ${companyName}'s payroll system.`
              : 'Your information has been updated in the company payroll system.'}
          </p>
          <Button onClick={() => navigate('/')}>Go to home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Buildings size={24} color="var(--teal)" />
          <h1 style={{ fontSize: '1.3rem' }}>{mode === 'invite' ? 'Join your company payroll' : 'Update your details'}</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>QreekPay · Employee onboarding</p>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {mode === 'invite'
            ? `${companyName} has invited you to join their payroll system. Fill in your details below — your bank account will be verified in real-time.`
            : 'Update your payroll information below. Your bank details will be verified in real-time.'}
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full name *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="Your full name" />
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" />
            <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 801 234 5678" />
            <Input label="Monthly salary (₦) *" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} error={errors.salary} placeholder="250000" />
            <Input label="Account number *" value={form.bank_account} onChange={e => handleBankChange('bank_account', e.target.value)} error={errors.bank_account} placeholder="0123456789" maxLength={10} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
            <div>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: errors.bank_code ? 'var(--red)' : 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Bank *</label>
              <select value={form.bank_code} onChange={e => handleBankChange('bank_code', e.target.value)} style={{ width: '100%', borderColor: errors.bank_code ? 'var(--red)' : undefined }}>
                <option value="">Select bank</option>
                {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
              {errors.bank_code && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.bank_code}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <Button variant="secondary" onClick={handleVerify} disabled={verifying || !form.bank_account || !form.bank_code}>
              {verifying ? 'Verifying…' : 'Verify account'}
            </Button>
            {verifiedName && (
              <span style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 600 }}>
                <Check size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {verifiedName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
            <Input label="Department" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
            <Input label="Job title" value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Software Engineer" />
          </div>

          {employee?.bank_name && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bank size={16} />
              Current bank on file: <strong>{employee.bank_name}</strong> ({employee.bank_account_masked})
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <Button onClick={handleSubmit} disabled={saving || !verifiedName}>
              {saving ? 'Saving…' : (mode === 'invite' ? 'Submit details' : 'Save details')}
            </Button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '1rem' }}>
          Secured by Qreek Finance · Your bank details are verified in real-time
        </p>
      </motion.div>
    </div>
  );
}
