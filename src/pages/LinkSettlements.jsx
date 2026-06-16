import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon } from 'phosphor-react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import { getLinks, getLinkSettlements } from '../api/paymentLinks.js';
import { getUserFriendlyError } from '../lib/utils.js';

const FMT = v => `₦${(v || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function DetailItem({ label, value, wide = false }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : undefined,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.7rem 0.8rem',
      minWidth: 0,
    }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '0.84rem', color: 'var(--text-1)', wordBreak: 'break-word' }}>{value || '-'}</div>
    </div>
  );
}

export default function LinkSettlements() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [settlements, setSettlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const link = useMemo(() => links.find(l => l.id === linkId) || null, [links, linkId]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getLinks(), getLinkSettlements(linkId, page)])
      .then(([ld, data]) => {
        if (!mounted) return;
        setLinks(ld.links || []);
        setSettlements(data);
      })
      .catch(err => {
        if (!mounted) return;
        toast.error(getUserFriendlyError(err, 'Failed to load settlements.'));
        setSettlements({ payments: [], total: 0, page, per_page: 10, total_pages: 0 });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
        setSettlementsLoading(false);
      });
    return () => { mounted = false; };
  }, [linkId, page]);

  const changePage = (newPage) => {
    setSelectedPayment(null);
    setSettlementsLoading(true);
    setPage(newPage);
  };

  const closeDetails = () => setSelectedPayment(null);
  const statusLabel = (payment) => {
    if (!payment) return '-';
    if (payment.status === 'completed' || payment.status === 'split_settlement') return 'Completed';
    if (payment.status === 'processing' || payment.status === 'payout_pending') return 'Processing';
    if (payment.status === 'failed') return 'Failed';
    return payment.status || '-';
  };

  return (
    <AppShell title={link?.title ? `Settlements - ${link.title}` : 'Settlements'}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <button onClick={() => navigate('/payment-links')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.4rem', marginBottom: '0.15rem' }}>{link?.title || 'Settlements'}</h1>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                {link ? 'All payments received via this link' : 'Loading link details'}
              </div>
            </div>
          </div>
          {link?.url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.45rem 0.65rem', maxWidth: '100%', minWidth: 0 }}>
              <LinkIcon size={16} color="var(--teal)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</span>
              <CopyButton text={link.url} />
            </div>
          )}
        </div>

        {loading || settlementsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
            Loading settlements...
          </div>
        ) : settlements && settlements.payments && settlements.payments.length ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Reference</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Payer</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Qreek Fee</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.payments.map((p, i) => (
                  <React.Fragment key={p.reference || i}>
                    <tr style={{ borderBottom: selectedPayment?.reference === p.reference ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{p.reference}</td>
                      <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{p.payer_name || p.payer_phone || '-'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{FMT(p.checkout_amount || p.amount)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{FMT(p.fee || p.qreek_fee)}</td>
                      <td style={{ padding: '0.5rem' }}>{statusLabel(p)}</td>
                      <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button onClick={() => setSelectedPayment(prev => prev?.reference === p.reference ? null : p)} style={{ background: 'var(--teal-faint)', color: 'var(--teal)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
                          {selectedPayment?.reference === p.reference ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
              <div>
                Page {settlements.page} of {settlements.total_pages} · {settlements.total} total
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" disabled={settlements.page <= 1} onClick={() => changePage(settlements.page - 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Prev</Button>
                <Button variant="secondary" disabled={settlements.page >= settlements.total_pages} onClick={() => changePage(settlements.page + 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Next</Button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            No payments yet for this link.
          </div>
        )}
      </div>

      <Modal open={!!selectedPayment} onClose={closeDetails} title="Transaction details" maxWidth={760}>
        {selectedPayment && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Transaction details</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{selectedPayment.reference}</div>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: 'var(--teal-faint)', color: 'var(--teal)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {statusLabel(selectedPayment)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              <DetailItem label="Date" value={selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString('en-NG') : '-'} />
              <DetailItem label="Payer" value={selectedPayment.payer_name || selectedPayment.payer_phone || '-'} />
              <DetailItem label="Checkout amount" value={FMT(selectedPayment.checkout_amount || selectedPayment.amount)} />
              <DetailItem label="Recipient amount" value={FMT(selectedPayment.recipient_amount || selectedPayment.net)} />
              <DetailItem label="Qreek fee" value={FMT(selectedPayment.fee || selectedPayment.qreek_fee)} />
              <DetailItem label="Provider fee" value={FMT(selectedPayment.provider_fee)} />
              <DetailItem label="Status" value={statusLabel(selectedPayment)} />
              <DetailItem label="Description" value={selectedPayment.payment_description || '-'} wide />
              <DetailItem label="Provider transaction ID" value={selectedPayment.provider_transaction_id || '-'} wide />
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
