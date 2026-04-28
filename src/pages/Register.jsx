// Register.jsx collects a new user's basic identity and PIN, then sends them to login
// so the first authenticated step mirrors the same sign-in flow used afterward.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register } from '../api/auth.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

function StepDots({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: i + 1 <= current ? 'var(--teal)' : 'var(--surface-3)',
              color: i + 1 <= current ? 'var(--text-inv)' : 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              border: `1px solid ${i + 1 <= current ? 'var(--teal)' : 'var(--border)'}`,
            }}
          >
            {i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ height: 1, width: 24, background: i + 1 < current ? 'var(--teal)' : 'var(--border)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', pin: '', confirmPin: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name required';
    if (!form.lastName.trim()) errs.lastName = 'Last name required';
    if (!form.phone.trim()) errs.phone = 'Phone number required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.pin || form.pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    if (form.pin !== form.confirmPin) errs.confirmPin = 'PINs do not match';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        pin: form.pin,
      });
      sessionStorage.setItem('qreek_signup_phone', data.user?.phone || form.phone);
      toast.success('Account created. Log in with your phone number and PIN.');
      navigate('/login', { replace: true, state: { phone: data.user?.phone || form.phone, fromSignup: true } });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </div>
          <h1 style={{ fontSize: '1.3rem' }}>Create account</h1>
        </div>

        <StepDots current={step} total={2} />

        {step === 1 ? (
          <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input label="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Emeka" error={errors.firstName} autoFocus />
              <Input label="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Obi" error={errors.lastName} />
            </div>
            <Input
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+2348012345678"
              error={errors.phone}
              hint="Nigerian format; we'll normalise it automatically"
            />
            <Button type="submit" fullWidth>Continue →</Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Set PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={form.pin}
              onChange={e => set('pin', e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              error={errors.pin}
              hint="4–6 digits. Keep it private."
              autoFocus
            />
            <Input
              label="Confirm PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={form.confirmPin}
              onChange={e => set('confirmPin', e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              error={errors.confirmPin}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Button>
              <Button type="submit" loading={loading} style={{ flex: 2 }}>Create account</Button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
