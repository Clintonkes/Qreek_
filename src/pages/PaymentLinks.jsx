// PaymentLinks.jsx manages shareable collection links so users can accept payments
// into their own payment workflows without exposing raw bank details every time.
import React, { useEffect, useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Link, Plus, Trash, PencilSimple, ListChecks, QrCode } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import BankSelect from '../components/ui/BankSelect.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import QRCodeCard from '../components/ui/QRCodeCard.jsx';
import { getLinks, createLink, deleteLink, updateLink, verifyBankAccount } from '../api/paymentLinks.js';
import { getUserFriendlyError } from '../lib/utils.js';
import { getBanks } from '../api/payroll.js';
import { me } from '../api/auth.js';
import { QREEK_FEES, calculateFee, feePercent } from '../lib/payments.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function DetailItem({ label, value, wide = false }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : undefined,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.7rem 0.8rem',
      minWidth: 0,
    }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '0.84rem', color: 'var(--text-1)', wordBreak: 'break-word' }}>{value || '-'}</div>
    </div>
  );
}

/**
 * Modal component for creating a new payment link.
 * Allows configuration of fixed or flexible amounts, maximum uses, and expiration.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Array} props.banks - List of supported banks for deposit routing.
 * @param {Function} props.onCreated - Callback triggered after a link is successfully created.
 */
