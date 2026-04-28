// PoolDetail.jsx drills into a single payment pool, including members, requests, and payout activity.
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, PaperPlaneTilt, Bell, Users, Clock, CheckCircle, XCircle, Plus } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getPool, getPoolActivity, poolSend, createRequest, getRequests } from '../api/pools.js';
import { getBanks } from '../api/payroll.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function ActivityItem({ item, currentPhone }) {
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

function SendModal({ open, onClose, poolId, banks, onSent }) {
  const [form, setForm] = useState({ amount: '', recipient_name: '', bank_account: '', bank_code: '', note: '', pin: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.amount || +form.amount < 100)      e.amount = 'Minimum ₦100';
    if (!form.recipient_name.trim())              e.recipient_name = 'Required';
    if (!/^\d{10}$/.test(form.bank_account))     e.bank_account = 'Must be 10 digits';
    if (!form.bank_code)                          e.bank_code = 'Select a bank';
    if (!form.pin || form.pin.length < 4)         e.pin = '4–6 digit PIN';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await poolSend(poolId, { amount: +form.amount, recipient_name: form.recipient_name, bank_account: form.bank_account, bank_code: form.bank_code, note: form.note || undefined, pin: form.pin });
      toast.success('Payment sent!');
      setForm({ amount: '', recipient_name: '', bank_account: '', bank_code: '', note: '', pin: '' });
      onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed.');
    } finally {
      setSaving(false);
    }
  };

  const fee = +form.amount > 0 ? +(+form.amount * 0.003).toFixed(2) : 0;
  const net = +form.amount > 0 ? +(+form.amount - fee).toFixed(2) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Send payment" maxWidth={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Amount (₦) *" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} error={errors.amount} placeholder="5000" />
        {+form.amount > 0 && (
          <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-2)' }}>Fee (0.3%): {FMT(fee)}</span>
            <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Recipient gets: {FMT(net)}</span>
          </div>
        )}
        <Input label="Recipient name *" value={form.recipient_name} onChange={e => set('recipient_name', e.target.value)} error={errors.recipient_name} placeholder="Emeka Johnson" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input label="Account number *" value={form.bank_account} onChange={e => set('bank_account', e.target.value.replace(/\D/g, '').slice(0, 10))} error={errors.bank_account} placeholder="0123456789" style={{ fontFamily: 'var(--font-mono)' }} />
          <div>
            <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: errors.bank_code ? 'var(--red)' : 'var(--text-2)', display: 'block', marginBottom: '0.35rem' }}>Bank *</label>
            <select value={form.bank_code} onChange={e => set('bank_code', e.target.value)} style={{ width: '100%', borderColor: errors.bank_code ? 'var(--red)' : undefined }}>
              <option value="">Select</option>
              {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            {errors.bank_code && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.bank_code}</span>}
          </div>
        </div>
        <Input label="Note (optional)" value={form.note} onChange={e => set('note', e.target.value)} placeholder="For January supplies" />
        <Input label="Your PIN *" type="password" value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))} error={errors.pin} placeholder="••••••" maxLength={6} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3em' }} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={saving}>{saving ? 'Sending…' : 'Send payment'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function RequestModal({ open, onClose, poolId, onCreated }) {
  const [form, setForm]   = useState({ title: '', amount: '', note: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.amount || +form.amount <= 0) { toast.error('Title and amount required.'); return; }
    setSaving(true);
    try {
      await createRequest(poolId, { title: form.title, amount: +form.amount, note: form.note || undefined, due_date: form.due_date || undefined });
      toast.success('Payment request sent to pool members!');
      setForm({ title: '', amount: '', note: '', due_date: '' });
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Request payment from members" maxWidth={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="January dues" />
        <Input label="Amount (₦) *" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="5000" />
        <Input label="Note (optional)" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Pay before Friday" />
        <Input label="Due date (optional)" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Sending…' : 'Send request'}</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function PoolDetail() {
  const { poolId } = useParams();
  const navigate   = useNavigate();
  const [pool,      setPool]      = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [banks,     setBanks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showSend,  setShowSend]  = useState(false);
  const [showReq,   setShowReq]   = useState(false);
  const [tab,       setTab]       = useState('activity');

  const load = useCallback(async () => {
    try {
      const [pd, ad, rd, bd] = await Promise.all([
        getPool(poolId), getPoolActivity(poolId, 1), getRequests(poolId), getBanks(),
      ]);
      setPool(pd);
      setActivity(ad.activity || []);
      setRequests(rd.requests || []);
      setBanks(bd.banks || []);
    } catch { toast.error('Failed to load pool.'); }
    finally { setLoading(false); }
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <AppShell title="Pool"><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div></AppShell>;
  if (!pool)   return <AppShell title="Pool"><div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>Pool not found.</div></AppShell>;

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
              {pool.member_count} member{pool.member_count !== 1 ? 's' : ''} · Fiat pool · 0.3% fee
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {pool.is_admin && <Button variant="secondary" onClick={() => setShowReq(true)}><Bell size={16} /> Request payment</Button>}
            <Button onClick={() => setShowSend(true)}><PaperPlaneTilt size={16} /> Send payment</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            ['Invite code', <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>{pool.invite_code}</span>],
            ['Total volume', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)' }}>{FMT(pool.total_volume)}</span>],
            ['Members', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{pool.member_count}</span>],
            ['Active requests', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--amber)' }}>{requests.length}</span>],
          ].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>{l}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{v}{l === 'Invite code' && <CopyButton text={pool.invite_code} />}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.25rem', marginBottom: '1.25rem' }}>
          {[['activity', 'Activity'], ['members', 'Members'], ['requests', 'Requests']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '0.5rem', border: 'none', background: tab === id ? 'var(--surface-2)' : 'transparent', color: tab === id ? 'var(--teal)' : 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 500, borderBottom: tab === id ? '2px solid var(--teal)' : '2px solid transparent', transition: 'var(--trans-fast)' }}>
              {label} {id === 'requests' && requests.length > 0 && <span style={{ background: 'var(--amber)', color: 'var(--text-inv)', borderRadius: 'var(--radius-full)', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.25rem' }}>{requests.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'activity' && (
          <div>
            {activity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No activity yet. Send the first payment!
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

        {tab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No active payment requests.
                {pool.is_admin && <div style={{ marginTop: '0.75rem' }}><Button variant="secondary" onClick={() => setShowReq(true)}><Plus size={16} /> Create request</Button></div>}
              </div>
            ) : requests.map(req => (
              <div key={req.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{req.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: '1rem' }}>{FMT(req.amount)}</span>
                </div>
                {req.note && <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: '0.4rem' }}>{req.note}</div>}
                {req.due_date && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Due: {new Date(req.due_date).toLocaleDateString('en-NG')}</div>}
                <div style={{ marginTop: '0.75rem' }}>
                  <Button onClick={() => setShowSend(true)} style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>Pay now</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SendModal open={showSend} onClose={() => setShowSend(false)} poolId={poolId} banks={banks} onSent={load} />
      <RequestModal open={showReq} onClose={() => setShowReq(false)} poolId={poolId} onCreated={load} />
    </AppShell>
  );
}
