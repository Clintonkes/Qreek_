import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, SpinnerGap, Warning, XCircle } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import { confirmPayrollCheckout } from '../api/payroll.js';

const STATE = {
  processing: {
    icon: (c) => <SpinnerGap size={36} color={c} />,
    color: 'var(--teal)',
    bg:    'var(--teal-faint)',
    title: 'Confirming payment…',
  },
  success: {
    icon: (c) => <CheckCircle size={36} color={c} weight="fill" />,
    color: 'var(--green)',
    bg:    'var(--green-faint)',
    title: 'Payroll payment received',
  },
  cancelled: {
    icon: (c) => <XCircle size={36} color={c} weight="fill" />,
    color: 'var(--amber)',
    bg:    'var(--amber-faint)',
    title: 'Payment cancelled',
  },
  missing: {
    icon: (c) => <Warning size={36} color={c} weight="fill" />,
    color: 'var(--amber)',
    bg:    'var(--amber-faint)',
    title: 'Payment details missing',
  },
  error: {
    icon: (c) => <Warning size={36} color={c} weight="fill" />,
    color: 'var(--red)',
    bg:    'var(--red-faint)',
    title: 'Payroll checkout needs attention',
  },
};

export default function PayrollCheckoutReturn() {
  const { runId }       = useParams();
  const [params]        = useSearchParams();
  const navigate        = useNavigate();
  const [message, setMessage] = useState('Confirming the Flutterwave payment…');
  const [status,  setStatus]  = useState('processing');

  const txRef         = params.get('tx_ref')        || '';
  const transactionId = params.get('transaction_id') || '';
  const flwStatus     = (params.get('status')        || '').toLowerCase();

  useEffect(() => {
    let alive = true;

    async function finalize() {
      // 1. User explicitly cancelled on the Flutterwave page.
      if (flwStatus === 'cancelled') {
        setStatus('cancelled');
        setMessage('You cancelled the payment. No money was charged. Go back to the payroll run to try again.');
        return;
      }

      // 2. Flutterwave redirected without the IDs we need to verify.
      if (!txRef || !transactionId) {
        setStatus('missing');
        setMessage('Flutterwave did not return payment details. If your bank was charged, the webhook will confirm it automatically. Otherwise reopen the payroll run and try again.');
        return;
      }

      // 3. Happy path — confirm with the backend.
      try {
        const res = await confirmPayrollCheckout(runId, {
          tx_ref:         txRef,
          transaction_id: transactionId,
          status:         flwStatus || 'successful',
        });
        if (!alive) return;
        setStatus('success');
        setMessage('Payment confirmed. Salary transfers are now in progress.');
        window.setTimeout(() => {
          navigate(`/enterprise/payroll/${runId}`, { replace: true });
        }, 900);
      } catch (err) {
        if (!alive) return;
        const detail = err.response?.data?.detail || 'We could not confirm this payment yet.';
        setStatus('error');
        setMessage(detail);
        toast.error(detail);
        window.setTimeout(() => {
          navigate(`/enterprise/payroll/${runId}`, { replace: true });
        }, 1400);
      }
    }

    finalize();
    return () => { alive = false; };
  }, [flwStatus, navigate, runId, transactionId, txRef]);

  const s = STATE[status] || STATE.processing;

  return (
    <AppShell title="Payroll checkout">
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: s.bg,
          display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem',
        }}>
          {s.icon(s.color)}
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.title}</h1>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '1.5rem' }}>{message}</p>
        <Button
          variant="secondary"
          onClick={() => navigate(`/enterprise/payroll/${runId}`, { replace: true })}
        >
          View payroll run
        </Button>
      </div>
    </AppShell>
  );
}
