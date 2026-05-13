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

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuthStore, { hasStoredActiveSession } from './store/authStore.js';
import PrivateLayout from './components/layout/PrivateLayout.jsx';

const Landing    = lazy(() => import('./pages/Landing.jsx'));
const Login      = lazy(() => import('./pages/Login.jsx'));
const Register   = lazy(() => import('./pages/Register.jsx'));
const ForgotPin  = lazy(() => import('./pages/ForgotPin.jsx'));
const Dashboard        = lazy(() => import('./pages/Dashboard.jsx'));
const Pools            = lazy(() => import('./pages/Pools.jsx'));
const PoolDetail       = lazy(() => import('./pages/PoolDetail.jsx'));
const Settings         = lazy(() => import('./pages/Settings.jsx'));
const Enterprise       = lazy(() => import('./pages/Enterprise.jsx'));
const CompanySetup     = lazy(() => import('./pages/CompanySetup.jsx'));
const EmployeeList     = lazy(() => import('./pages/EmployeeList.jsx'));
const PayrollRuns      = lazy(() => import('./pages/PayrollRuns.jsx'));
const PayrollRunCreate = lazy(() => import('./pages/PayrollRunCreate.jsx'));
const PayrollRunDetail = lazy(() => import('./pages/PayrollRunDetail.jsx'));
const PaymentLinks     = lazy(() => import('./pages/PaymentLinks.jsx'));
const PublicPayment    = lazy(() => import('./pages/PublicPayment.jsx'));

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
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
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
      <Suspense fallback={null}>
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
      </Suspense>
    </BrowserRouter>
  );
}
