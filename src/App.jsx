import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore.js';
import Spinner from './components/ui/Spinner.jsx';
import PrivateLayout from './components/layout/PrivateLayout.jsx';

// Public pages — tiny bundles, load fast
const Landing  = lazy(() => import('./pages/Landing.jsx'));
const Login    = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));

// Private pages — lazy-loaded individually so only the needed page loads
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

function FullPageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <Spinner size={40} />
    </div>
  );
}

// Guards unauthenticated users away from private routes
function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Keeps logged-in users off the login / register screens
function GuestGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// Animated wrapper — only the page content animates, not the sidebar
const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

// Wraps all private pages with the animated transition
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={variants} initial="initial" animate="animate" exit="exit">
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Spinner size={28} />
          </div>
        }>
          <Outlet />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          {/* ── Public routes ─────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route element={<GuestGuard />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* ── Private routes — PrivateLayout mounts ONCE ────── */}
          {/* Sidebar, TopBar, MobileNav never unmount on navigation */}
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

          {/* Legacy redirects */}
          <Route path="/trade"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
          <Route path="/alerts" element={<Navigate to="/dashboard" replace />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
