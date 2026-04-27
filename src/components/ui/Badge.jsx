import React from 'react';

const variants = {
  completed:  { bg: 'var(--green-faint)',  color: 'var(--green)' },
  processing: { bg: 'var(--amber-faint)',  color: 'var(--amber)' },
  pending:    { bg: 'var(--amber-faint)',  color: 'var(--amber)' },
  failed:     { bg: 'var(--red-faint)',    color: 'var(--red)' },
  default:    { bg: 'var(--surface-3)',    color: 'var(--text-2)' },
};

export default function Badge({ status, children, style }) {
  const v = variants[status] || variants.default;
  return (
    <span style={{
      display: 'inline-block', padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-full)', fontSize: '0.75rem',
      fontFamily: 'var(--font-display)', fontWeight: 600,
      background: v.bg, color: v.color, ...style,
    }}>
      {children || status}
    </span>
  );
}
