// Landing.jsx is the public marketing page that introduces Qreek's pool-powered payment flows
// and helps new visitors understand the solo, enterprise, and communal use cases.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Buildings, CheckCircle, Coins, Link as LinkIcon, Users } from 'phosphor-react';

const TRUST_PILLS = [
  'Pool-powered payouts',
  'Solo, enterprise, and communal use',
  'Transparent payment fees',
  'All Nigerian banks',
];

const USE_CASES = [
  {
    id: 'solo',
    label: 'Solo',
    badge: 'For freelancers and creators',
    title: 'Collect, organize, and withdraw payments without chasing people.',
    desc: 'Create payment links, route incoming money into a pool, and keep every customer payment tidy from collection to payout.',
    accent: 'var(--teal)',
    surface: 'linear-gradient(135deg, rgba(0, 212, 170, 0.22), rgba(0, 212, 170, 0.04))',
    amount: '₦1.28M',
    metric: 'Collected this month',
    points: ['Create branded payment links', 'Track every payer in one flow', 'Withdraw or reuse balance instantly'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    badge: 'For teams and operations',
    title: 'Run structured payouts for staff, vendors, and recurring obligations.',
    desc: 'Use Qreek pools to stage funds, review totals, and trigger organized business disbursements with cleaner visibility across departments.',
    accent: 'var(--amber)',
    surface: 'linear-gradient(135deg, rgba(245, 166, 35, 0.22), rgba(245, 166, 35, 0.04))',
    amount: '126',
    metric: 'Beneficiaries processed',
    points: ['Fund one pool for many payouts', 'See departments and payment status', 'Keep payroll and vendor payments aligned'],
  },
  {
    id: 'communal',
    label: 'Communal',
    badge: 'For groups, associations, and circles',
    title: 'Coordinate group contributions and transparent disbursements in one place.',
    desc: 'Perfect for thrift groups, family collections, events, and community projects where multiple people contribute and everyone needs clarity.',
    accent: 'var(--green)',
    surface: 'linear-gradient(135deg, rgba(46, 213, 115, 0.22), rgba(46, 213, 115, 0.04))',
    amount: '48',
    metric: 'Contributors active',
    points: ['Shared visibility for members', 'Clear contribution milestones', 'Controlled payouts from a common pool'],
  },
];

const FEATURES = [
  {
    icon: '🔗',
    title: 'Payment links that feel intentional',
    desc: 'Share one clean link and let Qreek route every incoming payment into the right pool, project, or payout plan.',
  },
  {
    icon: '🏦',
    title: 'Payouts to any Nigerian bank',
    desc: 'Move money out of your pool with confidence, whether you are paying yourself, a team, or a community beneficiary.',
  },
  {
    icon: '🧾',
    title: 'Built-in visibility',
    desc: 'Know who paid, what has been disbursed, and where balances are sitting without juggling spreadsheets.',
  },
  {
    icon: '👥',
    title: 'Designed for shared money',
    desc: 'Qreek pools make group collections, salary batches, and contribution circles easy to manage without confusion.',
  },
  {
    icon: '⚡',
    title: 'Fast action surfaces',
    desc: 'Fund, collect, review, and payout from one calm interface that keeps the next action obvious.',
  },
  {
    icon: '🛡️',
    title: 'Cleaner trust signals',
    desc: 'Use structured flows, PIN-backed actions, and clear payment states to make sensitive money movement feel safer.',
  },
];

const FEES = [
  { label: 'Pool transfers', value: '0.25%', desc: 'Low-cost movement inside organized pools' },
  { label: 'Business payouts', value: '0.30%', desc: 'For teams, salary batches, and vendor runs' },
  { label: 'Payment links', value: 'Fast', desc: 'Create and share in minutes' },
  { label: 'Settlement clarity', value: 'Live', desc: 'Balances, usage, and status update clearly' },
];

const HOW = [
  {
    step: '01',
    title: 'Choose your payment mode',
    desc: 'Start with a solo collection flow, a team payout setup, or a communal pool for shared contributions.',
  },
  {
    step: '02',
    title: 'Collect into a pool',
    desc: 'Fund your pool with incoming payments, contribution requests, or business allocation for the cycle you want to run.',
  },
  {
    step: '03',
    title: 'Payout with control',
    desc: 'Review balances, approve transfers, and send money to the right people with a record of what happened.',
  },
];

function Nav({ scrolled }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(6,14,26,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'var(--trans)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#features" style={{ color: 'var(--text-2)', fontSize: '0.9rem', display: 'none' }} className="desktop-link">Features</a>
          <a href="#flows" style={{ color: 'var(--text-2)', fontSize: '0.9rem', display: 'none' }} className="desktop-link">Flows</a>
          <Link to="/login" style={{ color: 'var(--text-2)', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>Log in</Link>
          <Link
            to="/register"
            style={{
              background: 'linear-gradient(135deg, var(--teal), #47f5cb)',
              color: 'var(--text-inv)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.88rem',
              boxShadow: 'var(--shadow-teal)',
            }}
          >
            Get started
          </Link>
        </nav>
      </div>
      <style>{`@media(min-width:768px){.desktop-link{display:inline!important}}`}</style>
    </header>
  );
}

function UseCasePanel({ active, onSelect }) {
  const current = USE_CASES.find(item => item.id === active) || USE_CASES[0];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '30px',
        padding: '1.1rem',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -80,
          background: `radial-gradient(circle at 20% 20%, ${current.accent}33 0%, transparent 42%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08) 0%, transparent 24%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {USE_CASES.map(item => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                padding: '0.65rem 0.95rem',
                borderRadius: '999px',
                border: `1px solid ${selected ? item.accent : 'var(--border)'}`,
                background: selected ? item.surface : 'rgba(255,255,255,0.03)',
                color: selected ? 'var(--text)' : 'var(--text-2)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: 'rgba(5, 13, 25, 0.72)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            minHeight: 350,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: current.surface,
                  color: current.accent,
                  border: `1px solid ${current.accent}44`,
                  borderRadius: '999px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: '0.85rem',
                }}
              >
                <CheckCircle size={14} />
                {current.badge}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem', maxWidth: 420 }}>{current.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.86rem', lineHeight: 1.7, maxWidth: 440 }}>{current.desc}</p>
            </div>
            <div
              style={{
                minWidth: 120,
                textAlign: 'right',
                background: current.surface,
                border: `1px solid ${current.accent}33`,
                borderRadius: '18px',
                padding: '0.85rem',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: current.accent }}>{current.amount}</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.72rem' }}>{current.metric}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '1rem' }}>
            {current.points.map((point, index) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{point}</span>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: current.accent, boxShadow: `0 0 18px ${current.accent}` }} />
              </motion.div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              { label: 'Collections', value: current.id === 'enterprise' ? '24 active' : '12 active' },
              { label: 'Pool balance', value: current.id === 'communal' ? '₦892k' : '₦4.8M' },
              { label: 'Payout state', value: 'Ready' },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  padding: '0.85rem',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ color: 'var(--text-3)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <div
            style={{
              background: 'rgba(7, 17, 33, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '22px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>Payment activity</span>
              <span style={{ fontSize: '0.72rem', color: current.accent }}>live flow</span>
            </div>
            {[
              { name: current.id === 'solo' ? 'Design invoice' : current.id === 'enterprise' ? 'Salary batch' : 'April contribution', status: 'Funded', width: '88%' },
              { name: current.id === 'solo' ? 'Retainer top-up' : current.id === 'enterprise' ? 'Vendor payout' : 'Welfare disbursement', status: 'Queued', width: '72%' },
              { name: current.id === 'solo' ? 'Client collection' : current.id === 'enterprise' ? 'Bonus payout' : 'Event support', status: 'Ready', width: '56%' },
            ].map(item => (
              <div key={item.name} style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span>{item.name}</span>
                  <span style={{ color: 'var(--text-2)' }}>{item.status}</span>
                </div>
                <div style={{ height: 9, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    key={`${current.id}-${item.name}`}
                    initial={{ width: 0 }}
                    animate={{ width: item.width }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${current.accent}, #ffffff)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: current.surface,
              border: `1px solid ${current.accent}33`,
              borderRadius: '22px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <Coins size={18} color={current.accent} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Pool summary</span>
            </div>
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              {[
                ['Incoming', current.id === 'solo' ? '₦540,000' : current.id === 'enterprise' ? '₦12,400,000' : '₦2,160,000'],
                ['Reserved', current.id === 'solo' ? '₦120,000' : current.id === 'enterprise' ? '₦1,900,000' : '₦340,000'],
                ['Available', current.id === 'solo' ? '₦420,000' : current.id === 'enterprise' ? '₦10,500,000' : '₦1,820,000'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(7, 17, 33, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '22px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              { icon: LinkIcon, label: 'Payment links', value: current.id === 'solo' ? '08' : '14' },
              { icon: current.id === 'enterprise' ? Buildings : Users, label: current.id === 'enterprise' ? 'Teams' : 'Contributors', value: current.id === 'enterprise' ? '06' : '37' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '0.9rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <item.icon size={18} color={current.accent} />
                <div style={{ color: 'var(--text-3)', fontSize: '0.7rem', marginTop: '0.55rem' }}>{item.label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState('solo');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveUseCase(current => {
        const index = USE_CASES.findIndex(item => item.id === current);
        return USE_CASES[(index + 1) % USE_CASES.length].id;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <Nav scrolled={scrolled} />

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'calc(5rem + 64px) 1.5rem 4rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top left, rgba(0,212,170,0.20), transparent 30%), radial-gradient(circle at top right, rgba(245,166,35,0.18), transparent 25%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 26%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ maxWidth: 700, marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--teal-border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 0.9rem',
                fontSize: '0.78rem',
                color: 'var(--teal)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginBottom: '1.35rem',
              }}
            >
              Pools for modern payments
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.6rem)', lineHeight: 1.02, marginBottom: '1rem', maxWidth: 840 }}>
              Collect money, manage shared funds, and payout with more control.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '1.75rem', maxWidth: 640 }}>
              Qreek turns pools into a cleaner way to run payments for yourself, your business, or your community. Collect into one flow, organize balances, and disburse with clarity.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: 'linear-gradient(135deg, var(--teal), #48f2c8)',
                  color: 'var(--text-inv)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  padding: '0.95rem 1.35rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.98rem',
                  boxShadow: 'var(--shadow-teal)',
                }}
              >
                Start with Qreek
                <ArrowRight size={18} />
              </Link>
              <a
                href="#flows"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  padding: '0.95rem 1.35rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.98rem',
                }}
              >
                Explore payment flows
              </a>
            </div>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {TRUST_PILLS.map(item => (
                <span
                  key={item}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.38rem 0.8rem',
                    fontSize: '0.76rem',
                    color: 'var(--text-2)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <UseCasePanel active={activeUseCase} onSelect={setActiveUseCase} />
        </div>
      </section>

      <section id="flows" style={{ padding: '4.5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Payment Flows
        </p>
        <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', marginBottom: '0.85rem', maxWidth: 720 }}>
          One product, three ways to move money with purpose.
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '2.5rem', maxWidth: 620 }}>
          Qreek is built around pool-based money movement, so the same system can power personal collections, company payouts, and communal contribution cycles.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {HOW.map(item => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35 }}
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.6rem',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--border-light)', lineHeight: 1, marginBottom: '0.95rem' }}>{item.step}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.45rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.7 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" style={{ padding: '4.5rem 1.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.03))' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', marginBottom: '0.75rem' }}>A more interactive home for payments</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '2.75rem', maxWidth: 600 }}>
            The experience is designed to feel active and operational, not static. Every surface should help you understand money in motion.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.18 }}
                style={{
                  background: 'rgba(10, 22, 40, 0.88)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '1.55rem', marginBottom: '0.85rem' }}>{icon}</div>
                <h3 style={{ fontSize: '0.96rem', marginBottom: '0.45rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="fees" style={{ padding: '4.5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', marginBottom: '0.75rem', maxWidth: 680 }}>
          Money colors, clear pricing, and less guesswork.
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '2.75rem', maxWidth: 600 }}>
          Qreek should feel optimistic and trustworthy, so the visuals lean into vibrant payment colors while keeping fee language simple and visible.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {FEES.map(({ label, value, desc }, index) => (
            <div
              key={label}
              style={{
                background: index % 2 === 0 ? 'linear-gradient(180deg, rgba(0,212,170,0.10), rgba(255,255,255,0.03))' : 'linear-gradient(180deg, rgba(245,166,35,0.10), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.45rem',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: index % 2 === 0 ? 'var(--teal)' : 'var(--amber)', marginBottom: '0.35rem' }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: '5rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(0,212,170,0.14), rgba(245,166,35,0.10), rgba(6,14,26,1))',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', marginBottom: '0.75rem' }}>Build your next payment flow on pools, not patchwork.</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '2rem', fontSize: '1rem', maxWidth: 640, marginInline: 'auto' }}>
            Whether you are receiving alone, paying a team, or coordinating a community, Qreek gives the money a structure before it starts moving.
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: 'var(--amber)',
              color: 'var(--text-inv)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              padding: '1rem 1.6rem',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
              boxShadow: 'var(--shadow-amber)',
            }}
          >
            Create free account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="#features" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Features</a>
            <a href="#flows" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Flows</a>
            <Link to="/login" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Login</Link>
            <Link to="/register" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Sign up</Link>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', width: '100%' }}>
            © {new Date().getFullYear()} Qreek. Pool-powered payment flows for solo, enterprise, and communal use.
          </p>
        </div>
      </footer>
    </div>
  );
}
