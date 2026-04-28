// Sidebar.jsx anchors the desktop dashboard navigation and wraps logout in a confirmation modal
// so users do not accidentally end an active management session.
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChartPieSlice,
  Users,
  GearSix,
  SignOut,
  Buildings,
  Link as LinkIcon,
} from 'phosphor-react';
import useAuthStore from '../../store/authStore.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const NAV_MAIN = [
  { to: '/dashboard', icon: ChartPieSlice, label: 'Dashboard' },
  { to: '/pools', icon: Users, label: 'Pools' },
  { to: '/payment-links', icon: LinkIcon, label: 'Payment Links' },
];

const NAV_ENTERPRISE = [
  { to: '/enterprise', icon: Buildings, label: 'Enterprise' },
];

const NAV_BOTTOM = [
  { to: '/settings', icon: GearSix, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const initials = (user?.name || 'Q').slice(0, 1).toUpperCase();
  const firstName = user?.name?.split(' ')[0] || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        style={{
          width: 280,
          height: '100vh',
          background: 'rgba(10,22,40,0.96)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          flexShrink: 0,
          overflow: 'hidden',
          backdropFilter: 'blur(18px)',
          zIndex: 70,
        }}
      >
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
            Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
          </span>
        </div>

        <div style={{ padding: '1rem 1rem 0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', marginBottom: '0.35rem' }}>
              Workspace
            </div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Payment Operations</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              Manage collections, pools, and business payouts from one calm dashboard.
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, minHeight: 0, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_MAIN.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '14px',
                color: isActive ? 'var(--teal)' : 'var(--text-2)',
                background: isActive ? 'linear-gradient(135deg, rgba(0,212,170,0.14), rgba(0,212,170,0.05))' : 'transparent',
                border: isActive ? '1px solid var(--teal-border)' : '1px solid transparent',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'var(--trans-fast)',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </NavLink>
          ))}

          <div style={{ margin: '0.75rem 0 0.25rem', padding: '0 0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Enterprise
            </span>
          </div>

          {NAV_ENTERPRISE.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '14px',
                color: isActive ? 'var(--amber)' : 'var(--text-2)',
                background: isActive ? 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.05))' : 'transparent',
                border: isActive ? '1px solid rgba(245,166,35,0.25)' : '1px solid transparent',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'var(--trans-fast)',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          {NAV_BOTTOM.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '14px',
                color: isActive ? 'var(--teal)' : 'var(--text-2)',
                background: isActive ? 'linear-gradient(135deg, rgba(0,212,170,0.14), rgba(0,212,170,0.05))' : 'transparent',
                border: isActive ? '1px solid var(--teal-border)' : '1px solid transparent',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'var(--trans-fast)',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'rgba(6,14,26,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--teal)',
                color: 'var(--text-inv)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || firstName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.phone}</div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 0.85rem',
              borderRadius: '14px',
              background: 'none',
              border: 'none',
              color: 'var(--text-3)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              transition: 'var(--trans-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--red)';
              e.currentTarget.style.background = 'var(--red-faint)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <SignOut size={16} />
            Log out
          </button>
        </div>
      </aside>

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
