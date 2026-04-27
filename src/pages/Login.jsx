import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Login() {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ phone: '', pin: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.phone) errs.phone = 'Phone number required';
    if (!form.pin)   errs.pin   = 'PIN required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await login({ phone: form.phone, pin: form.pin });
      setAuth({ token: data.token, user: data.user });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
      if (msg.includes('frozen')) setErrors({ pin: msg });
      else setErrors({ pin: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Phone number"
            type="tel" autoComplete="tel"
            value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+2348012345678"
            error={errors.phone}
          />
          <Input
            label="PIN"
            type="password" inputMode="numeric" maxLength={6}
            value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            error={errors.pin}
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} fullWidth>
            Log in →
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
