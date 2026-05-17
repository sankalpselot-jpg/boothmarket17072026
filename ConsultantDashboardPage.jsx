/**
 * components/common/ProtectedRoute.js
 *
 * Route guard that checks:
 * 1. User is authenticated (has a valid session)
 * 2. User has the required role(s)
 * 3. User's account is approved (if required)
 *
 * Usage in Router:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute roles={['consultant', 'rental_provider']}>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } />
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({
  children,
  roles = [],           // Allowed roles. Empty = any authenticated user.
  requireApproved = true, // Block pending accounts from accessing this route
}) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role access (admins always pass)
  if (roles.length > 0 && !roles.includes(user.role) && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Block pending/rejected users (unless they're admin)
  if (requireApproved && !isAdmin && user.approvalStatus !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
};

export default ProtectedRoute;
