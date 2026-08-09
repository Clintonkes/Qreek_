import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

/* ── Card dimensions (CSS-pixel coordinate space) ── */
const CARD_W = 400;
const CARD_H = 480;
const QR_CSS = 240;   // QR square side-length in CSS pixels

function fmtNgn(v) {
  return v ? `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })}` : '';
}

/* Universal rounded-rect path helper (arcTo is universally supported) */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/*
 * Draws the full payment card onto `canvas`.
 * S = canvas.width / CARD_W   → 1 for preview, 2 for print-quality download.
 * All coordinates are in CSS pixels; multiply by S for canvas pixels.
 */
async function renderCard(canvas, { url, title, isPool, isFlexible, amount }) {
  const S      = canvas.width / CARD_W;
  const W      = canvas.width;
  const H      = canvas.height;
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const ctx    = canvas.getContext('2d');
  const BX     = 28 * S;                  // left margin
  const MID    = (CARD_W / 2) * S;        // horizontal centre
  const QR     = QR_CSS * S;              // QR size in canvas px
  const qrX    = ((CARD_W - QR_CSS) / 2) * S;  // QR left edge (centred)
  const qrY    = 134 * S;                 // QR top edge

  ctx.clearRect(0, 0, W, H);

  /* ── White background ── */
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  /* ── Top accent bar ── */
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 8 * S);

  /* ── Brand: "Qreek" dark + "Finance" accent ── */
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';
  ctx.font         = `900 ${20 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#060e1a';
  ctx.fillText('Qreek', BX, 50 * S);
  const qw = ctx.measureText('Qreek').width;
  ctx.fillStyle = accent;
  ctx.fillText('Finance', BX + qw, 50 * S);

  /* ── Type label ── */
  ctx.font      = `700 ${9 * S}px Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText(isPool ? 'POOL COLLECTION' : 'PAYMENT LINK', BX, 70 * S);

  /* ── Payment title (capped at 36 chars) ── */
  const safeTitle = title.length > 36 ? title.slice(0, 35) + '…' : title;
  ctx.font      = `800 ${15 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#060e1a';
  ctx.fillText(safeTitle, BX, 96 * S);

  /* ── Amount ── */
  ctx.font      = `600 ${12 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.fillText(isFlexible ? 'Flexible amount' : fmtNgn(amount), BX, 116 * S);

  /* ── Soft shadow card behind QR ── */
  const pad = 10 * S;
  ctx.shadowColor   = 'rgba(0,0,0,0.07)';
  ctx.shadowBlur    = 12 * S;
  ctx.shadowOffsetY = 3  * S;
  ctx.fillStyle     = '#f7f7f7';
  rrect(ctx, qrX - pad, qrY - pad, QR + pad * 2, QR + pad * 2, 12 * S);
  ctx.fill();
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetY = 0;

  /* ── Generate & blit QR ── */
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, {
    width: QR,
    margin: 2,
    errorCorrectionLevel: 'H',   // H = 30 % damage tolerance → logo is safe
    color: { dark: '#060e1a', light: '#ffffff' },
  });
  ctx.drawImage(qrCanvas, qrX, qrY, QR, QR);

  /* ── Qreek centre logo ── */
  const cx = qrX + QR / 2;
  const cy = qrY + QR / 2;
  const r  = QR * 0.1;

  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.font         = `900 ${Math.round(r * 1.4)}px Arial, sans-serif`;
  ctx.fillStyle    = '#000000';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Q', cx, cy + Math.round(S));

  /* ── "Scan to pay" ── */
  const afterQR = 134 + QR_CSS + 22;   // = 396
  ctx.font         = `700 ${12 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#222222';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Scan to pay · No app or account needed', MID, afterQR * S);

  /* ── Payment URL (readable fallback) ── */
  const displayUrl = url.replace(/^https?:\/\//, '');
  const shortUrl   = displayUrl.length > 46 ? displayUrl.slice(0, 45) + '…' : displayUrl;
  ctx.font      = `500 ${9.5 * S}px monospace, Arial`;
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText(shortUrl, MID, (afterQR + 19) * S);

  /* ── Hairline divider ── */
  ctx.textAlign   = 'left';
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth   = 1 * S;
  ctx.beginPath();
  ctx.moveTo(BX, (afterQR + 38) * S);
  ctx.lineTo(W - BX, (afterQR + 38) * S);
  ctx.stroke();

  /* ── Footer ── */
  ctx.font      = `500 ${9 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#cccccc';
  ctx.textAlign = 'center';
  ctx.fillText('Secured by Flutterwave · CBN-licensed processing', MID, (afterQR + 58) * S);

  /* ── Bottom accent bar ── */
  ctx.fillStyle = accent;
  ctx.fillRect(0, H - 8 * S, W, 8 * S);
}

