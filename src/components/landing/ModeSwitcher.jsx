import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Handshake, Lightning, Storefront, Briefcase,
  Users, Megaphone, ChartLine, Receipt,
  Link as LinkIcon, ChatCircleText, CheckCircle, Tray,
  Tag, CurrencyNgn, Bell, Books,
  FileText, ShieldCheck, Rocket,
} from 'phosphor-react';
import Photo from './Photo';
import { prefersReducedMotion } from './landingCss';

const MODES = [
  {
    name: 'Communal', Icon: Handshake, kicker: 'Groups and circles', color: '#00d4aa', slot: 'modeCommunal',
    title: 'Collect together without losing trust in the room.',
    summary: 'For ajo, esusu, church drives, levies, and committee collections where everyone needs to see the same truth at the same time.',
    actions: [
      { Icon: Users,     title: 'Invite members',        copy: 'Create a pool, add admins, share one invite link.' },
      { Icon: Megaphone, title: 'Request contributions', copy: 'Send payment requests with amount and due date.' },
      { Icon: ChartLine, title: 'Track the ledger',      copy: 'See who paid, who is pending, and the running total.' },
      { Icon: Receipt,   title: 'Resolve disputes',      copy: 'Receipts and history stay attached to the pool.' },
    ],
    stats: [{ value: '0.15%', label: 'per contribution' }, { value: 'Live', label: 'member ledger' }, { value: 'All', label: 'members visible' }],
    path: ['Create pool', 'Invite', 'Collect', 'Confirm', 'Ledger'],
  },
  {
    name: 'Solo', Icon: Lightning, kicker: 'Personal collections', color: '#f5a623', slot: 'modeSolo',
    title: 'Move fast when one person needs to collect cleanly.',
    summary: 'Personal dues, deposits, one-off payments, and small business requests with automatic confirmation and record-keeping.',
    actions: [
      { Icon: LinkIcon,       title: 'Generate a link',   copy: 'Create a branded payment link for any amount.' },
      { Icon: ChatCircleText, title: 'Share anywhere',    copy: 'Drop the link into WhatsApp, Instagram, or an invoice.' },
      { Icon: CheckCircle,    title: 'Get confirmation',  copy: 'Payment confirmed by Flutterwave and recorded instantly.' },
      { Icon: Tray,           title: 'Keep records',      copy: 'Every payer, amount, and receipt stored automatically.' },
    ],
    stats: [{ value: '0.25%', label: 'per payment' }, { value: '2 min', label: 'link setup' }, { value: 'No', label: 'account needed' }],
    path: ['Create link', 'Share', 'Pay', 'Receipt', 'Record'],
  },
  {
    name: 'Merchant', Icon: Storefront, kicker: 'Sales and deposits', color: '#2ed573', slot: 'modeMerchant',
    title: 'Turn everyday selling into organised payment operations.',
    summary: 'For sellers, agencies, and service providers who need command over deposits, repeat clients, and payment proof.',
    actions: [
      { Icon: Tag,         title: 'Name each collection', copy: 'Label payments by client, order, or project.' },
      { Icon: CurrencyNgn, title: 'Accept all channels',  copy: 'Card, transfer, or USSD through Flutterwave checkout.' },
      { Icon: Bell,        title: 'See alerts instantly', copy: 'Confirmed payments show clear status. No uncertainty.' },
      { Icon: Books,       title: 'Review history',       copy: 'Filter by customer, amount, date, and receipt state.' },
    ],
    stats: [{ value: 'Any', label: 'channel' }, { value: 'Clean', label: 'receipts' }, { value: 'Fast', label: 'follow-up' }],
    path: ['Set purpose', 'Share', 'Confirm', 'Receipt', 'Follow up'],
  },
  {
    name: 'Enterprise', Icon: Briefcase, kicker: 'Payroll and teams', color: '#9b59b6', slot: 'modeEnterprise',
    title: 'Run high-volume payouts with approval and evidence.',
    summary: 'For payroll, department reviews, bulk payment runs, and accounting teams that need per-employee status and printable proof.',
    actions: [
      { Icon: FileText,    title: 'Import roster',     copy: 'Upload employees, salaries, banks, and departments.' },
      { Icon: ShieldCheck, title: 'Approve with PIN',  copy: 'Sensitive runs require a secure PIN before money moves.' },
      { Icon: Rocket,      title: 'Disburse in bulk',  copy: 'Salary transfers fire in parallel with live status per person.' },
      { Icon: Receipt,     title: 'Export proof',      copy: 'Download payroll receipts and run summaries for accounting.' },
    ],
    stats: [{ value: '0.2%', label: 'per run' }, { value: 'Bulk', label: 'disbursement' }, { value: 'Per', label: 'employee status' }],
    path: ['Import', 'Review', 'Approve', 'Disburse', 'Export'],
  },
];

