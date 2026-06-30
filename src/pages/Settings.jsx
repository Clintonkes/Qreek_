/**
 * @file Settings.jsx
 * @description Provides the user interface for managing account settings, security, and financial preferences.
 * This file handles user profile display, default bank account configuration, security PIN updates, 
 * and user session termination (logout).
 * 
 * Flow:
 * 1. Initialization: Fetches the list of supported banks from the backend API.
 * 2. Profile Management: Displays user identity and referral information from the global auth store.
 * 3. Bank Configuration: Allows users to set or update their default Naira payout account via saveBank API.
 * 4. Security Updates: Facilitates PIN changes with current PIN validation to ensure account integrity.
 * 5. Session Control: Triggers the global logout action and redirects to the login page.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import useAuthStore from '../store/authStore.js';
import { changePin, hasPin, setPin } from '../api/auth.js';

/**
 * Section component - A structural wrapper for categorizing setting groups.
 * @param {Object} props
 * @param {string} props.title - The header title for the settings section.
 * @param {React.ReactNode} props.children - The content to render inside the section.
 */
function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );
}

/**
 * Settings component - User-centric management of security and financial preferences.
 * Features:
 * - Profile overview (Name, Phone, KYC status).
 * - Default bank account management for Naira payouts.
 * - Security PIN updates with mandatory verification of the current PIN.
 * - Referral code sharing.
 * - Device session termination (Logout).
 *
 * @returns {JSX.Element}
 */
export default function Settings() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [pinForm,  setPinForm]  = useState({ current_pin: '', new_pin: '', confirm_pin: '' });
  const [savingPin, setSavingPin] = useState(false);
  const [hasPinFlag, setHasPinFlag] = useState(null);

  useEffect(() => {
    hasPin().then(r => setHasPinFlag(r.has_pin)).catch(() => setHasPinFlag(false));
  }, []);

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinForm.new_pin !== pinForm.confirm_pin) { toast.error('PINs do not match'); return; }
    if (pinForm.new_pin.length < 4) { toast.error('PIN must be at least 4 digits'); return; }
    setSavingPin(true);
    try {
      await setPin({ new_pin: pinForm.new_pin });
      toast.success('Transaction PIN set successfully');
      setPinForm({ current_pin: '', new_pin: '', confirm_pin: '' });
      setHasPinFlag(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set PIN');
    } finally {
      setSavingPin(false);
    }
  };

  /**
   * handleChangePin - Securely updates the user's security PIN.
   * Flow: Validates new PIN match/length -> calls changePin API (requires current PIN) -> 
   * clears form -> shows success toast.
   * @param {React.FormEvent} e - Form submission event.
   */
  const handleChangePin = async (e) => {
    e.preventDefault();
    if (pinForm.new_pin !== pinForm.confirm_pin) { toast.error('New PINs do not match'); return; }
    if (pinForm.new_pin.length < 4) { toast.error('PIN must be at least 4 digits'); return; }
    setSavingPin(true);
    try {
      await changePin({ current_pin: pinForm.current_pin, new_pin: pinForm.new_pin });
      toast.success('PIN changed successfully');
      setPinForm({ current_pin: '', new_pin: '', confirm_pin: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change PIN');
    } finally {
      setSavingPin(false);
    }
  };

  /**
   * handleLogout - Terminates the user's authenticated session.
   * Flow: Triggers global logout (clears tokens/state) -> redirects user to the login screen.
   */
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <AppShell title="Settings">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Settings</h1>

      <Section title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Full name</div>
            <div style={{ fontWeight: 500 }}>{user?.name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Phone</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{user?.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>KYC status</div>
            <div style={{ color: user?.kyc_verified ? 'var(--green)' : 'var(--amber)', fontWeight: 500 }}>
              {user?.kyc_verified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </Section>

      {hasPinFlag === false ? (
        <Section title="Set transaction PIN">
          <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            You haven't set a transaction PIN yet. Create one — you'll need it to authorise payroll runs and other payments.
          </p>
          <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="New PIN" type="password" inputMode="numeric" maxLength={6}
              value={pinForm.new_pin} onChange={e => setPinForm(f => ({ ...f, new_pin: e.target.value.replace(/\D/g,'') }))}
              placeholder="••••"
            />
            <Input
              label="Confirm PIN" type="password" inputMode="numeric" maxLength={6}
              value={pinForm.confirm_pin} onChange={e => setPinForm(f => ({ ...f, confirm_pin: e.target.value.replace(/\D/g,'') }))}
              placeholder="••••"
            />
            <Button type="submit" loading={savingPin} variant="secondary">Set PIN</Button>
          </form>
        </Section>
      ) : (
        <Section title="Change PIN">
          <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Current PIN" type="password" inputMode="numeric" maxLength={6}
              value={pinForm.current_pin} onChange={e => setPinForm(f => ({ ...f, current_pin: e.target.value.replace(/\D/g,'') }))}
              placeholder="••••"
            />
            <Input
              label="New PIN" type="password" inputMode="numeric" maxLength={6}
              value={pinForm.new_pin} onChange={e => setPinForm(f => ({ ...f, new_pin: e.target.value.replace(/\D/g,'') }))}
              placeholder="••••"
            />
            <Input
              label="Confirm new PIN" type="password" inputMode="numeric" maxLength={6}
              value={pinForm.confirm_pin} onChange={e => setPinForm(f => ({ ...f, confirm_pin: e.target.value.replace(/\D/g,'') }))}
              placeholder="••••"
            />
            <Button type="submit" loading={savingPin} variant="secondary">Change PIN</Button>
          </form>
        </Section>
      )}

      <Section title="Referral">
        <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Share your code and earn rewards when friends sign up.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--teal)', flex: 1, letterSpacing: '0.1em' }}>
            {user?.referral_code || '—'}
          </code>
          {user?.referral_code && <CopyButton value={user.referral_code} label="referral code" />}
        </div>
      </Section>

      <Section title="Danger zone">
        <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Logging out will clear your session from this device.
        </p>
        <Button variant="danger" onClick={handleLogout}>Log out</Button>
      </Section>
    </AppShell>
  );
}
