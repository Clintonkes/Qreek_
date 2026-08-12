import React from 'react';
import { IMG, url, srcSetFor } from './images';

/* ─── Photo ────────────────────────────────────────────────────────────────
   Every photograph on the landing page renders through this wrapper so the
   treatment stays identical everywhere.

   Stock photography dropped straight onto #060e1a reads as pasted-in. Three
   things keep it on-brand:
     1. the image is desaturated and darkened slightly toward the palette,
     2. a scrim gradient sits on top so text always has something to sit on,
     3. an accent wash tints the scrim, so a teal card and an amber card read
        as siblings rather than two unrelated photos.

   scrim: 'hero'  left-to-right, for full-bleed sections with copy over them
          'card'  bottom-up, for image headers with a label at the base
          'panel' soft vignette, for large editorial images
          'none'  raw image
─────────────────────────────────────────────────────────────────────────── */

const SCRIMS = {
  hero: 'linear-gradient(100deg, var(--bg) 0%, rgba(6,14,26,0.94) 30%, rgba(6,14,26,0.62) 62%, rgba(6,14,26,0.30) 100%)',
  card: 'linear-gradient(180deg, rgba(6,14,26,0.10) 30%, rgba(6,14,26,0.55) 62%, rgba(6,14,26,0.93) 100%)',
  panel: 'linear-gradient(160deg, rgba(6,14,26,0.08) 0%, rgba(6,14,26,0.42) 55%, rgba(6,14,26,0.85) 100%)',
  none: 'none',
};

export default function Photo({
  slot,
  ratio = '16 / 10',
  accent,
  scrim = 'card',
  eager = false,
  sizes = '100vw',
  radius = 0,
  children,
  style,
  imgStyle,
  ...rest
}) {
  const src = IMG[slot];
  if (!src) return null;

  return (
    <div
      {...rest}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: ratio,
        background: 'var(--surface)',
        borderRadius: radius,
        ...style,
      }}
    >
      <img
        src={url(src.id, 1600)}
        srcSet={srcSetFor(src.id)}
        sizes={sizes}
        alt={src.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: src.pos || '50% 50%',
          filter: 'saturate(0.82) contrast(1.06) brightness(0.9)',
          ...imgStyle,
        }}
      />

      {/* Brand scrim, plus an accent wash so photos inherit their section colour */}
      {scrim !== 'none' && (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: SCRIMS[scrim], pointerEvents: 'none' }}
        />
      )}
      {accent && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(140deg, ${accent}22, transparent 55%)`,
            mixBlendMode: 'screen',
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />
      )}

      {children}
    </div>
  );
}

/* Small cropped thumbnail: circular avatars in the mockups, rounded squares
   in the hero category strip. */
export function Avatar({ slot, size = 50, accent = 'var(--teal)', radius = '50%' }) {
  const src = IMG[slot];
  if (!src) return null;
  return (
    <img
      src={url(src.id, 160)}
      alt=""
      loading="lazy"
      decoding="async"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        objectFit: 'cover',
        objectPosition: src.pos || '50% 50%',
        border: `1px solid ${accent}55`,
        filter: 'saturate(0.85) contrast(1.05)',
        display: 'block',
      }}
    />
  );
}
