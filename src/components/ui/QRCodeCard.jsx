import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

async function getJsPDF() {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
}

/* Card dimensions (1× CSS pixels) */
const CARD_W  = 400;
const CARD_H  = 460;   // card image height — no button strip drawn on canvas
const QR_CSS  = 210;
const BTN_H   = 56;    // native PDF button height below the card image
const PDF_H   = CARD_H + BTN_H + 16; // total PDF page height

function fmtNgn(v) {
  return v ? `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })}` : '';
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

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
 * Draws the payment card on `canvas` — without a TAP button strip.
 * The PDF adds that as a native element below the image so it is
 * always visible and always correctly positioned.
 */
async function renderCard(canvas, { url, title, isPool, isFlexible, amount }) {
  const S      = canvas.width / CARD_W;
  const W      = canvas.width;
  const H      = canvas.height;
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const ctx    = canvas.getContext('2d');
  const BX     = 28 * S;
  const MID    = (CARD_W / 2) * S;
  const QR     = QR_CSS * S;
  const qrX    = ((CARD_W - QR_CSS) / 2) * S;
  const qrY    = 130 * S;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Top accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 8 * S);

  // Brand wordmark
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';
  ctx.font         = `900 ${20 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#060e1a';
  ctx.fillText('Qreek', BX, 50 * S);
  const qw = ctx.measureText('Qreek').width;
  ctx.fillStyle = accent;
  ctx.fillText('Finance', BX + qw, 50 * S);

  ctx.font      = `700 ${9 * S}px Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText(isPool ? 'POOL COLLECTION' : 'PAYMENT LINK', BX, 69 * S);

  // Title & amount
  const safeTitle = title.length > 36 ? title.slice(0, 35) + '…' : title;
  ctx.font      = `800 ${15 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#060e1a';
  ctx.fillText(safeTitle, BX, 94 * S);

  ctx.font      = `600 ${12 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.fillText(isFlexible ? 'Flexible amount' : fmtNgn(amount), BX, 115 * S);

  // QR shadow card
  const pad = 10 * S;
  ctx.shadowColor   = 'rgba(0,0,0,0.07)';
  ctx.shadowBlur    = 12 * S;
  ctx.shadowOffsetY = 3 * S;
  ctx.fillStyle     = '#f7f7f7';
  rrect(ctx, qrX - pad, qrY - pad, QR + pad * 2, QR + pad * 2, 12 * S);
  ctx.fill();
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetY = 0;

  // QR code
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, {
    width: QR, margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#060e1a', light: '#ffffff' },
  });
  ctx.drawImage(qrCanvas, qrX, qrY, QR, QR);

  // Centre Q logo
  const cx = qrX + QR / 2;
  const cy = qrY + QR / 2;
  const r  = QR * 0.1;
  ctx.beginPath(); ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = accent; ctx.fill();
  ctx.font         = `900 ${Math.round(r * 1.4)}px Arial, sans-serif`;
  ctx.fillStyle    = '#000000';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Q', cx, cy + Math.round(S));

  // Instructions
  const afterQR = 130 + QR_CSS + 18;
  ctx.font         = `700 ${11 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#333333';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Scan to pay. No app or account needed.', MID, afterQR * S);

  // Payment URL (visible text for reference / Google Lens recognition)
  const displayUrl = url.replace(/^https?:\/\//, '');
  ctx.font         = `600 ${9.5 * S}px monospace, Arial`;
  ctx.fillStyle    = '#aaaaaa';
  ctx.fillText(displayUrl, MID, (afterQR + 18) * S);

  // Divider
  const divY = afterQR + 36;
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth   = 1 * S;
  ctx.textAlign   = 'left';
  ctx.beginPath();
  ctx.moveTo(BX, divY * S);
  ctx.lineTo(W - BX, divY * S);
  ctx.stroke();

  // Footer
  ctx.font         = `500 ${9 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#cccccc';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Secured by Flutterwave. CBN-licensed processing.', MID, (divY + 18) * S);

  // Bottom accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, H - 8 * S, W, 8 * S);
}

/*
 * ── PDF Download ─────────────────────────────────────────────────────────────
 *
 * Fix    : TAP HERE TO PAY is now a native jsPDF rectangle + text element
 *          drawn BELOW the card image — not pixels embedded in the JPEG.
 * Error  : The button was drawn on the canvas and baked into the JPEG.
 *          JPEG compression + PDF coordinate-space mismatch meant the button
 *          was either invisible or its link annotation was offset from it.
 * Line   : pdf.roundedRect / pdf.text / pdf.link calls below.
 * Page   : src/components/ui/QRCodeCard.jsx
 * System : PDF opened on phone, user saw the card but not the button,
 *          because raster pixels inside a JPEG cannot be interacted with.
 * Concept: pdf.roundedRect(), pdf.text(), and pdf.link() all operate in the
 *          same native PDF coordinate space (top-left origin, px units with
 *          px_scaling hotfix). Every compliant PDF viewer renders and
 *          hit-tests them in one pass, so the tappable region is always
 *          exactly where the visible button is drawn.
 */
async function downloadPdf({ url, title, isPool, isFlexible, amount }) {
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const [ar, ag, ab] = hexToRgb(accent);

  // Render card at 2× for crisp text
  const c  = document.createElement('canvas');
  c.width  = CARD_W * 2;
  c.height = CARD_H * 2;
  await renderCard(c, { url, title, isPool, isFlexible, amount });
  const imgData = c.toDataURL('image/jpeg', 0.96);

  const jsPDF = await getJsPDF();
  // Page is slightly taller than the card to hold the native button below
  const pdf = new jsPDF({ unit: 'px', format: [CARD_W, PDF_H], hotfixes: ['px_scaling'] });

  // Card image fills the top portion
  pdf.addImage(imgData, 'JPEG', 0, 0, CARD_W, CARD_H);

  // Native PDF button — drawn after the card image so it appears below it
  const btnX = 28;
  const btnY = CARD_H + 8;
  const btnW = CARD_W - 56;

  pdf.setFillColor(ar, ag, ab);
  pdf.roundedRect(btnX, btnY, btnW, BTN_H, 8, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(0, 0, 0);
  pdf.text('TAP HERE TO PAY  →', CARD_W / 2, btnY + BTN_H / 2 + 5, { align: 'center' });

  // Link annotation sits exactly on top of the native button — always aligned
  pdf.link(btnX, btnY, btnW, BTN_H, { url });

  pdf.save(`qreek-pay-${isPool ? 'pool' : 'link'}.pdf`);
}

/* ── Share via native share sheet (mobile) ── */
async function shareCard({ url, title, isPool, isFlexible, amount }) {
  const c  = document.createElement('canvas');
  c.width  = CARD_W * 2;
  c.height = CARD_H * 2;
  await renderCard(c, { url, title, isPool, isFlexible, amount });
  const imgData = c.toDataURL('image/jpeg', 0.96);

  const accent = isPool ? '#f5a623' : '#00d4aa';
  const [ar, ag, ab] = hexToRgb(accent);

  const jsPDF = await getJsPDF();
  const pdf   = new jsPDF({ unit: 'px', format: [CARD_W, PDF_H], hotfixes: ['px_scaling'] });
  pdf.addImage(imgData, 'JPEG', 0, 0, CARD_W, CARD_H);

  const btnX = 28, btnY = CARD_H + 8, btnW = CARD_W - 56;
  pdf.setFillColor(ar, ag, ab);
  pdf.roundedRect(btnX, btnY, btnW, BTN_H, 8, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(0, 0, 0);
  pdf.text('TAP HERE TO PAY  →', CARD_W / 2, btnY + BTN_H / 2 + 5, { align: 'center' });
  pdf.link(btnX, btnY, btnW, BTN_H, { url });

  const blob = pdf.output('blob');
  const file = new File([blob], 'qreek-payment-card.pdf', { type: 'application/pdf' });

  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `Pay ${title} via Qreek` });
  } else {
    // Desktop: just download
    const href = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = href;
    a.download = 'qreek-payment-card.pdf';
    a.click();
    URL.revokeObjectURL(href);
  }
}

