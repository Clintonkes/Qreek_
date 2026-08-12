import React from 'react';
import Photo from './Photo';
import Reveal from './Reveal';

/* Adobe's "made with" gallery, translated to customer stories: an asymmetric
   photo mosaic where two cells run full height. */
const CASES = [
  { slot: 'storyAjo',        tall: true,  tag: 'Ajo Group',           color: '#00d4aa', title: 'Adaeze market women circle, 20 members',        body: 'Each member contributes ₦10,000 monthly via Flutterwave checkout. The activity feed shows who paid and who is pending. No more arguments, no more screenshots. Fee: ₦15 per contribution.' },
  { slot: 'storyMerchant',   tall: false, tag: 'Merchant',            color: '#f5a623', title: 'Tokunbo, a Lagos fashion designer',             body: 'Shares one Qreek link in her Instagram bio. Clients pay flexible amounts for deposits and custom orders. Every payment confirmed automatically. No account needed to pay.' },
  { slot: 'storyChurch',     tall: false, tag: 'Church',              color: '#2ed573', title: 'Pastor James building fund committee',          body: 'Creates a Qreek pool for building fund contributions. Members pay from anywhere in Nigeria. The committee sees the running total live. Every naira is accounted for with a receipt.' },
  { slot: 'storyEnterprise', tall: true,  tag: 'Enterprise',          color: '#9b59b6', title: 'TechBridge Solutions, 47 employees',            body: 'CFO confirms payroll in 4 minutes. All 47 salary transfers fire in parallel. Each employee gets a bank alert. Printable receipt for accounting. No subscription required.' },
  { slot: 'storyStudents',   tall: false, tag: 'Student Association', color: '#00d4aa', title: 'UNILAG Engineering, Final Year Levy',           body: 'Collects ₦15,000 project levy from 300 students via a Qreek pool. Members pay from their phones. Committee sees exactly who paid and who is outstanding. No cash-handling.' },
  { slot: 'storyAgency',     tall: false, tag: 'Small Business',      color: '#f5a623', title: 'Chidi web agency, collecting project deposits', body: 'Sends a Qreek payment link to each client instead of sharing account numbers. Client pays via card or bank transfer. Instant confirmation and a clean receipt every time.' },
];

export default function StoryMosaic() {
  return (
    <section style={{ padding: '5.5rem 0', background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ padding: '0 2rem', maxWidth: 1200, margin: '0 auto 2.25rem' }}>
        <Reveal>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5a623', marginBottom: '0.65rem' }}>Who uses Qreek</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.65rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0, maxWidth: 620 }}>Built for how Nigeria pays</h2>
        </Reveal>
      </div>

      <div className="story-mosaic" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', gridAutoRows: 'minmax(0, auto)' }}>
        {CASES.map((c, i) => (
          <Reveal
            key={c.slot}
            delay={i * 70}
            className={c.tall ? 'story-tall' : undefined}
            style={{
              gridRow: c.tall ? 'span 2' : undefined,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 18,
              overflow: 'hidden',
              transition: 'border-color 0.25s, transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}45`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 56px ${c.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Photo
              slot={c.slot}
              ratio={c.tall ? '3 / 4' : '16 / 10'}
              scrim="card"
              accent={c.color}
              sizes="(max-width: 768px) 100vw, 380px"
              className={c.tall ? 'story-photo-tall' : undefined}
              style={{ flex: c.tall ? 1 : 'none' }}
            >
              <div style={{ position: 'absolute', top: '0.9rem', left: '0.9rem', background: 'rgba(6,14,26,0.7)', backdropFilter: 'blur(10px)', color: c.color, border: `1px solid ${c.color}45`, borderRadius: 7, padding: '0.24rem 0.6rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                {c.tag}
              </div>
              <div style={{ position: 'absolute', left: '1.25rem', right: '1.25rem', bottom: '1rem', fontWeight: 800, fontSize: '0.96rem', lineHeight: 1.32, color: 'var(--text)', textShadow: '0 2px 12px rgba(6,14,26,0.9)' }}>
                {c.title}
              </div>
            </Photo>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.78, margin: 0, padding: '1.1rem 1.25rem 1.4rem' }}>{c.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
