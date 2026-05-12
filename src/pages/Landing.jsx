import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Sub-components ────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? 'rgba(6,14,26,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s ease', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
        Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>Sign in</Link>
        <Link to="/register" style={{ background: 'var(--teal)', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, padding: '0.55rem 1.25rem', borderRadius: 'var(--radius)' }}>Get started free</Link>
      </div>
    </nav>
  );
}

function TrustStrip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.14)', borderRadius: 'var(--radius)', marginBottom: '2.5rem' }}>
      {[['🔒','Payments processed by Monnify (CBN-licensed)'],['🏦','Funds go directly to recipient bank'],['✅','Qreek never holds your money'],['📋','Every naira tracked and receipted']].map(([icon, text]) => (
        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.77rem', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
          <span>{icon}</span><span>{text}</span>
        </div>
      ))}
    </div>
  );
}

function PillarCard({ icon, tag, title, desc, fee, cta, to, color }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--surface)', border: `1px solid ${hover ? color : 'var(--border)'}`, borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'var(--trans)', flex: 1, minWidth: 260, boxShadow: hover ? `0 0 40px ${color}18` : 'none' }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color, marginBottom: '0.4rem' }}>{tag}</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: '0.87rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color, fontWeight: 700 }}>{fee}</span>
        <Link to={to} style={{ fontSize: '0.82rem', fontWeight: 700, color, textDecoration: 'none', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 'var(--radius)', padding: '0.35rem 0.75rem' }}>{cta} →</Link>
      </div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--teal)', color: 'var(--text-inv)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function UseCase({ tag, color, title, body }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
      <div style={{ display: 'inline-block', background: `${color}18`, color, borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{tag}</div>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{title}</div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{body}</p>
    </div>
  );
}

function TrustFeature({ icon, title, desc }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

function PriceBox({ label, pct, note }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '0.35rem' }}>{pct}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{note}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Landing() {
  const S  = (pad = '5rem') => ({ padding: `${pad} 1.5rem` });
  const C  = { textAlign: 'center' };
  const SL = { fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.75rem' };
  const H2 = { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.1 };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ ...S('5rem'), minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...C }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
          🇳🇬 THE TRUST INFRASTRUCTURE FOR NIGERIAN PAYMENTS
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', maxWidth: 820, letterSpacing: '-0.02em' }}>
          Stop chasing bank alerts.<br />
          <span style={{ color: 'var(--teal)' }}>See who paid.</span> Instantly.
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-2)', maxWidth: 600, lineHeight: 1.8, marginBottom: '2.5rem' }}>
          Qreek gives your ajo group, your business, and your team a transparent payment ledger —
          no more screenshots, no more disputes, no more manual bank alerts.
          Powered by Monnify. <strong style={{ color: 'var(--text)' }}>Qreek never holds your funds.</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <Link to="/register" style={{ background: 'var(--teal)', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '1rem', fontWeight: 800, padding: '0.85rem 2rem', borderRadius: 'var(--radius)' }}>Start free — no monthly fees</Link>
          <Link to="/login" style={{ background: 'var(--surface-2)', color: 'var(--text)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>Sign in</Link>
        </div>
        <TrustStrip />
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['Pool contributions','0.30%'],['Payment links','0.40%'],['Payroll','0.30%'],['No monthly fee','Ever']].map(([label, fee]) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'var(--text-2)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--teal)' }}>{fee}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section style={{ ...S(), maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ ...C, marginBottom: '3rem' }}>
          <div style={SL}>Three products. One platform.</div>
          <h2 style={H2}>Built for how Nigeria moves money</h2>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <PillarCard icon="🏦" tag="Payment Pools" color="var(--teal)" to="/register" fee="0.30% per contribution" cta="Create a pool"
            title="Ajo, esusu, and group collections — with a live ledger"
            desc="Create a pool, share the invite code in your WhatsApp group, and send payment requests. Every member pays through Monnify checkout. The activity feed shows who paid, how much, and when — in real time, visible to all members." />
          <PillarCard icon="🔗" tag="Payment Links" color="var(--amber)" to="/register" fee="0.40% per payment" cta="Create a link"
            title="One link. Card, bank transfer, or USSD. Automatic record."
            desc="Create a Qreek link in 2 minutes. Share it on WhatsApp or Instagram. Your clients open it in the browser, pay through Monnify secure checkout, and you see instant confirmation — no bank alert chasing." />
          <PillarCard icon="💼" tag="Enterprise Payroll" color="var(--purple)" to="/register" fee="0.30% per payroll run" cta="Set up payroll"
            title="Pay 500 employees in 4 minutes. 0.3% fee. No subscription."
            desc="Import your employee roster via CSV, review salaries by department, confirm with your PIN, and every salary hits every bank account in parallel. Real-time status per employee. Printable receipt for accounting." />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...S(), background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ ...C, marginBottom: '3rem' }}>
            <div style={SL}>How it works</div>
            <h2 style={H2}>Simple. Transparent. Trusted.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Step n="01" title="Create a pool or link in 2 minutes" desc="Sign up with your phone number. Create a payment pool for your group, or a payment link for your clients. No forms, no bank visit, no approvals needed." />
            <Step n="02" title="Share the link — your people pay in their browser" desc="Group members or clients open the link on any device. They pay using card, bank transfer, or USSD — powered by Monnify secure checkout. No Qreek account needed to pay." />
            <Step n="03" title="Qreek records it. Everyone sees it." desc="The moment Monnify confirms the payment, Qreek updates your ledger in real time. The payer gets a receipt. Your pool shows who paid. Funds settle directly from Monnify to the recipient bank." />
          </div>
          <div style={{ marginTop: '2.5rem', background: 'var(--surface)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🔐</div>
            <div>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem', color: 'var(--teal)' }}>Qreek never holds your money</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>
                Every naira paid through Qreek is processed by <strong style={{ color: 'var(--text)' }}>Monnify</strong> — a CBN-licensed Payment Solution Provider (a Moniepoint company).
                Funds go directly from the payer bank to the recipient bank. Qreek provides the record, the ledger, and the transparency layer. Qreek is never in the middle of your money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{ ...S(), maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ ...C, marginBottom: '3rem' }}>
          <div style={{ ...SL, color: 'var(--amber)' }}>Who uses Qreek</div>
          <h2 style={H2}>Built for the way Nigeria actually pays</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <UseCase tag="Ajo Group" color="var(--teal)" title="Adaeze market women circle — 20 members"
            body="Each member contributes ₦10,000 monthly via Monnify checkout. The activity feed shows who paid and who has not — no more arguments, no more screenshots. Fee: ₦30 per contribution." />
          <UseCase tag="Merchant" color="var(--amber)" title="Tokunbo, a Lagos fashion designer"
            body="Shares one Qreek link in her Instagram bio. Clients pay flexible amounts for deposits and custom orders. She sees every payment confirmed automatically — no bank alert chasing." />
          <UseCase tag="Church" color="var(--green)" title="Pastor James building fund committee"
            body="Creates a Qreek pool for building fund contributions. Members pay from anywhere. The committee sees the running total live. Every naira is accounted for." />
          <UseCase tag="Enterprise" color="var(--purple)" title="TechBridge Solutions — 47 employees"
            body="CFO confirms payroll in 4 minutes. All 47 salary transfers fire in parallel. Each employee gets a bank alert. Printable receipt for accounting. Total fee: ₦61,200. No monthly subscription." />
          <UseCase tag="Student Association" color="var(--teal)" title="UNILAG Engineering — Final Year Levy"
            body="Collects ₦15,000 project levy from 300 students via a Qreek pool. Members pay from their phones. The committee sees exactly who has paid and who is outstanding." />
          <UseCase tag="Small Business" color="var(--amber)" title="Chidi web agency — collecting deposits"
            body="Sends a Qreek payment link to each client instead of sharing account numbers. Client pays via card or bank transfer. Chidi gets instant confirmation and a clean receipt." />
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section style={{ ...S(), background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', ...C }}>
          <div style={SL}>Why trust Qreek</div>
          <h2 style={{ ...H2, marginBottom: '0.75rem' }}>The accountability layer Nigeria was missing</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', maxWidth: 560, margin: '0 auto 3rem', lineHeight: 1.8 }}>
            We are not a new bank. We give your community payments the infrastructure they deserve — powered by CBN-licensed rails.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <TrustFeature icon="🏛️" title="CBN-licensed processing" desc="All payments processed by Monnify, a CBN-licensed PSP and Moniepoint company. Qreek operates as Monnify merchant — not a separate payment institution." />
            <TrustFeature icon="🚫" title="Zero fund custody" desc="Qreek never touches your money. When a payer pays, the naira goes from their bank to the recipient bank. Qreek records the event — that is its only role." />
            <TrustFeature icon="👁️" title="Full transparency for pool members" desc="Every pool member sees the complete activity feed — every payment, every request, every receipt. Nothing is hidden from the group." />
            <TrustFeature icon="🔐" title="PIN-secured transactions" desc="All financial actions require your personal PIN. Five wrong attempts locks the account automatically. Your money is protected even if your phone is stolen." />
            <TrustFeature icon="📋" title="Immutable receipt for every payment" desc="Every confirmed payment generates an automatic receipt for payer and recipient. Monnify webhook is the source of truth — not a screenshot." />
            <TrustFeature icon="🆘" title="Dispute reporting built in" desc="Any pool member can flag a suspicious request or payment directly in the app. Qreek support responds within 24 hours. Admins cannot act unilaterally on large sums." />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ ...S(), maxWidth: 900, margin: '0 auto', ...C }}>
        <div style={SL}>Pricing</div>
        <h2 style={{ ...H2, marginBottom: '0.75rem' }}>The most affordable transparent rates in Nigeria</h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          No monthly fees. No setup costs. You only pay when money moves — and the fee is always shown before you confirm.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
          <PriceBox label="Pool contributions" pct="0.30%" note="Per contribution paid by pool member" />
          <PriceBox label="Payment links" pct="0.40%" note="Per payment received through your link" />
          <PriceBox label="Enterprise payroll" pct="0.30%" note="Per salary disbursed in a payroll run" />
          <PriceBox label="No monthly fee" pct="Free" note="No subscription, no setup, no withdrawal fee" />
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-3)' }}>
          All payments are processed by Monnify. Monnify processing fees apply separately.
          Bank transfer payments are typically ₦10–₦30 flat — the most affordable option for your group.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...S(), ...C, background: 'linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(245,166,35,0.05) 100%)', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Stop managing money with screenshots.
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          Join the ajo groups, merchants, and businesses already using Qreek to bring transparency to every payment.
        </p>
        <Link to="/register" style={{ display: 'inline-block', background: 'var(--teal)', color: 'var(--text-inv)', textDecoration: 'none', fontSize: '1.05rem', fontWeight: 800, padding: '0.95rem 2.5rem', borderRadius: 'var(--radius)' }}>
          Create your free account →
        </Link>
        <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-3)' }}>No credit card. No monthly fee. Set up in 2 minutes.</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '2.5rem 1.5rem', ...C }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', maxWidth: 600, margin: '0 auto 1rem', lineHeight: 1.7 }}>
          All payments processed by Monnify (TeamApt Ltd), a CBN-licensed Payment Solution Provider.
          Qreek Finance does not hold, custody, or transmit funds. Qreek Finance is a technology
          platform providing payment records, pool ledgers, and merchant dashboards.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-3)' }}>
          <Link to="/register" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Sign up</Link>
          <Link to="/login" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Log in</Link>
          <span>support@qreekfinance.org</span>
          <span>© 2026 Qreek Finance</span>
        </div>
      </footer>
    </div>
  );
}
