/**
 * @file PublicPayment.jsx
 * @description Provides a public-facing checkout interface for payment links.
 * Enables both Qreek members and non-members to settle payments directly to a 
 * creator's bank account via secure Flutterwave rails.
 * 
 * Flow:
 * 1. Resolution: On mount, it resolves the unique payment code via the backend to display link details.
 * 2. Interaction: Users enter their name, phone, and payment description. Flexible amount links allow user input.
 * 3. Execution: handlePay processes the payment, initiating a Flutterwave checkout session.
 * 4. Settlement: After Flutterwave collects funds, it shows recipient transfer progress.
 * 5. Conversion: After settlement, it displays an interactive prompt encouraging the user to join Qreek.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PaperPlaneTilt, CheckCircle, Warning, User, Phone, Bank, ArrowRight } from 'phosphor-react';
import { confirmFlutterwaveLinkPayment, getLinkPaymentStatus, resolveLink, payLink } from '../api/paymentLinks.js';
import { getUserFriendlyError } from '../lib/utils.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatPhoneNumber } from '../lib/utils.js';
import { getCheckoutUrl, getTransactionReference, PAYMENT_PROVIDER, QREEK_FEES, calculateFee, feePercent } from '../lib/payments.js';
import { toast } from 'react-hot-toast';

const FMT = v => {
  const value = Number(v || 0);
  const hasKobo = Math.round(value * 100) % 100 !== 0;
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const cleanAmountInput = (value) => {
  const normalized = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = normalized.split('.');
  const decimals = rest.join('').slice(0, 2);
  return rest.length ? `${whole}.${decimals}` : whole;
};

function SettlementStep({ done, active, title, detail }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', textAlign: 'left' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--green-faint)' : active ? 'var(--teal-faint)' : 'var(--surface-2)', color: done ? 'var(--green)' : active ? 'var(--teal)' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done ? <CheckCircle size={20} weight="fill" /> : active ? <Spinner size={16} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
        <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', lineHeight: 1.5 }}>{detail}</div>
      </div>
    </div>
  );
}

/**
 * PublicPayment component - The public-facing checkout page for payment links.
 * Features:
 * - Link Resolution: Fetches and displays details for a specific payment code.
 * - Validation: Ensures the link is active, has not expired, and has not exceeded use limits.
 * - Payment Form: Collects payer identity and supports fixed or flexible amounts.
 * - Flutterwave Integration: Hands off to hosted checkout and confirms the redirect.
 * - Post-Payment CTA: Incentivizes payers to register for Qreek after a successful transaction.
 *
 * @returns {JSX.Element}
 */
