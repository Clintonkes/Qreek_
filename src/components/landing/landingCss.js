/* Landing-page CSS that cannot live in an inline style object: keyframes,
   media queries, and scrollbar hiding. Injected once by Landing.jsx. */

export const GLOBAL_CSS = `
  @keyframes marqueeScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%      { opacity: 0.8;  transform: scale(1.06); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes payBar {
    from { width: 0%; }
    to   { width: 60%; }
  }
  @keyframes kenBurns {
    from { transform: scale(1.06); }
    to   { transform: scale(1.14); }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  .desktop-nav { display: flex; }

  @media (max-width: 900px) {
    /* Below three columns the tall cards no longer span two rows, so they must
       stop stretching — otherwise their neighbours inherit the dead height. */
    .story-mosaic      { grid-template-columns: 1fr 1fr !important; align-items: start !important; }
    .story-tall        { grid-row: auto !important; }
    .story-photo-tall  { flex: none !important; aspect-ratio: 16 / 10 !important; }
    .footer-cols       { grid-template-columns: 1fr 1fr !important; }
  }

  @media (max-width: 768px) {
    .desktop-nav      { display: none !important; }
    .mobile-menu-btn  { display: flex !important; }
    .hero-layout      { grid-template-columns: 1fr !important; }
    .hero-mockup      { display: none !important; }
    .hero-cats        { grid-template-columns: 1fr !important; }
    .hero-cat-mid     { border-right: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
    .hero-cat-last    { border-top: 1px solid rgba(255,255,255,0.07) !important; }
    .product-grid     { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .product-vis      { order: -1 !important; }
    .panel-mock       { position: static !important; width: 100% !important; margin-top: -2.5rem !important; }
    .modes-grid       { grid-template-columns: 1fr !important; }
    .how-grid         { grid-template-columns: 1fr !important; }
    .trust-grid-3     { grid-template-columns: 1fr !important; }
    .price-row        { grid-template-columns: 1fr 1fr !important; }
    .story-mosaic     { grid-template-columns: 1fr !important; }
    .hero-ctas        { flex-direction: column !important; align-items: stretch !important; }
    .hero-ctas a, .hero-ctas button { text-align: center !important; justify-content: center !important; }
    .rail-track       { padding: 0 1.25rem 1.25rem !important; }
  }

  @media (max-width: 480px) {
    .price-row   { grid-template-columns: 1fr !important; }
    .footer-cols { grid-template-columns: 1fr !important; }
  }

  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
  }

  .rail-track::-webkit-scrollbar { display: none; }
  .rail-track { scrollbar-width: none; -ms-overflow-style: none; }
`;

export function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* True when the visitor asked for reduced motion. Used to stop the hero and
   mode carousels from auto-advancing, which CSS alone cannot do. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
