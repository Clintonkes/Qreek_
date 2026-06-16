// PoolDetail.jsx drills into a single payment pool, including members, requests, and payout activity.
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UsersThree, Clock, CheckCircle, XCircle, Plus, Link as LinkIcon } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import BankSelect from '../components/ui/BankSelect.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getPool, getPoolActivity, reportDispute } from '../api/pools.js';
import { getBanks } from '../api/payroll.js';
import { createLink, getLinks, verifyBankAccount } from '../api/paymentLinks.js';
import { feePercent, PAYMENT_PROVIDER, QREEK_FEES } from '../lib/payments.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

/**
 * Renders an individual activity log item for a pool.
 * Supports both payment transfers and member-join events.
 *
 * @param {Object} props
 * @param {Object} props.item - The transaction or activity record.
 * @param {string} props.currentPhone - The active user's phone number to determine perspective.
 */
function ActivityItem({ item, currentPhone }) {
  if (item.type === 'join') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
        <div style={{ marginTop: '2px', color: 'var(--teal)' }}>
          <UsersThree size={16} weight="fill" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem' }}>
            <strong>{item.name || item.phone}</strong> joined the pool
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
            {new Date(item.date || item.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </div>
      </motion.div>
    );
  }

  const isSender = item.sender_phone === currentPhone;
  const icon     = item.status === 'completed' ? <CheckCircle size={16} color="var(--green)" weight="fill" /> : item.status === 'failed' ? <XCircle size={16} color="var(--red)" weight="fill" /> : <Clock size={16} color="var(--amber)" />;
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div style={{ marginTop: '2px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.88rem' }}>
          <strong>{isSender ? 'You' : item.sender_name}</strong> sent {FMT(item.amount)} to <strong>{item.recipient_name}</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
          {item.recipient_bank} · Fee {FMT(item.fee)} · {new Date(item.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
        </div>
        {item.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>"{item.note}"</div>}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: item.status === 'completed' ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }}>{FMT(item.net_amount)}</div>
    </motion.div>
  );
}

