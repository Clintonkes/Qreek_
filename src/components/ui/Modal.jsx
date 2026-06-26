// Modal.jsx provides the shared overlay and dialog shell used for confirmations and focused actions.
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'phosphor-react';

/**
 * Modal component - A shared overlay and dialog shell for confirmations and focused actions.
 * Includes Framer Motion animations and handles clicks outside/escape key for closing.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is currently visible.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {string} [props.title] - The title text displayed in the header.
 * @param {React.ReactNode} props.children - The content to be rendered inside the modal body.
 * @param {number} [props.maxWidth=480] - The maximum width of the modal dialog in pixels.
 * @returns {JSX.Element}
 */
export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(6,14,26,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '1.5rem',
              width: '100%', maxWidth, boxShadow: 'var(--shadow-lg)',
              maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{title}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
