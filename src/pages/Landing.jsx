import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRates } from '../api/rates.js';

const TRUST_PILLS = ['🔐 Identity verified', '0.25% pool fee', '6 cryptocurrencies', 'All Nigerian banks'];

const CHAT_MESSAGES = [
  { from: 'user', text: 'sell 100 USDT' },
  { from: 'bot',  text: '💸 Live rate: ₦1,580/USDT\nYou receive: ₦157,605\nWhich account to pay?' },
  { from: 'user', text: '0123456789 058' },
  { from: 'bot',  text: '✅ Done! ₦157,605 → GTBank ****6789\nArrives in under 5 minutes.' },
];

const FEATURES = [
  { icon: '💸', title: 'Sell crypto', desc: 'Sell USDT, BTC, ETH, BNB, SOL, USDC. Naira in under 5 minutes to any Nigerian bank.' },
  { icon: '🛒', title: 'Buy crypto', desc: 'Buy crypto with NGN. Pay via virtual bank account. Credit in minutes.' },
  { icon: '🏦', title: 'Trading pools', desc: 'Join a group pool and pay just 0.25% — the lowest fee in Nigeria.' },
  { icon: '👨‍👩‍👧', title: 'Family pools', desc: 'Create shared NGN wallets for family savings and group transfers.' },
  { icon: '📤', title: 'Send by phone', desc: 'Send crypto to any Qreek user by phone number. 0.1% fee.' },
  { icon: '🔔', title: 'Price alerts', desc: 'Set a target price and get notified the moment the market hits it.' },
];

const FEES = [
  { label: 'Pool trades', value: '0.25%', desc: 'Lowest in Nigeria' },
  { label: 'External trades', value: '0.40%', desc: 'Still cheaper than exchanges' },
  { label: 'Send crypto', value: '0.10%', desc: 'By phone number' },
  { label: 'NGN transfers', value: '0.30%', desc: 'Fiat pool sends' },
  { label: 'Withdrawal fee', value: '₦0', desc: 'Never charged' },
  { label: 'Hidden charges', value: 'None', desc: 'Guaranteed' },
];

const HOW = [
  { step: '01', title: 'Create account', desc: 'Phone number, name, and a 4-digit PIN. Verified in seconds.' },
  { step: '02', title: 'Place your trade', desc: 'Type what you want — sell 100 USDT, buy 0.002 BTC. See live rate and exact fee before confirming.' },
  { step: '03', title: 'Naira hits your bank', desc: 'Confirm with PIN. Tell us which account to pay. Any Nigerian bank. NGN in under 5 minutes.' },
];