export default function ModeSwitcher() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const go = useCallback((idx) => setActive((idx + MODES.length) % MODES.length), []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    timerRef.current = setTimeout(() => go(active + 1), 9000);
    return () => clearTimeout(timerRef.current);
  }, [active, go]);

  const mode = MODES[active];

  return (
    <section id="modes" style={{ background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '5.5rem 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 28% 50%, ${mode.color}12, transparent 55%)`, transition: 'background 0.7s ease', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.75rem' }}>One payment layer</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Tuned to how people collect</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
          {MODES.map((m, i) => {
            const sel = i === active;
            return (
              <button key={m.name} onClick={() => { clearTimeout(timerRef.current); go(i); }}
                style={{ background: sel ? `${m.color}18` : 'rgba(255,255,255,0.04)', color: sel ? m.color : 'var(--text-3)', border: `1px solid ${sel ? m.color + '55' : 'rgba(255,255,255,0.07)'}`, borderRadius: 999, padding: '0.55rem 1.25rem', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <m.Icon size={16} weight="duotone" aria-hidden />{m.name}
              </button>
            );
          })}
        </div>

        <div className="modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }} key={mode.name}>

          <div style={{ animation: 'fadeUp 0.45s ease both' }}>
            <div style={{ color: mode.color, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{mode.kicker}</div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{mode.title}</h3>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-2)', lineHeight: 1.88, marginBottom: '1.5rem' }}>{mode.summary}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {mode.actions.map(a => (
                <div key={a.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.85rem' }}>
                  <a.Icon size={20} weight="duotone" color={mode.color} aria-hidden style={{ marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.81rem', marginBottom: '0.22rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{a.copy}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {mode.stats.map(s => (
                <div key={s.label} style={{ flex: 1, background: `${mode.color}0c`, border: `1px solid ${mode.color}28`, borderRadius: 10, padding: '0.65rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: mode.color, fontSize: '0.92rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Photograph for the active mode, with the flow chain across its base */}
          <Photo
            slot={mode.slot}
            ratio="4 / 3"
            scrim="panel"
            accent={mode.color}
            radius={20}
            sizes="(max-width: 768px) 100vw, 560px"
            style={{ border: `1px solid ${mode.color}38`, boxShadow: `0 30px 80px ${mode.color}14`, animation: 'fadeUp 0.45s 0.08s ease both' }}
          >
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1.1rem 1.25rem', background: 'linear-gradient(180deg, transparent, rgba(6,14,26,0.92))' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-3)', marginBottom: '0.45rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Flow</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {mode.path.map((step, i) => {
                  const last = i === mode.path.length - 1;
                  return (
                    <span key={step} style={{ color: last ? mode.color : 'var(--text-2)', background: last ? `${mode.color}1c` : 'rgba(6,14,26,0.66)', backdropFilter: 'blur(8px)', border: `1px solid ${last ? mode.color + '55' : 'rgba(255,255,255,0.1)'}`, borderRadius: 999, padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontWeight: 800 }}>{step}</span>
                  );
                })}
              </div>
            </div>
          </Photo>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
          {MODES.map((m, i) => (
            <button key={m.name} onClick={() => { clearTimeout(timerRef.current); go(i); }}
              aria-label={`Show ${m.name} mode`}
              style={{ width: i === active ? 20 : 7, height: 6, borderRadius: 99, background: i === active ? mode.color : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