/* ════════════════════════ Component ═════════════════════════════════════ */
export default function QRCodeCard({ url, title, isPool, isFlexible, amount }) {
  const previewRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const data   = { url, title, isPool, isFlexible, amount };

  /* Render 1× preview on mount / prop change */
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !url) return;
    canvas.width  = CARD_W;
    canvas.height = CARD_H;
    renderCard(canvas, data);
  }, [url, title, isPool, isFlexible, amount]);

  /* Download high-DPI PNG (2×) — suitable for printing at any phone-print kiosk */
  const downloadPng = async () => {
    setBusy(true);
    try {
      const c    = document.createElement('canvas');
      c.width    = CARD_W * 2;
      c.height   = CARD_H * 2;
      await renderCard(c, data);
      const a    = document.createElement('a');
      a.href     = c.toDataURL('image/png');
      a.download = `qreek-pay-${isPool ? 'pool' : 'link'}.png`;
      a.click();
    } finally { setBusy(false); }
  };

  /* Open a print-ready window — user can Ctrl-P or Save as PDF.
     The clickable URL link below the card works in the browser window. */
  const openPrint = async () => {
    setBusy(true);
    try {
      const c  = document.createElement('canvas');
      c.width  = CARD_W * 2;
      c.height = CARD_H * 2;
      await renderCard(c, data);
      const img = c.toDataURL('image/png');

      const win = window.open('', '_blank', 'width=540,height=760');
      win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"/>
        <title>Pay — ${title}</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{display:flex;flex-direction:column;align-items:center;justify-content:center;
               min-height:100vh;background:#f2f2f2;font-family:system-ui,sans-serif;
               padding:2rem;gap:.85rem}
          .card{background:#fff;border-radius:14px;overflow:hidden;
                box-shadow:0 4px 24px rgba(0,0,0,.12);max-width:400px;width:100%}
          img{width:100%;display:block}
          a.paylink{font-size:.72rem;color:${accent};word-break:break-all;
                    text-align:center;max-width:400px;font-family:monospace;text-decoration:none}
          a.paylink:hover{text-decoration:underline}
          button{padding:.65rem 2.25rem;background:${accent};color:#000;border:none;
                 border-radius:8px;font-weight:800;cursor:pointer;font-size:.9rem}
          @media print{button{display:none!important}}
        </style>
      </head><body>
        <div class="card"><img src="${img}" alt="Qreek Payment Card"/></div>
        <a class="paylink" href="${url}" target="_blank">${url}</a>
        <button onclick="window.print()">Print / Save as PDF</button>
      </body></html>`);
      win.document.close();
    } finally { setBusy(false); }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Pay me via Qreek Finance:\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

      {/* Card preview — clicking it opens the checkout page */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        title="Click to open payment checkout"
        style={{ display: 'block', width: '100%', borderRadius: 12, overflow: 'hidden',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.14)', cursor: 'pointer',
                 transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.14)'; }}>
        <canvas ref={previewRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
      </a>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.55 }}>
        Click to open checkout &nbsp;·&nbsp; Scan with any phone camera to pay &nbsp;·&nbsp; No login needed
      </p>

      {/* Download + print */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
        <button onClick={downloadPng} disabled={busy}
          style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}40`,
                   borderRadius: 'var(--radius)', padding: '0.65rem', cursor: busy ? 'wait' : 'pointer',
                   fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.84rem' }}>
          {busy ? '…' : '↓ Download card'}
        </button>
        <button onClick={openPrint} disabled={busy}
          style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)',
                   borderRadius: 'var(--radius)', padding: '0.65rem', cursor: busy ? 'wait' : 'pointer',
                   fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.84rem' }}>
          ⎙ Print / PDF
        </button>
      </div>

      {/* WhatsApp share — sends the payment URL as a tappable text link */}
      <button onClick={shareWhatsApp}
        style={{ width: '100%', background: 'rgba(37,211,102,0.1)', color: '#25d366',
                 border: '1px solid rgba(37,211,102,0.3)', borderRadius: 'var(--radius)',
                 padding: '0.65rem', cursor: 'pointer', fontFamily: 'var(--font-display)',
                 fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center',
                 justifyContent: 'center', gap: '0.4rem' }}>
        Share payment link via WhatsApp
      </button>
    </div>
  );
}