function Nav({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(6,14,26,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'var(--trans)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#features" style={{ color: 'var(--text-2)', fontSize: '0.9rem', display: 'none' }} className="desktop-link">Features</a>
          <a href="#fees"     style={{ color: 'var(--text-2)', fontSize: '0.9rem', display: 'none' }} className="desktop-link">Fees</a>
          <Link to="/login"    style={{ color: 'var(--text-2)', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>Log in</Link>
          <Link to="/register" style={{
            background: 'var(--teal)', color: 'var(--text-inv)', fontFamily: 'var(--font-display)',
            fontWeight: 600, padding: '0.55rem 1.1rem', borderRadius: 'var(--radius)', fontSize: '0.88rem',
          }}>Get started</Link>
        </nav>
      </div>
      <style>{`@media(min-width:768px){.desktop-link{display:inline!important}}`}</style>
    </header>
  );
}

function ChatMockup() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const timers = CHAT_MESSAGES.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 800 + i * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '1.25rem',
      maxWidth: 340, width: '100%',
      boxShadow: 'var(--shadow-teal), var(--shadow-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-2)' }}>Qreek Chat</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: 180 }}>
        <AnimatePresence>
          {CHAT_MESSAGES.slice(0, visible).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                background: msg.from === 'bot' ? 'var(--surface-2)' : 'var(--teal)',
                color: msg.from === 'bot' ? 'var(--text)' : 'var(--text-inv)',
                padding: '0.5rem 0.8rem', borderRadius: 10,
                fontSize: '0.78rem', whiteSpace: 'pre-wrap', maxWidth: '85%',
                fontFamily: msg.from === 'bot' ? 'var(--font-mono)' : 'var(--font-body)',
                border: msg.from === 'bot' ? '1px solid var(--border)' : 'none',
              }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RatesTicker({ rates }) {
  const coins = ['USDT','BTC','ETH','BNB','SOL','USDC'];
  const items = coins.filter(c => rates[c]?.rate > 0);
  if (!items.length) return null;

  const Strip = () => (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', paddingRight: '2.5rem', flexShrink: 0 }}>
      {items.map(coin => {
        const { rate, change } = rates[coin];
        const up = change >= 0;
        const fmt = rate >= 1_000_000 ? `₦${(rate/1_000_000).toFixed(2)}M` : `₦${rate.toLocaleString('en-NG',{maximumFractionDigits:0})}`;
        return (
          <span key={coin} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem' }}>{coin}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{fmt}</span>
            <span style={{ fontSize: '0.72rem', color: up ? 'var(--green)' : 'var(--red)' }}>
              {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '0.65rem 0' }}>
      <div style={{ display: 'flex', animation: 'ticker 25s linear infinite' }}>
        <Strip /><Strip />
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [rates, setRates]       = useState({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getRates().then(d => setRates(d.rates || {})).catch(() => {});
  }, []);

  return (
    <div>
      <Nav scrolled={scrolled} />

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: 'calc(5rem + 64px) 1.5rem 5rem', maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--teal-faint)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem',
              fontSize: '0.78rem', color: 'var(--teal)', fontFamily: 'var(--font-display)', fontWeight: 600,
              marginBottom: '1.5rem',
            }}>
              ⚡ Under 5 minutes · Live market rates
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.25rem' }}>
              Sell crypto. Get Naira.{' '}
              <span style={{ color: 'var(--teal)' }}>Instantly.</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              No exchange account. No waiting. Live rates, one fee shown upfront, NGN in any Nigerian bank in under 5 minutes.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              <Link to="/register" style={{
                background: 'var(--teal)', color: 'var(--text-inv)',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                padding: '0.85rem 1.75rem', borderRadius: 'var(--radius)', fontSize: '1rem',
              }}>Start trading →</Link>
              <Link to="/login" style={{
                background: 'transparent', color: 'var(--text)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 600,
                padding: '0.85rem 1.75rem', borderRadius: 'var(--radius)', fontSize: '1rem',
              }}>Log in</Link>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TRUST_PILLS.map(p => (
                <span key={p} style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem', color: 'var(--text-2)', fontFamily: 'var(--font-display)',
                }}>{p}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChatMockup />
          </div>
        </div>
      </section>

      <RatesTicker rates={rates} />

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '3rem' }}>Three steps. Under five minutes.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {HOW.map(({ step, title, desc }) => (
            <div key={step} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 700, color: 'var(--border-light)', lineHeight: 1, marginBottom: '1rem', userSelect: 'none' }}>{step}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>Everything you need to move money fast</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '3rem' }}>Six powerful features. One simple interface.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid transparent', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'var(--trans)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--teal)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee comparison */}
      <section id="fees" style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>The cheapest transparent rates in Nigeria.</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '3rem', maxWidth: 500 }}>
          Every fee is shown before you confirm. No surprises.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {FEES.map(({ label, value, desc }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.4rem' }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--teal-faint) 0%, var(--bg) 100%)',
        borderTop: '1px solid var(--teal-border)',
      }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', marginBottom: '0.75rem' }}>Ready to move faster?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem', fontSize: '1rem' }}>
          No download. No exchange account. Live rates, one fee.
        </p>
        <Link to="/register" style={{
          display: 'inline-block', background: 'var(--amber)', color: 'var(--text-inv)',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          padding: '1rem 2.5rem', borderRadius: 'var(--radius)', fontSize: '1.05rem',
        }}>Create free account →</Link>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Finance</span>
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="#features" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Features</a>
            <a href="#fees"     style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Fees</a>
            <Link to="/login"    style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Login</Link>
            <Link to="/register" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Sign up</Link>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', width: '100%' }}>
            © {new Date().getFullYear()} Qreek Finance. All fees shown before you confirm any trade.
          </p>
        </div>
      </footer>
    </div>
  );
}
