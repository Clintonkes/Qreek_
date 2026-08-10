import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

async function getJsPDF() {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
}

const CARD_W = 400;   // px at 1× scale
const CARD_H = 520;
const QR_CSS = 220;

function fmtNgn(v) {
  return v ? `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })}` : '';
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
 * Draws the full payment card on `canvas`.
 * S = canvas.width / CARD_W — all coordinates scale with it,
 * so the same function works for 1× preview and 2× export.
 *
 * Returns the Y position (in CARD_W units) of the clickable URL strip,
 * so the PDF annotation can be positioned exactly on top of it.
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
  const qrY    = 140 * S;

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
  ctx.fillText('Qreek', BX, 52 * S);
  const qw = ctx.measureText('Qreek').width;
  ctx.fillStyle = accent;
  ctx.fillText('Finance', BX + qw, 52 * S);

  // Link type
  ctx.font      = `700 ${9 * S}px Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText(isPool ? 'POOL COLLECTION' : 'PAYMENT LINK', BX, 72 * S);

  // Title & amount
  const safeTitle = title.length > 36 ? title.slice(0, 35) + '…' : title;
  ctx.font      = `800 ${15 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#060e1a';
  ctx.fillText(safeTitle, BX, 98 * S);

  ctx.font      = `600 ${12 * S}px Arial, sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.fillText(isFlexible ? 'Flexible amount' : fmtNgn(amount), BX, 120 * S);

  // QR shadow card
  const pad = 10 * S;
  ctx.shadowColor   = 'rgba(0,0,0,0.07)';
  ctx.shadowBlur    = 12 * S;
  ctx.shadowOffsetY = 3 * S;
  ctx.fillStyle     = '#f7f7f7';
  rrect(ctx, qrX - pad, qrY - pad, QR + pad * 2, QR + pad * 2, 12 * S);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
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

  // "Scan to pay" label
  const afterQR = 140 + QR_CSS + 20;
  ctx.font         = `700 ${11.5 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#222222';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Scan to pay. No app or account needed.', MID, afterQR * S);

  // ── Tap-to-Pay strip ──
  // This rectangle becomes the PDF link annotation target.
  // It is drawn prominently so recipients know to tap it.
  const stripY = afterQR + 16;   // in CARD_W coordinate units (not scaled)
  const stripH = 52;
  ctx.fillStyle   = accent;
  rrect(ctx, BX, stripY * S, (W - BX * 2), stripH * S, 8 * S);
  ctx.fill();

  ctx.font         = `900 ${14 * S}px Arial, sans-serif`;
  ctx.fillStyle    = '#000000';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAP HERE TO PAY  →', MID, (stripY + stripH / 2) * S);

  // URL as small text below strip (for reference / copy-paste)
  const displayUrl = url.replace(/^https?:\/\//, '');
  ctx.font         = `500 ${9 * S}px monospace, Arial`;
  ctx.fillStyle    = '#aaaaaa';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(displayUrl, MID, (stripY + stripH + 16) * S);

  // Divider
  const divY = stripY + stripH + 34;
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
  ctx.fillText('Secured by Flutterwave. CBN-licensed processing.', MID, (divY + 20) * S);

  // Bottom accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, H - 8 * S, W, 8 * S);

  // Return strip geometry in CARD_W-unit coordinates for PDF annotation
  return { stripY, stripH, stripX: 28, stripW: CARD_W - 56 };
}

/*
 * ── PDF Download ────────────────────────────────────────────────────────────
 */
async function downloadPdf({ url, title, isPool, isFlexible, amount }) {
  // Render card at 2× to keep text crisp in the PDF
  const c  = document.createElement('canvas');
  c.width  = CARD_W * 2;
  c.height = CARD_H * 2;
  const strip = await renderCard(c, { url, title, isPool, isFlexible, amount });
  const imgData = c.toDataURL('image/jpeg', 0.96);

  // PDF dimensions match card in points (1pt ≈ 1.333px at 96dpi)
  const jsPDF = await getJsPDF();
  const pdf   = new jsPDF({ unit: 'px', format: [CARD_W, CARD_H], hotfixes: ['px_scaling'] });

  // Embed the card image
  pdf.addImage(imgData, 'JPEG', 0, 0, CARD_W, CARD_H);

  // Invisible clickable annotation over the "TAP HERE TO PAY" strip.
  // jsPDF .link(x, y, w, h, { url }) writes an /Annot /Link /URI entry.
  // Any PDF viewer on any device will open url when this region is tapped.
  pdf.link(strip.stripX, strip.stripY, strip.stripW, strip.stripH, { url });

  pdf.save(`qreek-pay-${isPool ? 'pool' : 'link'}.pdf`);
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

  const handleDownloadPdf = async () => {
    setBusy(true);
    try { await downloadPdf(data); }
    finally { setBusy(false); }
  };

  // Native share sheet (mobile): sends the PDF file via any app the user picks.
  // WhatsApp receives it as a document with the clickable link inside.
  const handleShare = async () => {
    setBusy(true);
    try {
      const c  = document.createElement('canvas');
      c.width  = CARD_W * 2;
      c.height = CARD_H * 2;
      await renderCard(c, data);
      const imgData = c.toDataURL('image/jpeg', 0.96);

      const jsPDF = await getJsPDF();
      const pdf   = new jsPDF({ unit: 'px', format: [CARD_W, CARD_H], hotfixes: ['px_scaling'] });
      pdf.addImage(imgData, 'JPEG', 0, 0, CARD_W, CARD_H);
      // Strip geometry matches renderCard's stripY = afterQR+16 = (140+220+20)+16 = 396
      pdf.link(28, 396, CARD_W - 56, 52, { url });

      const pdfBlob = pdf.output('blob');
      const file    = new File([pdfBlob], 'qreek-payment-card.pdf', { type: 'application/pdf' });

      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Pay ${title} via Qreek` });
      } else {
        // Desktop fallback: just download the PDF
        const href = URL.createObjectURL(pdfBlob);
        const a    = document.createElement('a');
        a.href     = href;
        a.download = 'qreek-payment-card.pdf';
        a.click();
        URL.revokeObjectURL(href);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.warn('Share failed:', err);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

      {/* Preview — clicking the card opens checkout */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        title="Click to open payment checkout"
        style={{ display: 'block', width: '100%', borderRadius: 12, overflow: 'hidden',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer',
                 transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}>
        <canvas ref={previewRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
      </a>

      {/* Primary — download the PDF */}
      <button onClick={handleDownloadPdf} disabled={busy}
        style={{ width: '100%', background: accent, color: '#000', border: 'none',
                 borderRadius: 'var(--radius)', padding: '0.85rem', cursor: busy ? 'wait' : 'pointer',
                 fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.95rem',
                 boxShadow: `0 6px 20px ${accent}40` }}>
        {busy ? '…' : '↓ Download payment card (PDF)'}
      </button>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.65, marginTop: '-0.3rem' }}>
        Save once. Share to anyone on WhatsApp, Telegram, email, anywhere.<br/>
        They open it and tap <strong style={{ color: 'var(--text-2)' }}>TAP HERE TO PAY</strong> — no account needed.
      </p>

      {/* Secondary — native share sheet on mobile */}
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