export default function QRCodeCard({ url, title, isPool, isFlexible, amount }) {
  const previewRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const data   = { url, title, isPool, isFlexible, amount };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !url) return;
    canvas.width  = CARD_W;
    canvas.height = CARD_H;
    renderCard(canvas, data);
  }, [url, title, isPool, isFlexible, amount]);

  const handleDownload = async () => {
    setBusy(true);
    try { await downloadPdf(data); }
    finally { setBusy(false); }
  };

  const handleShare = async () => {
    setBusy(true);
    try { await shareCard(data); }
    catch (err) { if (err?.name !== 'AbortError') console.warn('Share failed:', err); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

      {/* Preview — click opens checkout in new tab */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', width: '100%', borderRadius: 12, overflow: 'hidden',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer',
                 transition: 'transform 0.18s, box-shadow 0.18s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}>
        <canvas ref={previewRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
      </a>

      {/* What the PDF looks like */}
      <div style={{ width: '100%', background: accent + '18', border: `1px solid ${accent}40`,
                    borderRadius: 'var(--radius)', padding: '0.65rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.1rem' }}>📄</span>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
          The PDF has a <strong style={{ color: accent }}>TAP HERE TO PAY</strong> button below the card.
          Whoever opens it taps that button — they go straight to your checkout.
        </div>
      </div>

      {/* Primary: download PDF */}
      <button onClick={handleDownload} disabled={busy}
        style={{ width: '100%', background: accent, color: '#000', border: 'none',
                 borderRadius: 'var(--radius)', padding: '0.85rem', cursor: busy ? 'wait' : 'pointer',
                 fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.95rem',
                 boxShadow: `0 6px 20px ${accent}40` }}>
        {busy ? '…' : '↓ Download payment card (PDF)'}
      </button>

      <p style={{ fontSize: '0.71rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.65, marginTop: '-0.3rem' }}>
        Save once to your phone. Share on WhatsApp, Telegram, email, anywhere.<br />
        No Qreek account needed to pay.
      </p>

      {/* Secondary: native share sheet */}
      <button onClick={handleShare} disabled={busy}
        style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text-1)',
                 border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                 padding: '0.7rem', cursor: busy ? 'wait' : 'pointer',
                 fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem' }}>
        {busy ? '…' : '⬆ Share card directly'}
      </button>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textAlign: 'center', marginTop: '-0.4rem' }}>
        Opens your phone's share sheet — pick any app.
      </p>
    </div>
  );
}
