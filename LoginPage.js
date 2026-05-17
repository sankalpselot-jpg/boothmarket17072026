/**
 * pages/ConsultantDashboardPage.js
 *
 * Consultant's home base:
 * - Quick stats (inquiries sent, accepted, pending)
 * - Sent inquiries list with status tracking
 * - Quick links to marketplace
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inquiryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'badge-pending',
  responded: 'badge bg-blue-100 text-blue-700',
  accepted: 'badge bg-green-100 text-green-700',
  declined: 'badge bg-red-100 text-red-700',
  cancelled: 'badge bg-gray-100 text-gray-500',
};

const ConsultantDashboardPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await inquiryApi.list({ ...params, limit: 50 });
      setInquiries(res.data.data.inquiries);
    } catch {
      toast.error('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this inquiry?')) return;
    try {
      await inquiryApi.cancel(id);
      toast.success('Inquiry cancelled.');
      loadInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel inquiry.');
    }
  };

  // Compute stats
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    accepted: inquiries.filter((i) => i.status === 'accepted').length,
    responded: inquiries.filter((i) => i.status === 'responded').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.firstName}!
            </h1>
            <p className="text-gray-500 text-sm mt-1">Consultant Dashboard</p>
          </div>
          <Link to="/marketplace" className="btn-primary px-5 py-2.5">
            🔍 Browse Rentals
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Inquiries', value: stats.total, color: 'text-gray-900' },
            { label: 'Awaiting Response', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Provider Responded', value: stats.responded, color: 'text-blue-600' },
            { label: 'Accepted Deals', value: stats.accepted, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Inquiry List */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-gray-900">My Inquiries</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input py-2 text-sm w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Inquiries Yet</h3>
              <p className="text-gray-500 text-sm mb-5">
                Browse the marketplace and send your first inquiry to a rental provider.
              </p>
              <Link to="/marketplace" className="btn-primary px-6 py-2.5">
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">

                    {/* Product thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {inq.product_image
                        ? <img src={inq.product_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📦</div>
                      }
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {inq.product_title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Provider: {inq.provider_company || `${inq.provider_first_name} ${inq.provider_last_name}`}
                          </p>
                        </div>
                        <span className={`${STATUS_STYLES[inq.status]} flex-shrink-0`}>
                          {inq.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span>
                          📅 {new Date(inq.rental_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(inq.rental_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>📦 Qty: {inq.quantity_needed}</span>
                        {inq.estimated_total > 0 && (
                          <span className="text-brand-600 font-semibold">
                            Est. ₹{parseFloat(inq.estimated_total).toLocaleString('en-IN')}
                          </span>
                        )}
                        {inq.event_name && <span>🎪 {inq.event_name}</span>}
                      </div>

                      {/* Provider response */}
                      {inq.provider_response && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-gray-700">
                          <span className="font-medium text-blue-600">Provider replied: </span>
                          {inq.provider_response}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 justify-end">
                    <Link
                      to={`/products/${inq.product_id || ''}`}
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      View Product
                    </Link>
                    {inq.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(inq.id)}
                        className="text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel Inquiry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConsultantDashboardPage;
