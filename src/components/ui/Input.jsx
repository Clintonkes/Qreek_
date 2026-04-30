// Input.jsx wraps a native input with label and error messaging so form fields stay consistent.
import React, { useRef, useEffect } from 'react';

export default function Input({ label, error, hint, style, containerStyle, multiline, rows = 1, ...props }) {
  const textareaRef = useRef(null);

  // Auto-expand textarea when content changes
  useEffect(() => {
    if (multiline && textareaRef.current) {
      const el = textareaRef.current;
      const adjust = () => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      };
      adjust();
    }
  }, [multiline, props.value]);

  const handleChange = (e) => {
    if (multiline && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const inputBaseStyle = {
    borderColor: error ? 'var(--red)' : undefined,
    boxShadow: error ? '0 0 0 3px var(--red-faint)' : undefined,
    ...style,
  };

  const textareaExtraStyle = {
    resize: 'none',
    overflow: 'hidden',
    minHeight: rows > 1 ? undefined : '60px',
  };

  const inputElement = multiline ? (
    <textarea
      ref={textareaRef}
      rows={rows}
      style={{ ...inputBaseStyle, ...textareaExtraStyle }}
      {...props}
      onChange={handleChange}
    />
  ) : (
    <input style={inputBaseStyle} {...props} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}
      {inputElement}
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>
      )}
      {!error && hint && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{hint}</span>
      )}
    </div>
  );
}
