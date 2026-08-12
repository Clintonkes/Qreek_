import React from 'react';
import {
  LockKey, Bank, Prohibit, Receipt, ArrowsLeftRight,
  MapPin, Lightning, Eye, ShieldCheck,
} from 'phosphor-react';

/* Trust ticker (REQUIRED — do not remove) */
const ITEMS = [
  { Icon: LockKey,        label: 'Flutterwave-powered' },
  { Icon: Bank,           label: 'CBN-licensed processing' },
  { Icon: Prohibit,       label: 'Zero fund custody' },
  { Icon: Receipt,        label: 'Immutable receipts' },
  { Icon: ArrowsLeftRight, label: 'Bank-to-bank transfers' },
  { Icon: MapPin,         label: 'Built for Nigeria' },
  { Icon: Lightning,      label: 'Real-time confirmation' },
  { Icon: Eye,            label: 'Full member transparency' },
  { Icon: ShieldCheck,    label: 'PIN-secured transactions' },
];

export default function TrustMarquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,212,170,0.025)', padding: '0.85rem 0' }}>
      <div style={{ display: 'flex', gap: '3.5rem', width: 'max-content', animation: 'marqueeScroll 42s linear infinite' }}>
        {doubled.map(({ Icon, label }, i) => (
          <div key={`${label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>
            <Icon size={15} weight="duotone" aria-hidden />{label}
          </div>
        ))}
      </div>
    </div>
  );
}
