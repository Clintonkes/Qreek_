// CompanySetup.jsx walks a business owner through the minimum company details
// needed to activate enterprise payment and payroll features.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Buildings, ArrowRight, ArrowLeft } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { createCompany } from '../api/payroll.js';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Manufacturing',
  'Retail & E-commerce', 'Construction', 'Agriculture', 'Logistics & Transport',
  'Media & Entertainment', 'Hospitality', 'Legal & Consulting', 'NGO / Non-profit', 'Other',
];

const STEPS = ['Company details', 'Contact info', 'Review & create'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.5rem' }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= current ? 'var(--teal)' : 'var(--surface-2)',
              color: i <= current ? 'var(--text-inv)' : 'var(--text-3)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem',
              border: i === current ? '2px solid var(--teal)' : 'none',
              boxShadow: i === current ? 'var(--shadow-teal)' : 'none',
              transition: 'var(--trans)',
            }}>{i < current ? '✓' : i + 1}</div>
            <span style={{ fontSize: '0.72rem', color: i === current ? 'var(--teal)' : 'var(--text-3)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? 'var(--teal)' : 'var(--border)', margin: '0 0.5rem', marginBottom: '1.2rem', transition: 'var(--trans)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CompanySetup() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({
    name: '', industry: '', rc_number: '', email: '', address: '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Company name is required.'); return; }
    setLoading(true);
    try {
      await createCompany({ name: form.name, industry: form.industry || undefined, rc_number: form.rc_number || undefined, email: form.email || undefined, address: form.address || undefined });
      toast.success('Company created! Start adding employees.');
      navigate('/enterprise/employees');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create company.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Company setup">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Buildings size={28} color="var(--teal)" weight="duotone" />
          <h1 style={{ fontSize: '1.5rem' }}>Set up your company</h1>
        </div>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Takes 2 minutes. You can edit everything later.
        </p>

        <StepIndicator current={step} />

        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Company name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Technologies Ltd" autoFocus />
            <div>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Industry</label>
              <select value={form.industry} onChange={e => set('industry', e.target.value)} style={{ width: '100%' }}>
                <option value="">Select industry (optional)</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <Input label="CAC / RC Number (optional)" value={form.rc_number} onChange={e => set('rc_number', e.target.value)} placeholder="RC 1234567" />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Company email (optional)" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="hr@company.com" />
            <Input label="Address (optional)" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Victoria Island, Lagos" />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Company summary</h3>
              {[['Name', form.name], ['Industry', form.industry || '—'], ['RC Number', form.rc_number || '—'], ['Email', form.email || '—'], ['Address', form.address || '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '1rem', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-3)', minWidth: 80 }}>{k}</span>
                  <span style={{ color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
              ✅ Payroll fee: <strong style={{ color: 'var(--teal)' }}>0.3%</strong> per payment · No monthly charge · No hidden fees
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 0
            ? <Button variant="secondary" onClick={() => setStep(s => s - 1)}><ArrowLeft size={16} /> Back</Button>
            : <div />
          }
          {step < 2
            ? <Button onClick={() => { if (step === 0 && !form.name.trim()) { toast.error('Company name is required.'); return; } setStep(s => s + 1); }}>Continue <ArrowRight size={16} /></Button>
            : <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create company'}</Button>
          }
        </div>
      </div>
    </AppShell>
  );
}
