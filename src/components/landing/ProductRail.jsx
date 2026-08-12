import React from 'react';
import { Link } from 'react-router-dom';
import { Bank, Link as LinkIcon, Briefcase, Eye, ShieldCheck, Receipt, ArrowRight } from 'phosphor-react';
import Photo from './Photo';
import Reveal from './Reveal';

const CARDS = [
  { slot: 'railPools',    Icon: Bank,       color: '#00d4aa', tag: 'Communal',        title: 'Payment Pools',      body: 'For ajo groups, committees, and circles. Every member sees every naira paid, in real time, with no disputes.' },
  { slot: 'railLinks',    Icon: LinkIcon,   color: '#f5a623', tag: 'Solo & Merchant', title: 'Payment Links',      body: 'One link. Card, transfer, or USSD. Clients pay in browser. Automatic receipt every time.' },
  { slot: 'railPayroll',  Icon: Briefcase,  color: '#9b59b6', tag: 'Business',        title: 'Enterprise Payroll', body: 'Bulk salary runs. PIN approval. Per-employee status. Printable receipts. No monthly subscription.' },
  { slot: 'railFeed',     Icon: Eye,        color: '#2ed573', tag: 'Transparency',    title: 'Live Activity Feed', body: 'See who paid, who has not, and the running total. All members, one source of truth.' },
  { slot: 'railPin',      Icon: ShieldCheck, color: '#4a90e2', tag: 'Security',       title: 'PIN-Secured Auth',   body: 'Every financial action requires your secure PIN. Five wrong attempts locks the account instantly.' },
  { slot: 'railReceipts', Icon: Receipt,    color: '#f87171', tag: 'Proof',           title: 'Webhook Receipts',   body: 'Flutterwave webhook confirmation is the source of truth. Not screenshots, not DMs.' },
];

export default function ProductRail() {
  return (
    <section style={{ padding: '5.5rem 0', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.65rem' }}>Everything in one place</div>
          <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.85rem' }}>
            Everything you need to collect, track, and pay.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 500, margin: '0 auto', lineHeight: 1.85 }}>
            Whether you are an ajo group of 5 or a company of 500, Qreek has the right product for how you move money.
          </p>
        </Reveal>
      </div>

      <div className="rail-track" style={{ display: 'flex', gap: '1.1rem', overflowX: 'auto', padding: '0 2rem 0.5rem', scrollbarWidth: 'none' }}>
        {CARDS.map(({ slot, Icon, color, tag, title, body }) => (
          <Link key={title} to="/register"
            style={{ textDecoration: 'none', color: 'inherit', flex: '0 0 310px', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.25s ease, transform 0.3s ease, box-shadow 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}45`; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 24px 64px ${color}1c`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

            <Photo slot={slot} ratio="16 / 10" scrim="card" accent={color} sizes="310px">
              <div style={{ position: 'absolute', top: '0.9rem', left: '0.9rem', width: 34, height: 34, borderRadius: 10, background: 'rgba(6,14,26,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} weight="duotone" color={color} aria-hidden />
              </div>
              <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color }}>
                {tag}
              </div>
            </Photo>

            <div style={{ padding: '1.25rem 1.75rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{title}</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.78, margin: 0, flex: 1 }}>{body}</p>
              <div style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 800, color, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Get started <ArrowRight size={15} weight="bold" aria-hidden />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
