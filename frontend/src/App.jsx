import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { PageTransition } from './components/ui/motion';

import HomePage from './pages/HomePage';
import CtfPage from './pages/CtfPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/ctf" element={<PageTransition><CtfPage /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><DashboardPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppShell() {
  const location = useLocation();
  const hideFooter =
    location.pathname === '/admin/login' ||
    location.pathname.startsWith('/admin/dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AnimatedRoutes />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
