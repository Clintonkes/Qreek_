// Settings.jsx gives the signed-in user a place to manage profile-adjacent security and payout details.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import useAuthStore from '../store/authStore.js';
import { changePin, saveBank, listBanks } from '../api/auth.js';

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [banks, setBanks]   = useState([]);
  const [bankForm, setBankForm] = useState({ account_number: '', bank_code: '' });
  const [pinForm,  setPinForm]  = useState({ current_pin: '', new_pin: '', confirm_pin: '' });
  const [saving,   setSaving]   = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    listBanks().then(d => setBanks(d.banks || [])).catch(() => {});
  }, []);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankForm.account_number || !bankForm.bank_code) { toast.error('Fill in account details'); return; }
    setSaving(true);
    try {
      const data = await saveBank(bankForm);
      updateUser({ ...user, bank_account: bankForm.account_number, bank_code: bankForm.bank_code, bank_name: data.bank_name });
      toast.success(`Default account saved — ${data.bank_name}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save bank');
    } finally {
      setSaving(false);
    }
  };

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

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <AppShell title="Settings">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Settings</h1>

      <Section title="Profile">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
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

      <Section title="Default bank account">
        {user?.bank_account && (
          <div style={{ marginBottom: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.88rem' }}>
            Current: <strong>{user.bank_name}</strong> — ****{user.bank_account?.slice(-4)}
          </div>
        )}
        <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Account number"
            type="text" maxLength={10} inputMode="numeric"
            value={bankForm.account_number} onChange={e => setBankForm(f => ({ ...f, account_number: e.target.value.replace(/\D/g,'') }))}
            placeholder="0123456789"
          />
          <div>
            <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Bank</label>
            <select value={bankForm.bank_code} onChange={e => setBankForm(f => ({ ...f, bank_code: e.target.value }))} style={{ width: '100%' }}>
              <option value="">Select bank</option>
              {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>
          <Button type="submit" loading={saving} variant="secondary">Save account</Button>
        </form>
      </Section>

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
