import React, { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function PinModal({ open, onClose, onSubmit, loading = false, title = 'Enter PIN' }) {
  const [pin, setPin] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setPin(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length >= 4) onSubmit(pin);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={380}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Enter your 4–6 digit PIN to authorise this transaction.
        </p>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
          style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
          autoComplete="current-password"
        />
        <Button type="submit" loading={loading} disabled={pin.length < 4} fullWidth>
          Confirm
        </Button>
      </form>
    </Modal>
  );
}
