import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartPieSlice, Link as LinkIcon, Users, Buildings, UsersThree } from 'phosphor-react';

const NAV = [
  { to: '/dashboard',  icon: ChartPieSlice, label: 'Home' },
  { to: '/pools',      icon: Users,         label: 'Pools' },
  { to: null,          icon: UsersThree,    label: 'Family', comingSoon: true },
  { to: '/payment-links', icon: LinkIcon,   label: 'Links' },
  { to: '/enterprise', icon: Buildings,     label: 'Business' },
];

export default function MobileNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
      background: 'var(--bg-2)', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch', zIndex: 100,
    }}>
      {NAV.map(({ to, icon: Icon, label, comingSoon }) => (
        comingSoon ? (
          <div
            key={label}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
              color: 'var(--text-3)',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-display)', fontWeight: 500,
              minHeight: 44, cursor: 'not-allowed', opacity: 0.5,
            }}
            title={`${label} · Coming soon`}
          >
            <Icon size={20} weight="regular" />
            {label}
          </div>
        ) : (
          <NavLink
            key={to} to={to}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
              color: isActive ? 'var(--teal)' : 'var(--text-3)',
              textDecoration: 'none', fontSize: '0.65rem',
              fontFamily: 'var(--font-display)', fontWeight: 500,
              transition: 'var(--trans-fast)',
              minHeight: 44,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                {label}
              </>
            )}
          </NavLink>
        )
      ))}
    </nav>
  );
}
