import React, { useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import TopBar from './TopBar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useRates } from '../../hooks/useRates.js';

export default function AppShell({ children, title = '', back = false }) {
  useAuth();
  useRates();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="sidebar-desktop" style={{ display: 'none' }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="topbar-mobile">
          <TopBar title={title} back={back} />
        </div>

        <main style={{
          flex: 1, padding: '2rem',
          paddingBottom: 'calc(2rem + 64px)',
          maxWidth: 1200, width: '100%', margin: '0 auto',
        }}>
          {children}
        </main>
      </div>

      <div className="mobile-nav-bar">
        <MobileNav />
      </div>

      <style>{`
        @media (min-width: 900px) {
          .sidebar-desktop { display: flex !important; }
          .topbar-mobile   { display: none !important; }
          .mobile-nav-bar  { display: none !important; }
          main { padding-bottom: 2rem !important; }
        }
        @media (max-width: 899px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile   { display: block; }
          .mobile-nav-bar  { display: block; }
        }
      `}</style>
    </div>
  );
}
