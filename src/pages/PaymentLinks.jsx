// PaymentLinks.jsx manages shareable collection links so users can accept payments
// into their own payment workflows without exposing raw bank details every time.
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, Plus, Trash, PencilSimple, ListChecks } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getLinks, createLink, deleteLink, updateLink, getLinkSettlements } from '../api/paymentLinks.js';
import { getBanks } from '../api/payroll.js';
import { QREEK_FEES, calculateFee, feePercent } from '../lib/payments.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

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
function CreateLinkModal({ open, onClose, banks, onCreated, editing, onUpdated }) {
  const isEdit = !!editing;
  const [form, setForm]   = useState({ title: '', description: '', amount: '', bank_account: '', bank_code: '', max_uses: '', expires_days: '' });
  const [flexible, setFlexible] = useState(false);
  const [saving, setSaving]     = useState(false);

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
        max_uses: editing.max_uses || '',
        expires_days: '',
      });
    } else if (open && !editing) {
      setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', max_uses: '', expires_days: '' });
      setFlexible(false);
    }
  }, [open, editing]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim())        { toast.error('Title required.'); return; }
    if (!form.description.trim())  { toast.error('Description required.'); return; }
    if (!form.bank_account.trim()) { toast.error('Account number required.'); return; }
    if (!form.bank_code)           { toast.error('Select a bank.'); return; }
    if (!flexible && (!form.amount || +form.amount <= 0)) { toast.error('Enter a fixed amount or enable flexible.'); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description.trim(),
        amount: flexible ? undefined : +form.amount,
        max_uses: form.max_uses ? +form.max_uses : undefined,
        expires_days: form.expires_days ? +form.expires_days : undefined,
        provider: 'flutterwave',
      };
      // Only send bank fields if provided (non-empty) — changing bank recreates subaccount.
      if (form.bank_account && form.bank_code) {
        payload.bank_account = form.bank_account;
        payload.bank_code = form.bank_code;
      }
      if (isEdit && editing?.id) {
        await onUpdated(editing.id, payload);
        toast.success('Payment link updated!');
      } else {
        await createLink(payload);
        toast.success('Payment link created!');
        setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', max_uses: '', expires_days: '' });
        onCreated();
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || (isEdit ? 'Failed to update link.' : 'Failed to create link.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create payment link" maxWidth={520}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {isEdit && editing && (editing.bank_name || editing.bank_account) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', background: 'var(--surface-2)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
            Current bank: {editing.bank_name} {editing.bank_account ? `(${editing.bank_account})` : ''} — enter new full details above to change (will recreate subaccount for splits).
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create link')}</Button>
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
function LinkCard({ link, onDelete, onEdit, onViewEvents }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await deleteLink(link.id);
      toast.success('Link deleted.');
      onDelete(link.id);
    } catch { toast.error('Failed to deactivate.'); }
    finally { setDeleting(false); }
  };

  const handleEditClick = () => {
    if (onEdit) onEdit(link);
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

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
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
            <button onClick={handleEditClick} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <PencilSimple size={13} /> Edit
            </button>
            <button onClick={() => onViewEvents && onViewEvents(link)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ListChecks size={13} /> Settlements
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting} style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--red)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Trash size={13} /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        )}
      </div>

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

/**
 * PaymentLinks component - Dashboard for managing shareable payment URLs.
 * Users can create links to collect funds directly into their designated bank accounts
 * without sharing raw account details. Displays active links, total collections, and status.
 *
 * @returns {JSX.Element}
 */
