// TopBar.jsx is the compact mobile header for private pages, including the optional back action.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';

export default function TopBar({ title, back = false }) {
  const navigate = useNavigate();
  return (
    <header
      style={{
        minHeight: 64,
        background: 'rgba(10,22,40,0.94)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
      }}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem',
            minWidth: 44,
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      {!back && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
        </span>
      )}
      {title && <h1 style={{ fontSize: '1rem', fontWeight: 600, flex: 1 }}>{title}</h1>}
    </header>
  );
}
