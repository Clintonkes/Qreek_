// PaymentLinks.jsx manages shareable collection links so users can accept payments
// into their own payment workflows without exposing raw bank details every time.
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, Plus, Trash } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getLinks, createLink, deleteLink } from '../api/paymentLinks.js';
import { getBanks } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function CreateLinkModal({ open, onClose, banks, onCreated }) {
  const [form, setForm]   = useState({ title: '', description: '', amount: '', bank_account: '', bank_code: '', max_uses: '', expires_days: '' });
  const [flexible, setFlexible] = useState(false);
  const [saving, setSaving]     = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim())        { toast.error('Title required.'); return; }
    if (!form.bank_account.trim()) { toast.error('Account number required.'); return; }
    if (!form.bank_code)           { toast.error('Select a bank.'); return; }
    if (!flexible && (!form.amount || +form.amount <= 0)) { toast.error('Enter a fixed amount or enable flexible.'); return; }

    setSaving(true);
    try {
      await createLink({
        title: form.title, description: form.description || undefined,
        amount: flexible ? undefined : +form.amount,
        bank_account: form.bank_account, bank_code: form.bank_code,
        max_uses: form.max_uses ? +form.max_uses : undefined,
        expires_days: form.expires_days ? +form.expires_days : undefined,
      });
      toast.success('Payment link created!');
      setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', max_uses: '', expires_days: '' });
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create payment link" maxWidth={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Q1 Invoice Payment" />
        <Input label="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Payment for January design services" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <input type="checkbox" checked={flexible} onChange={e => setFlexible(e.target.checked)} />
            Flexible amount (payer sets the amount)
          </label>
        </div>

        {!flexible && <Input label="Fixed amount (₦) *" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="50000" />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input label="Account number *" value={form.bank_account} onChange={e => set('bank_account', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0123456789" style={{ fontFamily: 'var(--font-mono)' }} />
          <div>
            <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Bank *</label>
            <select value={form.bank_code} onChange={e => set('bank_code', e.target.value)} style={{ width: '100%' }}>
              <option value="">Select</option>
              {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>
          <Input label="Max uses (optional)" type="number" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} placeholder="100" />
          <Input label="Expires in days (optional)" type="number" value={form.expires_days} onChange={e => set('expires_days', e.target.value)} placeholder="30" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create link'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function LinkCard({ link, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Deactivate "${link.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteLink(link.id);
      toast.success('Link deactivated.');
      onDelete(link.id);
    } catch { toast.error('Failed to deactivate.'); }
    finally { setDeleting(false); }
  };

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  const isFull    = link.max_uses && link.use_count >= link.max_uses;
  const status    = !link.is_active ? 'inactive' : isExpired ? 'expired' : isFull ? 'full' : 'active';
  const statusColor = { active: 'var(--green)', expired: 'var(--text-3)', full: 'var(--amber)', inactive: 'var(--text-3)' }[status];

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', opacity: status !== 'active' ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{link.title}</div>
          {link.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{link.description}</div>}
        </div>
        <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: statusColor + '20', color: statusColor, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>Amount</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--teal)' }}>{link.is_flexible ? 'Flexible' : FMT(link.amount)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>Uses</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{link.use_count}{link.max_uses ? ` / ${link.max_uses}` : ''}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>Collected</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--green)' }}>{FMT(link.total_collected)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem', marginBottom: '0.75rem' }}>
        <Link size={14} color="var(--teal)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</span>
        <CopyButton text={link.url} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {link.is_active && (
          <button onClick={handleDelete} disabled={deleting} style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Trash size={14} /> {deleting ? 'Deactivating…' : 'Deactivate'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PaymentLinks() {
  const [links,    setLinks]    = useState([]);
  const [banks,    setBanks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getLinks(), getBanks()])
      .then(([ld, bd]) => { setLinks(ld.links || []); setBanks(bd.banks || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => setLinks(prev => prev.filter(l => l.id !== id));

  const activeLinks = links.filter(l => l.is_active);
  const totalCollected = links.reduce((s, l) => s + (l.total_collected || 0), 0);

  return (
    <AppShell title="Payment links">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Payment links</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {activeLinks.length} active · Total collected: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalCollected)}</strong>
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create link</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>
      ) : links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Link size={40} color="var(--border-light)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>No payment links yet.</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>Create a shareable link that anyone can use to pay you — your clients, customers, or pool members.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first link</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {links.map(link => <LinkCard key={link.id} link={link} onDelete={handleDelete} />)}
        </div>
      )}

      <CreateLinkModal open={showCreate} onClose={() => setShowCreate(false)} banks={banks} onCreated={load} />
    </AppShell>
  );
}
