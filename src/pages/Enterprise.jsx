// Enterprise.jsx is the business operations home for payroll and structured team payouts.
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Buildings, Users, Money, ChartBar, ArrowRight, Plus, Lightning, Wallet, Link as LinkIcon, UserPlus, ShareNetwork } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getCompany, getAnalytics, depositToWallet, getWalletBalance, generateEmployeeInvite } from '../api/payroll.js';
import { getLinks } from '../api/paymentLinks.js';

/**
 * A reusable UI card to display a key metric or statistic.
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - Icon component to render.
 * @param {string} props.label - Title/label for the metric.
 * @param {string|number} props.value - Primary metric value.
 * @param {string} [props.color='var(--teal)'] - Theme color string.
 * @param {string} [props.sub] - Optional secondary text.
 */
function StatCard({ icon: Icon, label, value, color = 'var(--teal)', sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-2)', fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
        <Icon size={16} color={color} />
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

/**
 * Renders a row indicating the status, period, and total of a payroll run.
 *
 * @param {Object} props
 * @param {Object} props.run - Payroll run data object.
 * @param {string} props.run.status - Status of the run ('completed', 'partial', etc.).
 * @param {string} props.run.period - Period or date describing the run.
 * @param {number} [props.run.count] - Employee count for this run.
 * @param {number} [props.run.total_net] - Total net amount.
 */
function RunBar({ run }) {
  const pct = run.count ? 100 : 0;
  const color = run.status === 'completed' ? 'var(--green)' : run.status === 'partial' ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{run.period}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{run.count} employees</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text)' }}>
        ₦{(run.total_net || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
      </div>
      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: color + '20', color }}>{run.status}</span>
    </div>
  );
}

/**
 * Enterprise dashboard component for business operations.
 * Displays aggregate metrics (total paid, employee count, payroll runs),
 * recent payroll activities, and quick access to management features.
 *
 * @returns {JSX.Element}
 */
