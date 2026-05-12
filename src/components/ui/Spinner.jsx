import React from 'react';

/**
 * Spinner component - A lightweight SVG loading indicator with rotation animation.
 *
 * @param {Object} props
 * @param {number} [props.size=24] - The width and height of the spinner in pixels.
 * @param {string} [props.color='var(--teal)'] - The stroke color of the spinner.
 * @returns {JSX.Element}
 */
export default function Spinner({ size = 24, color = 'var(--teal)' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="50" strokeDashoffset="15" strokeLinecap="round" />
    </svg>
  );
}
