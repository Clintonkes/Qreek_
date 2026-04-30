// PrivateLayout mounts ONCE and never unmounts during navigation.
// Sidebar, TopBar, and MobileNav stay alive — only <Outlet> changes.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import TopBar from './TopBar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useRates } from '../../hooks/useRates.js';

export default function PrivateLayout() {
  useAuth();
  useRates();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        .qs-sidebar { display: none; }
        .qs-topbar  { display: block; }
        .qs-mobnav  { display: block; }
        .qs-main    { padding: 1rem; padding-bottom: calc(1rem + 80px); }
        @media (min-width: 900px) {
          .qs-sidebar { display: flex !important; }
          .qs-topbar  { display: none !important; }
          .qs-mobnav  { display: none !important; }
          .qs-main    { padding: 2rem !important; padding-bottom: 2rem !important; padding-left: calc(280px + 2rem) !important; }
        }
        @media (max-width: 639px) {
          .qs-main { padding: 0.875rem; padding-bottom: calc(0.875rem + 80px); }
        }
      `}</style>

       {/* Sidebar — never unmounts */}
       <div className="qs-sidebar" style={{ flexShrink: 0 }}>
         <Sidebar />
       </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="qs-topbar">
          <TopBar />
        </div>

        {/* Page content area — only this changes on navigation */}
        <main className="qs-main" style={{ flex: 1, maxWidth: 1240, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>

        <div className="qs-mobnav">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
