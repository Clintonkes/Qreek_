/**
 * @file PublicPayment.jsx
 * @description Provides a public-facing checkout interface for payment links.
 * Enables both Qreek members and non-members to settle payments directly to a 
 * creator's bank account via secure Flutterwave rails.
 * 
 * Flow:
 * 1. Resolution: On mount, it resolves the unique payment code via the backend to display link details.
 * 2. Interaction: Users enter their name, phone, and optional note. Flexible amount links allow user input.
 * 3. Execution: handlePay processes the payment, initiating a Flutterwave checkout session.
 * 4. Conversion: After success, it displays an interactive prompt encouraging the user to join Qreek.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PaperPlaneTilt, CheckCircle, Warning, User, Phone, Bank, ArrowRight } from 'phosphor-react';
import { confirmFlutterwaveLinkPayment, resolveLink, payLink } from '../api/paymentLinks.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PhoneInput from '../components/ui/PhoneInput.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatPhoneNumber } from '../lib/utils.js';
import { getCheckoutUrl, getTransactionReference, PAYMENT_PROVIDER, QREEK_FEES, calculateFee, feePercent } from '../lib/payments.js';
import { toast } from 'react-hot-toast';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

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

  const redirectedTransactionId = searchParams.get('transaction_id');
  const redirectedReference = searchParams.get('tx_ref');
  const redirectedStatus = searchParams.get('status');

  useEffect(() => {
    resolveLink(code)
      .then(data => setLink(data.link || data))
      .catch(err => setError(err.response?.data?.detail || 'This payment link is invalid or has expired.'))
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
        toast.success('Payment confirmed!');
      })
      .catch(err => setError(err.response?.data?.detail || 'We could not confirm this payment yet. If money left your account, the receipt will update after provider verification.'))
      .finally(() => {
        setPaying(false);
        setLoading(false);
      });
  }, [code, redirectedReference, redirectedStatus, redirectedTransactionId]);

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

    setPaying(true);
    try {
      const response = await payLink(code, {
        name: form.name.trim(),
        phone: formatPhoneNumber(form.phone),
        amount,
        note: form.note || undefined,
        provider: 'flutterwave',
        redirect_url: `${window.location.origin}/p/${code}`,
      });
      const checkoutUrl = getCheckoutUrl(response);

      if (!checkoutUrl) {
        throw new Error('Missing Flutterwave checkout URL from backend.');
      }

      const reference = getTransactionReference(response);
      if (reference) sessionStorage.setItem(`qreek:flw:${code}`, reference);
      window.location.assign(checkoutUrl);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Payment failed.');
      setPaying(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={40} /></div>;

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 400, textAlign: 'center', background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <Warning size={48} color="var(--amber)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Link Unavailable</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Go to Qreek Finance</Link>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-faint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} weight="fill" />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>
          You've sent {FMT(receipt?.amount || (link.is_flexible ? +form.amount : link.amount))} to {link.title}. A receipt has been sent to your phone.
        </p>
        
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(245,166,35,0.05) 100%)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--teal-border)', textAlign: 'left', marginBottom: '2rem' }}>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Payment Amount</div>
            {link.is_flexible ? (
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--teal)' }}>₦</span>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  placeholder="0.00"
                  style={{ paddingLeft: '2.2rem', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{FMT(link.amount)}</div>
            )}
            {(link.is_flexible ? +form.amount : link.amount) > 0 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                Qreek fee {feePercent(QREEK_FEES.paymentLink)}: {FMT(calculateFee(link.is_flexible ? +form.amount : link.amount, QREEK_FEES.paymentLink))}
              </div>
            )}
          </div>

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
              label="Note (optional)" 
              value={form.note} 
              onChange={e => setForm({...form, note: e.target.value})} 
              placeholder="What is this payment for?"
            />
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" disabled={paying} style={{ width: '100%', justifyContent: 'center', height: 52, fontSize: '1.05rem' }}>
              {paying ? 'Opening checkout…' : `Pay ${link.is_flexible ? FMT(+form.amount || 0) : FMT(link.amount)} →`}
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
