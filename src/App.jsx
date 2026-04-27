import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore.js';
import Spinner from './components/ui/Spinner.jsx';

const Landing   = lazy(() => import('./pages/Landing.jsx'));
const Login     = lazy(() => import('./pages/Login.jsx'));
const Register  = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Trade     = lazy(() => import('./pages/Trade.jsx'));
const Wallet    = lazy(() => import('./pages/Wallet.jsx'));
const Pools     = lazy(() => import('./pages/Pools.jsx'));
const Alerts    = lazy(() => import('./pages/Alerts.jsx'));
const Settings  = lazy(() => import('./pages/Settings.jsx'));

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
            <Route path="/dashboard" element={<PrivateRoute><PageWrap><Dashboard /></PageWrap></PrivateRoute>} />
            <Route path="/trade"     element={<PrivateRoute><PageWrap><Trade /></PageWrap></PrivateRoute>} />
            <Route path="/wallet"    element={<PrivateRoute><PageWrap><Wallet /></PageWrap></PrivateRoute>} />
            <Route path="/pools"     element={<PrivateRoute><PageWrap><Pools /></PageWrap></PrivateRoute>} />
            <Route path="/alerts"    element={<PrivateRoute><PageWrap><Alerts /></PageWrap></PrivateRoute>} />
            <Route path="/settings"  element={<PrivateRoute><PageWrap><Settings /></PageWrap></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}
