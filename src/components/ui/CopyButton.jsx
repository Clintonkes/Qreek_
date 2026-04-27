import React, { useState } from 'react';
import { CopySimple, Check } from 'phosphor-react';

export default function CopyButton({ text, style }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        background: 'var(--surface-3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer',
        color: copied ? 'var(--teal)' : 'var(--text-2)', display: 'inline-flex',
        alignItems: 'center', transition: 'var(--trans-fast)', ...style,
      }}
    >
      {copied ? <Check size={16} /> : <CopySimple size={16} />}
    </button>
  );
}
