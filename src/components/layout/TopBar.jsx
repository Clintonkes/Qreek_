// TopBar.jsx is the compact mobile header for private pages, including the optional back action.
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, SignOut, GearSix } from 'phosphor-react';
import useAuthStore from '../../store/authStore.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function TopBar({ title, back = false }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
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
        {title && <h1 style={{ fontSize: '1rem', fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/settings"
            aria-label="Settings"
            style={{
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <GearSix size={20} />
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Log out"
            style={{
              color: 'var(--red)',
              background: 'rgba(255,71,87,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '8px',
            }}
          >
            <SignOut size={20} />
          </button>
        </div>
      </header>

      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Log out of Qreek?">
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          You will be returned to the login page and need to sign in again to continue managing your payment flows.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Confirm logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
