import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore.js';
import Spinner from './components/ui/Spinner.jsx';

const Landing          = lazy(() => import('./pages/Landing.jsx'));
const Login            = lazy(() => import('./pages/Login.jsx'));
const Register         = lazy(() => import('./pages/Register.jsx'));
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function PageWrap({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <Spinner size={40} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
            <Route path="/login"    element={<PublicRoute><PageWrap><Login /></PageWrap></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><PageWrap><Register /></PageWrap></PublicRoute>} />
            <Route path="/dashboard"              element={<PrivateRoute><PageWrap><Dashboard /></PageWrap></PrivateRoute>} />
            <Route path="/pools"                  element={<PrivateRoute><PageWrap><Pools /></PageWrap></PrivateRoute>} />
            <Route path="/pools/:poolId"           element={<PrivateRoute><PageWrap><PoolDetail /></PageWrap></PrivateRoute>} />
            <Route path="/settings"               element={<PrivateRoute><PageWrap><Settings /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise"             element={<PrivateRoute><PageWrap><Enterprise /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise/setup"       element={<PrivateRoute><PageWrap><CompanySetup /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise/employees"   element={<PrivateRoute><PageWrap><EmployeeList /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise/payroll"     element={<PrivateRoute><PageWrap><PayrollRuns /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise/payroll/run" element={<PrivateRoute><PageWrap><PayrollRunCreate /></PageWrap></PrivateRoute>} />
            <Route path="/enterprise/payroll/:runId" element={<PrivateRoute><PageWrap><PayrollRunDetail /></PageWrap></PrivateRoute>} />
            <Route path="/payment-links"          element={<PrivateRoute><PageWrap><PaymentLinks /></PageWrap></PrivateRoute>} />
            <Route path="/trade"                  element={<Navigate to="/dashboard" replace />} />
            <Route path="/wallet"                 element={<Navigate to="/dashboard" replace />} />
            <Route path="/alerts"                 element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}