function PoolLinkModal({ open, onClose, poolId, banks, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', amount: '', bank_account: '', bank_code: '', due_date: '' });
  const [amountMode, setAmountMode] = useState('fixed');
  const [saving, setSaving] = useState(false);
  const [bankStatus, setBankStatus] = useState({ state: 'idle', name: '' });
  const [dueDateError, setDueDateError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateDueDate = (value) => {
    if (!value) {
      setDueDateError('');
      return false;
    }
    const selected = new Date(`${value}T00:00:00`);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (selected < startOfToday) {
      setDueDateError('Selected date has already passed.');
      return false;
    }
    setDueDateError('');
    return true;
  };

  const verifyBank = async (override = {}) => {
    const bankAccount = override.bank_account ?? form.bank_account;
    const bankCode = override.bank_code ?? form.bank_code;
    if (!/^\d{10}$/.test(bankAccount) || !bankCode) {
      setBankStatus({ state: 'idle', name: '' });
      return;
    }
    setBankStatus({ state: 'checking', name: '' });
    try {
      const verified = await verifyBankAccount({
        bank_account: bankAccount,
        bank_code: bankCode,
      });
      setBankStatus({ state: 'verified', name: verified?.account_name || '' });
    } catch {
      setBankStatus({ state: 'failed', name: '' });
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title required.'); return; }
    if (!form.description.trim()) { toast.error('Description required.'); return; }
    if (amountMode === 'fixed' && (!form.amount || +form.amount <= 0)) { toast.error('Enter a fixed amount or choose flexible.'); return; }
    if (!/^\d{10}$/.test(form.bank_account)) { toast.error('Enter a valid 10 digit account number.'); return; }
    if (!form.bank_code) { toast.error('Select a bank.'); return; }
    if (!form.due_date) { toast.error('Due date is required.'); return; }
    if (!validateDueDate(form.due_date)) {
      toast.error('Selected date has already passed.');
      return;
    }

    const dueDate = new Date(`${form.due_date}T23:59:59`);
    const today = new Date();
    const expiresDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (!Number.isFinite(expiresDays) || expiresDays <= 0) { toast.error('Due date must be in the future.'); return; }

    setSaving(true);
    try {
      const verified = await verifyBankAccount({
        bank_account: form.bank_account,
        bank_code: form.bank_code,
      });
      await createLink({
        title: form.title.trim(),
        description: form.description.trim(),
        amount: amountMode === 'flexible' ? null : +form.amount,
        bank_account: form.bank_account,
        bank_code: form.bank_code,
        expires_days: expiresDays,
        pool_id: poolId,
        provider: 'flutterwave',
      });
      toast.success(verified?.account_name ? `Verified ${verified.account_name}. Pool payment link created.` : 'Pool payment link created.');
      setForm({ title: '', description: '', amount: '', bank_account: '', bank_code: '', due_date: '' });
      setAmountMode('fixed');
      setDueDateError('');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create pool payment link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate payment link" maxWidth={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="January dues" />
        <Input label="Description *" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Contribution for January pool payment" />
        <div>
          <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Amount type *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              ['fixed', 'Fixed amount'],
              ['flexible', 'Flexible amount'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmountMode(value)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${amountMode === value ? 'var(--teal)' : 'var(--border)'}`,
                  background: amountMode === value ? 'var(--teal-faint)' : 'var(--surface-2)',
                  color: amountMode === value ? 'var(--teal)' : 'var(--text-2)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {amountMode === 'fixed' && <Input label="Fixed amount (₦) *" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="5000" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Account number *" value={form.bank_account} onChange={e => { set('bank_account', e.target.value.replace(/\D/g, '').slice(0, 10)); setBankStatus({ state: 'idle', name: '' }); }} onBlur={verifyBank} placeholder="0123456789" style={{ fontFamily: 'var(--font-mono)' }} />
          <BankSelect
            label="Bank *"
            banks={banks}
            value={form.bank_code}
            onChange={value => {
              set('bank_code', value);
              setBankStatus({ state: 'idle', name: '' });
              if (/^\d{10}$/.test(form.bank_account) && value) {
                verifyBank({ bank_account: form.bank_account, bank_code: value });
              }
            }}
            hint="Bank account will be verified before saving."
          />
          <div style={{ gridColumn: '1 / -1', fontSize: '0.76rem', color: bankStatus.state === 'verified' ? 'var(--green)' : bankStatus.state === 'failed' ? 'var(--red)' : 'var(--text-3)' }}>
            {bankStatus.state === 'checking' && 'Verifying bank account...'}
            {bankStatus.state === 'verified' && `Verified: ${bankStatus.name}`}
            {bankStatus.state === 'failed' && 'Bank account could not be verified.'}
            {bankStatus.state === 'idle' && 'Bank account will be verified before saving.'}
          </div>
        </div>
        <Input
          label="Due date *"
          type="date"
          value={form.due_date}
          onChange={e => {
            set('due_date', e.target.value);
            validateDueDate(e.target.value);
          }}
          error={dueDateError}
          hint="Past dates are rejected as soon as they are selected."
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Generating...' : 'Generate link'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function PoolLinkAction({ link, isAdmin, onGenerate }) {
  if (link) {
    return (
      <div style={{ width: '100%', maxWidth: 420, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', background: 'var(--surface)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <LinkIcon size={16} color="var(--teal)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            {link.url}
          </span>
          <CopyButton text={link.url} />
        </div>
        <a href={link.url} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start', fontSize: '0.75rem', color: 'var(--teal)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Open
        </a>
      </div>
    );
  }
  if (!isAdmin) return null;
  return <Button onClick={onGenerate}><Plus size={16} /> Generate payment link</Button>;
}

/**
 * PoolDetail component - Deep dive into a specific payment pool.
 * Includes three primary tabs:
 * - Activity: A chronological feed of payments made from the pool.
 * - Members: Roster of users in the pool with roles (e.g., admin).
 * - Requests: Outstanding payment demands made by the pool admin.
 *
 * Administrators can broadcast payment requests, and members can send outbound payments.
 *
 * @returns {JSX.Element}
 */
export default function PoolDetail() {
  const { poolId } = useParams();
  const navigate   = useNavigate();
  const [pool,      setPool]      = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [poolLinks, setPoolLinks] = useState([]);
  const [banks,     setBanks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showLink,  setShowLink]  = useState(false);
  const [tab,       setTab]       = useState('activity');

  const load = useCallback(async () => {
    try {
      const [pd, ad, bd, ld] = await Promise.all([
        getPool(poolId), getPoolActivity(poolId, 1), getBanks(), getLinks(),
      ]);
      setPool(pd);
      const payments = (ad.activity || []).map(t => ({ ...t, type: 'payment' }));
      const joins = (pd.members || []).map(m => ({
        type: 'join', id: `join_${m.phone}`, name: m.name, phone: m.phone,
        created_at: m.joined_at,
      }));
      const merged = [...payments, ...joins].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
      setActivity(merged);
      setBanks(bd.banks || []);
      setPoolLinks((ld.links || []).filter(l => l.pool_id === poolId && l.is_active !== false));
    } catch { toast.error('Failed to load pool.'); }
    finally { setLoading(false); }
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <AppShell title="Pool"><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div></AppShell>;
  if (!pool)   return <AppShell title="Pool"><div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>Pool not found.</div></AppShell>;
  const activePoolLink = poolLinks[0] || null;

  return (
    <AppShell title={pool.name}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/pools')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem' }}>{pool.name}</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
              {pool.member_count} member{pool.member_count !== 1 ? 's' : ''} · Fiat pool · {feePercent(QREEK_FEES.poolPayout)} fee
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <PoolLinkAction link={activePoolLink} isAdmin={pool.is_admin} onGenerate={() => setShowLink(true)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            ['Invite code', <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>{pool.invite_code}</span>],
            ['Total volume', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)' }}>{FMT(pool.total_volume)}</span>],
            ['Members', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{pool.member_count}</span>],
            ['Payment link', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: activePoolLink ? 'var(--teal)' : 'var(--text-3)' }}>{activePoolLink ? 'Generated' : 'Not created'}</span>],
          ].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>{l}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{v}{l === 'Invite code' && <CopyButton text={pool.invite_code} />}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.25rem', marginBottom: '1.25rem' }}>
          {[['activity', 'Activity'], ['members', 'Members'], ['protect', 'Protection']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '0.5rem', border: 'none', background: tab === id ? 'var(--surface-2)' : 'transparent', color: tab === id ? 'var(--teal)' : 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 500, borderBottom: tab === id ? '2px solid var(--teal)' : '2px solid transparent', transition: 'var(--trans-fast)' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'activity' && (
          <div>
            {activity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No activity yet.
              </div>
            ) : activity.map(item => <ActivityItem key={item.id} item={item} currentPhone="" />)}
          </div>
        )}

        {tab === 'members' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {(pool.members || []).map((m, i) => (
              <div key={m.phone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', color: 'var(--text-inv)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {(m.name || m.phone)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name || m.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-NG') : '—'}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: m.role === 'admin' ? 'var(--teal-faint)' : 'var(--surface-2)', color: m.role === 'admin' ? 'var(--teal)' : 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{m.role}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'protect' && (
          <ProtectionTab poolId={poolId} pool={pool} />
        )}
      </div>

      <PoolLinkModal open={showLink} onClose={() => setShowLink(false)} poolId={poolId} banks={banks} onCreated={load} />
    </AppShell>
  );
}

function ProtectionTab({ poolId, pool }) {
  const [desc,    setDesc]    = useState('');
  const [txnId,   setTxnId]   = useState('');
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleDispute = async () => {
    if (!desc.trim() || desc.trim().length < 10) { toast.error('Please describe the issue in at least 10 characters.'); return; }
    setSending(true);
    try {
      await reportDispute(poolId, { description: desc, transaction_id: txnId || undefined });
      setDone(true);
      toast.success('Dispute reported. Support will review within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to report dispute.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, color: 'var(--teal)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>🔐 How your money is protected</div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            `All payments are processed by ${PAYMENT_PROVIDER.name}. Qreek never holds funds.`,
            'Funds go directly from the payer\'s bank to the recipient\'s bank — the admin cannot intercept them.',
            'Every transaction is recorded on Qreek\'s immutable ledger and visible to all pool members.',
            'Admin changes are logged with timestamp and visible to all members.',
            'You can report any suspicious activity below and our support team will respond within 24 hours.',
          ].map((item, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{item}</li>)}
        </ul>
      </div>

      {done ? (
        <div style={{ background: 'var(--green-faint)', border: '1px solid var(--green)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', color: 'var(--green)' }}>
          ✅ Dispute reported successfully. Reference: DISPUTE-{poolId?.slice(0,6)?.toUpperCase()}<br />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Our support team will contact you within 24 hours.</span>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>🚩 Report a problem with this pool</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Transaction reference (optional)</label>
              <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="e.g. QRK_PS_ABC123" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Describe the problem *</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Describe what happened — e.g. Admin created a payment request for an unauthorized amount..." style={{ resize: 'none' }} />
            </div>
            <Button onClick={handleDispute} disabled={sending || desc.trim().length < 10} variant="danger" style={{ alignSelf: 'flex-start' }}>
              {sending ? 'Sending…' : 'Submit dispute report'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
