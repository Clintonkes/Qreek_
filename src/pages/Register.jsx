// Register.jsx — 3-step registration: identity → phone OTP → PIN
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import { register, checkPhoneAvailable, sendSignupOtp, verifySignupOtp } from '../api/auth.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import { validatePhoneNumber, formatPhoneNumber } from '../lib/utils.js';

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
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', otp: '', pin: '', confirmPin: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [signupVerifyToken, setSignupVerifyToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // Step 1 → Step 2: validate identity, check availability, send OTP
  const nextStep = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name required';
    if (!form.lastName.trim()) errs.lastName = 'Last name required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number required';
    } else if (!validatePhoneNumber(form.phone)) {
      errs.phone = 'Invalid phone number. Include country code (e.g., +2348012345678)';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setCheckingPhone(true);
    try {
      const normalised = formatPhoneNumber(form.phone) || form.phone;
      const { available } = await checkPhoneAvailable(normalised);
      if (!available) {
        setErrors({ phone: 'This phone number is already registered.' });
        return;
      }
      await sendSignupOtp(normalised);
      startResendCooldown();
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not send verification code. Try again.';
      toast.error(msg);
    } finally {
      setCheckingPhone(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const tick = setInterval(() => {
      setResendCooldown(n => { if (n <= 1) { clearInterval(tick); return 0; } return n - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const normalised = formatPhoneNumber(form.phone) || form.phone;
    try {
      await sendSignupOtp(normalised);
      startResendCooldown();
      toast.success('New code sent.');
    } catch {
      toast.error('Could not resend. Try again.');
    }
  };

  // Step 2 → Step 3: verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) { setErrors({ otp: 'Enter the code sent to your number' }); return; }
    setLoading(true);
    try {
      const normalised = formatPhoneNumber(form.phone) || form.phone;
      const { verify_token } = await verifySignupOtp(normalised, form.otp.trim());
      setSignupVerifyToken(verify_token);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired code.';
      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: create account
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(form.phone)) {
      setErrors({ phone: 'Invalid phone number format' });
      setStep(1);
      return;
    }
    const normalizedPhone = formatPhoneNumber(form.phone);
    if (!normalizedPhone) {
      setErrors({ phone: 'Invalid phone number format' });
      setStep(1);
      return;
    }
    const errs = {};
    if (!form.pin || form.pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    if (form.pin !== form.confirmPin) errs.confirmPin = 'PINs do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await register({
        phone: normalizedPhone,
        firstName: form.firstName,
        lastName: form.lastName,
        pin: form.pin,
        signup_verify_token: signupVerifyToken,
      });
      sessionStorage.setItem('qreek_signup_phone', data.user?.phone || normalizedPhone);
      toast.success('Account created. Log in with your phone number and PIN.');
      navigate('/login', { replace: true, state: { phone: data.user?.phone || normalizedPhone, fromSignup: true } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('phone') && (msgLower.includes('already') || msgLower.includes('registered') || msgLower.includes('exist') || msgLower.includes('duplicate'))) {
        setErrors({ phone: msg });
        setStep(1);
      } else if (msgLower.includes('verified') || msgLower.includes('verification')) {
        toast.error('Phone verification expired. Please start again.');
        setStep(1);
      } else {
        toast.error(msg);
      }
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
      <Link to="/" style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-2)', fontSize: '0.85rem', textDecoration: 'none' }}><ArrowLeft size={16} /> Home</Link>
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

        <StepDots current={step} total={3} />

        {step === 1 && (
          <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input label="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Emeka" error={errors.firstName} autoFocus />
              <Input label="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Obi" error={errors.lastName} />
            </div>
            <PhoneInput
              label="Phone number"
              value={form.phone}
              onChange={v => set('phone', v)}
              error={errors.phone}
              hint="International format: include country code (e.g., +2348012345678)"
            />
            <Button type="submit" fullWidth loading={checkingPhone}>Continue →</Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', textAlign: 'center', margin: 0 }}>
              A 6-character code was sent to <strong style={{ color: 'var(--text)' }}>{form.phone}</strong>. Enter it below.
            </p>
            <Input
              label="Verification code"
              value={form.otp}
              onChange={e => set('otp', e.target.value.toLowerCase())}
              placeholder="e.g. a3k9z2"
              maxLength={6}
              error={errors.otp}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" type="button" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Button>
              <Button type="submit" loading={loading} style={{ flex: 2 }}>Verify →</Button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-2)', margin: 0 }}>
              Didn't receive it?{' '}
              {resendCooldown > 0
                ? <span style={{ color: 'var(--text-3)' }}>Resend in {resendCooldown}s</span>
                : <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>Resend code</button>
              }
            </p>
          </form>
        )}

        {step === 3 && (
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
              <Button variant="secondary" type="button" onClick={() => setStep(2)} style={{ flex: 1 }}>Back</Button>
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
