// AppShell is now a pure content-area wrapper.
// Navigation (Sidebar, TopBar, MobileNav) lives in PrivateLayout and mounts ONCE —
// it never remounts or re-fetches on route changes.
import React from 'react';

export default function AppShell({ children }) {
  return (
    <div style={{
      maxWidth: 1240,
      width: '100%',
      margin: '0 auto',
      padding: '1.5rem 1rem',
    }}>
      <style>{`
        @media (min-width: 900px) {
          .appshell-inner { padding: 2rem !important; }
        }
        @media (max-width: 639px) {
          .appshell-inner { padding: 0.875rem !important; padding-bottom: calc(0.875rem + 80px) !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
