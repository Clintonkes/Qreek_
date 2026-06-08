import React from 'react';

/**
 * Spinner component - A lightweight non-circular loading indicator.
 *
 * @param {Object} props
 * @param {number} [props.size=24] - The width and height of the spinner in pixels.
 * @param {string} [props.color='var(--teal)'] - The fill color of the indicator.
 * @returns {JSX.Element}
 */
export default function Spinner({ size = 24, color = 'var(--teal)' }) {
  const dot = Math.max(3, Math.round(size / 5));
  const gap = Math.max(2, Math.round(size / 10));
  const height = Math.max(dot, Math.round(size / 3.5));
  return (
    <div
      aria-label="Loading"
      role="status"
      style={{
        width: size,
        height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
      }}
    >
      <style>{`
        @keyframes qreek-pulse {
          0%, 80%, 100% { transform: scale(0.65); opacity: 0.45; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: dot,
            height: dot,
            borderRadius: 9999,
            background: color,
            animation: `qreek-pulse 1s ease-in-out ${i * 0.12}s infinite`,
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}
