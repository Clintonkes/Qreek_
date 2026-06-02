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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuthStore, { hasStoredActiveSession } from './store/authStore.js';
import PrivateLayout from './components/layout/PrivateLayout.jsx';

// Eager imports (no lazy loading) for instant response on navigation/clicks, avoids dynamic module fetch MIME errors in prod
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPin from './pages/ForgotPin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pools from './pages/Pools.jsx';
import PoolDetail from './pages/PoolDetail.jsx';
import Settings from './pages/Settings.jsx';
import Enterprise from './pages/Enterprise.jsx';
import CompanySetup from './pages/CompanySetup.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import PayrollRuns from './pages/PayrollRuns.jsx';
import PayrollRunCreate from './pages/PayrollRunCreate.jsx';
import PayrollRunDetail from './pages/PayrollRunDetail.jsx';
import PaymentLinks from './pages/PaymentLinks.jsx';
import PublicPayment from './pages/PublicPayment.jsx';

/**
 * AuthGuard component that protects routes requiring authentication.
 * Redirects to the login page if the user is not authenticated or has no active session.
 */
function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated && hasStoredActiveSession() ? <Outlet /> : <Navigate to="/login" replace />;
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
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
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
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/forgot-pin" element={<ForgotPin />} />
        <Route path="/p/:code"    element={<PublicPayment />} />

        <Route element={<AuthGuard />}>
          <Route element={<PrivateLayout />}>
            <Route element={<AnimatedOutlet />}>
              <Route path="/dashboard"                 element={<Dashboard />} />
              <Route path="/pools"                     element={<Pools />} />
              <Route path="/pools/:poolId"             element={<PoolDetail />} />
              <Route path="/settings"                  element={<Settings />} />
              <Route path="/enterprise"                element={<Enterprise />} />
              <Route path="/enterprise/setup"          element={<CompanySetup />} />
              <Route path="/enterprise/employees"      element={<EmployeeList />} />
              <Route path="/enterprise/payroll"        element={<PayrollRuns />} />
              <Route path="/enterprise/payroll/run"    element={<PayrollRunCreate />} />
              <Route path="/enterprise/payroll/:runId" element={<PayrollRunDetail />} />
              <Route path="/payment-links"             element={<PaymentLinks />} />
            </Route>
          </Route>
        </Route>

        <Route path="/trade"  element={<Navigate to="/dashboard" replace />} />
        <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
        <Route path="/alerts" element={<Navigate to="/dashboard" replace />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
