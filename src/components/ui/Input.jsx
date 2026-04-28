// Input.jsx wraps a native input with label and error messaging so form fields stay consistent.
import React from 'react';

export default function Input({ label, error, style, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}
      <input
        style={{
          borderColor: error ? 'var(--red)' : undefined,
          boxShadow: error ? '0 0 0 3px var(--red-faint)' : undefined,
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>
      )}
    </div>
  );
}
