import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, SpinnerGap, Warning } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import { confirmPayrollCheckout } from '../api/payroll.js';

export default function PayrollCheckoutReturn() {
  const { runId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirming the Flutterwave payment...');
  const [status, setStatus] = useState('processing');
  const txRef = params.get('tx_ref') || '';
  const transactionId = params.get('transaction_id') || '';
  const flwStatus = params.get('status') || '';

  useEffect(() => {
    let cancelled = false;

    async function finalize() {
      if (!txRef || !transactionId) {
        setStatus('missing');
        setMessage('Missing Flutterwave payment details. Open the payroll run again from the dashboard.');
        return;
      }

      try {
        const res = await confirmPayrollCheckout(runId, {
          tx_ref: txRef,
          transaction_id: transactionId,
          status: flwStatus || 'successful',
        });
        if (cancelled) return;
        setStatus(res?.result?.status || 'processing');
        setMessage(
          res?.result?.status === 'processing'
            ? 'Payment received. Payroll execution has started.'
            : 'Payment confirmed and payroll execution updated.'
        );
        window.setTimeout(() => {
          navigate(`/enterprise/payroll/${runId}`, { replace: true });
        }, 900);
      } catch (err) {
        if (cancelled) return;
        const detail = err.response?.data?.detail || 'We could not finalize this payment yet.';
        setStatus('error');
        setMessage(detail);
        toast.error(detail);
        window.setTimeout(() => {
          navigate(`/enterprise/payroll/${runId}`, { replace: true });
        }, 1400);
      }
    }

    finalize();
    return () => {
      cancelled = true;
    };
  }, [flwStatus, navigate, runId, transactionId, txRef]);

  return (
    <AppShell title="Finalizing payroll">
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: status === 'error' ? 'var(--red-faint)' : 'var(--teal-faint)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
          {status === 'error' ? <Warning size={36} color="var(--red)" /> : status === 'processing' ? <SpinnerGap size={36} color="var(--teal)" /> : <CheckCircle size={36} color="var(--green)" weight="fill" />}
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {status === 'error' ? 'Payroll checkout needs attention' : 'Payroll payment received'}
        </h1>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '1.5rem' }}>{message}</p>
        <Button variant="secondary" onClick={() => navigate(`/enterprise/payroll/${runId}`, { replace: true })}>
          View payroll run
        </Button>
      </div>
    </AppShell>
  );
}
