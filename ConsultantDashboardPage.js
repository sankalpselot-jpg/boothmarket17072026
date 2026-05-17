/**
 * context/AuthContext.js
 *
 * Global authentication state using React Context.
 * Provides: current user, login/logout functions, role helpers.
 * Persists session in localStorage so page refresh keeps the user logged in.
 *
 * Wrap your app in <AuthProvider> and consume with useAuth() hook.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  // Restore session from localStorage on first load
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      const { accessToken, refreshToken, user: userData } = data.data;

      // Persist tokens + user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      const approvalStatus = err.response?.data?.approvalStatus;
      return { success: false, message, approvalStatus };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      // Revoke refresh token on server (fire and forget)
      await authApi.logout(refreshToken);
    } catch {
      // Ignore errors — always clear local state
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await authApi.register(formData);
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      const errors = err.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Role Helpers ────────────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isConsultant = user?.role === 'consultant';
  const isProvider = user?.role === 'rental_provider';
  const isCompany = user?.role === 'company';
  const isApproved = user?.approvalStatus === 'approved';
  const isAuthenticated = !!user;

  // ─── Redirect Helper ─────────────────────────────────────────────────────────
  // Returns the correct dashboard path for the current user's role
  const getDashboardPath = useCallback(() => {
    if (!user) return '/login';
    const paths = {
      admin: '/admin',
      consultant: '/dashboard/consultant',
      rental_provider: '/dashboard/provider',
      company: '/dashboard/company',
    };
    return paths[user.role] || '/';
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register,
      isAdmin, isConsultant, isProvider, isCompany,
      isApproved, isAuthenticated,
      getDashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
