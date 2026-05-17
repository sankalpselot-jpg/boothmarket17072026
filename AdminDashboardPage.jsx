/**
 * components/common/Navbar.js
 *
 * Top navigation bar. Shows different links depending on:
 * - Whether user is logged in
 * - Their role (consultant / provider / company / admin)
 * - Their approval status
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Simple hamburger icon (inline SVG — no extra dependency)
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Role label shown next to user name
  const roleLabel = {
    consultant: 'Consultant',
    rental_provider: 'Rental Provider',
    company: 'Company',
    admin: 'Admin',
  }[user?.role] || '';

  // Nav links depend on role
  const navLinks = isAuthenticated
    ? [
        { to: '/marketplace', label: 'Browse Rentals' },
        ...(user?.role === 'consultant'
          ? [{ to: '/dashboard/consultant', label: 'My Dashboard' }]
          : []),
        ...(user?.role === 'rental_provider'
          ? [
              { to: '/dashboard/provider', label: 'My Dashboard' },
              { to: '/dashboard/provider/listings', label: 'My Listings' },
            ]
          : []),
        ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
      ]
    : [
        { to: '/marketplace', label: 'Browse Rentals' },
        { to: '/how-it-works', label: 'How It Works' },
      ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-dark-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-sm">
              BM
            </div>
            <span className="font-bold text-lg tracking-tight group-hover:text-brand-400 transition-colors">
              BoothMarket
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.to)
                    ? 'bg-dark-700 text-brand-400'
                    : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Auth Buttons ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User info pill */}
                <div className="flex items-center gap-2 bg-dark-700 rounded-full px-3 py-1.5">
                  <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-white leading-tight">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-gray-400 leading-tight">{roleLabel}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white font-medium px-3 py-2">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Register Free
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-700 border-t border-dark-600 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-dark-600 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Logout ({user?.firstName})
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="block btn-primary text-center text-sm">
                    Register Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
