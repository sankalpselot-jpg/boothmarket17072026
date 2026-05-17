/**
 * pages/PendingApprovalPage.js
 * Shown to registered users whose accounts are still under admin review.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PendingApprovalPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-10 text-center animate-fade-in">
        <div className="text-6xl mb-5">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Under Review</h1>
        <p className="text-gray-600 mb-3">
          Hi <strong>{user?.firstName}</strong>, your registration has been received!
        </p>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Our admin team is reviewing your account. You will receive an email at{' '}
          <strong className="text-gray-700">{user?.email}</strong> once it has been approved.
          This usually takes <strong>24–48 business hours</strong>.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6 text-left">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="space-y-1 text-xs">
            <li>✅ Admin reviews your profile details</li>
            <li>✅ You receive an approval or feedback email</li>
            <li>✅ Once approved, you can log in and use the platform</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Haven't received an email? Check your spam folder or contact{' '}
          <a href="mailto:support@boothmarket.com" className="text-brand-600 hover:underline">
            support@boothmarket.com
          </a>
        </p>
        <button
          onClick={logout}
          className="btn-secondary w-full py-2.5"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
