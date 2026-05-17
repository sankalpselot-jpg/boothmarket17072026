/**
 * pages/AdminDashboardPage.js
 *
 * Admin control panel with:
 * - Platform statistics at the top
 * - Tabbed user list (All / Pending / Consultants / Providers / Companies)
 * - Approve / Reject / Suspend buttons per user
 * - Rejection reason modal
 * - Audit log tab
 */

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-extrabold text-gray-900">{value ?? '…'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

// ─── Rejection Modal ──────────────────────────────────────────────────────────
const RejectModal = ({ user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Account</h3>
        <p className="text-sm text-gray-500 mb-4">
          Rejecting <strong>{user.first_name} {user.last_name}</strong> ({user.email}).
          They will receive an email with your reason.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="form-input mb-4"
          rows={3}
          placeholder="Reason for rejection (optional but recommended)..."
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow = ({ user, onApprove, onReject, onSuspend, onUnsuspend }) => {
  const roleColors = {
    consultant: 'bg-blue-100 text-blue-700',
    rental_provider: 'bg-purple-100 text-purple-700',
    company: 'bg-green-100 text-green-700',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="font-medium text-gray-900 text-sm">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-xs text-gray-400">{user.email}</div>
        {user.company_name && (
          <div className="text-xs text-gray-500">{user.company_name}</div>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={`badge text-xs ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
          {user.role === 'rental_provider' ? 'Provider' : user.role}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`badge-${user.approval_status}`}>
          {user.approval_status}
        </span>
      </td>
      <td className="px-4 py-4 text-xs text-gray-500">
        <div>{user.city}{user.state ? `, ${user.state}` : ''}</div>
        <div className="text-gray-400">
          {new Date(user.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </div>
      </td>
      <td className="px-4 py-4">
        {user.product_count > 0 && (
          <span className="text-xs text-gray-500">{user.product_count} products</span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          {user.approval_status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(user)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onReject(user)}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
              >
                ✕ Reject
              </button>
            </>
          )}
          {user.approval_status === 'approved' && (
            <button
              onClick={() => onSuspend(user)}
              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold rounded-lg transition-colors"
            >
              ⏸ Suspend
            </button>
          )}
          {user.approval_status === 'suspended' && (
            <button
              onClick={() => onUnsuspend(user)}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
            >
              ▶ Unsuspend
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending | all | consultant | rental_provider | company
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load stats on mount
  useEffect(() => {
    adminApi.getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => toast.error('Could not load stats.'));
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 25,
        ...(activeTab !== 'all' && activeTab !== 'pending'
          ? { role: activeTab }
          : {}),
        ...(activeTab === 'pending' ? { status: 'pending' } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      };
      const res = await adminApi.getUsers(params);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchUsers(1);
  }, [activeTab]); // eslint-disable-line

  const handleApprove = async (user) => {
    try {
      await adminApi.approveUser(user.id);
      toast.success(`${user.first_name} ${user.last_name} approved! Email sent.`);
      fetchUsers(currentPage);
      adminApi.getStats().then((r) => setStats(r.data.data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    try {
      await adminApi.rejectUser(rejectTarget.id, reason);
      toast.success(`${rejectTarget.first_name} rejected. Email sent.`);
      setRejectTarget(null);
      fetchUsers(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    }
  };

  const handleSuspend = async (user) => {
    if (!window.confirm(`Suspend ${user.first_name} ${user.last_name}? They will lose access immediately.`)) return;
    try {
      await adminApi.suspendUser(user.id);
      toast.success(`${user.first_name} suspended.`);
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to suspend user.');
    }
  };

  const handleUnsuspend = async (user) => {
    try {
      await adminApi.unsuspendUser(user.id);
      toast.success(`${user.first_name} unsuspended.`);
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to unsuspend.');
    }
  };

  const TABS = [
    { key: 'pending', label: `Pending (${stats?.users?.pending_approvals ?? '…'})` },
    { key: 'all', label: `All Users (${stats?.users?.approved_users ?? '…'})` },
    { key: 'consultant', label: `Consultants (${stats?.users?.total_consultants ?? '…'})` },
    { key: 'rental_provider', label: `Providers (${stats?.users?.total_providers ?? '…'})` },
    { key: 'company', label: `Companies (${stats?.users?.total_companies ?? '…'})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage platform users and registrations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending Approvals" value={stats?.users?.pending_approvals} icon="⏳" color="bg-yellow-100" />
          <StatCard label="Total Consultants" value={stats?.users?.total_consultants} icon="🏗️" color="bg-blue-100" />
          <StatCard label="Rental Providers" value={stats?.users?.total_providers} icon="🏭" color="bg-purple-100" />
          <StatCard label="Active Products" value={stats?.products?.active_products} icon="📦" color="bg-green-100" />
        </div>

        {/* User Management Table */}
        <div className="card overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-4 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                className="form-input max-w-sm text-sm"
                placeholder="Search by name, email, or company…"
              />
              <button onClick={() => fetchUsers(1)} className="btn-primary text-sm px-4 py-2">
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['User', 'Role', 'Status', 'Location / Joined', 'Products', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onApprove={handleApprove}
                      onReject={setRejectTarget}
                      onSuspend={handleSuspend}
                      onUnsuspend={handleUnsuspend}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {users.length} of {pagination.total} users
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1.5 text-gray-600">
                  {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Rejection Modal */}
      {rejectTarget && (
        <RejectModal
          user={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