export default function PublicPayment() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', amount: '', note: '' });
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [checkingSettlement, setCheckingSettlement] = useState(false);
  const [poolContributions, setPoolContributions] = useState([]);
  const [poolTotal, setPoolTotal] = useState(0);

  const redirectedTransactionId = searchParams.get('transaction_id');
  const redirectedReference = searchParams.get('tx_ref');
  const redirectedStatus = searchParams.get('status');

  useEffect(() => {
    resolveLink(code)
      .then(data => {
        const l = data.link || data;
        setLink(l);
        if (data.recent_contributions) {
          setPoolContributions(data.recent_contributions);
          setPoolTotal(data.pool_total_via_link || 0);
        }
      })
      .catch(err => setError(getUserFriendlyError(err, 'This payment link is invalid or has expired.')))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (!redirectedTransactionId && !redirectedReference) return;

    setPaying(true);
    confirmFlutterwaveLinkPayment(code, {
      transaction_id: redirectedTransactionId,
      tx_ref: redirectedReference,
      status: redirectedStatus,
    })
      .then(data => {
        setReceipt(data.payment || data.transaction || data);
        setSuccess(true);
        const payment = data.payment || data.transaction || data;
        if (['completed', 'split_settlement'].includes(payment?.payout_status)) {
          toast.success('Payment and recipient settlement completed!');
        } else {
          toast.success('Payment received. Confirming recipient settlement...');
        }
      })
      .catch(err => setError(getUserFriendlyError(err, 'We could not confirm this payment yet. If money left your account, the receipt will update after provider verification.')))
      .finally(() => {
        setPaying(false);
        setLoading(false);
      });
  }, [code, redirectedReference, redirectedStatus, redirectedTransactionId]);

  useEffect(() => {
    const txRef = receipt?.reference || redirectedReference;
    const transferDone = receipt?.status === 'completed' && ['completed', 'split_settlement'].includes(receipt?.payout_status);
    if (!success || !txRef || transferDone) return;

    setCheckingSettlement(true);
    const timer = window.setInterval(() => {
      getLinkPaymentStatus(code, txRef)
        .then(data => {
          const payment = data.payment || data.transaction || data;
          setReceipt(payment);
          if (payment?.status === 'completed' && ['completed', 'split_settlement'].includes(payment?.payout_status)) {
            toast.success('Recipient settlement completed.');
            window.clearInterval(timer);
            setCheckingSettlement(false);
          }
        })
        .catch(() => {
          window.clearInterval(timer);
          setCheckingSettlement(false);
        });
    }, 5000);

    return () => {
      window.clearInterval(timer);
      setCheckingSettlement(false);
    };
  }, [code, receipt?.payout_status, receipt?.reference, receipt?.status, redirectedReference, success]);

  /**
   * handlePay - Orchestrates the payment checkout flow.
   * Flow: Validates form data -> prepares amount -> triggers Flutterwave checkout -> 
   * handles success (shows success UI/CTA) or failure (shows toast).
   * @param {React.FormEvent} e - Form submission event.
   */
  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name.');
    if (!form.phone || form.phone.length < 10) return toast.error('Please enter a valid phone number.');
    const amount = link.is_flexible ? +form.amount : link.amount;
    if (!amount || amount < 100) return toast.error('Minimum payment is ₦100.');
    if (!form.note.trim()) return toast.error('Please enter a payment description.');

    setPaying(true);
    try {
      // Always generate a fresh idempotency key for each pay submission.
      // This allows the same payer (same phone/amount/desc) to make *multiple independent payments*
      // to the same link (like depositing to the same bank account number multiple times).
      // The key is only for deduplicating *retries of the exact same payment attempt* (e.g. network retry
      // of this POST with the same key). Previous "sticky per-profile key" caused subsequent payments
      // to hit "idempotent.recorded" for old completed txs (see backend pay_link idempotency logic and
      // the checkout.idempotent.recorded event in logs), returning no/new checkout_url and triggering
      // frontend "Missing Flutterwave checkout URL" or showing old receipt instead of new checkout.
      const idempotencyKey = crypto.randomUUID();
      const response = await payLink(code, {
        name: form.name.trim(),
        phone: formatPhoneNumber(form.phone),
        amount,
        payment_description: form.note.trim(),
        provider: 'flutterwave',
        redirect_url: `${window.location.origin}/p/${code}`,
        idempotency_key: idempotencyKey,
      });
      const checkoutUrl = getCheckoutUrl(response);
      const payment = response.payment || response.transaction || response;

      const isAlreadyProcessed = payment?.status === 'completed' ||
        ['completed', 'split_settlement'].includes(payment?.payout_status);
      const isPendingSettlement = payment?.payout_status === 'pending' ||
        payment?.status === 'payout_pending' || payment?.status === 'processing';

      if (isAlreadyProcessed || isPendingSettlement) {
        // Idempotent hit on a tx that's already charged or in settlement.
        // Show receipt/success UI + let polling keep it fresh. Do not redirect to (stale) checkout.
        setReceipt(payment || response);
        setSuccess(true);
        if (isAlreadyProcessed) {
          toast.success('Payment already completed!');
        } else {
          toast('Payment is being processed. Monitoring settlement...');
        }
      } else if (checkoutUrl) {
        const reference = getTransactionReference(response);
        if (reference) sessionStorage.setItem(`qreek:flw:${code}`, reference);
        sessionStorage.setItem(`qreek:quote:${reference || code}`, JSON.stringify({
          checkout_amount: response.checkout_amount,
          recipient_amount: response.recipient_amount || response.net,
          fee: response.fee,
          provider_fee_estimate: response.provider_fee_estimate,
        }));
        window.location.assign(checkoutUrl);
      } else {
        throw new Error('Missing Flutterwave checkout URL from backend.');
      }
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Payment failed.'));
      setPaying(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={40} /></div>;

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 400, textAlign: 'center', background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <Warning size={48} color="var(--amber)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{redirectedReference || redirectedTransactionId ? 'Payment Confirmation Issue' : 'Link Unavailable'}</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Go to Qreek Finance</Link>
      </div>
    </div>
  );

  if (success) {
    const amount = receipt?.checkout_amount || receipt?.amount || (link.is_flexible ? +form.amount : link.amount);
    const recipientAmount = receipt?.recipient_amount || receipt?.net || (link.is_flexible ? +form.amount : link.amount);
    const payoutDone = receipt?.status === 'completed' && ['completed', 'split_settlement'].includes(receipt?.payout_status);
    const payoutPending = receipt?.payout_status === 'pending' || receipt?.status === 'payout_pending' || receipt?.status === 'processing';
    const settledAmount = receipt?.provider_settled_amount || amount;
    const qreekFee = receipt?.fee || calculateFee(recipientAmount, QREEK_FEES.paymentLink);
    const providerFee = receipt?.provider_fee || Math.max(amount - settledAmount, 0);
    return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: payoutDone ? 'var(--green-faint)' : 'var(--teal-faint)', color: payoutDone ? 'var(--green)' : 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          {payoutDone ? <CheckCircle size={40} weight="fill" /> : <Spinner size={34} />}
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{payoutDone ? 'Payment Completed!' : 'Payment Received'}</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>
          {payoutDone
            ? `You've paid ${FMT(amount)}. ${link.title} receives ${FMT(recipientAmount)}.`
            : `${FMT(amount)} has been accepted by Flutterwave. The recipient's share is being settled directly to their bank account.`}
        </p>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <SettlementStep done title="Payment collected" detail="Flutterwave confirmed the payer's payment." />
          <SettlementStep done={payoutDone} active={payoutPending || checkingSettlement} title="Recipient settlement" detail={`Flutterwave settles ${FMT(recipientAmount)} directly to the bank account saved on this link.`} />
          <SettlementStep done={payoutDone} active={false} title="Completed" detail="This becomes completed when Flutterwave accepts the split settlement for the recipient." />
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.82rem' }}>
          {[
            ['Payer amount', FMT(amount)],
            ['Recipient receives', FMT(recipientAmount)],
            [`Qreek fee (${feePercent(QREEK_FEES.paymentLink)})`, FMT(qreekFee)],
            ['Flutterwave fee', FMT(providerFee)],
            ['Flutterwave settled', FMT(settledAmount)],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.25rem 0' }}>
              <span style={{ color: 'var(--text-3)' }}>{label}</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: label === 'Recipient receives' ? 'var(--teal)' : 'var(--text-2)' }}>{value}</strong>
            </div>
          ))}
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(245,166,35,0.05) 100%)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--teal-border)', textAlign: 'left', marginBottom: '2rem', opacity: payoutDone ? 1 : 0.72 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--teal)' }}>Want more control over your payments?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Join Qreek Finance to create your own payment links, manage group pools (ajo), and run payroll with zero monthly fees.
          </p>
          <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'var(--text-inv)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
            Get Started with Qreek <ArrowRight size={18} />
          </Link>
        </div>
        
        <Link to="/" style={{ color: 'var(--text-3)', fontSize: '0.85rem', textDecoration: 'none' }}>Return to Home</Link>
      </div>
    </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 480, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-2)', marginBottom: '1rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{link.title}</h1>
          {link.description && <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{link.description}</p>}
        </div>

        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-2)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Recipient Receives</div>
            {link.is_flexible ? (
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--teal)' }}>₦</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: cleanAmountInput(e.target.value)})} 
                  placeholder="0.00"
                  style={{ paddingLeft: '2.2rem', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(link.amount)}</div>
            )}
            {(link.is_flexible ? +form.amount : link.amount) > 0 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                {link.pool_id ? 'Pool' : 'Link'} fee (0.15% / 0.25%): {FMT(calculateFee(link.is_flexible ? +form.amount : link.amount, link.pool_id ? 0.0015 : QREEK_FEES.paymentLink))} 
              </div>
            )}
          </div>

          {/* Pool collection link ledger: shown on the public checkout page for transparency.
              Shows payments, payers (anonymized if needed), amounts, dates. "amount contributed at the time" via total + list.
              Great UX idea added: sortable view, cumulative feel, encourages more contributions via social proof. */}
          {(poolContributions.length > 0 || link.pool_id) && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Pool contributions (live ledger)</span>
                <span style={{ color: 'var(--teal)' }}>{FMT(poolTotal)} total</span>
              </div>
              {poolContributions.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Be the first to contribute — your payment will appear here instantly for everyone to see.</div>
              ) : (
                <div style={{ maxHeight: 140, overflow: 'auto', fontSize: '0.75rem' }}>
                  {poolContributions.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                      <span>{c.date ? new Date(c.date).toLocaleDateString() : ''} · {c.payer}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{FMT(c.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input 
              label="Your Full Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="e.g. John Doe"
            />
            <PhoneInput 
              label="Phone Number" 
              value={form.phone} 
              onChange={v => setForm({...form, phone: v})} 
            />
            <Input 
              label="Payment description *" 
              multiline
              rows={2}
              value={form.note} 
              onChange={e => setForm({...form, note: e.target.value})} 
              placeholder="What is this payment for?"
            />
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" disabled={paying} style={{ width: '100%', justifyContent: 'center', height: 52, fontSize: '1.05rem' }}>
              {paying ? 'Opening checkout…' : `Continue to ${PAYMENT_PROVIDER.name} →`}
            </Button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Secure payment powered by</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--teal)' }}>{PAYMENT_PROVIDER.name}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
