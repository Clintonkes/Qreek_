/**
 * @file Login.jsx
 * @description Manages the user authentication interface and logic.
 * This file handles phone number validation, PIN entry with visibility toggles, 
 * and robust error handling including account lockout protection.
 * 
 * Flow:
 * 1. Input: Collects phone number and security PIN from the user.
 * 2. Validation: Normalizes the phone number and ensures the PIN is a 4-6 digit numeric string.
 * 3. Authentication: Calls the login API. On success, it persists tokens and user data 
 *    to the global authStore and redirects to the dashboard.
 * 4. Security: Monitors failed attempts and displays remaining attempts or account frozen state.
 * 5. Recovery: Provides navigation links to PIN retrieval and the landing page.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKey, Warning, Eye, EyeSlash, House } from 'phosphor-react';
import { login } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import { validatePhoneNumber, formatPhoneNumber } from '../lib/utils.js';

/**
 * Login component - Handles user authentication via phone number and security PIN.
 * Features:
 * - International phone number validation and normalization.
 * - PIN entry with numeric-only enforcement and masking.
 * - Brute-force protection: Tracks remaining attempts and handles account lockout/freezing.
 * - Seamless redirection post-login with support for "fromSignup" state.
 *
 * @returns {JSX.Element}
 */
export default function Login() {
  const { setAuth }  = useAuthStore();
  const navigate     = useNavigate();
  const location     = useLocation();
  const initialPhone = location.state?.phone || sessionStorage.getItem('qreek_signup_phone') || '';

  const [phone,        setPhone]        = useState(initialPhone);
  const [pin,          setPin]          = useState('');
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [frozen,       setFrozen]       = useState(false);
  const [showPin,      setShowPin]      = useState(false);

  const clearErr = (k) => setErrors(e => ({ ...e, [k]: '' }));

  const parseAttempts = (msg) => {
    const m = (msg || '').match(/(\d+) attempt/);
    return m ? parseInt(m[1], 10) : null;
  };

  /**
   * handleSubmit - Processes the login form submission.
   * Flow: Validates inputs -> normalizes phone -> calls login API -> 
   * handles success (storage/redirect) or error (attempts count/lockout).
   * @param {React.FormEvent} e - Form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!phone) {
      errs.phone = 'Phone number required';
    } else if (!validatePhoneNumber(phone)) {
      errs.phone = 'Enter a valid number — select country from dropdown, then type local number only';
    }
    if (!pin) {
      errs.pin = 'PIN required';
    } else if (!/^\d{4,6}$/.test(pin)) {
      errs.pin = 'PIN must be 4-6 digits';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const normalizedPhone = formatPhoneNumber(phone);
    if (!normalizedPhone) { setErrors({ phone: 'Could not parse phone number. Try selecting country again.' }); return; }

    setLoading(true);
    setErrors({});

    try {
      const data = await login({ phone: normalizedPhone, pin });
      setAuth({ token: data.token, refresh_token: data.refresh_token, user: data.user });
      sessionStorage.removeItem('qreek_signup_phone');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.detail || 'Login failed. Check your details and try again.';
      if (status === 403 || msg.toLowerCase().includes('frozen')) {
        setFrozen(true); setAttemptsLeft(0); return;
      }
      const remaining = parseAttempts(msg);
      if (remaining !== null) setAttemptsLeft(remaining);
      setErrors({ pin: 'Invalid credentials. Please try again.' });
      // We don't clear the PIN anymore to allow user to correct it, as per request
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <Link to="/" style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-2)', fontSize: '0.85rem', textDecoration: 'none', transition: 'var(--trans-fast)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
      >
        <ArrowLeft size={16} /> Home
      </Link>

      <div style={{ width: '100%', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </div>
          <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
            {location.state?.fromSignup ? 'Account ready. Sign in to continue.' : 'Sign in to your account'}
          </p>
        </div>

        {frozen ? (
          <div style={{ background: 'var(--red-faint)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
            <LockKey size={36} color="var(--red)" weight="fill" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: '0.35rem', fontSize: '1rem' }}>Account locked</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                Too many failed PIN attempts. Your account has been locked for security. Contact support to regain access.
              </p>
            </div>
            <a href="mailto:support@qreekfinance.org" style={{ background: 'var(--red)', color: '#fff', padding: '0.65rem 1.5rem', borderRadius: 'var(--radius)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
              Contact support
            </a>
            <Link to="/forgot-pin" style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Try reset PIN instead</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <PhoneInput
              label="Phone number"
              value={phone}
              onChange={v => { setPhone(v); clearErr('phone'); }}
              error={errors.phone}
            />

            <div style={{ position: 'relative' }}>
              <Input
                label="PIN"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '')); clearErr('pin'); }}
                placeholder="••••"
                error={errors.pin}
                autoComplete="current-password"
                autoFocus={!!initialPhone}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '2.15rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                {showPin ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.55rem 0.75rem', background: attemptsLeft <= 2 ? 'var(--red-faint)' : 'var(--amber-faint)', border: `1px solid ${attemptsLeft <= 2 ? 'var(--red)' : 'var(--amber)'}`, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: attemptsLeft <= 2 ? 'var(--red)' : 'var(--amber)' }}>
                  <Warning size={14} weight="fill" />
                  <span><strong>{attemptsLeft}</strong> attempt{attemptsLeft !== 1 ? 's' : ''} left before account locks.</span>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
              <Link to="/forgot-pin" style={{ fontSize: '0.85rem', color: 'var(--text-2)', textDecoration: 'none' }}>Retrieve PIN?</Link>
              <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                <House size={14} /> Return to home
              </Link>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
          No account? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
