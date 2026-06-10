import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Link as LinkIcon, Plus, UsersThree, Wallet, PaperPlaneTilt, HandCoins } from 'phosphor-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import BankSelect from '../components/ui/BankSelect.jsx';
import { getBanks } from '../api/payroll.js';
import { createLink } from '../api/paymentLinks.js';
import {
  approveFamilyRequest,
  completeFamilyTransfer,
  createFamily,
  createFamilyRequest,
  createFamilyTransfer,
  getFamilies,
  getFamily,
  joinFamily,
} from '../api/family.js';
import { verifyBankAccount } from '../api/paymentLinks.js';
import useAuthStore from '../store/authStore.js';
import { getUserFriendlyError } from '../lib/utils.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function Stat({ label, value, sub, accent = 'var(--teal)' }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.1rem' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: accent }}>{value}</div>
      {sub ? <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>{sub}</div> : null}
    </div>
  );
}

function Pill({ children, tone = 'teal' }) {
  const tones = {
    teal: { bg: 'var(--teal-faint)', color: 'var(--teal)' },
    amber: { bg: 'rgba(245,166,35,0.12)', color: 'var(--amber)' },
    green: { bg: 'var(--green-faint)', color: 'var(--green)' },
    red: { bg: 'var(--red-faint)', color: 'var(--red)' },
    surface: { bg: 'var(--surface-2)', color: 'var(--text-2)' },
  };
  const style = tones[tone] || tones.teal;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: style.bg, color: style.color, fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700 }}>
      {children}
    </span>
  );
}

function FamilyCard({ family, onOpen }) {
  return (
    <div
      onClick={() => onOpen(`/family/${family.id}`)}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.2rem', cursor: 'pointer', transition: 'var(--trans-fast)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.25rem' }}>{family.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.55 }}>
            {family.member_count || 0} members · {FMT(family.balance_ngn || 0)} balance
          </div>
        </div>
        <ArrowRight size={14} color="var(--teal)" />
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
        <Pill tone={family.role === 'admin' ? 'teal' : 'surface'}>{family.role || 'member'}</Pill>
        <Pill tone="amber">Code {family.invite_code}</Pill>
      </div>
    </div>
  );
}

