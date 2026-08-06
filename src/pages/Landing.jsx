import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  :root {
    --ink:       #070710;
    --ink-2:     #0b0b18;
    --ink-3:     #101020;
    --teal:      #00d4aa;
    --amber:     #f59e0b;
    --violet:    #8b5cf6;
    --green:     #22c55e;
    --slate:     #94a3b8;
    --slate-2:   #64748b;
    --font-display: 'Syne', system-ui, sans-serif;
    --font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    font-family: var(--font-body);
    background: var(--ink);
    color: #f1f5f9;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Keyframes ── */
  @keyframes shimmerText {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes meshDrift {
    0%   { transform: translate(0,0) scale(1); }
    40%  { transform: translate(2%,-2%) scale(1.05); }
    80%  { transform: translate(-1.5%,1.5%) scale(0.97); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes floatOrb {
    0%,100% { opacity:.25; transform:scale(1) translate(0,0); }
    50%      { opacity:.55; transform:scale(1.1) translate(1%,-1%); }
  }
  @keyframes floatDot {
    0%,100% { transform:translateY(0) translateX(0); opacity:.4; }
    33%      { transform:translateY(-18px) translateX(6px); opacity:.7; }
    66%      { transform:translateY(-8px) translateX(-8px); opacity:.5; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes fadeRight {
    from { opacity:0; transform:translateX(-18px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes fadeLeft {
    from { opacity:0; transform:translateX(18px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.86); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes rippleOut {
    from { transform:scale(0); opacity:.45; }
    to   { transform:scale(3.5); opacity:0; }
  }
  @keyframes spinBorder {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes checkBounce {
    0%   { transform:scale(0); opacity:0; }
    60%  { transform:scale(1.25); }
    100% { transform:scale(1); opacity:1; }
  }

  /* ── Scene animations ── */
  @keyframes poolBar  { from{width:0} to{width:60%} }
  @keyframes rowIn    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
  @keyframes notifIn  { from{opacity:0;transform:translateX(20px) scale(.94)} to{opacity:1;transform:none scale(1)} }
  @keyframes receiptUp{ from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes deptFill { from{width:0} to{width:100%} }

  /* ── Responsive ── */
  .nav-links { display:flex; }
  .nav-ham   { display:none !important; }
  @media(max-width:768px){
    .nav-links     { display:none !important; }
    .nav-ham       { display:flex !important; }
    .tiles-grid    { grid-template-columns:1fr !important; }
    .product-grid  { grid-template-columns:1fr !important; }
    .flip-order    { order:-1 !important; }
    .modes-layout  { grid-template-columns:1fr !important; }
    .steps-grid    { grid-template-columns:1fr !important; }
    .browser-scene { min-height:320px !important; }
    .stats-row     { grid-template-columns:1fr !important; }
    .price-list    { grid-template-columns:1fr 1fr !important; }
  }
  @media(max-width:480px){
    .price-list { grid-template-columns:1fr !important; }
  }
  @media(prefers-reduced-motion:reduce){
    *{ animation-duration:.01ms !important; transition-duration:.01ms !important; }
  }
  .scroll-x::-webkit-scrollbar{ display:none; }
  .scroll-x { scrollbar-width:none; -webkit-overflow-scrolling:touch; }
`;

function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ─── Scroll reveal ──────────────────────────────────────────────────────── */
function Reveal({ children, delay=0, dy=22, dx=0, scale=false, style, ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold:.06 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const from = scale ? 'scale(.9)' : `translate(${dx}px,${dy}px)`;
  return (
    <div ref={ref} {...rest} style={{ opacity:vis?1:0, transform:vis?'none':from, transition:`opacity .8s ${delay}ms cubic-bezier(.22,1,.36,1), transform .8s ${delay}ms cubic-bezier(.22,1,.36,1)`, ...style }}>
      {children}
    </div>
  );
}

/* ─── 3D Tilt Card ───────────────────────────────────────────────────────── */
function TiltCard({ children, color='#00d4aa', borderRadius=20, style, className }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx:0, ry:0 });
  const [shine, setShine] = useState({ x:50, y:50 });
  const [hov, setHov] = useState(false);
  const [ripples, setRipples] = useState([]);

  const compute = useCallback((clientX, clientY) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((clientY - cy) / (rect.height / 2)) * -9;
    const ry = ((clientX - cx) / (rect.width / 2)) * 9;
    const sx = ((clientX - rect.left) / rect.width) * 100;
    const sy = ((clientY - rect.top) / rect.height) * 100;
    setTilt({ rx, ry });
    setShine({ x:sx, y:sy });
  }, []);

  const onMove = useCallback((e) => compute(e.clientX, e.clientY), [compute]);
  const onTouch = useCallback((e) => {
    const t = e.touches[0];
    if (t) compute(t.clientX, t.clientY);
  }, [compute]);

  const addRipple = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  }, []);

  const reset = useCallback(() => {
    setHov(false);
    setTilt({ rx:0, ry:0 });
  }, []);

  return (
    <div ref={ref}
      className={className}
      onMouseEnter={() => setHov(true)}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onMouseDown={addRipple}
      onTouchStart={(e) => { setHov(true); onTouch(e); addRipple(e); }}
      onTouchMove={onTouch}
      onTouchEnd={reset}
      style={{
        borderRadius,
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hov?1.03:1})`,
        transition: hov ? 'transform .12s ease, box-shadow .3s ease' : 'transform .7s cubic-bezier(.22,1,.36,1), box-shadow .5s ease',
        boxShadow: hov ? `0 32px 90px ${color}22, 0 0 0 1px ${color}33, inset 0 1px 0 rgba(255,255,255,0.08)` : '0 2px 16px rgba(0,0,0,.4)',
        position:'relative',
        overflow:'hidden',
        willChange:'transform',
        cursor:'default',
        ...style,
      }}>
      {/* Shine */}
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', background:`radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,${hov?.09:0}) 0%, transparent 55%)`, transition:hov?'none':'opacity .5s', pointerEvents:'none', zIndex:3 }} />
      {/* Border glow */}
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', border:`1px solid ${hov ? color+'45' : 'rgba(255,255,255,0.07)'}`, transition:'border-color .3s', pointerEvents:'none', zIndex:3 }} />
      {/* Ripples */}
      {ripples.map(rp => (
        <div key={rp.id} style={{ position:'absolute', left:`${rp.x}%`, top:`${rp.y}%`, width:60, height:60, borderRadius:'50%', background:`${color}22`, transform:'translate(-50%,-50%)', animation:'rippleOut .65s ease forwards', pointerEvents:'none', zIndex:4 }} />
      ))}
      {children}
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function CountUp({ to, prefix='', suffix='', decimals=0, duration=1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [going, setGoing] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !going) { setGoing(true); io.disconnect(); } }, { threshold:.5 });
    io.observe(el); return () => io.disconnect();
  }, [going]);
  useEffect(() => {
    if (!going) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(+(eased * to).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [going, to, duration, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>;
}

/* ─── Cursor spotlight (hero) ────────────────────────────────────────────── */
function CursorSpotlight({ containerRef }) {
  const [pos, setPos] = useState({ x:50, y:50 });
  useEffect(() => {
    const fn = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
    };
    window.addEventListener('mousemove', fn, { passive:true });
    return () => window.removeEventListener('mousemove', fn);
  }, [containerRef]);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(700px circle at ${pos.x}% ${pos.y}%, rgba(0,212,170,0.065), transparent 48%)`, transition:'background .08s linear', zIndex:1 }} />
  );
}

/* ─── Magnetic button ────────────────────────────────────────────────────── */
function MagBtn({ children, style, to, onClick }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({ x: (e.clientX - cx) * .28, y: (e.clientY - cy) * .28 });
  };
  const onLeave = () => setOffset({ x:0, y:0 });
  const inner = (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ display:'inline-flex', transform:`translate(${offset.x}px,${offset.y}px)`, transition:'transform .3s cubic-bezier(.22,1,.36,1)', ...style }}>
      {children}
    </span>
  );
  return to ? <Link to={to} style={{ textDecoration:'none' }}>{inner}</Link> : <button onClick={onClick} style={{ background:'none', border:'none', padding:0, cursor:'pointer' }}>{inner}</button>;
}

/* ══════════════ VIDEO SLIDESHOW ══════════════════════════════════════════ */
function Scene1({ active, sceneKey }) {
  const C = '#00d4aa';
  const rows = [
    { n:'Adaeze O.', a:'₦10,000', t:'1 min ago',  ok:true },
    { n:'Tunde K.',  a:'₦10,000', t:'4 min ago',  ok:true },
    { n:'James E.',  a:'₦10,000', t:'8 min ago',  ok:true },
    { n:'Ngozi B.',  a:'—',        t:'Pending',    ok:false },
    { n:'Chisom A.', a:'—',        t:'Pending',    ok:false },
  ];
  return (
    <div key={sceneKey} style={{ position:'absolute', inset:0, opacity:active?1:0, transition:'opacity .6s ease', padding:'1.75rem', background:'radial-gradient(ellipse at 18% 18%, rgba(0,212,170,0.06), transparent 50%), radial-gradient(ellipse at 82% 82%, rgba(99,102,241,0.05), transparent 50%)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', height:'100%' }}>
        <div style={{ animation:'fadeRight .5s .08s ease both' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:C, marginBottom:'.4rem' }}>Pool · Communal</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', fontWeight:800, marginBottom:'.15rem', letterSpacing:'-.02em' }}>Adaeze Market Circle</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'2rem', fontWeight:700, color:C, lineHeight:1, animation:'fadeUp .4s .35s ease both' }}>₦240,000</div>
          <div style={{ fontSize:'.72rem', color:'var(--slate)', marginBottom:'.9rem' }}>of ₦400,000 target</div>
          <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:99, marginBottom:'1rem', overflow:'hidden' }}>
            <div style={{ height:'100%', background:`linear-gradient(90deg,${C},#00ffca)`, borderRadius:99, animation:'poolBar 1.1s .5s ease both', boxShadow:`0 0 12px ${C}80` }} />
          </div>
          {[['17','Paid'],['3','Pending'],['20','Total']].map(([v,l],i) => (
            <div key={l} style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'.55rem .7rem', marginRight:'.45rem', animation:`fadeUp .35s ${.55+i*.08}s ease both` }}>
              <span style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:'1.2rem', color:C }}>{v}</span>
              <span style={{ fontSize:'.64rem', color:'var(--slate-2)', marginTop:1 }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ animation:'fadeLeft .5s .12s ease both' }}>
          <div style={{ fontSize:'.62rem', fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.65rem' }}>Live Activity</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.38rem', marginBottom:'.85rem' }}>
            {rows.map((r,i) => (
              <div key={r.n} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.44rem .6rem', background:r.ok?`${C}07`:'rgba(255,255,255,0.02)', border:`1px solid ${r.ok?C+'20':'rgba(255,255,255,0.05)'}`, borderRadius:8, animation:`rowIn .38s ${.3+i*.1}s ease both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.42rem' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:r.ok?`${C}1a`:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', fontWeight:800, color:r.ok?C:'var(--slate-2)' }}>{r.n[0]}</div>
                  <span style={{ fontSize:'.76rem', fontWeight:600, color:r.ok?'#f1f5f9':'var(--slate-2)' }}>{r.n}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'.73rem', fontWeight:700, color:r.ok?C:'var(--slate-2)' }}>{r.a}</div>
                  <div style={{ fontSize:'.62rem', color:'var(--slate-2)' }}>{r.t}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:`${C}12`, border:`1px solid ${C}30`, borderRadius:10, padding:'.6rem .8rem', display:'flex', alignItems:'center', gap:'.45rem', animation:'notifIn .5s 1.35s ease both' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:C, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', fontWeight:900, color:'#000', flexShrink:0 }}>✓</div>
            <div>
              <div style={{ fontSize:'.74rem', fontWeight:800, color:C }}>New payment received</div>
              <div style={{ fontSize:'.67rem', color:'var(--slate)' }}>Emeka paid ₦10,000 · just now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene2({ active, sceneKey }) {
  const C = '#f59e0b';
  return (
    <div key={sceneKey} style={{ position:'absolute', inset:0, opacity:active?1:0, transition:'opacity .6s ease', background:'radial-gradient(ellipse at 72% 18%, rgba(245,158,11,0.07), transparent 50%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.75rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.75rem', width:'100%', alignItems:'center' }}>
        <div style={{ animation:'fadeRight .5s .08s ease both' }}>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'1.35rem' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:`${C}18`, border:`1px solid ${C}38`, margin:'0 auto .55rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>👗</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.9rem' }}>Tokunbo Fashion</div>
              <div style={{ fontSize:'.68rem', color:'var(--slate-2)', marginTop:2 }}>Payment link</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'.9rem', textAlign:'center', marginBottom:'.85rem', border:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize:'.62rem', color:'var(--slate-2)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.2rem' }}>Amount</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.7rem', fontWeight:700, color:C }}>₦25,000</div>
              <div style={{ fontSize:'.7rem', color:'var(--slate)', marginTop:'.12rem' }}>Custom order deposit</div>
            </div>
            <button style={{ width:'100%', background:`linear-gradient(135deg,${C},#fbbf24)`, color:'#000', fontWeight:800, fontSize:'.84rem', border:'none', borderRadius:9, padding:'.72rem', fontFamily:'var(--font-display)', boxShadow:`0 8px 20px ${C}30`, cursor:'pointer' }}>Pay with Flutterwave →</button>
            <div style={{ display:'flex', gap:'.35rem', justifyContent:'center', marginTop:'.65rem' }}>
              {['💳 Card','🏦 Transfer','📱 USSD'].map(m => (<div key={m} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, padding:'.22rem .45rem', fontSize:'.65rem', color:'var(--slate-2)' }}>{m}</div>))}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', animation:'fadeLeft .5s .12s ease both' }}>
          <div style={{ width:66, height:66, borderRadius:'50%', background:`linear-gradient(135deg,${C},#fbbf24)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto .9rem', fontSize:'1.6rem', boxShadow:`0 14px 40px ${C}38`, animation:'checkBounce .55s .8s ease both', color:'#000', fontWeight:900 }}>✓</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:800, marginBottom:'.35rem', animation:'fadeUp .4s 1s ease both' }}>Payment confirmed</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.4rem', fontWeight:700, color:C, marginBottom:'.35rem', animation:'fadeUp .4s 1.1s ease both' }}>₦25,000</div>
          <div style={{ fontSize:'.76rem', color:'var(--slate)', marginBottom:'1.1rem', animation:'fadeUp .4s 1.15s ease both' }}>Flutterwave webhook confirmed</div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, padding:'.9rem', textAlign:'left', animation:'receiptUp .5s 1.3s ease both' }}>
            {[['From','Customer'],['To','Tokunbo Fashion'],['Ref','QRK-2026-08-0041'],['Fee','₦63 (0.25%)']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', marginBottom:'.3rem', color:'var(--slate)' }}>
                <span>{k}</span><span style={{ color:'#f1f5f9', fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene3({ active, sceneKey }) {
  const C = '#8b5cf6';
  const depts = [{ n:'Engineering',count:12,delay:.32 },{ n:'Design',count:6,delay:.46 },{ n:'Sales',count:18,delay:.6 },{ n:'Operations',count:11,delay:.74 }];
  return (
    <div key={sceneKey} style={{ position:'absolute', inset:0, opacity:active?1:0, transition:'opacity .6s ease', background:'radial-gradient(ellipse at 80% 18%, rgba(139,92,246,0.07), transparent 50%)', padding:'1.75rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', height:'100%' }}>
        <div style={{ animation:'fadeRight .5s .08s ease both' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:C, marginBottom:'.4rem' }}>Enterprise · Payroll</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, marginBottom:'.1rem', letterSpacing:'-.01em' }}>October 2026</div>
          <div style={{ fontSize:'.76rem', color:'var(--slate)', marginBottom:'.9rem' }}>TechBridge Solutions</div>
          <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem' }}>
            {[['47','Employees',C],['₦30.6M','Total','#f1f5f9'],['4m','Run time','#22c55e']].map(([v,l,col]) => (
              <div key={l} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'.55rem', textAlign:'center', animation:`fadeUp .35s .4s ease both` }}>
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:'.95rem', color:col }}>{v}</div>
                <div style={{ fontSize:'.62rem', color:'var(--slate-2)', marginTop:1 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ animation:'fadeUp .4s 1.5s ease both', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.22)', borderRadius:9, padding:'.6rem .8rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
            <span style={{ color:'#22c55e', fontWeight:900 }}>✓</span>
            <span style={{ fontSize:'.76rem', fontWeight:700, color:'#22c55e' }}>All 47 transfers confirmed</span>
          </div>
        </div>
        <div style={{ animation:'fadeLeft .5s .12s ease both' }}>
          <div style={{ fontSize:'.62rem', fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.65rem' }}>Department Status</div>
          {depts.map(d => (
            <div key={d.n} style={{ marginBottom:'.75rem', animation:`fadeUp .38s ${d.delay}s ease both` }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.74rem', marginBottom:'.28rem' }}>
                <span style={{ color:'var(--slate)', fontWeight:600 }}>{d.n}</span>
                <span style={{ color:'#22c55e', fontWeight:800, fontSize:'.68rem' }}>{d.count}/{d.count} ✓</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', background:`linear-gradient(90deg,${C},#22c55e)`, borderRadius:99, animation:`deptFill .9s ${d.delay+.2}s ease both` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:'.85rem', animation:'receiptUp .5s 1.3s ease both', background:`${C}0e`, border:`1px solid ${C}28`, borderRadius:10, padding:'.65rem .8rem' }}>
            {[['Total disbursed','₦30,600,000'],['Qreek fee (0.2%)','₦61,200'],['Receipt','Available']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', marginBottom:'.22rem' }}>
                <span style={{ color:'var(--slate)' }}>{k}</span>
                <span style={{ color:'#f1f5f9', fontWeight:700, fontFamily:k==='Receipt'?'inherit':'var(--font-mono)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoSlideshow() {
  const [active, setActive] = useState(0);
  const [keys, setKeys] = useState([0,0,0]);
  const timer = useRef(null);
  const SCENES = [
    { label:'Payment Pool',      url:'qreekfinance.org/pool/adaeze-circle',      color:'#00d4aa' },
    { label:'Payment Link',      url:'qreekfinance.org/p/tokunbo-fashion',        color:'#f59e0b' },
    { label:'Enterprise Payroll',url:'qreekfinance.org/payroll/october-2026',    color:'#8b5cf6' },
  ];

  const go = useCallback((idx) => {
    const n = ((idx % 3) + 3) % 3;
    setKeys(k => k.map((v,i) => i === n ? v+1 : v));
    setActive(n);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => go(active + 1), 6000);
    return () => clearTimeout(timer.current);
  }, [active, go]);

  const cur = SCENES[active];

  return (
    <div style={{ maxWidth:1080, margin:'0 auto', padding:'0 1.25rem 1rem' }}>
      <div style={{ background:'#090915', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden', boxShadow:'0 60px 180px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        {/* Browser bar */}
        <div style={{ background:'#0d0d1e', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'.55rem .9rem', display:'flex', alignItems:'center', gap:'.65rem' }}>
          <div style={{ display:'flex', gap:'.3rem' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:.85 }} />)}
          </div>
          <div style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:7, padding:'.24rem .9rem', fontSize:'.7rem', color:'var(--slate-2)', textAlign:'center', fontFamily:'var(--font-mono)', maxWidth:400, margin:'0 auto' }}>
            <span style={{ color:'#22c55e', marginRight:'.25rem' }}>⚿</span>{cur.url}
          </div>
          <div style={{ display:'flex', gap:'.3rem' }}>
            {SCENES.map((s,i) => (
              <button key={i} onClick={() => { clearTimeout(timer.current); go(i); }} style={{ width:i===active?18:6, height:6, borderRadius:99, background:i===active?s.color:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all .3s ease', padding:0 }} />
            ))}
          </div>
        </div>
        {/* Viewport */}
        <div className="browser-scene" style={{ position:'relative', minHeight:400, background:'#06060f' }}>
          <Scene1 active={active===0} sceneKey={keys[0]} />
          <Scene2 active={active===1} sceneKey={keys[1]} />
          <Scene3 active={active===2} sceneKey={keys[2]} />
        </div>
      </div>
      {/* Labels */}
      <div style={{ display:'flex', justifyContent:'center', gap:'1.1rem', marginTop:'1.1rem', flexWrap:'wrap' }}>
        {SCENES.map((s,i) => (
          <button key={s.label} onClick={() => { clearTimeout(timer.current); go(i); }} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'.38rem', fontSize:'.75rem', fontWeight:i===active?800:500, color:i===active?s.color:'var(--slate-2)', fontFamily:'var(--font-body)', transition:'color .25s ease' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:i===active?s.color:'rgba(255,255,255,0.18)', transition:'background .25s ease' }} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const L = [['features','Products'],['modes','Modes'],['how-it-works','How it works'],['pricing','Pricing']];
  const lk = { background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'.875rem', fontWeight:500, color:'rgba(148,163,184,0.9)', padding:'.4rem .75rem', borderRadius:8, transition:'color .15s', letterSpacing:'-.01em' };
  const hover = (e,on) => e.currentTarget.style.color = on ? '#00d4aa' : 'rgba(148,163,184,.9)';
  return (
    <>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, height:62, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', background:scrolled?'rgba(7,7,16,0.92)':'transparent', backdropFilter:scrolled?'blur(28px) saturate(180%)':'none', borderBottom:scrolled?'1px solid rgba(255,255,255,0.05)':'none', transition:'all .35s ease' }}>
        <button onClick={() => goTo('hero')} style={{ ...lk, fontSize:'1.08rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-.03em', padding:0, fontFamily:'var(--font-display)' }}>
          Qreek<span style={{ color:'#00d4aa' }}>Finance</span>
        </button>
        <div className="nav-links" style={{ gap:0 }}>
          {L.map(([id,label]) => <button key={id} onClick={() => goTo(id)} style={lk} onMouseEnter={e=>hover(e,true)} onMouseLeave={e=>hover(e,false)}>{label}</button>)}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
          <Link to="/login" style={{ color:'rgba(148,163,184,.9)', textDecoration:'none', fontSize:'.875rem', fontWeight:500, padding:'.4rem .85rem', borderRadius:8 }}>Sign in</Link>
          <Link to="/register" style={{ background:'#00d4aa', color:'#000', textDecoration:'none', fontSize:'.875rem', fontWeight:800, padding:'.45rem 1.15rem', borderRadius:8, fontFamily:'var(--font-display)', letterSpacing:'-.01em' }}>Get started</Link>
          <button className="nav-ham" onClick={() => setOpen(o=>!o)} aria-label="Menu" style={{ background:'none', border:'none', cursor:'pointer', padding:'.4rem', display:'flex', flexDirection:'column', gap:5 }}>
            {[0,1,2].map(i => <span key={i} style={{ display:'block', width:20, height:2, background:'var(--slate)', borderRadius:2 }} />)}
          </button>
        </div>
      </nav>
      {open && (
        <div style={{ position:'fixed', top:62, left:0, right:0, zIndex:190, background:'rgba(7,7,16,.97)', backdropFilter:'blur(28px)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'1rem 1.5rem', display:'flex', flexDirection:'column', gap:'.15rem' }}>
          {L.map(([id,label]) => <button key={id} onClick={() => { goTo(id); setOpen(false); }} style={{ ...lk, textAlign:'left', fontSize:'.95rem', padding:'.7rem .5rem' }}>{label}</button>)}
          <div style={{ display:'flex', gap:'.65rem', marginTop:'.65rem', paddingTop:'.65rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/login" onClick={() => setOpen(false)} style={{ flex:1, textAlign:'center', textDecoration:'none', color:'#f1f5f9', fontSize:'.88rem', fontWeight:600, padding:'.7rem', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} style={{ flex:1, textAlign:'center', textDecoration:'none', color:'#000', background:'#00d4aa', fontSize:'.88rem', fontWeight:800, padding:'.7rem', borderRadius:10, fontFamily:'var(--font-display)' }}>Get started</Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Marquee (trust ticker — REQUIRED) ─────────────────────────────────── */
function Marquee() {
  const items = ['🔒 Flutterwave-secured','🏛️ CBN-licensed processing','🚫 Zero fund custody','📋 Immutable receipts','✅ Bank-to-bank transfers','🇳🇬 Built for Nigeria','⚡ Real-time confirmation','👁️ Full member transparency','🔐 PIN-secured transactions','💸 No monthly fees'];
  return (
    <div style={{ overflow:'hidden', background:'rgba(0,212,170,0.03)', borderTop:'1px solid rgba(0,212,170,0.1)', borderBottom:'1px solid rgba(0,212,170,0.1)', padding:'.82rem 0' }}>
      <div style={{ display:'flex', gap:'3rem', width:'max-content', animation:'marqueeScroll 36s linear infinite' }}>
        {[...items,...items].map((item,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'.4rem', whiteSpace:'nowrap', fontSize:'.77rem', color:'var(--slate-2)', fontWeight:500 }}>{item}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  const [vis, setVis] = useState(false);
  const heroRef = useRef(null);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  return (
    <section id="hero" ref={heroRef} style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'var(--ink)' }}>
      {/* Animated mesh */}
      <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-8%', left:'-4%', width:'52%', height:'65%', background:'radial-gradient(ellipse, rgba(0,212,170,0.09) 0%, transparent 70%)', animation:'meshDrift 20s ease-in-out infinite', filter:'blur(45px)' }} />
        <div style={{ position:'absolute', top:'15%', right:'-6%', width:'48%', height:'58%', background:'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)', animation:'meshDrift 26s ease-in-out infinite reverse', filter:'blur(50px)' }} />
        <div style={{ position:'absolute', bottom:'-4%', left:'28%', width:'44%', height:'38%', background:'radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 70%)', animation:'floatOrb 11s ease infinite 4s', filter:'blur(42px)' }} />
        {/* Grid */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.022 }} aria-hidden>
          <defs><pattern id="grd" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth=".5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grd)"/>
        </svg>
        {/* Floating dots */}
        {[{x:'18%',y:'28%',d:0},{x:'82%',y:'22%',d:1.5},{x:'58%',y:'75%',d:2.8},{x:'12%',y:'65%',d:1.1},{x:'88%',y:'68%',d:3.4}].map((p,i) => (
          <div key={i} style={{ position:'absolute', left:p.x, top:p.y, width:4, height:4, borderRadius:'50%', background:'rgba(0,212,170,0.4)', animation:`floatDot ${7+i*1.3}s ease-in-out infinite ${p.d}s` }} />
        ))}
      </div>
      {/* Cursor spotlight */}
      <CursorSpotlight containerRef={heroRef} />

      {/* Headline */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'9rem 2rem 3rem', position:'relative', zIndex:2 }}>
        <div style={{ maxWidth:800, textAlign:'center', opacity:vis?1:0, transform:vis?'none':'translateY(22px)', transition:'opacity 1s ease, transform 1s ease' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', background:'rgba(0,212,170,0.06)', border:'1px solid rgba(0,212,170,0.14)', borderRadius:999, padding:'.3rem .9rem', fontSize:'.7rem', fontWeight:700, color:'#00d4aa', marginBottom:'1.85rem', letterSpacing:'.07em', fontFamily:'var(--font-body)' }}>
            🇳🇬  Trusted payment infrastructure for Nigeria
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.85rem,9vw,6.5rem)', fontWeight:800, lineHeight:1.01, marginBottom:'1.5rem', letterSpacing:'-.04em', color:'#f1f5f9' }}>
            Stop chasing<br />bank alerts.<br />
            <span style={{ background:'linear-gradient(90deg,#00d4aa,#00ffcc,#00d4aa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'200% auto', animation:'shimmerText 4s linear infinite' }}>
              See who paid.
            </span>
          </h1>

          {/* Sub */}
          <p style={{ fontFamily:'var(--font-body)', fontSize:'clamp(.95rem,2vw,1.1rem)', color:'var(--slate)', maxWidth:520, margin:'0 auto 2.25rem', lineHeight:1.9, fontWeight:400 }}>
            Pools for ajo groups. Links for merchants. Payroll for teams.{' '}
            <strong style={{ color:'#f1f5f9', fontWeight:700 }}>Your funds go bank-to-bank — Qreek never touches them.</strong>
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:'.75rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'1.6rem' }}>
            {/* Spinning-border primary CTA */}
            <div style={{ position:'relative', borderRadius:12, padding:1, display:'inline-block' }}>
              <div aria-hidden style={{ position:'absolute', inset:0, borderRadius:'inherit', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:-2, borderRadius:'inherit', background:'conic-gradient(from 0deg, #00d4aa, #8b5cf6, #f59e0b, #00d4aa)', animation:'spinBorder 4s linear infinite' }} />
              </div>
              <Link to="/register" style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:'.4rem', background:'#070710', color:'#00d4aa', textDecoration:'none', fontSize:'1rem', fontWeight:800, padding:'.88rem 2.25rem', borderRadius:11, fontFamily:'var(--font-display)', letterSpacing:'-.01em', zIndex:1 }}>
                Start for free →
              </Link>
            </div>
            <button onClick={() => goTo('features')} style={{ background:'rgba(255,255,255,0.06)', color:'#f1f5f9', fontSize:'1rem', fontWeight:600, padding:'.88rem 1.9rem', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:'var(--font-body)', backdropFilter:'blur(10px)', letterSpacing:'-.01em' }}>
              See it in action
            </button>
          </div>

          {/* Fee pills */}
          <div style={{ display:'flex', gap:'.4rem', justifyContent:'center', flexWrap:'wrap' }}>
            {[['0.15%','Pools','#00d4aa'],['0.25%','Links','#f59e0b'],['0.2%','Payroll','#8b5cf6'],['Free','Setup','#22c55e']].map(([fee,label,col]) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:999, padding:'.26rem .75rem', fontSize:'.72rem', color:'var(--slate-2)', display:'flex', gap:'.3rem', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:800, color:col }}>{fee}</span>
                <span style={{ fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <Marquee />

      {/* Video Slideshow */}
      <div style={{ paddingTop:'2.5rem', paddingBottom:'3.5rem', position:'relative', background:'linear-gradient(to bottom, var(--ink) 0%, var(--ink-2) 100%)', zIndex:2 }}>
        <Reveal style={{ textAlign:'center', marginBottom:'1.35rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', fontFamily:'var(--font-body)' }}>Live product demo</div>
        </Reveal>
        <VideoSlideshow />
      </div>
    </section>
  );
}

/* ─── Product tiles ──────────────────────────────────────────────────────── */
function ProductTile({ color, icon, bigStat, statSub, headline, body, fee, cta, to, delay=0 }) {
  return (
    <Reveal delay={delay} style={{ display:'flex' }}>
      <Link to={to} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', flex:1 }}>
        <TiltCard color={color} style={{ flex:1, background:'var(--ink-2)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Visual header */}
          <div style={{ background:`linear-gradient(155deg, ${color}0e, ${color}04)`, borderBottom:`1px solid ${color}18`, padding:'2.25rem 2rem 1.85rem', position:'relative', overflow:'hidden', flexShrink:0 }}>
            <div aria-hidden style={{ position:'absolute', top:-45, right:-45, width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle, ${color}22, transparent 65%)`, animation:'floatOrb 7s ease infinite' }} />
            <div style={{ fontSize:'2.2rem', marginBottom:'.9rem', position:'relative' }}>{icon}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'2.5rem', fontWeight:700, color, lineHeight:1, position:'relative', letterSpacing:'-.02em' }}>{bigStat}</div>
            <div style={{ fontSize:'.74rem', color:'var(--slate-2)', marginTop:'.2rem', position:'relative', fontWeight:500 }}>{statSub}</div>
          </div>
          {/* Text */}
          <div style={{ padding:'1.5rem 2rem', flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem', marginBottom:'.4rem', color:'#f1f5f9', letterSpacing:'-.02em' }}>{headline}</div>
            <p style={{ fontSize:'.86rem', color:'var(--slate)', lineHeight:1.78, marginBottom:'1.2rem', flex:1, fontWeight:400 }}>{body}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'.8rem', color, fontWeight:700 }}>{fee}</span>
              <span style={{ fontSize:'.84rem', fontWeight:800, color, fontFamily:'var(--font-display)' }}>{cta} →</span>
            </div>
          </div>
        </TiltCard>
      </Link>
    </Reveal>
  );
}

/* ─── Mockups ────────────────────────────────────────────────────────────── */
function PoolMockup() {
  const C = '#00d4aa';
  return (
    <TiltCard color={C} borderRadius={20} style={{ background:'linear-gradient(160deg,#0c0c1c,#07070f)', padding:'1.5rem' }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:130, height:130, borderRadius:'50%', background:`radial-gradient(circle, ${C}18, transparent)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div>
          <div style={{ fontSize:'.6rem', fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:C, marginBottom:2 }}>Pool · Communal</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.98rem', letterSpacing:'-.02em' }}>Adaeze Market Circle</div>
        </div>
        <div style={{ background:`${C}14`, border:`1px solid ${C}38`, borderRadius:7, padding:'.24rem .52rem', fontSize:'.66rem', color:C, fontWeight:800, height:'fit-content' }}>Active</div>
      </div>
      <div style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.7rem', marginBottom:'.32rem' }}>
          <span style={{ color:'var(--slate)' }}>Collected</span>
          <span style={{ fontFamily:'var(--font-mono)', fontWeight:800, color:C }}>₦240k / ₦400k</span>
        </div>
        <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:99 }}>
          <div style={{ height:'100%', width:'60%', background:`linear-gradient(90deg,${C},#00ffca)`, borderRadius:99, boxShadow:`0 0 10px ${C}60` }} />
        </div>
      </div>
      {[{n:'Adaeze O.',p:true,a:'₦10,000'},{n:'Tunde K.',p:true,a:'₦10,000'},{n:'Ngozi B.',p:false,a:'Pending'},{n:'James E.',p:true,a:'₦10,000'},{n:'Chisom A.',p:true,a:'₦10,000'}].map(m => (
        <div key={m.n} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.42rem .6rem', background:m.p?`${C}06`:'rgba(255,255,255,0.02)', border:`1px solid ${m.p?C+'18':'rgba(255,255,255,0.04)'}`, borderRadius:8, marginBottom:'.38rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.45rem' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:m.p?`${C}18`:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.64rem', fontWeight:900, color:m.p?C:'var(--slate-2)' }}>{m.n[0]}</div>
            <span style={{ fontSize:'.76rem', fontWeight:600, color:m.p?'#f1f5f9':'var(--slate-2)' }}>{m.n}</span>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'.73rem', color:m.p?C:'var(--slate-2)', fontWeight:700 }}>{m.a}</span>
        </div>
      ))}
      <div style={{ marginTop:'.8rem', padding:'.58rem', background:`${C}07`, border:`1px solid ${C}14`, borderRadius:8, fontSize:'.72rem', color:'var(--slate)', textAlign:'center' }}>20 members · 17 paid · 3 pending</div>
    </TiltCard>
  );
}

function LinkMockup() {
  const C = '#f59e0b';
  return (
    <TiltCard color={C} borderRadius={20} style={{ background:'linear-gradient(160deg,#0c0c1c,#07070f)', padding:'1.5rem' }}>
      <div style={{ position:'absolute', top:-40, left:-40, width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${C}14, transparent)`, pointerEvents:'none' }} />
      <div style={{ textAlign:'center', marginBottom:'1.1rem' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:`${C}18`, border:`1px solid ${C}38`, margin:'0 auto .6rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>👗</div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.92rem', letterSpacing:'-.02em' }}>Tokunbo Fashion</div>
        <div style={{ fontSize:'.68rem', color:'var(--slate-2)', marginTop:2 }}>qreekfinance.org/p/tokunbo</div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'1rem', marginBottom:'.85rem', textAlign:'center', border:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize:'.62rem', color:'var(--slate-2)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.2rem' }}>Amount</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.75rem', fontWeight:700, color:C }}>₦25,000</div>
        <div style={{ fontSize:'.72rem', color:'var(--slate)', marginTop:'.12rem' }}>Custom order deposit</div>
      </div>
      <button style={{ width:'100%', background:`linear-gradient(135deg,${C},#fbbf24)`, color:'#000', fontWeight:800, fontSize:'.86rem', border:'none', borderRadius:9, padding:'.78rem', cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:`0 8px 22px ${C}28`, marginBottom:'.8rem' }}>Pay with Flutterwave →</button>
      <div style={{ display:'flex', gap:'.35rem', justifyContent:'center', marginBottom:'.7rem' }}>
        {['💳 Card','🏦 Transfer','📱 USSD'].map(m => (<div key={m} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, padding:'.22rem .45rem', fontSize:'.66rem', color:'var(--slate-2)' }}>{m}</div>))}
      </div>
      <div style={{ textAlign:'center', fontSize:'.67rem', color:'var(--slate-2)' }}>🔒 Secured by Flutterwave · CBN-licensed</div>
    </TiltCard>
  );
}

function PayrollMockup() {
  const C = '#8b5cf6';
  return (
    <TiltCard color={C} borderRadius={20} style={{ background:'linear-gradient(160deg,#0c0c1c,#07070f)', padding:'1.5rem' }}>
      <div style={{ position:'absolute', bottom:-40, right:-40, width:130, height:130, borderRadius:'50%', background:`radial-gradient(circle, ${C}14, transparent)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div>
          <div style={{ fontSize:'.6rem', fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:C, marginBottom:2 }}>Payroll Run</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.98rem', letterSpacing:'-.02em' }}>October 2026</div>
          <div style={{ fontSize:'.72rem', color:'var(--slate)', marginTop:2 }}>TechBridge Solutions</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.1rem', fontWeight:700, color:C }}>₦30.6M</div>
          <div style={{ fontSize:'.66rem', color:'var(--slate-2)' }}>Total disbursed</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'.55rem', marginBottom:'1rem' }}>
        {[{v:'47',l:'Employees',c:C},{v:'47',l:'Paid ✓',c:'#22c55e'},{v:'4m',l:'Run time',c:'var(--slate)'}].map(s => (
          <div key={s.l} style={{ flex:1, background:`rgba(255,255,255,0.04)`, border:`1px solid rgba(255,255,255,0.07)`, borderRadius:9, padding:'.55rem', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.1rem', fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'.64rem', color:'var(--slate-2)', marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {[{n:'Engineering',c:12},{n:'Design',c:6},{n:'Sales',c:18},{n:'Operations',c:11}].map(d => (
        <div key={d.n} style={{ marginBottom:'.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.7rem', marginBottom:'.2rem' }}>
            <span style={{ color:'var(--slate)' }}>{d.n}</span>
            <span style={{ color:'#22c55e', fontWeight:700, fontSize:'.67rem' }}>{d.c} paid ✓</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:99 }}>
            <div style={{ height:'100%', width:'100%', background:`linear-gradient(90deg,${C},#22c55e)`, borderRadius:99 }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop:'.85rem', padding:'.58rem .72rem', background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:8, fontSize:'.72rem', color:'#22c55e', display:'flex', alignItems:'center', gap:'.35rem' }}>✓ All 47 transfers confirmed · Receipt ready</div>
    </TiltCard>
  );
}

/* ─── Product deep-dive section ──────────────────────────────────────────── */
function ProductSection({ tag, headline, body, fee, cta, to, color, side, MockupComponent }) {
  const r = side !== 'left';
  return (
    <div style={{ maxWidth:1180, margin:'0 auto', padding:'5.5rem 2rem' }}>
      <div className="product-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4.5rem', alignItems:'center' }}>
        <Reveal dx={r?-22:22} style={{ order:r?0:1 }}>
          <div style={{ fontSize:'.63rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color, marginBottom:'.85rem', fontFamily:'var(--font-body)' }}>{tag}</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, lineHeight:1.08, marginBottom:'1.1rem', letterSpacing:'-.03em', color:'#f1f5f9' }}>{headline}</h2>
          <p style={{ fontSize:'1.03rem', color:'var(--slate)', lineHeight:1.9, marginBottom:'1.65rem', fontWeight:400, maxWidth:460 }}>{body}</p>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <Link to={to} style={{ background:color, color:'#000', textDecoration:'none', fontSize:'.92rem', fontWeight:800, padding:'.72rem 1.65rem', borderRadius:10, fontFamily:'var(--font-display)', letterSpacing:'-.01em', boxShadow:`0 8px 28px ${color}28` }}>{cta} →</Link>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'.8rem', color, fontWeight:700 }}>{fee}</span>
          </div>
        </Reveal>
        <Reveal dx={r?22:-22} delay={70} className="flip-order" style={{ order:r?1:0 }}>
          <MockupComponent />
        </Reveal>
      </div>
    </div>
  );
}

/* ─── Mode Carousel ──────────────────────────────────────────────────────── */
function ModeCarousel({ modes }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const go = useCallback((i) => setActive(((i%modes.length)+modes.length)%modes.length), [modes.length]);
  useEffect(() => {
    timer.current = setTimeout(() => go(active+1), 9000);
    return () => clearTimeout(timer.current);
  }, [active, go]);
  const m = modes[active];
  return (
    <section id="modes" style={{ background:'var(--ink-2)', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'5.5rem 0', position:'relative', overflow:'hidden' }}>
      <div aria-hidden style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 25% 50%, ${m.color}0e, transparent 55%), radial-gradient(ellipse at 78% 50%, ${m.alt}0a, transparent 45%)`, transition:'background .7s ease', pointerEvents:'none' }} />
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem', position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>One platform</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, color:'#f1f5f9' }}>Tuned to how people collect</h2>
        </div>
        {/* Tab pills */}
        <div style={{ display:'flex', justifyContent:'center', gap:'.4rem', marginBottom:'2rem', flexWrap:'wrap' }}>
          {modes.map((md,i) => (
            <button key={md.name} onClick={() => { clearTimeout(timer.current); go(i); }}
              style={{ background:i===active?`${md.color}14`:'rgba(255,255,255,0.04)', color:i===active?md.color:'var(--slate-2)', border:`1px solid ${i===active?md.color+'45':'rgba(255,255,255,0.07)'}`, borderRadius:999, padding:'.48rem 1.15rem', fontWeight:800, fontSize:'.8rem', cursor:'pointer', fontFamily:'var(--font-display)', transition:'all .22s ease', display:'flex', alignItems:'center', gap:'.35rem' }}>
              <span>{md.icon}</span><span>{md.name}</span>
            </button>
          ))}
        </div>
        <div key={m.name} className="modes-layout" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start' }}>
          {/* Left */}
          <div style={{ animation:'fadeRight .42s ease both' }}>
            <div style={{ fontSize:'.63rem', fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:m.color, marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>{m.kicker}</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,3vw,1.9rem)', fontWeight:800, lineHeight:1.1, marginBottom:'.85rem', letterSpacing:'-.025em', color:'#f1f5f9' }}>{m.title}</h3>
            <p style={{ fontSize:'.95rem', color:'var(--slate)', lineHeight:1.88, marginBottom:'1.25rem', fontWeight:400 }}>{m.summary}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.55rem', marginBottom:'1.25rem' }}>
              {m.actions.map(a => (
                <TiltCard key={a.title} color={m.color} borderRadius={12} style={{ background:'rgba(255,255,255,0.03)', padding:'.8rem' }}>
                  <div style={{ fontSize:'1rem', marginBottom:'.26rem' }}>{a.icon}</div>
                  <div style={{ fontWeight:800, fontSize:'.77rem', marginBottom:'.18rem', color:'#f1f5f9', fontFamily:'var(--font-body)' }}>{a.title}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--slate)', lineHeight:1.55 }}>{a.copy}</div>
                </TiltCard>
              ))}
            </div>
            <div style={{ display:'flex', gap:'.5rem' }}>
              {m.stats.map(s => (<div key={s.label} style={{ flex:1, background:`${m.color}0a`, border:`1px solid ${m.color}22`, borderRadius:9, padding:'.55rem', textAlign:'center' }}><div style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:m.color, fontSize:'.88rem' }}>{s.value}</div><div style={{ fontSize:'.64rem', color:'var(--slate-2)', marginTop:2, fontFamily:'var(--font-body)' }}>{s.label}</div></div>))}
            </div>
          </div>
          {/* Right diagram */}
          <div style={{ background:'linear-gradient(145deg,rgba(12,12,28,.94),rgba(6,6,15,.97))', border:`1px solid ${m.color}32`, borderRadius:18, padding:'1.5rem', boxShadow:`0 24px 72px ${m.color}0e`, position:'relative', overflow:'hidden', animation:'fadeLeft .42s .07s ease both' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 32% 28%, ${m.color}14, transparent 55%), radial-gradient(circle at 72% 72%, ${m.alt}0e, transparent 48%)`, pointerEvents:'none' }} />
            <svg viewBox="0 0 420 240" style={{ width:'100%', height:'auto', overflow:'visible', position:'relative' }} aria-hidden>
              <defs>
                <linearGradient id={`mg-${m.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={m.color}/><stop offset="100%" stopColor={m.alt}/>
                </linearGradient>
              </defs>
              <path d="M82 120 C128 36,236 40,288 93 S390 190,328 218 S152 228,94 174 S34 154,82 120" fill="none" stroke={`url(#mg-${m.name})`} strokeWidth="1.6" strokeDasharray="10 8" opacity=".45"/>
              {m.nodes.map((nd,i) => (
                <g key={nd.label} transform={`translate(${nd.x} ${nd.y})`}>
                  <circle r={i===0?36:24} fill="rgba(6,6,15,.92)" stroke={i===0?m.color:'rgba(255,255,255,0.1)'} strokeWidth={i===0?1.4:.8}/>
                  <text y={i===0?-1:0} textAnchor="middle" fontSize={i===0?18:13}>{nd.icon}</text>
                  <text y={i===0?17:13} textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="700">{nd.label}</text>
                </g>
              ))}
            </svg>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'.85rem', marginTop:'.35rem', position:'relative' }}>
              <div style={{ fontSize:'.64rem', color:'var(--slate-2)', marginBottom:'.35rem', fontFamily:'var(--font-body)' }}>Flow</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.32rem' }}>
                {m.path.map((step,i) => (<span key={step} style={{ color:i===m.path.length-1?m.color:'var(--slate-2)', background:i===m.path.length-1?`${m.color}12`:'rgba(255,255,255,0.04)', border:`1px solid ${i===m.path.length-1?m.color+'35':'rgba(255,255,255,0.05)'}`, borderRadius:999, padding:'.24rem .55rem', fontSize:'.68rem', fontWeight:800, fontFamily:'var(--font-body)' }}>{step}</span>))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:'.38rem', marginTop:'1.75rem' }}>
          {modes.map((_,i) => (<button key={i} onClick={() => { clearTimeout(timer.current); go(i); }} style={{ width:i===active?18:6, height:6, borderRadius:99, background:i===active?m.color:'rgba(255,255,255,0.14)', border:'none', cursor:'pointer', transition:'all .3s ease', padding:0 }} />))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:'01', icon:'⚡', title:'Create in 2 minutes',       body:'Sign up with your phone. Create a pool, a payment link, or a payroll run. No forms, no bank visits, no approvals needed.' },
    { n:'02', icon:'🔗', title:'Share — they pay in browser', body:'Members or clients open the link on any device. Pay via card, bank transfer, or USSD through Flutterwave. No Qreek account needed to pay.' },
    { n:'03', icon:'✓',  title:'Ledger updates instantly',   body:'The moment Flutterwave confirms, your Qreek ledger updates in real time. Payer gets a receipt. Funds hit the bank directly.' },
  ];
  return (
    <section id="how-it-works" style={{ padding:'5.5rem 2rem', background:'var(--ink)' }}>
      <div style={{ maxWidth:1020, margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>How it works</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, color:'#f1f5f9' }}>Simple. Transparent. Trusted.</h2>
        </Reveal>
        <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
          {steps.map(({ n, icon, title, body }, i) => (
            <Reveal key={n} delay={i*100}>
              <TiltCard color="#00d4aa" borderRadius={16} style={{ background:'var(--ink-2)', border:'1px solid rgba(255,255,255,0.06)', padding:'1.75rem', height:'100%' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.65rem', marginBottom:'1rem' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.05rem', color:'#00d4aa', flexShrink:0 }}>{icon}</div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'.75rem', fontWeight:700, color:'rgba(0,212,170,0.5)', letterSpacing:'.08em' }}>{n}</span>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:800, marginBottom:'.5rem', lineHeight:1.3, color:'#f1f5f9', letterSpacing:'-.02em' }}>{title}</h3>
                <p style={{ fontSize:'.84rem', color:'var(--slate)', lineHeight:1.82, margin:0, fontWeight:400 }}>{body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={80} style={{ marginTop:'2rem', background:'rgba(0,212,170,0.04)', border:'1px solid rgba(0,212,170,0.1)', borderRadius:14, padding:'1.3rem 1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
          <span style={{ fontSize:'1.25rem', flexShrink:0 }}>🔐</span>
          <p style={{ margin:0, fontSize:'.86rem', color:'var(--slate)', lineHeight:1.82, fontWeight:400 }}>
            Every naira paid through Qreek is processed by <strong style={{ color:'#f1f5f9', fontWeight:700 }}>Flutterwave</strong> — a CBN-licensed Payment Solution Provider. Funds flow directly from payer bank to recipient bank.{' '}
            <strong style={{ color:'#f1f5f9', fontWeight:700 }}>Qreek is never in the middle of your money.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Use Case Carousel ──────────────────────────────────────────────────── */
function UseCaseCarousel({ cases }) {
  const scrollRef = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left:dir*320, behavior:'smooth' });
  const onScroll = () => {
    const el = scrollRef.current; if (!el) return;
    setCanL(el.scrollLeft > 12);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
  };
  const btnSt = (active) => ({ width:38, height:38, borderRadius:'50%', background:active?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:active?'#f1f5f9':'var(--slate-2)', cursor:active?'pointer':'default', fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 });
  return (
    <section id="use-cases" style={{ padding:'5.5rem 0', background:'var(--ink-2)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ padding:'0 2rem', maxWidth:1180, margin:'0 auto 1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <Reveal>
            <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'#f59e0b', marginBottom:'.5rem', fontFamily:'var(--font-body)' }}>Who uses Qreek</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.4rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, margin:0, color:'#f1f5f9' }}>Built for how Nigeria pays</h2>
          </Reveal>
          <div style={{ display:'flex', gap:'.4rem' }}>
            <button onClick={() => scroll(-1)} disabled={!canL} style={btnSt(canL)}>←</button>
            <button onClick={() => scroll(1)}  disabled={!canR} style={btnSt(canR)}>→</button>
          </div>
        </div>
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="scroll-x" style={{ display:'flex', gap:'.9rem', overflowX:'auto', padding:'.5rem 2rem 1rem' }}>
        {cases.map(c => (
          <TiltCard key={c.title} color={c.color} borderRadius={15} style={{ flexShrink:0, width:295, background:'var(--ink-3)', padding:'1.35rem', overflow:'visible' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${c.color},transparent)`, borderRadius:'15px 15px 0 0' }} />
            <div style={{ display:'inline-block', background:`${c.color}16`, color:c.color, borderRadius:6, padding:'.17rem .5rem', fontSize:'.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>{c.tag}</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.9rem', marginBottom:'.42rem', lineHeight:1.3, color:'#f1f5f9', letterSpacing:'-.02em' }}>{c.title}</div>
            <p style={{ fontSize:'.8rem', color:'var(--slate)', lineHeight:1.78, margin:0, fontWeight:400 }}>{c.body}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

/* ─── Trust / Stats section ──────────────────────────────────────────────── */
function TrustSection() {
  return (
    <section style={{ padding:'5.5rem 2rem', background:'var(--ink)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3.75rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>Why trust Qreek</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, color:'#f1f5f9', marginBottom:'.85rem' }}>The accountability layer<br />Nigeria was missing</h2>
          <p style={{ fontSize:'1.03rem', color:'var(--slate)', maxWidth:420, margin:'0 auto', lineHeight:1.88, fontWeight:400 }}>Not a new bank. Your community payments, finally with infrastructure they deserve.</p>
        </Reveal>

        {/* Big stat row */}
        <div className="stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'rgba(255,255,255,0.05)', borderRadius:22, overflow:'hidden', marginBottom:'3rem' }}>
          {[
            { stat:'₦0', suffix:'', label:'in custody', sub:'Your money never passes through Qreek. Ever.', color:'#00d4aa', to:0 },
            { stat:'100', suffix:'%', label:'receipts via Flutterwave webhook', sub:'Not screenshots. Cryptographic payment confirmation.', color:'#f59e0b', to:100 },
            { stat:'5', suffix:' min', label:'to set up and go live', sub:'Pool, link, or payroll — operational in minutes.', color:'#8b5cf6', to:5 },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i*80}
              style={{ background:'var(--ink)', padding:'2.75rem 2rem', textAlign:'center' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--ink-2)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--ink)'}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:800, color:s.color, letterSpacing:'-.04em', lineHeight:1, marginBottom:'.45rem' }}>
                {s.stat === '₦0' ? '₦0' : <><CountUp to={s.to} suffix={s.suffix} duration={1800} />{s.stat === '5' ? '' : ''}</>}
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontWeight:700, color:'#f1f5f9', fontSize:'.9rem', marginBottom:'.4rem' }}>{s.label}</div>
              <p style={{ fontSize:'.8rem', color:'var(--slate)', margin:0, lineHeight:1.7, maxWidth:200, margin:'0 auto', fontWeight:400 }}>{s.sub}</p>
            </Reveal>
          ))}
        </div>

        {/* Trust bullets */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }} className="steps-grid">
          {[
            { icon:'🏛️', color:'#00d4aa', title:'CBN-licensed processing',   desc:'Flutterwave is the licensed PSP.' },
            { icon:'👁️', color:'#60a5fa', title:'Full member transparency',   desc:'Every member sees the same truth.' },
            { icon:'📋', color:'#22c55e', title:'Immutable receipts',         desc:'Webhook confirmation, not screenshots.' },
            { icon:'🔐', color:'#f59e0b', title:'PIN-secured transactions',   desc:'Every financial action needs your PIN.' },
            { icon:'🆘', color:'#8b5cf6', title:'Dispute reporting built in', desc:'Flag suspicious payments instantly.' },
            { icon:'🚫', color:'#f87171', title:'No fund custody',            desc:'Naira flows bank-to-bank only.' },
          ].map((s,i) => (
            <Reveal key={s.title} delay={i*55}>
              <TiltCard color={s.color} borderRadius={14} style={{ background:'var(--ink-2)', border:'1px solid rgba(255,255,255,0.06)', padding:'1.25rem', display:'flex', gap:'.75rem', alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0, marginTop:2 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily:'var(--font-body)', fontWeight:800, fontSize:'.88rem', color:s.color, marginBottom:'.25rem' }}>{s.title}</div>
                  <div style={{ fontSize:'.78rem', color:'var(--slate)', lineHeight:1.6, fontWeight:400 }}>{s.desc}</div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
function PricingSection() {
  return (
    <section id="pricing" style={{ padding:'5.5rem 2rem', background:'var(--ink-2)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>Pricing</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, color:'#f1f5f9', marginBottom:'.85rem' }}>Pay only when money moves.</h2>
          <p style={{ fontSize:'1.03rem', color:'var(--slate)', maxWidth:400, margin:'0 auto', lineHeight:1.88, fontWeight:400 }}>The fee is always shown before you confirm. No monthly subscription. No minimum. No surprises.</p>
        </Reveal>

        <div className="price-list" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { pct:'0.15%', label:'Payment Pools', note:'Per member contribution', color:'#00d4aa' },
            { pct:'0.25%', label:'Payment Links', note:'Per payment received',    color:'#f59e0b', featured:true },
            { pct:'0.2%',  label:'Payroll Runs',  note:'Per salary disbursed',    color:'#8b5cf6' },
          ].map((p,i) => (
            <Reveal key={p.label} delay={i*70}>
              <TiltCard color={p.color} borderRadius={16}
                style={{ background:p.featured?`${p.color}0b`:'var(--ink-3)', padding:'2rem 1.5rem', textAlign:'center', boxShadow:p.featured?`0 20px 60px ${p.color}12`:undefined }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'2.4rem', fontWeight:700, color:p.color, letterSpacing:'-.03em', lineHeight:1, marginBottom:'.4rem' }}>{p.pct}</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.95rem', color:'#f1f5f9', marginBottom:'.32rem', letterSpacing:'-.02em' }}>{p.label}</div>
                <div style={{ fontSize:'.78rem', color:'var(--slate-2)', fontWeight:500 }}>{p.note}</div>
                {p.featured && <div style={{ marginTop:'.85rem', display:'inline-block', background:`${p.color}18`, border:`1px solid ${p.color}35`, borderRadius:99, padding:'.2rem .65rem', fontSize:'.68rem', color:p.color, fontWeight:800 }}>Most popular</div>}
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            {[['✓ No monthly fee','#22c55e'],['✓ No minimum amount','#22c55e'],['✓ No lock-in contract','#22c55e']].map(([t,c]) => (
              <span key={t} style={{ fontSize:'.84rem', color:c, fontWeight:700, fontFamily:'var(--font-body)' }}>{t}</span>
            ))}
          </div>
          <p style={{ textAlign:'center', fontSize:'.75rem', color:'var(--slate-2)', marginTop:'.85rem', fontWeight:400 }}>Flutterwave processing fees apply separately and are shown at checkout.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section style={{ padding:'8rem 2rem', textAlign:'center', position:'relative', overflow:'hidden', background:'var(--ink)' }}>
      <div aria-hidden style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 65%, rgba(0,212,170,0.07), transparent 60%), radial-gradient(ellipse at 18% 18%, rgba(139,92,246,0.04), transparent 50%)', pointerEvents:'none' }} />
      <Reveal style={{ position:'relative', maxWidth:680, margin:'0 auto' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,6vw,4rem)', fontWeight:800, letterSpacing:'-.04em', lineHeight:1.0, marginBottom:'1.1rem', color:'#f1f5f9' }}>
          Stop managing money<br />with screenshots.
        </h2>
        <p style={{ fontSize:'1.05rem', color:'var(--slate)', maxWidth:400, margin:'0 auto 2.5rem', lineHeight:1.88, fontWeight:400 }}>
          Join the ajo groups, merchants, and businesses using Qreek to bring transparency to every payment.
        </p>
        <div style={{ display:'flex', gap:'.65rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'1.1rem' }}>
          <div style={{ position:'relative', borderRadius:12, padding:1.5, display:'inline-block' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, borderRadius:'inherit', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:-2, background:'conic-gradient(from 0deg, #00d4aa, #8b5cf6, #f59e0b, #00d4aa)', animation:'spinBorder 4s linear infinite' }} />
            </div>
            <Link to="/register" style={{ position:'relative', display:'inline-flex', alignItems:'center', background:'#070710', color:'#00d4aa', textDecoration:'none', fontSize:'.98rem', fontWeight:800, padding:'.9rem 2.4rem', borderRadius:11, fontFamily:'var(--font-display)', letterSpacing:'-.01em', zIndex:1 }}>
              Create your free account →
            </Link>
          </div>
          <Link to="/login" style={{ background:'rgba(255,255,255,0.05)', color:'#f1f5f9', textDecoration:'none', fontSize:'.98rem', fontWeight:600, padding:'.9rem 1.9rem', borderRadius:12, border:'1px solid rgba(255,255,255,0.09)', fontFamily:'var(--font-body)', letterSpacing:'-.01em' }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize:'.78rem', color:'var(--slate-2)', fontFamily:'var(--font-body)', fontWeight:400 }}>No credit card. No monthly fee. Set up in 2 minutes.</p>
      </Reveal>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:'var(--ink-2)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'2.25rem 2rem', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.05rem', marginBottom:'.6rem', color:'#f1f5f9', letterSpacing:'-.02em' }}>
        Qreek<span style={{ color:'#00d4aa' }}>Finance</span>
      </div>
      <p style={{ fontSize:'.74rem', color:'var(--slate-2)', maxWidth:540, margin:'0 auto 1rem', lineHeight:1.7, fontWeight:400 }}>
        All payments processed by Flutterwave Technology Solutions Limited, a CBN-licensed Payment Solution Provider. Qreek Finance does not hold, custody, or transmit funds.
      </p>
      <div style={{ display:'flex', justifyContent:'center', gap:'1.4rem', flexWrap:'wrap', fontSize:'.78rem', color:'var(--slate-2)', fontFamily:'var(--font-body)' }}>
        {[['features','Products'],['pricing','Pricing']].map(([id,label]) => (<button key={id} onClick={() => goTo(id)} style={{ background:'none', border:'none', color:'var(--slate-2)', cursor:'pointer', fontSize:'.78rem', fontFamily:'var(--font-body)' }}>{label}</button>))}
        <Link to="/register" style={{ color:'var(--slate-2)', textDecoration:'none' }}>Sign up</Link>
        <Link to="/login"    style={{ color:'var(--slate-2)', textDecoration:'none' }}>Log in</Link>
        <span>support@qreekfinance.org</span>
        <span>© 2026 Qreek Finance</span>
      </div>
    </footer>
  );
}

/* ══════════════════════════ LANDING PAGE ═══════════════════════════════════ */
export default function Landing() {
  const MODES = [
    { name:'Communal', icon:'🤝', kicker:'Groups and circles',      color:'#00d4aa', alt:'#4a90e2',
      title:'Collect together without losing trust in the room.',
      summary:'For ajo, esusu, church drives, levies, and committee collections where everyone needs to see the same truth at the same time.',
      actions:[{icon:'👥',title:'Invite members',copy:'Create a pool, add admins, share one invite link.'},{icon:'📣',title:'Request contributions',copy:'Send payment requests with amount, purpose, and due date.'},{icon:'📊',title:'Track the ledger',copy:'See who paid, who is pending, and the running total live.'},{icon:'🧾',title:'Resolve disputes',copy:'Every receipt and activity log stays attached to the pool.'}],
      stats:[{value:'0.15%',label:'per contribution'},{value:'Live',label:'member ledger'},{value:'All',label:'members visible'}],
      path:['Create pool','Invite','Collect','Confirm','Ledger'],
      nodes:[{x:228,y:118,icon:'🏦',label:'Pool'},{x:88,y:116,icon:'👤',label:'Ada'},{x:328,y:68,icon:'👤',label:'Tunde'},{x:346,y:192,icon:'👤',label:'Ngozi'}] },
    { name:'Solo', icon:'⚡', kicker:'Personal collections',         color:'#f59e0b', alt:'#00d4aa',
      title:'Move fast when one person needs to collect cleanly.',
      summary:'Personal dues, deposits, one-off payments, and small business requests with automatic confirmation and clean record-keeping.',
      actions:[{icon:'🔗',title:'Generate a link',copy:'Create a branded payment link for any amount.'},{icon:'💬',title:'Share anywhere',copy:'Drop the link into WhatsApp, Instagram, or an invoice.'},{icon:'✅',title:'Get confirmation',copy:'Payment confirmed by Flutterwave and recorded instantly.'},{icon:'📥',title:'Keep records',copy:'Every payer, amount, and receipt stored automatically.'}],
      stats:[{value:'0.25%',label:'per payment'},{value:'2 min',label:'link setup'},{value:'No',label:'account needed to pay'}],
      path:['Create link','Share','Pay','Receipt','Record'],
      nodes:[{x:228,y:118,icon:'🔗',label:'Link'},{x:88,y:116,icon:'📱',label:'Phone'},{x:328,y:68,icon:'💳',label:'Card'},{x:346,y:192,icon:'🏦',label:'Bank'}] },
    { name:'Merchant', icon:'🛍️', kicker:'Sales and deposits',      color:'#22c55e', alt:'#f59e0b',
      title:'Turn everyday selling into organised payment operations.',
      summary:'For sellers, agencies, and service providers who need command over deposits, repeat clients, and payment proof.',
      actions:[{icon:'🏷️',title:'Name each collection',copy:'Label payments by client, order, or project.'},{icon:'💸',title:'Accept all channels',copy:'Card, transfer, or USSD — all through Flutterwave checkout.'},{icon:'🔔',title:'See alerts instantly',copy:'Confirmed payments show clear status — no uncertain alerts.'},{icon:'📚',title:'Review history',copy:'Filter by customer, amount, date, and receipt state.'}],
      stats:[{value:'Any',label:'channel'},{value:'Clean',label:'receipts'},{value:'Fast',label:'follow-up'}],
      path:['Set purpose','Share','Confirm','Receipt','Follow up'],
      nodes:[{x:228,y:118,icon:'🛍️',label:'Shop'},{x:88,y:116,icon:'🧑',label:'Client'},{x:328,y:68,icon:'🧾',label:'Order'},{x:346,y:192,icon:'✅',label:'Paid'}] },
    { name:'Enterprise', icon:'💼', kicker:'Payroll and teams',     color:'#8b5cf6', alt:'#4a90e2',
      title:'Run high-volume payouts with approval and evidence.',
      summary:'For payroll, department reviews, bulk payment runs, and accounting teams that need per-employee status and printable proof.',
      actions:[{icon:'📄',title:'Import roster',copy:'Upload employees, salaries, banks, and departments.'},{icon:'🛡️',title:'Approve with PIN',copy:'Sensitive runs require a secure confirmation before money moves.'},{icon:'🚀',title:'Disburse in bulk',copy:'Salary transfers submitted in parallel with live status.'},{icon:'🧾',title:'Export proof',copy:'Download payroll receipts and run summaries for accounting.'}],
      stats:[{value:'0.2%',label:'per run'},{value:'Bulk',label:'disbursement'},{value:'Per',label:'employee status'}],
      path:['Import','Review','Approve','Disburse','Export'],
      nodes:[{x:228,y:118,icon:'💼',label:'Run'},{x:88,y:116,icon:'👩‍💼',label:'HR'},{x:328,y:68,icon:'🏢',label:'Team'},{x:346,y:192,icon:'📋',label:'Audit'}] },
  ];

  const CASES = [
    { tag:'Ajo Group',           color:'#00d4aa', title:'Adaeze market women circle — 20 members',       body:'Each member contributes ₦10,000 monthly via Flutterwave checkout. The activity feed shows who paid and who has not — no more arguments, no more screenshots.' },
    { tag:'Merchant',            color:'#f59e0b', title:'Tokunbo, a Lagos fashion designer',              body:'Shares one Qreek link in her Instagram bio. Clients pay flexible amounts for deposits and custom orders. Every payment confirmed automatically.' },
    { tag:'Church',              color:'#22c55e', title:'Pastor James building fund committee',           body:'Creates a Qreek pool for building fund contributions. Members pay from anywhere. The committee sees the running total live. Every naira accounted for.' },
    { tag:'Enterprise',          color:'#8b5cf6', title:'TechBridge Solutions — 47 employees',            body:'CFO confirms payroll in 4 minutes. All 47 salary transfers fire in parallel. Each employee gets a bank alert. Printable receipt for accounting. No subscription.' },
    { tag:'Student Association', color:'#00d4aa', title:'UNILAG Engineering — Final Year Levy',           body:'Collects ₦15,000 project levy from 300 students via a Qreek pool. Members pay from their phones. Committee sees exactly who paid and who is outstanding.' },
    { tag:'Small Business',      color:'#f59e0b', title:'Chidi web agency — project deposits',            body:'Sends a Qreek payment link to each client instead of sharing account numbers. Client pays via card or bank transfer. Instant confirmation and a clean receipt.' },
  ];

  return (
    <div style={{ background:'var(--ink)', color:'#f1f5f9', overflowX:'clip' }}>
      <style>{GLOBAL_CSS}</style>
      <Nav />
      <Hero />

      {/* Product overview tiles */}
      <section id="features" style={{ background:'var(--ink-2)', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'5.5rem 2rem' }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <Reveal style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ fontSize:'.65rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--slate-2)', marginBottom:'.6rem', fontFamily:'var(--font-body)' }}>Three products. One platform.</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, color:'#f1f5f9' }}>Built for how Nigeria moves money</h2>
          </Reveal>
          <div className="tiles-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.15rem' }}>
            <ProductTile color="#00d4aa" icon="🏦" bigStat="0.15%" statSub="per member contribution" headline="Payment Pools" body="Live payment ledger for ajo groups, committees, and community collections. Every member sees every naira, in real time." fee="0.15% per contribution" cta="Create a pool" to="/register" delay={0} />
            <ProductTile color="#f59e0b" icon="🔗" bigStat="2 min"  statSub="to create and go live"  headline="Payment Links" body="One link anyone can pay through — card, bank transfer, or USSD. Automatic receipt, automatic record." fee="0.25% per payment" cta="Create a link" to="/register" delay={90} />
            <ProductTile color="#8b5cf6" icon="💼" bigStat="₦30M+"  statSub="disbursable in minutes"  headline="Payroll" body="Bulk salary transfers with per-employee status, PIN approval, and printable accounting receipts. No subscription." fee="0.2% per payroll run" cta="Set up payroll" to="/register" delay={180} />
          </div>
        </div>
      </section>

      {/* Deep-dive alternating sections */}
      <section style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <ProductSection tag="Payment Pools" headline="Ajo, esusu, and group collections — with a live ledger" body="Create a pool, share the invite in your WhatsApp group, and request contributions. Every member pays through Flutterwave checkout. The activity feed shows who paid, how much, and when — in real time, visible to all." fee="0.15% per contribution" cta="Create a pool" to="/register" color="#00d4aa" side="right" MockupComponent={PoolMockup} />
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', background:'var(--ink-2)' }}>
          <ProductSection tag="Payment Links" headline="One link. Card, transfer, or USSD. Automatic records." body="Create a Qreek link in 2 minutes. Share it on WhatsApp or Instagram. Clients open it in the browser, pay through Flutterwave, and you get instant confirmation — no bank alert chasing, no manual reconciliation." fee="0.25% per payment" cta="Create a link" to="/register" color="#f59e0b" side="left" MockupComponent={LinkMockup} />
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
          <ProductSection tag="Enterprise Payroll" headline="Pay 500 employees in 4 minutes. 0.2% fee." body="Import your employee roster, review salaries by department, confirm with your PIN, and every salary hits every bank account in parallel. Real-time status per employee. Printable receipt for accounting." fee="0.2% per payroll run" cta="Set up payroll" to="/register" color="#8b5cf6" side="right" MockupComponent={PayrollMockup} />
        </div>
      </section>

      <ModeCarousel modes={MODES} />
      <HowItWorks />
      <UseCaseCarousel cases={CASES} />
      <TrustSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
