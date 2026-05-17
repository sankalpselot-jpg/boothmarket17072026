/**
 * App.js
 *
 * Root component. Sets up:
 * - AuthProvider (global auth state)
 * - React Router v6 route tree
 * - Toast notifications
 * - All page components mapped to their URLs
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Layout ────────────────────────────────────────────────────────────────────
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Pages ─────────────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ConsultantDashboardPage from './pages/ConsultantDashboardPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

import './styles/index.css';

// ── Smart Dashboard Redirect ──────────────────────────────────────────────────
// Sends authenticated users to the right dashboard for their role
const DashboardRedirect = () => {
  const { getDashboardPath } = useAuth();
  return <Navigate to={getDashboardPath()} replace />;
};

// ── Simple 404 Page ───────────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl font-black text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary px-6 py-3">Go to Homepage</a>
    </div>
  </div>
);

// ── Unauthorized Page ─────────────────────────────────────────────────────────
const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
    <div>
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <a href="/" className="btn-primary px-6 py-3">Go Home</a>
    </div>
  </div>
);

// ── Route Tree ────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Pending approval (authenticated but not yet approved) ── */}
      <Route
        path="/pending-approval"
        element={
          <ProtectedRoute requireApproved={false}>
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />

      {/* ── Dashboard redirect ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* ── Consultant Dashboard ── */}
      <Route
        path="/dashboard/consultant"
        element={
          <ProtectedRoute roles={['consultant']}>
            <ConsultantDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/consultant/inquiries"
        element={
          <ProtectedRoute roles={['consultant']}>
            <ConsultantDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Provider Dashboard ── */}
      <Route
        path="/dashboard/provider"
        element={
          <ProtectedRoute roles={['rental_provider']}>
            <ProviderDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/provider/listings"
        element={
          <ProtectedRoute roles={['rental_provider']}>
            <ProviderDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Admin Panel ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

// ── Root App ──────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      {/* Global toast notifications — appears top-right */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
