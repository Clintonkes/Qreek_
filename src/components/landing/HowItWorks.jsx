import React from 'react';
import { ShieldCheck } from 'phosphor-react';
import Photo from './Photo';
import Reveal from './Reveal';

const STEPS = [
  { n: '01', slot: 'panelPools', title: 'Create in 2 minutes',        body: 'Sign up with your phone number. Create a pool, a payment link, or a payroll run. No forms, no bank visits, no approvals required.' },
  { n: '02', slot: 'railLinks',  title: 'Share. They pay in browser.', body: 'Members or clients open your link on any device. They pay through Flutterwave: card, bank transfer, or USSD. No Qreek account needed to pay.' },
  { n: '03', slot: 'railReceipts', title: 'Ledger updates instantly',  body: 'The moment Flutterwave confirms, Qreek marks the payment. Payer gets a receipt. Funds settle bank-to-bank. Qreek never touches them.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '5.5rem 2rem', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Getting started</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Simple. Transparent. Trusted.</h2>
        </Reveal>

        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {STEPS.map(({ n, slot, title, body }, i) => (
            <Reveal key={n} delay={i * 100}>
              <Photo
                slot={slot}
                ratio="16 / 10"
                scrim="card"
                accent="#00d4aa"
                radius={16}
                sizes="(max-width: 768px) 100vw, 340px"
                style={{ marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div style={{ position: 'absolute', left: '1rem', bottom: '1rem', width: 42, height: 42, borderRadius: '50%', background: 'rgba(6,14,26,0.78)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,212,170,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#00d4aa', fontSize: '0.85rem' }}>
                  {n}
                </div>
              </Photo>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.82, margin: 0 }}>{body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80} style={{ marginTop: '2.75rem', background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.12)', borderRadius: 14, padding: '1.35rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} weight="duotone" color="#00d4aa" aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.82 }}>
            Every naira paid through Qreek is processed by <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Flutterwave</strong>, a CBN-licensed Payment Solution Provider. Funds flow directly from payer bank to recipient bank.{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Qreek is never in the middle of your money.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