function CreateLinkModal({ open, onClose, banks, onCreated, editing, onUpdated, savedBank }) {
  const isEdit = !!editing;
  const navigate = useNavigate();
  const [form, setForm]   = useState({ title: '', description: '', amount: '', bank_account: '', bank_code: '', expires_days: '' });
  const [flexible, setFlexible] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [bankStatus, setBankStatus] = useState({ state: 'idle', name: '' });

  // Prefill when editing
  useEffect(() => {
    if (open && editing) {
      const isFlex = editing.is_flexible;
      setFlexible(isFlex);
      setForm({
        title: editing.title || '',
        description: editing.description || '',
        amount: isFlex ? '' : (editing.amount || ''),
        bank_account: '', // do not prefill masked value; user must enter full acct to change bank
        bank_code: '',
        expires_days: '',
      });
    } else if (open && !editing) {
      setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', expires_days: '' });
      setFlexible(false);
      setBankStatus({ state: 'idle', name: '' });
    }
  }, [open, editing]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const verifyBank = async (override = {}) => {
    const bankAccount = override.bank_account ?? form.bank_account;
    const bankCode = override.bank_code ?? form.bank_code;
    if (!/^\d{10}$/.test(bankAccount) || !bankCode) {
      setBankStatus({ state: 'idle', name: '' });
      return;
    }
    setBankStatus({ state: 'checking', name: '' });
    try {
      const verified = await verifyBankAccount({ bank_account: bankAccount, bank_code: bankCode });
      setBankStatus({ state: 'verified', name: verified?.account_name || '' });
    } catch {
      setBankStatus({ state: 'failed', name: '' });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim())        { toast.error('Title required.'); return; }
    if (!form.description.trim())  { toast.error('Description required.'); return; }
    if (!flexible && (!form.amount || +form.amount <= 0)) { toast.error('Enter a fixed amount or enable flexible.'); return; }

    // For new personal links, require a saved bank on the profile — no bank fields in the form.
    if (!isEdit && !savedBank?.bank_account) {
      toast.error('Save your bank account in Settings before creating a payment link.');
      onClose();
      navigate('/settings');
      return;
    }

    const hasBankChange = Boolean(form.bank_account.trim() || form.bank_code);
    if (isEdit && hasBankChange) {
      if (!/^\d{10}$/.test(form.bank_account)) { toast.error('Enter a valid 10 digit account number.'); return; }
      if (!form.bank_code) { toast.error('Select a bank.'); return; }
    }

    setSaving(true);
    try {
      let verifiedAccountName = '';
      if (isEdit && hasBankChange) {
        const verified = await verifyBankAccount({
          bank_account: form.bank_account,
          bank_code: form.bank_code,
        });
        verifiedAccountName = verified?.account_name || '';
      }

      const payload = {
        title: form.title, description: form.description.trim(),
        amount: flexible ? null : +form.amount,
        expires_days: form.expires_days ? +form.expires_days : undefined,
        provider: 'flutterwave',
      };
      // For edits only: send bank fields if the user filled them in (triggers subaccount recreation).
      if (isEdit && hasBankChange) {
        payload.bank_account = form.bank_account;
        payload.bank_code = form.bank_code;
      }
      if (isEdit && editing?.id) {
        await onUpdated(editing.id, payload);
        toast.success(verifiedAccountName ? `Payment link updated. Verified: ${verifiedAccountName}` : 'Payment link updated!');
      } else {
        await createLink(payload);
        toast.success('Payment link created!');
        setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', expires_days: '' });
        onCreated();
      }
      onClose();
    } catch (err) {
      toast.error(getUserFriendlyError(err, isEdit ? 'Failed to update link.' : 'Failed to create link.'));
    } finally {
      setSaving(false);
    }
  };

  const hasSavedBank = Boolean(savedBank?.bank_account);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit payment link' : 'Create payment link'} maxWidth={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Q1 Invoice Payment" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={e => {
              set('description', e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="Payment for January design services"
            rows={3}
            style={{
              resize: 'none',
              overflow: 'hidden',
              minHeight: 76,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <input type="checkbox" checked={flexible} onChange={e => setFlexible(e.target.checked)} />
            Flexible amount (payer sets the amount)
          </label>
        </div>

        {!flexible && <Input label="Fixed amount (₦) *" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="50000" />}

        {(flexible || +form.amount > 0) && (
          <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-2)' }}>
            Qreek keeps {feePercent(QREEK_FEES.paymentLink)} per successful payment. {flexible ? 'The exact fee is calculated when the payer enters an amount.' : `Fee on this amount: ${FMT(calculateFee(form.amount, QREEK_FEES.paymentLink))}.`}
          </div>
        )}

        {/* For new personal links: show the saved bank that will receive payments. */}
        {!isEdit && (
          hasSavedBank ? (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: '0.1rem' }}>Payments settle to</div>
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>{savedBank.bank_name || 'Saved bank'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-2)' }}>****{(savedBank.bank_account || '').slice(-4)}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>To change your bank account, go to <button onClick={() => { onClose(); navigate('/settings'); }} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Settings</button>.</div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-2)' }}>
              You need to save your bank account before creating a payment link.{' '}
              <button onClick={() => { onClose(); navigate('/settings'); }} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>Go to Settings</button>
            </div>
          )
        )}

        {/* For edits: bank fields are optional — fill them to change the destination bank. */}
        {isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="New account number (optional)" value={form.bank_account} onChange={e => { set('bank_account', e.target.value.replace(/\D/g, '').slice(0, 10)); setBankStatus({ state: 'idle', name: '' }); }} onBlur={verifyBank} placeholder="Leave blank to keep current" style={{ fontFamily: 'var(--font-mono)' }} />
            <BankSelect
              label="New bank (optional)"
              banks={banks}
              value={form.bank_code}
              onChange={value => {
                set('bank_code', value);
                setBankStatus({ state: 'idle', name: '' });
                if (/^\d{10}$/.test(form.bank_account) && value) {
                  verifyBank({ bank_account: form.bank_account, bank_code: value });
                }
              }}
              hint="Leave blank to keep current bank."
            />
            <div style={{ gridColumn: '1 / -1', fontSize: '0.76rem', color: bankStatus.state === 'verified' ? 'var(--green)' : bankStatus.state === 'failed' ? 'var(--red)' : 'var(--text-3)' }}>
              {bankStatus.state === 'checking' && 'Verifying bank account...'}
              {bankStatus.state === 'verified' && `Verified: ${bankStatus.name}`}
              {bankStatus.state === 'failed' && 'Bank account could not be verified.'}
              {bankStatus.state === 'idle' && (editing?.bank_name ? `Current bank: ${editing.bank_name}${editing.bank_account ? ` (****${editing.bank_account.slice(-4)})` : ''} — fill both fields above to change.` : 'Fill both fields to change the destination bank.')}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input label="Expires in days (optional)" type="number" value={form.expires_days} onChange={e => set('expires_days', e.target.value)} placeholder="30" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || (!isEdit && !hasSavedBank)}>{saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create link')}</Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Card component to display the status and details of a specific payment link.
 * Includes options to copy the URL and deactivate the link.
 *
 * @param {Object} props
 * @param {Object} props.link - Payment link data object.
 * @param {Function} props.onDelete - Callback when the link is deactivated.
 */
function timeRemaining(expiresAt) {
  if (!expiresAt) return '';
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function LinkCard({ link, onDelete, onEdit, onViewSettlements }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await deleteLink(link.id);
      toast.success('Link deleted.');
      onDelete(link.id);
    } catch (err) { toast.error(getUserFriendlyError(err, 'Failed to delete link.')); }
    finally { setDeleting(false); }
  };

  const handleEditClick = () => {
    if (onEdit) onEdit(link);
  };

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  const status    = !link.is_active ? 'inactive' : isExpired ? 'expired' : 'active';
  const statusColor = { active: 'var(--green)', expired: 'var(--text-3)', inactive: 'var(--text-3)' }[status];

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', opacity: status !== 'active' ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{link.title}</div>
          {link.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{link.description}</div>}
        </div>
        <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: statusColor + '20', color: statusColor, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{status}</span>
      </div>
      {link.pool_id && link.expires_at && (
        <div style={{ fontSize: '0.75rem', color: 'var(--amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem' }}>⏱</span> {timeRemaining(link.expires_at)}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>Amount</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--teal)' }}>{link.is_flexible ? 'Flexible' : FMT(link.amount)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>Payments</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{link.use_count || 0}</div>
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

      {link.bank_name && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
          Bank: {link.bank_name} · {link.bank_account || '****'}
        </div>
      )}

      {/* Action buttons row: tightened padding/gap/font so Edit + Settlements + Delete never shoot off the card edge on narrow grids (3-col on md/lg).
         flexWrap + smaller sizes + icon+text keeps them inside without overflow (addresses screenshot of buttons "shooting off the tab"). */}
      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {link.is_active && (
          <>
            <button onClick={() => setQrOpen(true)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: link.pool_id ? 'var(--amber)' : 'var(--teal)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <QrCode size={13} /> QR
            </button>
            <button onClick={handleEditClick} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <PencilSimple size={13} /> Edit
            </button>
            <button onClick={() => onViewSettlements && onViewSettlements(link)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ListChecks size={13} /> Settlements
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting} style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--red)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Trash size={13} /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        )}
      </div>

      {/* QR Code modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Payment QR Code" maxWidth={460}>
        <QRCodeCard
          url={link.url}
          title={link.title}
          isPool={!!link.pool_id}
          isFlexible={link.is_flexible}
          amount={link.amount}
        />
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Link" maxWidth={400}>
        <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Are you sure you want to permanently delete "{link.title}"? This action cannot be undone (historical transactions are kept).
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} style={{ background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

const MemoLinkCard = memo(LinkCard, (prev, next) => prev.link === next.link);

/**
 * PaymentLinks component - Dashboard for managing shareable payment URLs.
 * Users can create links to collect funds directly into their designated bank accounts
 * without sharing raw account details. Displays active links, total collections, and status.
 *
 * @returns {JSX.Element}
 */
export default function PaymentLinks() {
  const navigate = useNavigate();
  const [links,    setLinks]    = useState([]);
  const [banks,    setBanks]    = useState([]);
  const [savedBank, setSavedBank] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [linksLoaded, setLinksLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const load = () => {
    setLoading(true);
    setLinksLoaded(false);
    Promise.all([getLinks(), getBanks(), me()])
      .then(([ld, bd, profile]) => {
        setLinks(ld.links || []);
        setBanks(bd.banks || []);
        setSavedBank(profile || null);
      })
      .finally(() => {
        setLoading(false);
        setLinksLoaded(true);
      });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => setLinks(prev => prev.filter(l => l.id !== id)); // local state update after hard delete on backend (deactivated gone forever from lists)

  const handleUpdated = async (id, payload) => {
    await updateLink(id, payload);
    load();
  };

  const openEdit = (link) => {
    setEditingLink(link);
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingLink(null);
  };

  // Strictly filter to only active (non-deactivated) links. Deactivated are hard-deleted on backend (see deactivate_link)
  // but we filter client-side too for safety + any cached/inflight data. This ensures deleted/deactivated
  // links no longer appear in dashboard or list (per user request + screenshot of lingering deactivated links).
  const displayLinks = useMemo(() => links.filter(l => l.is_active !== false), [links]);
  const totalCollected = useMemo(() => displayLinks.reduce((s, l) => s + (l.total_collected || 0), 0), [displayLinks]);
  const hasPersonalLink = useMemo(() => displayLinks.some(l => !l.pool_id), [displayLinks]);
  const totalPages = Math.max(1, Math.ceil(displayLinks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleLinks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayLinks.slice(start, start + PAGE_SIZE);
  }, [displayLinks, currentPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <AppShell title="Payment links">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Payment links</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {displayLinks.length} active · Total collected: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalCollected)}</strong>
          </p>
        </div>
        {linksLoaded && !hasPersonalLink && <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create link</Button>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
          Loading links...
        </div>
      ) : displayLinks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Link size={40} color="var(--border-light)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>No payment links yet.</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>Create a shareable link that anyone can use to pay you — your clients, customers, or pool members.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first link</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleLinks.map(link => (
            <MemoLinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
              onEdit={openEdit}
              onViewSettlements={(selectedLink) => navigate(`/payment-links/${selectedLink.id}/settlements`)}
            />
          ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem', padding: '0.9rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
              Showing <strong style={{ color: 'var(--text-1)' }}>{(currentPage - 1) * PAGE_SIZE + 1}</strong>-<strong style={{ color: 'var(--text-1)' }}>{Math.min(currentPage * PAGE_SIZE, displayLinks.length)}</strong> of <strong style={{ color: 'var(--text-1)' }}>{displayLinks.length}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                Prev
              </Button>
              <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <CreateLinkModal
        open={showCreate}
        onClose={closeModal}
        banks={banks}
        onCreated={load}
        editing={editingLink}
        onUpdated={handleUpdated}
        savedBank={savedBank}
      />
    </AppShell>
  );
}
