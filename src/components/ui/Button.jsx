// Button.jsx is the shared interactive button primitive used throughout the app,
// including loading states and width control for forms and dialogs.
import React from 'react';

const styles = {
  primary: {
    background: 'var(--teal)',
    color: 'var(--text-inv)',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--trans-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
  },
  secondary: {
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'var(--trans-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
  },
  danger: {
    background: 'var(--red-faint)',
    color: 'var(--red)',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255,71,87,0.2)',
    cursor: 'pointer',
    transition: 'var(--trans-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--trans-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
  },
};

export default function Button({
  variant = 'primary',
  children,
  style,
  disabled,
  fullWidth = false,
  loading = false,
  type = 'button',
  ...props
}) {
  const base = styles[variant] || styles.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      style={{
        ...base,
        width: fullWidth ? '100%' : base.width,
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      disabled={isDisabled}
      onMouseEnter={e => {
        if (!isDisabled) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
      }}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
