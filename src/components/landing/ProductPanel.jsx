import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'phosphor-react';
import Photo from './Photo';
import Reveal from './Reveal';

/* Alternating editorial block: copy on one side, a large photograph on the
   other with the product UI floated over its lower corner. */
export default function ProductPanel({ tag, headline, body, fee, cta, to, color, side, slot, MockupComponent }) {
  const isRight = side !== 'left';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5.5rem 2rem' }}>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.5rem', alignItems: 'center' }}>

        <Reveal dx={isRight ? -28 : 28} style={{ order: isRight ? 0 : 1 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color, marginBottom: '1rem' }}>{tag}</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.65rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em', textWrap: 'balance' }}>{headline}</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.88, marginBottom: '1.75rem' }}>{body}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: color, color: '#000', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 800, padding: '0.75rem 1.75rem', borderRadius: 999, fontFamily: 'var(--font-display)', boxShadow: `0 8px 26px ${color}30` }}>
              {cta} <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color, fontWeight: 700 }}>{fee}</span>
          </div>
        </Reveal>

        <Reveal dx={isRight ? 28 : -28} delay={80} className="product-vis" style={{ order: isRight ? 1 : 0, position: 'relative' }}>
          <Photo
            slot={slot}
            ratio="4 / 5"
            scrim="panel"
            accent={color}
            radius={20}
            sizes="(max-width: 768px) 100vw, 560px"
            style={{ border: `1px solid ${color}28`, boxShadow: `0 30px 80px rgba(0,0,0,0.45)` }}
          />
          {/* Product UI overlapping the outer lower corner, so the inner half of
              the photograph — the side facing the copy — stays visible. */}
          <div
            className="panel-mock"
            style={{
              position: 'absolute',
              [isRight ? 'right' : 'left']: '-1.5rem',
              bottom: '-2rem',
              width: '64%',
              zIndex: 2,
              filter: 'drop-shadow(0 30px 70px rgba(0,0,0,0.6))',
            }}
          >
            <MockupComponent />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
