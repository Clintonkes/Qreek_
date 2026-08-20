/**
 * @file FAQ.jsx
 * @description Standalone frequently-asked-questions page, reachable from the
 * landing nav and footer. Reuses the same nav/footer chrome as Landing.jsx so
 * it reads as part of the same site rather than a bolted-on page.
 */
import React, { useState } from 'react';
import { CaretDown } from 'phosphor-react';
import { GLOBAL_CSS } from '../components/landing/landingCss';
import LandingNav from '../components/landing/LandingNav';
import SiteFooter from '../components/landing/SiteFooter';
import Reveal from '../components/landing/Reveal';

const FAQ_CSS = `
  .faq-a-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
  .faq-a-wrap.open { grid-template-rows: 1fr; }
  .faq-a-inner { overflow: hidden; }
  .faq-q:hover { color: #00d4aa !important; }
`;

const GROUPS = [
  {
    title: 'General',
    color: '#00d4aa',
    items: [
      {
        q: 'What is Qreek?',
        a: "Qreek is a payment layer built for how Nigerians actually collect and move money — ajo and esusu circles, church and community levies, family support, solo traders and freelancers, and company payroll — all with a shared, receipted ledger instead of a notebook or a WhatsApp thread.",
      },
      {
        q: 'Do I need a Qreek account to pay someone?',
        a: "No. Anyone can pay a Qreek Payment Link or Pool contribution as a guest — enter your name, phone, and pay by card, bank transfer, or USSD. You only need an account to create your own links and pools, or to save a card for faster checkout next time.",
      },
      {
        q: "What's the difference between a Pool and a Payment Link?",
        a: "A Pool is for a group collecting together — an ajo circle, a church fund, a family — everyone sees a live ledger of who's paid. A Payment Link is for one person or business collecting on their own, like an invoice you can share anywhere.",
      },
    ],
  },
  {
    title: 'Payments & Fees',
    color: '#f5a623',
    items: [
      {
        q: 'How much does Qreek charge?',
        a: "0.15% per contribution on Pool and Family links, 0.25% per payment on personal Payment Links, and 0.2% per payroll run. No monthly subscription, no setup fee. Flutterwave's own processing fee applies separately and is always shown before you confirm.",
      },
      {
        q: 'Who actually processes my payment?',
        a: "Flutterwave, a CBN-licensed Payment Solution Provider. Qreek never holds or custodies your funds — money moves directly from the payer's card or bank to the recipient's account.",
      },
      {
        q: 'What happens if a payment fails or gets stuck?',
        a: "Nothing is deducted unless Flutterwave confirms the charge succeeded. If a payment shows as pending, Qreek automatically re-checks with Flutterwave in the background until it settles — you don't need to do anything.",
      },
    ],
  },
  {
    title: 'Saved Cards',
    color: '#9b59b6',
    items: [
      {
        q: 'Can I save my card for faster checkout next time?',
        a: "Yes — after paying a link once, you can opt in to save the card. Next time you're sent a link, you can pay with one tap instead of going through Flutterwave's full checkout page.",
      },
      {
        q: 'Is it safe to save my card on Qreek?',
        a: "Qreek never sees or stores your card number, expiry, or CVV. Saving a card only stores a secure, one-time token from Flutterwave — the same infrastructure banks use — so even Qreek can't reconstruct your card details from it.",
      },
      {
        q: 'Can I use a saved card without logging into my Qreek account?',
        a: "Yes. On the checkout page, enter the phone number your card is saved under and we'll text you a one-time code. Enter that code and your saved cards appear — no password, no full login, just proof the phone is yours.",
      },
      {
        q: 'Why do I sometimes get a second code from my bank?',
        a: "Some Nigerian cards require your bank's own one-time code on every charge, even a saved one — that's a card network rule, not something Qreek or Flutterwave can skip. You'll see a second prompt for that code if your bank requires it.",
      },
      {
        q: 'How do I remove a saved card?',
        a: "From your Qreek dashboard under Settings, you can view and remove any saved card at any time.",
      },
    ],
  },
  {
    title: 'Trust & Security',
    color: '#2ed573',
    items: [
      {
        q: 'Is Qreek licensed?',
        a: "Qreek is not the licensed entity — all payment processing runs through Flutterwave Technology Solutions Limited, a CBN-licensed Payment Solution Provider. Qreek is the ledger and collection layer built on top.",
      },
      {
        q: 'Does Qreek hold my money?',
        a: "No. Qreek has zero fund custody — payments settle directly from Flutterwave to the recipient's bank account. Qreek's fee is deducted automatically as part of that settlement, not held separately.",
      },
      {
        q: 'Who can see my payment history?',
        a: "For Pools and Family links, contributions are visible to members of that group (amount, payer name, date) so everyone can see the ledger is accurate. Personal Payment Links and Payroll are only visible to the account that created them.",
      },
    ],
  },
];

function AccordionItem({ q, a, open, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="faq-q"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          padding: '1.15rem 0', fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '0.98rem', color: 'var(--text)', transition: 'color 0.15s',
        }}
      >
        {q}
        <CaretDown size={16} weight="bold" style={{ flexShrink: 0, color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
      </button>
      <div className={`faq-a-wrap${open ? ' open' : ''}`}>
        <div className="faq-a-inner">
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-2)', maxWidth: 640 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState('General:0');

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'clip' }}>
      <style>{GLOBAL_CSS}</style>
      <style>{FAQ_CSS}</style>

      <LandingNav />

      <section style={{ padding: '8.5rem 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Help</div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.85rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>Frequently asked questions</h1>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
              Everything about how Qreek collects, moves, and secures money — from your first payment link to saving a card for next time.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem 6rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {GROUPS.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 60}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                <div style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{group.title}</div>
              </div>
              <div>
                {group.items.map((item, i) => {
                  const key = `${group.title}:${i}`;
                  return (
                    <AccordionItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      open={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </Reveal>
          ))}

          <Reveal style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '0.9rem' }}>Still have a question?</p>
            <a href="mailto:info@qreekfinance.org" style={{ color: '#00d4aa', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none' }}>info@qreekfinance.org</a>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