export default function Family() {
  const navigate = useNavigate();
  const { familyId } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(!!familyId);
  const [families, setFamilies] = useState([]);
  const [familyData, setFamilyData] = useState(null);
  const [banks, setBanks] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [linkForm, setLinkForm] = useState({ title: '', description: '', amount: '' });
  const [requestForm, setRequestForm] = useState({ title: '', amount: '', due_date: '', note: '' });
  const [transferForm, setTransferForm] = useState({ beneficiary_name: '', beneficiary_phone: '', amount: '', bank_account: '', bank_code: '', note: '' });
  const [bankCheck, setBankCheck] = useState({ state: 'idle', name: '' });

  const hasBankDetails = !!user?.bank_account && !!user?.bank_code;
  const selectedFamily = useMemo(() => familyData?.family || families.find(f => f.id === familyId) || null, [familyData?.family, families, familyId]);

  const refreshFamilies = async () => {
    const data = await getFamilies();
    setFamilies(data.families || []);
  };

  const refreshDetail = async (id) => {
    if (!id) {
      setFamilyData(null);
      return;
    }
    setDetailLoading(true);
    try {
      const data = await getFamily(id);
      setFamilyData(data);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to load family.'));
      navigate('/family');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([getFamilies(), getBanks().catch(() => ({ banks: [] }))])
      .then(([familyResp, bankResp]) => {
        if (!mounted) return;
        setFamilies(familyResp.families || []);
        setBanks(bankResp.banks || []);
      })
      .catch(err => {
        if (!mounted) return;
        toast.error(getUserFriendlyError(err, 'Could not load family groups.'));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!familyId) {
      setFamilyData(null);
      setDetailLoading(false);
      return;
    }
    refreshDetail(familyId);
  }, [familyId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return toast.error('Family name is required.');
    try {
      const data = await createFamily({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
      });
      toast.success('Family created.');
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      await refreshFamilies();
      navigate(`/family/${data.id}`);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to create family.'));
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim().replace(/\/+$/, '').split('/').pop().toUpperCase();
    if (!code) return toast.error('Invite code is required.');
    try {
      const data = await joinFamily(code);
      toast.success(data.message || 'Joined family.');
      setShowJoin(false);
      setJoinCode('');
      await refreshFamilies();
      navigate(`/family/${data.family_id || data.id}`);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to join family.'));
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!selectedFamily?.id) return;
    if (!hasBankDetails) return toast.error('Set your bank details in Settings before creating a family link.');
    if (!linkForm.title.trim()) return toast.error('Link title is required.');
    if (!linkForm.description.trim()) return toast.error('Link description is required.');
    if (linkForm.amount && +linkForm.amount <= 0) return toast.error('Amount must be greater than zero.');
    try {
      const link = await createLink({
        title: linkForm.title.trim(),
        description: linkForm.description.trim(),
        amount: linkForm.amount ? +linkForm.amount : null,
        bank_account: user.bank_account,
        bank_code: user.bank_code,
        family_id: selectedFamily.id,
        provider: 'flutterwave',
      });
      toast.success('Family payment link created.');
      setShowLink(false);
      setLinkForm({ title: '', description: '', amount: '' });
      await refreshDetail(selectedFamily.id);
      if (link?.link?.code) window.open(`${window.location.origin}/p/${link.link.code}`, '_blank', 'noreferrer');
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to create family payment link.'));
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!selectedFamily?.id) return;
    if (!requestForm.title.trim()) return toast.error('Request title is required.');
    if (!requestForm.amount || +requestForm.amount <= 0) return toast.error('Request amount must be greater than zero.');
    if (!requestForm.due_date.trim()) return toast.error('Due date is required.');
    try {
      await createFamilyRequest(selectedFamily.id, {
        title: requestForm.title.trim(),
        amount: +requestForm.amount,
        note: requestForm.note.trim() || undefined,
        due_date: requestForm.due_date,
      });
      toast.success('Family request created.');
      setShowRequest(false);
      setRequestForm({ title: '', amount: '', due_date: '', note: '' });
      await refreshDetail(selectedFamily.id);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to create request.'));
    }
  };

  const verifyTransferBank = async () => {
    if (!transferForm.bank_account || !transferForm.bank_code || !/^\d{10}$/.test(transferForm.bank_account)) {
      setBankCheck({ state: 'idle', name: '' });
      return;
    }
    setBankCheck({ state: 'checking', name: '' });
    try {
      const verified = await verifyBankAccount({
        bank_account: transferForm.bank_account,
        bank_code: transferForm.bank_code,
      });
      setBankCheck({ state: 'verified', name: verified?.account_name || '' });
    } catch {
      setBankCheck({ state: 'failed', name: '' });
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedFamily?.id) return;
    if (!transferForm.beneficiary_name.trim()) return toast.error('Beneficiary name is required.');
    if (!transferForm.bank_account.trim() || !transferForm.bank_code.trim()) return toast.error('Beneficiary bank details are required.');
    if (!transferForm.amount || +transferForm.amount <= 0) return toast.error('Transfer amount must be greater than zero.');
    try {
      await createFamilyTransfer(selectedFamily.id, {
        beneficiary_name: transferForm.beneficiary_name.trim(),
        beneficiary_phone: transferForm.beneficiary_phone.trim() || undefined,
        bank_account: transferForm.bank_account.trim(),
        bank_code: transferForm.bank_code.trim(),
        amount: +transferForm.amount,
        note: transferForm.note.trim() || undefined,
      });
      toast.success('Family transfer recorded.');
      setShowTransfer(false);
      setTransferForm({ beneficiary_name: '', beneficiary_phone: '', amount: '', bank_account: '', bank_code: '', note: '' });
      setBankCheck({ state: 'idle', name: '' });
      await refreshDetail(selectedFamily.id);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Failed to record transfer.'));
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await approveFamilyRequest(selectedFamily.id, requestId);
      toast.success('Request approved.');
      await refreshDetail(selectedFamily.id);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Could not approve request.'));
    }
  };

  const handleCompleteTransfer = async (transferId) => {
    try {
      await completeFamilyTransfer(selectedFamily.id, transferId);
      toast.success('Transfer marked complete.');
      await refreshDetail(selectedFamily.id);
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Could not complete transfer.'));
    }
  };

  const data = familyData || {};
  const family = data.family || selectedFamily;
  const members = data.members || [];
  const requests = data.requests || [];
  const transfers = data.transfers || [];
  const links = data.links || [];
  const ledger = data.ledger || [];
  const summary = data.summary || {};
  const isAdmin = family?.role === 'admin' || data.is_admin;

  return (
    <AppShell title="Family">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{familyId ? family?.name || 'Family' : 'Family'}</h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Shared family contributions, requests, transfer records, and public intake links.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => setShowJoin(true)}>Join family</Button>
              <Button onClick={() => setShowCreate(true)}>Create family</Button>
            </div>
          </div>

          {!familyId ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Stat label="Family groups" value={families.length} sub="Shared ledgers and requests" accent="var(--amber)" />
                <Stat label="Family members" value={families.reduce((sum, item) => sum + (item.member_count || 0), 0)} sub="Across all family groups" accent="var(--teal)" />
                <Stat label="Balance" value={FMT(families.reduce((sum, item) => sum + (item.balance_ngn || 0), 0))} sub="Visible family ledger value" accent="var(--green)" />
              </div>

              {families.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  No family groups yet. Create one to start collecting contributions and managing requests.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {families.map(familyItem => <FamilyCard key={familyItem.id} family={familyItem} onOpen={navigate} />)}
                </div>
              )}
            </>
          ) : detailLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={34} /></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <Stat label="Balance" value={FMT(family?.balance_ngn || 0)} sub="Contribution balance tracked in the family ledger" accent="var(--green)" />
                <Stat label="Members" value={family?.member_count || members.length || 0} sub="Payers and beneficiaries in the family group" accent="var(--teal)" />
                <Stat label="Requests" value={requests.length} sub="Open and approved request records" accent="var(--amber)" />
                <Stat label="Transfers" value={transfers.length} sub="Recorded transfer entries" accent="var(--blue)" />
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.15rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{family?.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                      Invite code <strong style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{family?.invite_code}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => setShowLink(true)}><LinkIcon size={16} /> Create link</Button>
                    <Button variant="secondary" onClick={() => setShowRequest(true)}><HandCoins size={16} /> Request money</Button>
                    <Button onClick={() => setShowTransfer(true)}><PaperPlaneTilt size={16} /> Record transfer</Button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
                  <Pill tone={isAdmin ? 'teal' : 'surface'}>{isAdmin ? 'Admin' : (family?.role || 'member')}</Pill>
                  <Pill tone="amber">{family?.member_count || members.length || 0} members</Pill>
                  <Pill tone="green">{FMT(family?.balance_ngn || 0)} balance</Pill>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Members</h2>
                    <Pill tone="surface">{members.length} listed</Pill>
                  </div>
                  {members.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>No members loaded yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {members.map(member => (
                        <div key={`${member.phone}-${member.joined_at}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.8rem 0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-2)' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name || member.phone}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{member.phone}</div>
                          </div>
                          <Pill tone={member.role === 'admin' ? 'teal' : 'surface'}>{member.role || 'member'}</Pill>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Family links</h2>
                    <Pill tone="amber">{links.length} active</Pill>
                  </div>
                  {links.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>
                      No family payment links yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {links.map(link => (
                        <div key={link.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', background: 'var(--bg-2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{link.title}</div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.55 }}>{link.description}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.35rem' }}>{link.code}</div>
                            </div>
                            <Link to={`/p/${link.code}`} target="_blank" rel="noreferrer" style={{ color: 'var(--teal)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              Open
                            </Link>
                          </div>
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                            <Pill tone="green">{link.is_flexible ? 'Flexible' : FMT(link.amount)}</Pill>
                            <CopyButton text={`${window.location.origin}/p/${link.code}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Requests</h2>
                    <Pill tone="amber">{requests.length} records</Pill>
                  </div>
                  {requests.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>No family requests yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {requests.map(request => (
                        <div key={request.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', background: 'var(--bg-2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{request.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.55 }}>{request.note || 'No note provided'}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                                Due {request.due_date ? new Date(request.due_date).toLocaleDateString('en-NG') : '-'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--teal)' }}>{FMT(request.amount)}</div>
                              <Pill tone={request.status === 'approved' ? 'green' : request.status === 'cancelled' ? 'red' : 'surface'}>{request.status || 'active'}</Pill>
                            </div>
                          </div>
                          {isAdmin && request.status === 'active' && (
                            <div style={{ marginTop: '0.65rem' }}>
                              <Button variant="secondary" onClick={() => handleApprove(request.id)} style={{ padding: '0.45rem 0.7rem', fontSize: '0.78rem' }}>Approve</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Transfers</h2>
                    <Pill tone="teal">{transfers.length} records</Pill>
                  </div>
                  {transfers.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>No transfer records yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {transfers.map(transfer => (
                        <div key={transfer.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', background: 'var(--bg-2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{transfer.beneficiary_name}</div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.55 }}>
                                {transfer.bank_name} {transfer.bank_account ? `· ${transfer.bank_account}` : ''}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                                {transfer.note || 'No memo'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--teal)' }}>{FMT(transfer.amount)}</div>
                              <Pill tone={transfer.status === 'completed' ? 'green' : transfer.status === 'failed' ? 'red' : 'amber'}>{transfer.status || 'pending'}</Pill>
                            </div>
                          </div>
                          {isAdmin && transfer.status !== 'completed' && (
                            <div style={{ marginTop: '0.65rem' }}>
                              <Button variant="secondary" onClick={() => handleCompleteTransfer(transfer.id)} style={{ padding: '0.45rem 0.7rem', fontSize: '0.78rem' }}>Mark complete</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Ledger</h2>
                  <Pill tone="surface">{ledger.length} entries</Pill>
                </div>
                {ledger.length === 0 ? (
                  <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>The family ledger will appear here after contributions or transfers.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Date</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Type</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Payer / Beneficiary</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Reference</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Amount</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((entry, index) => (
                          <tr key={`${entry.type}-${entry.reference || index}`} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>{entry.created_at ? new Date(entry.created_at).toLocaleString('en-NG') : '-'}</td>
                            <td style={{ padding: '0.5rem' }}><Pill tone={entry.type === 'contribution' ? 'teal' : entry.type === 'transfer' ? 'amber' : 'surface'}>{entry.type}</Pill></td>
                            <td style={{ padding: '0.5rem' }}>
                              <div style={{ fontWeight: 700 }}>{entry.name || entry.payer_name || entry.beneficiary_name || '-'}</div>
                              <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{entry.phone || entry.payer_phone || entry.beneficiary_phone || ''}</div>
                            </td>
                            <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{entry.reference || '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>{FMT(entry.amount)}</td>
                            <td style={{ padding: '0.5rem' }}>{entry.status || '-'}</td>
                            <td style={{ padding: '0.5rem' }}>{entry.description || entry.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create family" maxWidth={520}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Family name *" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="The Ogayi Family" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>Description</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Use this family ledger for school fees, rent, support, and savings."
              rows={4}
              style={{ resize: 'vertical', minHeight: 90 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create family</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join family" maxWidth={460}>
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Invite code *" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="ABC123" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowJoin(false)}>Cancel</Button>
            <Button type="submit">Join family</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showLink} onClose={() => setShowLink(false)} title="Create family contribution link" maxWidth={520}>
        <form onSubmit={handleCreateLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!hasBankDetails && (
            <div style={{ background: 'var(--amber-faint)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 'var(--radius)', padding: '0.85rem', fontSize: '0.84rem', color: 'var(--text-2)' }}>
              Set your bank details in Settings before creating a family link.
            </div>
          )}
          <Input label="Link title *" value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} placeholder={`${family?.name || 'Family'} contributions`} />
          <Input label="Description *" value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} placeholder="Contribute for school fees, rent, or emergencies." />
          <Input label="Fixed amount (optional)" type="number" value={linkForm.amount} onChange={e => setLinkForm(f => ({ ...f, amount: e.target.value }))} placeholder="Leave blank for flexible amount" />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
            This link will use your stored bank details: <strong>{user?.bank_name || 'No bank saved'}</strong>.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowLink(false)}>Cancel</Button>
            <Button type="submit" disabled={!hasBankDetails}>Create link</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Create family request" maxWidth={560}>
        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Request title *" value={requestForm.title} onChange={e => setRequestForm(f => ({ ...f, title: e.target.value }))} placeholder="School fees" />
          <Input label="Amount (₦) *" type="number" value={requestForm.amount} onChange={e => setRequestForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" />
          <Input label="Due date *" type="date" value={requestForm.due_date} onChange={e => setRequestForm(f => ({ ...f, due_date: e.target.value }))} />
          <Input label="Note" value={requestForm.note} onChange={e => setRequestForm(f => ({ ...f, note: e.target.value }))} placeholder="What the money is for" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button type="submit">Save request</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Record family transfer" maxWidth={620}>
        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Beneficiary name *" value={transferForm.beneficiary_name} onChange={e => setTransferForm(f => ({ ...f, beneficiary_name: e.target.value }))} placeholder="Chinelo Ogayi" />
          <Input label="Beneficiary phone" value={transferForm.beneficiary_phone} onChange={e => setTransferForm(f => ({ ...f, beneficiary_phone: e.target.value }))} placeholder="+234..." />
          <Input label="Amount (₦) *" type="number" value={transferForm.amount} onChange={e => setTransferForm(f => ({ ...f, amount: e.target.value }))} placeholder="20000" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Account number *" value={transferForm.bank_account} onChange={e => { setTransferForm(f => ({ ...f, bank_account: e.target.value.replace(/\D/g, '').slice(0, 10) })); setBankCheck({ state: 'idle', name: '' }); }} onBlur={verifyTransferBank} placeholder="0123456789" style={{ fontFamily: 'var(--font-mono)' }} />
            <BankSelect
              label="Bank *"
              banks={banks}
              value={transferForm.bank_code}
              onChange={value => {
                setTransferForm(f => ({ ...f, bank_code: value }));
                setBankCheck({ state: 'idle', name: '' });
              }}
              hint="We verify the destination bank before recording the transfer."
            />
          </div>
          <div style={{ fontSize: '0.76rem', color: bankCheck.state === 'verified' ? 'var(--green)' : bankCheck.state === 'failed' ? 'var(--red)' : 'var(--text-3)' }}>
            {bankCheck.state === 'checking' && 'Verifying bank account...'}
            {bankCheck.state === 'verified' && `Verified: ${bankCheck.name}`}
            {bankCheck.state === 'failed' && 'Bank account could not be verified.'}
            {bankCheck.state === 'idle' && 'Bank account will be verified before saving.'}
          </div>
          <Input label="Memo" value={transferForm.note} onChange={e => setTransferForm(f => ({ ...f, note: e.target.value }))} placeholder="Support, rent, or medical transfer" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancel</Button>
            <Button type="submit">Record transfer</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
