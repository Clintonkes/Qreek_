import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const SIZE = 260;

export default function QRCodeCard({ url, title, isPool }) {
  const canvasRef = useRef(null);
  const accent = isPool ? '#f5a623' : '#00d4aa';
  const label  = isPool ? 'Pool collection' : 'Payment link';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    // errorCorrectionLevel H = up to 30% of QR can be covered — safe for our logo
    QRCode.toCanvas(canvas, url, {
      width: SIZE,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#060e1a', light: '#ffffff' },
    }).then(() => {
      const ctx = canvas.getContext('2d');
      const cx  = SIZE / 2;
      const cy  = SIZE / 2;
      const r   = SIZE * 0.1; // logo radius = 10% of QR width

      // White halo so the logo floats cleanly above the QR grid
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Accent circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();

      // Bold "Q" insignia
      const fontSize = Math.round(r * 1.3);
      ctx.font        = `900 ${fontSize}px 'Montserrat', system-ui, sans-serif`;
      ctx.fillStyle   = '#000000';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Q', cx, cy + 1);
    });
  }, [url, accent]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = `qreek-${isPool ? 'pool' : 'link'}-qr.png`;
    a.click();
  };

  const openPrintWindow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img  = canvas.toDataURL('image/png');
    const win  = window.open('', '_blank', 'width=420,height=640');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8" />
      <title>Qreek QR — ${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { min-height: 100vh; display: flex; flex-direction: column; align-items: center;
               justify-content: center; font-family: system-ui, -apple-system, sans-serif;
               background: #fff; padding: 2rem; gap: 0.75rem; }
        .brand { font-size: 1rem; font-weight: 900; color: #060e1a; letter-spacing: -0.02em; }
        .brand span { color: ${accent}; }
        h2 { font-size: 1rem; font-weight: 800; color: #060e1a; text-align: center; margin-top: 0.25rem; }
        .badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
                 letter-spacing: 0.12em; color: ${accent}; border: 1px solid ${accent}60;
                 border-radius: 999px; padding: 0.2rem 0.65rem; }
        .qr { border: 2px solid ${accent}50; border-radius: 14px; overflow: hidden; margin: 0.75rem 0; }
        img { width: 220px; height: 220px; display: block; }
        .sub { font-size: 0.7rem; color: #888; text-align: center; line-height: 1.55; }
        .url { font-family: monospace; font-size: 0.65rem; color: #aaa; word-break: break-all; text-align: center; }
        button { margin-top: 1.5rem; padding: 0.6rem 1.75rem; background: ${accent};
                 color: #000; border: none; border-radius: 8px; font-weight: 800;
                 cursor: pointer; font-size: 0.85rem; }
        @media print { button { display: none !important; } }
      </style>
    </head><body>
      <div class="brand">Qreek<span>Finance</span></div>
      <span class="badge">${label}</span>
      <h2>${title}</h2>
      <div class="qr"><img src="${img}" /></div>
      <p class="sub">Scan this QR code to pay</p>
      <p class="url">${url}</p>
      <button onclick="window.print()">Print / Save as PDF</button>
    </body></html>`);
    win.document.close();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Pay via Qreek Finance:\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {/* Type badge */}
      <span style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}45`, borderRadius: 999, padding: '0.22rem 0.75rem', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {label}
      </span>

      {/* QR canvas — clicking it opens the payment checkout page */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        title="Click to open payment page"
        style={{ display: 'block', borderRadius: 16, overflow: 'hidden', border: `2px solid ${accent}45`, boxShadow: `0 6px 28px ${accent}18`, transition: 'box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = `0 10px 40px ${accent}35`}
        onMouseLeave={e => e.currentTarget.style.boxShadow = `0 6px 28px ${accent}18`}>
        <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ display: 'block' }} />
      </a>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
        Scan to open checkout · Click to open in browser
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-3)', wordBreak: 'break-all', textAlign: 'center', lineHeight: 1.55 }}>{url}</p>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
        <button onClick={downloadPng}
          style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}40`, borderRadius: 'var(--radius)', padding: '0.6rem 0.5rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem' }}>
          ↓ Save PNG
        </button>
        <button onClick={openPrintWindow}
          style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.6rem 0.5rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem' }}>
          ⎙ Print / PDF
        </button>
      </div>

      {/* WhatsApp share — simplest sharing method for Nigeria */}
      <button onClick={shareWhatsApp}
        style={{ width: '100%', background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        Share link via WhatsApp
      </button>
    </div>
  );
}