export default function PaymentLinks() {
  const [links,    setLinks]    = useState([]);
  const [banks,    setBanks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [settlementsLink, setSettlementsLink] = useState(null);
  const [settlements, setSettlements] = useState(null);
  const [settlementsLoading, setSettlementsLoading] = useState(false);
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getLinks(), getBanks()])
      .then(([ld, bd]) => { setLinks(ld.links || []); setBanks(bd.banks || []); })
      .finally(() => setLoading(false));
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

  const openSettlements = async (link, page = 1) => {
    setSettlementsLink(link);
    setSettlements(null);
    setSettlementsLoading(true);
    setSettlementsPage(page);
    setSelectedPayment(null);
    try {
      const data = await getLinkSettlements(link.id, page);
      setSettlements(data);
    } catch (e) {
      toast.error('Failed to load settlements');
      setSettlements({ payments: [], total: 0, page, per_page: 10, total_pages: 0 });
    } finally {
      setSettlementsLoading(false);
    }
  };

  const closeSettlements = () => {
    setSettlementsLink(null);
    setSettlements(null);
    setSelectedPayment(null);
  };

  const changeSettlementsPage = (newPage) => {
    if (settlementsLink) {
      openSettlements(settlementsLink, newPage);
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
  };

  // Strictly filter to only active (non-deactivated) links. Deactivated are hard-deleted on backend (see deactivate_link)
  // but we filter client-side too for safety + any cached/inflight data. This ensures deleted/deactivated
  // links no longer appear in dashboard or list (per user request + screenshot of lingering deactivated links).
  const displayLinks = links.filter(l => l.is_active !== false);
  const totalCollected = displayLinks.reduce((s, l) => s + (l.total_collected || 0), 0);

  return (
    <AppShell title="Payment links">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Payment links</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
            {displayLinks.length} active · Total collected: <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(totalCollected)}</strong>
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create link</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>
      ) : displayLinks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Link size={40} color="var(--border-light)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '1rem' }}>No payment links yet.</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>Create a shareable link that anyone can use to pay you — your clients, customers, or pool members.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first link</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayLinks.map(link => <LinkCard key={link.id} link={link} onDelete={handleDelete} onEdit={openEdit} onViewEvents={openSettlements} />)}
        </div>
      )}

      <CreateLinkModal 
        open={showCreate} 
        onClose={closeModal} 
        banks={banks} 
        onCreated={load} 
        editing={editingLink} 
        onUpdated={handleUpdated} 
      />

      {/* Settlements modal: table of all payments received via this link, 10 per page, with View action for details */}
      <Modal open={!!settlementsLink} onClose={closeSettlements} title={`Settlements for ${settlementsLink?.title || 'link'}`} maxWidth={800}>
        {settlementsLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner size={24} /></div>
        ) : settlements && settlements.payments && settlements.payments.length ? (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Reference</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Qreek Fee</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Payout</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.payments.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{p.reference}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{FMT(p.checkout_amount || p.amount)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{FMT(p.fee || p.qreek_fee)}</td>
                    <td style={{ padding: '0.5rem' }}>{p.status}</td>
                    <td style={{ padding: '0.5rem' }}>{p.payout_status || '-'}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button onClick={() => viewPaymentDetails(p)} style={{ background: 'var(--teal-faint)', color: 'var(--teal)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              <div>
                Page {settlements.page} of {settlements.total_pages} · {settlements.total} total
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" disabled={settlements.page <= 1} onClick={() => changeSettlementsPage(settlements.page - 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Prev</Button>
                <Button variant="secondary" disabled={settlements.page >= settlements.total_pages} onClick={() => changeSettlementsPage(settlements.page + 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Next</Button>
              </div>
            </div>

            {/* Details for selected payment */}
            {selectedPayment && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 6, fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>Transaction Details for {selectedPayment.reference}</strong>
                  <button onClick={() => setSelectedPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', maxHeight: 200, overflow: 'auto', background: 'var(--surface)', padding: '0.5rem', borderRadius: 4 }}>
                  {JSON.stringify(selectedPayment, null, 2)}
                </pre>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                  For full event log (webhook, verify, split), use the debug endpoint or contact support.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-3)' }}>No payments yet for this link.</div>
        )}
      </Modal>
    </AppShell>
  );
}