export default function Enterprise() {
  const [company,     setCompany]     = useState(null);
  const [analytics,   setAnalytics]   = useState(null);
  const [walletBal,   setWalletBal]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt,  setDepositAmt]  = useState('');
  const [depositing,  setDepositing]  = useState(false);
  const [enterpriseLinks, setEnterpriseLinks] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const loadCompany = () => {
    getCompany()
      .then(d => {
        const c = d.company;
        setCompany(c);
        if (c) {
          const stored = localStorage.getItem(`qreek_invite_${c.id}`) || '';
          setInviteLink(stored);
          getWalletBalance().then(w => setWalletBal(w.wallet_balance_ngn || 0)).catch(() => {});
          getLinks().then(ld => setEnterpriseLinks(ld.links || [])).catch(() => {});
          return getAnalytics();
        }
      })
      .then(d => { if (d) setAnalytics(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCompany(); }, []);

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    try {
      const res = await generateEmployeeInvite();
      const link = res.link || res.invite_link || res.url || '';
      if (!link) throw new Error('Server did not return a link');
      setInviteLink(link);
      localStorage.setItem(`qreek_invite_${company?.id || 'default'}`, link);
      toast.success('Invite link generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create invitation.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
    if (amt > 10_000_000) { toast.error('Max ₦10,000,000 per deposit.'); return; }
    setDepositing(true);
    try {
      const res = await depositToWallet({ amount: amt });
      if (res.checkout_url) {
        window.open(res.checkout_url, '_blank');
        toast.success('Deposit checkout opened.');
      }
      setShowDeposit(false);
      setDepositAmt('');
      setTimeout(async () => {
        try {
          const w = await getWalletBalance();
          setWalletBal(w.wallet_balance_ngn || 0);
        } catch {}
      }, 5000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed.');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) return (
    <AppShell title="Enterprise">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
    </AppShell>
  );

  if (!company) return (
    <AppShell title="Enterprise">
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Set up your enterprise payment pool</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Organize salaries, vendor settlements, and recurring team payouts from one Qreek pool. Add employees, stage funds, and run structured disbursements to any Nigerian bank.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> Salaries and vendor payouts from one pool
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> 0.2% payout fee with cleaner visibility
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> Bulk import up to 500 employees
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> PIN-secured payout execution
          </div>
        </div>
        <Button style={{ marginTop: '2rem', padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/enterprise/setup')}>
          Get started — it&apos;s free <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );

  const fmtNgn = v => v >= 1_000_000
    ? `₦${(v / 1_000_000).toFixed(2)}M`
    : `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

  return (
    <AppShell title="Enterprise">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{company.name}</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{company.industry || 'Enterprise account'} {company.rc_number ? `· RC ${company.rc_number}` : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowDeposit(true)}><Wallet size={16} /> Fund wallet</Button>
            <Button variant="secondary" onClick={() => navigate('/enterprise/employees')}><Users size={16} /> Employees</Button>
            <Button onClick={() => navigate('/enterprise/payroll/run')}><Lightning size={16} /> Run payroll</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={Wallet}   label="Wallet balance" value={fmtNgn(walletBal)}                color="var(--teal)" sub="company wallet" />
          <StatCard icon={Money}    label="Total paid"     value={fmtNgn(analytics?.total_paid_ngn)} color="var(--teal)" />
          <StatCard icon={Users}    label="Employees"      value={company.employee_count || 0}       color="var(--blue)" sub="active on payroll" />
          <StatCard icon={ChartBar} label="Payroll runs"   value={analytics?.runs_history?.length || 0} color="var(--amber)" />
            <StatCard icon={Buildings}label="Status"         value={company.is_verified ? 'Verified' : 'Active'} color="var(--green)" sub="0.2% payroll fee" />
        </div>

        <Modal open={showDeposit} onClose={() => setShowDeposit(false)} title="Fund company wallet" maxWidth={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
              Deposit NGN into your company wallet to cover payroll runs. Funds are processed via Flutterwave secure checkout.
            </p>
            <Input
              label="Amount (₦)"
              type="number"
              value={depositAmt}
              onChange={e => setDepositAmt(e.target.value)}
              placeholder="e.g. 500000"
              min={1}
              max={10_000_000}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowDeposit(false)}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={depositing || !depositAmt}>
                {depositing ? 'Opening checkout…' : `Deposit ${depositAmt ? `₦${parseFloat(depositAmt).toLocaleString()}` : ''}`}
              </Button>
            </div>
          </div>
        </Modal>

      <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(0,212,170,0.04) 100%)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShareNetwork size={20} color="var(--teal)" />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{company.name} – Employee invite</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Share this link so your team can submit their payroll details</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {inviteLink ? (
            <>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'none', sm: 'inline' }}>{inviteLink}</span>
              <CopyButton text={inviteLink} />
              <Button variant="secondary" onClick={handleGenerateInvite} disabled={creatingInvite} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                {creatingInvite ? '…' : 'Regenerate'}
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerateInvite} disabled={creatingInvite} style={{ fontSize: '0.85rem' }}>
              {creatingInvite ? 'Generating…' : <><UserPlus size={16} /> Generate invite link</>}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Recent payroll runs</h3>
            <Link to="/enterprise/payroll" style={{ fontSize: '0.8rem', color: 'var(--teal)' }}>View all</Link>
          </div>
          {analytics?.runs_history?.length ? (
            analytics.runs_history.slice(-5).reverse().map((r, i) => <RunBar key={i} run={r} />)
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
              No payroll runs yet.<br />
              <Link to="/enterprise/payroll/run" style={{ color: 'var(--teal)' }}>Run your first payroll</Link>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Department breakdown</h3>
          {analytics?.department_breakdown?.length ? (
            analytics.department_breakdown.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-2)' }}>{d.department}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtNgn(d.total_salary)} <span style={{ color: 'var(--text-3)' }}>· {d.count}</span></span>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-3)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
              Add employees with departments to see breakdown.
            </div>
          )}
        </div>
      </div>

      {enterpriseLinks.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Payment links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {enterpriseLinks.slice(0, 5).map(link => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{link.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <LinkIcon size={12} /> {link.url}
                  </div>
                </div>
                <CopyButton text={link.url} />
              </div>
            ))}
          </div>
          <Link to="/payment-links" style={{ fontSize: '0.82rem', color: 'var(--teal)', display: 'inline-block', marginTop: '0.75rem' }}>View all payment links →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link to="/enterprise/employees" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={20} color="var(--teal)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Manage employees</span>
            </div>
            <ArrowRight size={16} color="var(--text-3)" />
          </div>
        </Link>
        <Link to="/payment-links" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Plus size={20} color="var(--amber)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Payment links</span>
            </div>
            <ArrowRight size={16} color="var(--text-3)" />
          </div>
        </Link>
        <Link to="/enterprise/setup" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--trans-fast)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Buildings size={20} color="var(--amber)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Create new company</span>
            </div>
            <ArrowRight size={16} color="var(--text-3)" />
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
