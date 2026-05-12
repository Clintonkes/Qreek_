import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import { validatePhoneNumber, formatPhoneNumber } from '../lib/utils.js';
import client from '../api/client.js';

// Three-step flow:
// 1. Enter phone → backend sends OTP
// 2. Enter OTP code
// 3. Set new PIN

/**
 * ForgotPin component - Handles the PIN recovery process.
 * A three-step flow:
 * 1. Collects phone number and requests an OTP via the backend.
 * 2. Verifies the OTP to obtain a reset token.
 * 3. Prompts the user to enter and confirm a new PIN.
 *
 * @returns {JSX.Element}
 */
export default function ForgotPin() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [pin,     setPin]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [token,   setToken]   = useState('');  // reset token from OTP verify

  // Step 1 — request OTP
  const requestOtp = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(phone)) {
      setErrors({ phone: 'Enter a valid phone number with country code.' });
      return;
    }
    const normalizedPhone = formatPhoneNumber(phone);
    if (!normalizedPhone) { setErrors({ phone: 'Could not parse phone number.' }); return; }

    setLoading(true);
    setErrors({});
    try {
      await client.post('/auth/forgot-pin', { phone: normalizedPhone });
      toast.success('OTP sent to your phone. Check your SMS or WhatsApp.');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not send OTP. Check your phone number.';
      setErrors({ phone: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) { setErrors({ otp: 'Enter the OTP sent to your phone.' }); return; }
    const normalizedPhone = formatPhoneNumber(phone);

    setLoading(true);
    setErrors({});
    try {
      const res = await client.post('/auth/verify-otp', { phone: normalizedPhone, otp });
      setToken(res.data.reset_token);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired OTP. Try again.';
      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — set new PIN
  const resetPin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pin || pin.length < 4)  errs.pin     = 'PIN must be 4–6 digits';
    if (pin !== confirm)          errs.confirm = 'PINs do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const normalizedPhone = formatPhoneNumber(phone);

    setLoading(true);
    setErrors({});
    try {
      await client.post('/auth/reset-pin', { phone: normalizedPhone, reset_token: token, new_pin: pin });
      toast.success('PIN updated successfully!');
      navigate('/login', { replace: true, state: { phone: normalizedPhone } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset PIN. Please start over.';
      setErrors({ pin: msg });
    } finally {
      setLoading(false);
    }
  };

  const STEP_LABELS = ['Verify phone', 'Enter OTP', 'Set new PIN'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

      <Link to="/login" style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-2)', fontSize: '0.85rem', textDecoration: 'none', transition: 'var(--trans-fast)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
      >
        <ArrowLeft size={16} /> Back to login
      </Link>

      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </div>
          <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Reset your PIN</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
            {step === 1 && "We'll send a one-time code to your registered phone."}
            {step === 2 && "Enter the 6-digit code we sent to your phone."}
            {step === 3 && "Choose a new PIN for your account."}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i + 1 < step ? 'var(--green)' : i + 1 === step ? 'var(--teal)' : 'var(--surface-2)',
                  color: i + 1 <= step ? 'var(--text-inv)' : 'var(--text-3)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                  transition: 'var(--trans)',
                }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.65rem', color: i + 1 === step ? 'var(--teal)' : 'var(--text-3)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i + 1 < step ? 'var(--green)' : 'var(--border)', margin: '0 0.4rem', marginBottom: '1.1rem', transition: 'var(--trans)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — Phone */}
        {step === 1 && (
          <form onSubmit={requestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <PhoneInput
              label="Phone number"
              value={phone}
              onChange={v => { setPhone(v); setErrors(e => ({ ...e, phone: '' })); }}
              error={errors.phone}
            />
            <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </Button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="OTP code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setErrors(e => ({ ...e, otp: '' })); }}
              placeholder="123456"
              error={errors.otp}
              autoFocus
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.25em', fontSize: '1.25rem', textAlign: 'center' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', textAlign: 'center' }}>
              Didn't receive it?{' '}
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
                Resend
              </button>
            </p>
            <Button type="submit" disabled={loading || otp.length < 4} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </Button>
          </form>
        )}

        {/* Step 3 — New PIN */}
        {step === 3 && (
          <form onSubmit={resetPin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="New PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErrors(e => ({ ...e, pin: '' })); }}
              placeholder="••••"
              error={errors.pin}
              autoFocus
            />
            <Input
              label="Confirm new PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirm}
              onChange={e => { setConfirm(e.target.value.replace(/\D/g, '')); setErrors(e => ({ ...e, confirm: '' })); }}
              placeholder="••••"
              error={errors.confirm}
            />
            <Button type="submit" disabled={loading || pin.length < 4} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving…' : 'Set new PIN →'}
            </Button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
          Remember it? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
