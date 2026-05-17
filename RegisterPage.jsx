/**
 * pages/LoginPage.js
 * Login form with role-based redirect after successful login.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMsg, setPendingMsg] = useState('');

  // Redirect destination after login (set by ProtectedRoute)
  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setIsSubmitting(true);
    setPendingMsg('');

    const result = await login(email, password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.firstName}!`);
      // Redirect to intended page or role dashboard
      const dest = from || getDashboardPath();
      navigate(dest, { replace: true });
    } else {
      if (result.approvalStatus === 'pending') {
        setPendingMsg('Your account is under review. You'll be notified by email once approved.');
      } else {
        toast.error(result.message);
      }
    }
    setIsSubmitting(false);
  };

  // Show session expired banner if redirected here with that reason
  const sessionExpired = new URLSearchParams(location.search).get('reason') === 'session_expired';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold text-dark-800">BoothMarket</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome Back</h1>
          <p className="text-gray-500 mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Register free
            </Link>
          </p>
        </div>

        {/* Session expired notice */}
        {sessionExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 text-sm text-yellow-800 text-center">
            ⚠️ Your session expired. Please log in again.
          </div>
        )}

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                className="form-input"
                placeholder="you@company.com"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
                className="form-input"
                placeholder="Your password"
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Pending approval message */}
            {pendingMsg && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⏳ {pendingMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By logging in you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
