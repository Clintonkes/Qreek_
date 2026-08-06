/**
 * @file App.jsx
 * @description The root component of the Qreek Finance application.
 * This file sets up the primary routing infrastructure, authentication guards, 
 * and global page transitions.
 * 
 * Flow:
 * 1. Orchestration: Manages the mapping of URLs to specific page components.
 * 2. Security: Implements the AuthGuard component to protect private dashboards and management tools.
 * 3. Navigation: Provides the high-level application layout and global state integration.
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuthStore, { hasStoredActiveSession } from './store/authStore.js';
import PrivateLayout from './components/layout/PrivateLayout.jsx';
import PublicPageShell from './components/layout/PublicPageShell.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPin from './pages/ForgotPin.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Pools = lazy(() => import('./pages/Pools.jsx'));
const PoolDetail = lazy(() => import('./pages/PoolDetail.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const PayrollCheckoutReturn = lazy(() => import('./pages/PayrollCheckoutReturn.jsx'));
const PaymentLinks = lazy(() => import('./pages/PaymentLinks.jsx'));
const LinkSettlements = lazy(() => import('./pages/LinkSettlements.jsx'));
const PublicPayment = lazy(() => import('./pages/PublicPayment.jsx'));
const EmployeeSelfService = lazy(() => import('./pages/EmployeeSelfService.jsx'));

/**
 * AuthGuard component that protects routes requiring authentication.
 * Redirects to the login page if the user is not authenticated or has no active session.
 */
function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated && hasStoredActiveSession() ? <Outlet /> : <Navigate to="/login" replace />;
}

function FamilyRedirect() {
  return <Navigate to="/pools" replace />;
}

function EnterpriseComingSoon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Enterprise</h2>
      <p style={{ color: 'var(--text-2)', maxWidth: 380, lineHeight: 1.6, fontSize: '0.95rem' }}>
        Enterprise tools are in development. Payroll, team management, and business analytics are on their way.
      </p>
      <span style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '2rem', padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Coming Soon
      </span>
    </div>
  );
}

function EmployeeEditRedirect() {
  const { token } = useParams();
  return <Navigate to={`/invite/general/${token}`} replace />;
}

function OldInviteRedirect() {
  const { token } = useParams();
  return <Navigate to={`/invite/general/${token}`} replace />;
}

const variants = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0,        transition: { duration: 0.12 } },
};

// No spinner fallback — pages render instantly from cache on subsequent visits
/**
 * AnimatedOutlet component that provides page transition animations using Framer Motion.
 * Wraps the react-router-dom Outlet to animate route changes.
 */
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={variants} initial="initial" animate="animate" exit="exit">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function RouteFallback() {
  return null;
}

/**
 * Main App component - Root of the Qreek Finance application.
 * Defines the application structure, configuring all public, private, and dynamic routes.
 * 
 * Features:
 * - Routing Architecture: Centralizes route management for dashboards, pools, and enterprise tools.
 * - Authentication Guards: Protects sensitive paths via the AuthGuard component.
 * - Transitions: Implements fluid page animations using Framer Motion.
 * - Global State: Integrates with Zustand and Session storage for session persistence.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<PublicPageShell />}>
            <Route path="/"           element={<Landing />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/forgot-pin" element={<ForgotPin />} />
            <Route path="/p/:code"    element={<PublicPayment />} />
            <Route path="/invite/:company/:token" element={<EmployeeSelfService />} />
            <Route path="/enterprise/invite/:token" element={<OldInviteRedirect />} />
            <Route path="/enterprise/employee-edit/:token" element={<EmployeeEditRedirect />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<PrivateLayout />}>
              <Route element={<AnimatedOutlet />}>
                <Route path="/dashboard"                 element={<Dashboard />} />
                <Route path="/pools"                     element={<Pools />} />
                <Route path="/pools/:poolId"             element={<PoolDetail />} />
                <Route path="/family"                    element={<FamilyRedirect />} />
                <Route path="/family/:familyId"          element={<FamilyRedirect />} />
                <Route path="/settings"                  element={<Settings />} />
                <Route path="/enterprise"                element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/:businessId"   element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/setup"          element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/employees"      element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/payroll"        element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/payroll/run"    element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/payroll/:runId" element={<EnterpriseComingSoon />} />
                <Route path="/enterprise/payroll/:runId/checkout/return" element={<PayrollCheckoutReturn />} />
                <Route path="/payment-links"             element={<PaymentLinks />} />
                <Route path="/payment-links/:linkId/settlements" element={<LinkSettlements />} />
              </Route>
            </Route>
          </Route>

          <Route path="/trade"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
          <Route path="/alerts" element={<Navigate to="/dashboard" replace />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
