// AppShell.jsx provides the shared authenticated layout: fixed desktop navigation,
// mobile navigation, auth checks, and the scrolling container for page content.
import React from 'react';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import TopBar from './TopBar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useRates } from '../../hooks/useRates.js';

export default function AppShell({ children, title = '', back = false }) {
  useAuth();
  useRates();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, var(--bg) 0%, #081225 100%)' }}>
      <div className="sidebar-desktop" style={{ display: 'none' }}>
        <Sidebar />
      </div>

      <div className="app-shell-content" style={{ minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="topbar-mobile">
          <TopBar title={title} back={back} />
        </div>

        <main className="app-shell-main" style={{ flex: 1, minWidth: 0 }}>
          <div className="app-shell-inner" style={{ maxWidth: 1240, width: '100%', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <div className="mobile-nav-bar">
        <MobileNav />
      </div>

      <style>{`
        @media (min-width: 900px) {
          .sidebar-desktop { display: block !important; }
          .topbar-mobile   { display: none !important; }
          .mobile-nav-bar  { display: none !important; }
          .app-shell-content {
            margin-left: 280px;
          }
          .app-shell-main {
            padding: 2rem;
          }
          .app-shell-inner {
            min-height: calc(100vh - 4rem);
          }
        }
        @media (max-width: 899px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile   { display: block; }
          .mobile-nav-bar  { display: block; }
          .app-shell-main {
            padding: 1rem;
            padding-bottom: calc(1rem + 84px);
          }
        }
        @media (max-width: 639px) {
          .app-shell-main {
            padding: 0.875rem;
            padding-bottom: calc(0.875rem + 84px);
          }
        }
      `}</style>
    </div>
  );
}
