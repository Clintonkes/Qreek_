import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChartPieSlice, Users, GearSix, SignOut,
  Buildings, Link as LinkIcon,
} from 'phosphor-react';
import useAuthStore from '../../store/authStore.js';

const NAV_MAIN = [
  { to: '/dashboard', icon: ChartPieSlice, label: 'Dashboard' },
  { to: '/pools',     icon: Users,         label: 'Pools' },
  { to: '/payment-links', icon: LinkIcon,  label: 'Payment Links' },
];

const NAV_ENTERPRISE = [
  { to: '/enterprise',    icon: Buildings, label: 'Enterprise' },
  { to: '/payment-links', icon: LinkIcon,  label: 'Pay Links' },
];

const NAV_BOTTOM = [
  { to: '/settings',  icon: GearSix,       label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const initials = (user?.name || 'Q').slice(0, 1).toUpperCase();
  const firstName = user?.name?.split(' ')[0] || '';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
          Qreek<span style={{ color: 'var(--teal)' }}>Pay</span>
        </span>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {NAV_MAIN.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)',
              color: isActive ? 'var(--teal)' : 'var(--text-2)',
              background: isActive ? 'var(--teal-faint)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.9rem',
              transition: 'var(--trans-fast)', textDecoration: 'none',
            })}
          >
            <Icon size={18} weight="duotone" />{label}
          </NavLink>
        ))}

        <div style={{ margin: '0.75rem 0 0.25rem', padding: '0 0.75rem' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise</span>
        </div>

        {NAV_ENTERPRISE.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)',
              color: isActive ? 'var(--amber)' : 'var(--text-2)',
              background: isActive ? 'var(--amber-faint)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.9rem',
              transition: 'var(--trans-fast)', textDecoration: 'none',
            })}
          >
            <Icon size={18} weight="duotone" />{label}
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        {NAV_BOTTOM.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)',
              color: isActive ? 'var(--teal)' : 'var(--text-2)',
              background: isActive ? 'var(--teal-faint)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.9rem',
              transition: 'var(--trans-fast)', textDecoration: 'none',
            })}
          >
            <Icon size={18} weight="duotone" />{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--teal)', color: 'var(--text-inv)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || firstName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.phone}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)',
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-display)',
            transition: 'var(--trans-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-faint)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
        >
          <SignOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
