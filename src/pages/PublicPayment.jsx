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

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PaperPlaneTilt, CheckCircle, Warning, User, Phone, Bank, ArrowRight, ListBullets, Clock, CreditCard } from 'phosphor-react';
import { confirmFlutterwaveLinkPayment, getLinkPaymentStatus, resolveLink, payLink, getPublicLinkContributions, chargeSavedCard, validateCardOtp, requestCardCheckoutOtp, verifyCardCheckoutOtp, getGuestSavedCards } from '../api/paymentLinks.js';
import { getSavedCards } from '../api/cards.js';
import { getUserFriendlyError } from '../lib/utils.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatPhoneNumber } from '../lib/utils.js';
import { getCheckoutUrl, getTransactionReference, PAYMENT_PROVIDER, QREEK_FEES, calculateFee, feePercent } from '../lib/payments.js';
import useAuthStore from '../store/authStore.js';
import { toast } from 'react-hot-toast';

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
  const [paying, setPaying] = useState(!!(searchParams.get('transaction_id') || searchParams.get('tx_ref')));
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [checkingSettlement, setCheckingSettlement] = useState(false);
  const [poolContributions, setPoolContributions] = useState([]);
  const [poolTotal, setPoolTotal] = useState(0);
  const [poolContributionsTotal, setPoolContributionsTotal] = useState(0);
  const [poolLedgerTotalPages, setPoolLedgerTotalPages] = useState(1);
  const [poolLedgerPage, setPoolLedgerPage] = useState(1);
  const [poolLedgerLoading, setPoolLedgerLoading] = useState(false);
  const [poolLedgerError, setPoolLedgerError] = useState('');
  const [activeTab, setActiveTab] = useState('pay');
  const [paymentError, setPaymentError] = useState('');
  const [now, setNow] = useState(Date.now());
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [saveCardOptIn, setSaveCardOptIn] = useState(false);
  const [chargingCard, setChargingCard] = useState(false);
  const [otpPrompt, setOtpPrompt] = useState(null); // { tx_ref, flw_ref } — the card issuer's charge OTP
  const [otpValue, setOtpValue] = useState('');
  const [validatingOtp, setValidatingOtp] = useState(false);

  // Guest saved-card access: a payer who isn't logged in proves they own a
  // phone number that has saved cards, without a full Qreek login.
  const [guestCardStage, setGuestCardStage] = useState('idle'); // idle | otp_sent | verified
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [requestingCardOtp, setRequestingCardOtp] = useState(false);
  const [verifyingCardOtp, setVerifyingCardOtp] = useState(false);
  const [cardOtpValue, setCardOtpValue] = useState('');

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

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

  // Saved cards only exist for payers who are actually logged into Qreek — an
  // anonymous payer typing a name/phone into this public form never gets one.
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedCards([]);
      return;
    }
    getSavedCards()
      .then(data => {
        const cards = data.cards || [];
        setSavedCards(cards);
        const preferred = cards.find(c => c.is_default) || cards[0];
        if (preferred) setSelectedCardId(preferred.id);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!(link?.pool_id || link?.family_id) || activeTab !== 'ledger') return;

    let cancelled = false;
    setPoolLedgerLoading(true);
    setPoolLedgerError('');
    getPublicLinkContributions(code, poolLedgerPage, 10)
      .then(data => {
        if (cancelled) return;
        setPoolContributions(data.payments || []);
        setPoolContributionsTotal(data.total || 0);
        setPoolLedgerTotalPages(data.total_pages || 1);
        setPoolTotal(data.total_collected || link.total_collected || 0);
      })
      .catch(err => {
        if (cancelled) return;
        setPoolLedgerError(getUserFriendlyError(err, 'Could not load the pool ledger right now.'));
      })
      .finally(() => {
        if (!cancelled) setPoolLedgerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, code, link?.pool_id, link?.total_collected, poolLedgerPage]);

  useEffect(() => {
    if (!redirectedTransactionId && !redirectedReference) return;

    setPaying(true);
    const wantedToSaveCard = sessionStorage.getItem(`qreek:savecard:${code}`) === '1';
    confirmFlutterwaveLinkPayment(code, {
      transaction_id: redirectedTransactionId,
      tx_ref: redirectedReference,
      status: redirectedStatus,
      save_card: wantedToSaveCard,
    })
      .then(data => {
        sessionStorage.removeItem(`qreek:savecard:${code}`);
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

  // Recovery path: Flutterwave's hosted checkout page can lose its state and never
  // complete its redirect back to us — e.g. a mobile browser backgrounded to finish a
  // bank transfer, then resumed to a blank page. If we stashed a pending reference
  // before navigating away, use it to recover on return instead of just showing the pay
  // form again. The status endpoint reconciles directly with Flutterwave if still pending.
  useEffect(() => {
    if (redirectedTransactionId || redirectedReference) return;
    const pendingRef = sessionStorage.getItem(`qreek:flw:${code}`);
    if (!pendingRef) return;

    setPaying(true);
    getLinkPaymentStatus(code, pendingRef)
      .then(data => {
        const payment = data.payment || data.transaction || data;
        setReceipt(payment);
        setSuccess(true);
        if (['completed', 'split_settlement'].includes(payment?.payout_status)) {
          toast.success('Payment and recipient settlement completed!');
          sessionStorage.removeItem(`qreek:flw:${code}`);
        } else {
          toast('Resuming your previous payment. Checking status...');
        }
      })
      .catch(() => {
        // Stale or unrecoverable reference — drop it and let the payer pay normally.
        sessionStorage.removeItem(`qreek:flw:${code}`);
      })
      .finally(() => {
        setPaying(false);
        setLoading(false);
      });
  }, [code, redirectedReference, redirectedTransactionId]);

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
  // Computed for group links (pools and family): even when expired, resolve succeeds
  // (see _get_live_link for_payment=false) so we can always show the data/ledger.
  // Only block the actual pay action.
  const isGroupLink = link ? !!(link.pool_id || link.family_id) : false;
  const isExpired = link ? !!(link.expires_at && new Date(link.expires_at) < new Date()) : false;

  const handlePay = async (e) => {
    e.preventDefault();
    setPaymentError('');
    if (!form.name.trim()) return toast.error('Please enter your name.');
    if (!form.phone || form.phone.length < 10) return toast.error('Please enter a valid phone number.');
    const amount = link.is_flexible ? +form.amount : link.amount;
    if (!amount || amount < 100) return toast.error('Minimum payment is ₦100.');
    if (!form.note.trim()) return toast.error('Please enter a payment description.');

    if (isGroupLink && isExpired) {
      return toast.error('This pool link has expired and no longer accepts payments. All records remain visible.');
    }

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
        payer_name: form.name.trim(),
        phone: formatPhoneNumber(form.phone),
        payer_phone: formatPhoneNumber(form.phone),
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
        sessionStorage.setItem(`qreek:savecard:${code}`, isAuthenticated && saveCardOptIn ? '1' : '0');
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
      const status = err?.response?.status;
      const failureMessage =
        status === 502 && isGroupLink
          ? 'This pool link cannot accept payments right now because the recipient bank setup failed earlier. The pool owner needs to edit the bank details to refresh the subaccount.'
          : status === 502
            ? 'The payment service could not prepare this checkout right now. Please try again shortly.'
            : getUserFriendlyError(err, 'Payment failed.');

      setPaymentError(failureMessage);
      toast.error(failureMessage);
      setPaying(false);
    }
  };

  /**
   * handlePayWithSavedCard - One-tap payment using a token saved on a previous
   * checkout. No redirect to Flutterwave's hosted page. May come back asking
   * for a one-time code (Nigerian cards typically require this step-up even on
   * a saved card), in which case otpPrompt takes over the screen.
   */
  const handlePayWithSavedCard = async () => {
    if (!selectedCardId) return;
    const amount = link.is_flexible ? +form.amount : link.amount;
    if (link.is_flexible && (!amount || amount < 100)) return toast.error('Minimum payment is ₦100.');
    const description = form.note.trim() || link.description || link.title;

    setPaymentError('');
    setChargingCard(true);
    try {
      const response = await chargeSavedCard(code, {
        card_id: selectedCardId,
        amount: link.is_flexible ? amount : undefined,
        payment_description: description,
        checkout_token: checkoutToken || undefined,
      });
      if (response.requires_otp) {
        setOtpPrompt({ tx_ref: response.tx_ref, flw_ref: response.flw_ref });
        return;
      }
      const payment = response.payment || response.transaction || response;
      setReceipt(payment);
      setSuccess(true);
      toast.success('Payment received. Confirming recipient settlement...');
    } catch (err) {
      const message = getUserFriendlyError(err, 'Card charge failed.');
      setPaymentError(message);
      toast.error(message);
    } finally {
      setChargingCard(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    if (!otpValue.trim()) return toast.error('Enter the code Flutterwave sent you.');
    setValidatingOtp(true);
    try {
      const response = await validateCardOtp(code, {
        tx_ref: otpPrompt.tx_ref,
        flw_ref: otpPrompt.flw_ref,
        otp: otpValue.trim(),
        checkout_token: checkoutToken || undefined,
      });
      const payment = response.payment || response.transaction || response;
      setReceipt(payment);
      setSuccess(true);
      setOtpPrompt(null);
      toast.success('Payment received. Confirming recipient settlement...');
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'That code did not work. Please try again.'));
    } finally {
      setValidatingOtp(false);
    }
  };

  /**
   * handleRequestCardOtp / handleVerifyCardOtp - Guest saved-card access.
   * A payer who isn't logged into Qreek proves they own the phone number
   * already typed into the form above, without going through a full login.
   */
  const handleRequestCardOtp = async () => {
    if (!form.phone || form.phone.length < 10) return toast.error('Enter your phone number first.');
    setRequestingCardOtp(true);
    try {
      await requestCardCheckoutOtp(code, formatPhoneNumber(form.phone));
      setGuestCardStage('otp_sent');
      toast.success('If that number has a saved card, a code has been sent.');
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'Could not send a code right now.'));
    } finally {
      setRequestingCardOtp(false);
    }
  };

  const handleVerifyCardOtp = async (e) => {
    e.preventDefault();
    if (!cardOtpValue.trim()) return toast.error('Enter the code we sent you.');
    setVerifyingCardOtp(true);
    try {
      const { checkout_token } = await verifyCardCheckoutOtp(code, formatPhoneNumber(form.phone), cardOtpValue.trim());
      const { cards } = await getGuestSavedCards(code, checkout_token);
      if (!cards || cards.length === 0) {
        toast.error('No saved card found for that number.');
        setGuestCardStage('idle');
        return;
      }
      setCheckoutToken(checkout_token);
      setSavedCards(cards);
      setSelectedCardId((cards.find(c => c.is_default) || cards[0]).id);
      setGuestCardStage('verified');
    } catch (err) {
      toast.error(getUserFriendlyError(err, 'That code did not work.'));
    } finally {
      setVerifyingCardOtp(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={40} /></div>;

  if (error) return (
    <div data-reveal style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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

  if (paying) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
        {redirectedTransactionId || redirectedReference
          ? 'Confirming your payment…'
          : sessionStorage.getItem(`qreek:flw:${code}`)
            ? 'Checking your payment status…'
            : 'Opening payment checkout…'}
      </p>
    </div>
  );

  if (otpPrompt) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--teal-faint)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CreditCard size={30} />
        </div>
        <h1 style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>Enter your one-time code</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.75rem' }}>
          Your card issuer sent a code to confirm this charge. Enter it below to finish paying.
        </p>
        <form onSubmit={handleValidateOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="One-time code"
            value={otpValue}
            onChange={e => setOtpValue(e.target.value)}
            placeholder="e.g. 123456"
            autoFocus
          />
          <Button type="submit" disabled={validatingOtp} style={{ width: '100%', justifyContent: 'center', height: 48 }}>
            {validatingOtp ? 'Verifying…' : 'Confirm payment'}
          </Button>
          <button
            type="button"
            onClick={() => { setOtpPrompt(null); setOtpValue(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}
          >
            Cancel and try a different card
          </button>
        </form>
      </div>
    </div>
  );

  const renderPoolLedger = () => (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          <ListBullets size={16} style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} />
          {link.family_id ? 'Family contributions' : 'Pool contributions'}
        </div>
        <div style={{ color: 'var(--teal)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          {FMT(poolTotal)} total · {poolContributionsTotal} payment{poolContributionsTotal === 1 ? '' : 's'}
        </div>
      </div>

      {poolLedgerLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
          Loading payments...
        </div>
      ) : poolLedgerError ? (
        <div style={{ color: 'var(--red)', fontSize: '0.8rem', padding: '1rem' }}>{poolLedgerError}</div>
      ) : poolContributions.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
          No payments yet. The first contribution will appear here.
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Payer</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Amount</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {poolContributions.map((c, i) => (
                <tr key={c.reference || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem', fontSize: '0.78rem' }}>{c.payer_name || c.payer_phone || '-'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--teal)' }}>{FMT(c.amount)}</td>
                  <td style={{ padding: '0.5rem', fontSize: '0.78rem' }}>{c.status === 'split_settlement' || c.status === 'completed' ? 'Completed' : c.status || '-'}</td>
                  <td style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('en-NG') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem' }}>
            <div style={{ color: 'var(--text-3)' }}>
              Page {poolLedgerPage} of {poolLedgerTotalPages} · {poolContributionsTotal} total
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPoolLedgerPage(p => Math.max(1, p - 1))}
                disabled={poolLedgerPage === 1}
                style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)', cursor: poolLedgerPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.78rem' }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPoolLedgerPage(p => p + 1)}
                disabled={poolLedgerPage >= poolLedgerTotalPages}
                style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)', cursor: poolLedgerPage >= poolLedgerTotalPages ? 'not-allowed' : 'pointer', fontSize: '0.78rem' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 480, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-2)', marginBottom: '1rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{link.title}</h1>
          {link.description && <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{link.description}</p>}
          {link.expires_at && (
            <div style={{ fontSize: '0.78rem', color: isExpired ? 'var(--red)' : 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
              <Clock size={14} /> {isExpired ? 'Expired' : timeRemaining(link.expires_at)}
            </div>
          )}
        </div>

        {(link.pool_id || link.family_id) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('pay')}
              style={{
                padding: '0.65rem 0.8rem',
                borderRadius: 'var(--radius)',
                border: `1px solid ${activeTab === 'pay' ? 'var(--teal)' : 'var(--border)'}`,
                background: activeTab === 'pay' ? 'var(--teal-faint)' : 'var(--surface-2)',
                color: activeTab === 'pay' ? 'var(--teal)' : 'var(--text-2)',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              Make payment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              style={{
                padding: '0.65rem 0.8rem',
                borderRadius: 'var(--radius)',
                border: `1px solid ${activeTab === 'ledger' ? 'var(--teal)' : 'var(--border)'}`,
                background: activeTab === 'ledger' ? 'var(--teal-faint)' : 'var(--surface-2)',
                color: activeTab === 'ledger' ? 'var(--teal)' : 'var(--text-2)',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              View payments
            </button>
          </div>
        )}

        {(link.pool_id || link.family_id) && activeTab === 'ledger' && renderPoolLedger()}

        {(!(link.pool_id || link.family_id) || activeTab === 'pay') && (
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {paymentError && (
              <div style={{ background: 'var(--red-faint)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.55 }}>
                {paymentError}
              </div>
            )}

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
                  {link.pool_id ? 'Pool' : link.family_id ? 'Family' : 'Link'} fee (0.15% / 0.25%): {FMT(calculateFee(link.is_flexible ? +form.amount : link.amount, link.pool_id || link.family_id ? 0.0015 : QREEK_FEES.paymentLink))}
                </div>
              )}
            </div>

            {(isAuthenticated || guestCardStage === 'verified') && savedCards.length > 0 && !(isGroupLink && isExpired) && activeTab === 'pay' && (
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)' }}>
                  <CreditCard size={16} /> Pay with a saved card
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {savedCards.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-2)', cursor: 'pointer' }}>
                      <input type="radio" name="savedCard" checked={selectedCardId === c.id} onChange={() => setSelectedCardId(c.id)} />
                      {(c.brand || 'Card').toUpperCase()} •••• {c.last4}{c.exp_month && c.exp_year ? ` — exp ${c.exp_month}/${c.exp_year}` : ''}
                    </label>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={handlePayWithSavedCard}
                  disabled={chargingCard || !selectedCardId || (link.is_flexible && !(+form.amount > 0))}
                  style={{ width: '100%', justifyContent: 'center', height: 48 }}
                >
                  {chargingCard ? 'Charging card…' : `Pay ${FMT(link.is_flexible ? +form.amount || 0 : link.amount)} with this card`}
                </Button>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-3)' }}>or pay with a new card below</div>
              </div>
            )}

            {isGroupLink && isExpired && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--amber)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '0.5rem' }}>
                This {link.family_id ? 'family' : 'pool'} link expired on {link.expires_at ? new Date(link.expires_at).toLocaleDateString('en-NG') : 'the set date'}. It is unable to accept any new payments.
                However, every record, contribution history, payer details, amounts, dates, totals, and other data concerning it remains permanently visible here and in the dashboard.
              </div>
            )}

            {!(isGroupLink && isExpired) && activeTab === 'pay' && (
            <>
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

                {!isAuthenticated && guestCardStage === 'idle' && (
                  <button
                    type="button"
                    onClick={handleRequestCardOtp}
                    disabled={requestingCardOtp}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--teal)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
                  >
                    <CreditCard size={15} /> {requestingCardOtp ? 'Sending code…' : 'Have a saved card? Verify your phone to use it'}
                  </button>
                )}

                {!isAuthenticated && guestCardStage === 'otp_sent' && (
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                      We texted a code to {form.phone} to confirm you own this number before showing your saved card.
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Input
                        value={cardOtpValue}
                        onChange={e => setCardOtpValue(e.target.value)}
                        placeholder="6-digit code"
                        style={{ flex: 1 }}
                      />
                      <Button type="button" onClick={handleVerifyCardOtp} disabled={verifyingCardOtp} style={{ height: 44 }}>
                        {verifyingCardOtp ? 'Verifying…' : 'Verify'}
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setGuestCardStage('idle'); setCardOtpValue(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <Input 
                  label="Payment description *" 
                  multiline
                  rows={2}
                  value={form.note} 
                  onChange={e => setForm({...form, note: e.target.value})} 
                  placeholder="What is this payment for?"
                />
              </div>

              {isAuthenticated && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={saveCardOptIn} onChange={e => setSaveCardOptIn(e.target.checked)} />
                  Save this card for faster checkout next time
                </label>
              )}

              <div style={{ marginTop: '0.5rem' }}>
                <Button type="submit" disabled={paying} style={{ width: '100%', justifyContent: 'center', height: 52, fontSize: '1.05rem' }}>
                  {paying ? 'Opening checkout…' : savedCards.length > 0 ? `Continue with a new card →` : `Continue to ${PAYMENT_PROVIDER.name} →`}
                </Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Secure payment powered by</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--teal)' }}>{PAYMENT_PROVIDER.name}</span>
              </div>
            </>
          )}
          </form>
        )}
      </div>
    </div>
  );
}
