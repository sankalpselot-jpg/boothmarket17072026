/**
 * pages/ProductDetailPage.js
 *
 * Full product detail view. Shows:
 * - Image gallery
 * - Full specs (dimensions, weight, delivery info)
 * - Availability calendar (blocked dates)
 * - Inquiry form (consultants only)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productApi, inquiryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isConsultant, isApproved } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { quantityNeeded: 1 },
  });

  const startDate = watch('rentalStartDate');
  const endDate = watch('rentalEndDate');

  // Calculate estimated total dynamically from form values
  const estimatedDays = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1)
    : 0;
  const estimatedTotal = product
    ? product.price_per_day * estimatedDays * (parseInt(watch('quantityNeeded')) || 1)
    : 0;

  // Load product on mount
  useEffect(() => {
    setLoading(true);
    productApi.getById(id)
      .then((res) => setProduct(res.data.data))
      .catch(() => toast.error('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const onInquirySubmit = async (data) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!isConsultant) {
      toast.error('Only consultants can send inquiries.');
      return;
    }
    if (!isApproved) {
      toast.error('Your account must be approved to send inquiries.');
      return;
    }

    setSubmitting(true);
    try {
      await inquiryApi.create({ ...data, productId: id });
      toast.success('Inquiry sent! The provider will respond within 48 hours.');
      setInquiryOpen(false);
      navigate('/dashboard/consultant/inquiries');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" style={{ width: `${70 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-xl text-gray-500">Product not found.</p>
      </div>
    );
  }

  const blockedSet = new Set(product.blockedDates?.map((d) => d.toString().slice(0, 10)) || []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <a href="/marketplace" className="hover:text-brand-600">Marketplace</a>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* ── Image Gallery ── */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              {product.images?.[selectedImg]?.image_url ? (
                <img
                  src={product.images[selectedImg].image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">📦</div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all
                      ${i === selectedImg ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div>
            <span className="badge badge-active mb-3">{product.category_name}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>

            {/* Provider */}
            <p className="text-sm text-gray-500 mb-5">
              Listed by <span className="font-medium text-gray-700">
                {product.provider_company || `${product.provider_first_name} ${product.provider_last_name}`}
              </span>
              {product.provider_city && ` · ${product.provider_city}`}
            </p>

            {/* Price */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-5">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-brand-700">
                  ₹{parseFloat(product.price_per_day).toLocaleString('en-IN')}
                </span>
                <span className="text-gray-500 mb-1">/ day</span>
              </div>
              {product.security_deposit > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  + ₹{parseFloat(product.security_deposit).toLocaleString('en-IN')} refundable deposit
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Minimum rental: {product.minimum_rental_days} day{product.minimum_rental_days > 1 ? 's' : ''}
              </p>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              {[
                { label: '📍 Location', value: `${product.city || '—'}${product.state ? `, ${product.state}` : ''}` },
                { label: '🚚 Delivery', value: `${product.delivery_time_days} day${product.delivery_time_days > 1 ? 's' : ''} before event` },
                { label: '📦 Stock', value: `${product.stock_quantity} unit${product.stock_quantity > 1 ? 's' : ''} available` },
                { label: '🗺️ Delivery Radius', value: product.delivery_radius_km ? `${product.delivery_radius_km} km` : 'Contact provider' },
                ...(product.length_cm ? [{ label: '📐 Dimensions', value: `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm` }] : []),
                ...(product.weight_kg ? [{ label: '⚖️ Weight', value: `${product.weight_kg} kg` }] : []),
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{spec.label}</div>
                  <div className="font-medium text-gray-800">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {isConsultant && isApproved ? (
              <button
                onClick={() => setInquiryOpen(true)}
                className="btn-primary w-full py-4 text-base"
              >
                📩 Send Inquiry to Provider
              </button>
            ) : !isAuthenticated ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Log in as a consultant to send an inquiry</p>
                <a href="/login" className="btn-primary px-8 py-3">Log In to Inquire</a>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
                Only approved consultants can send inquiries.
              </div>
            )}
          </div>
        </div>

        {/* ── Blocked Dates Notice ── */}
        {product.blockedDates?.length > 0 && (
          <div className="mt-10 card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">📅 Unavailable Dates</h3>
            <div className="flex flex-wrap gap-2">
              {product.blockedDates.slice(0, 20).map((date) => (
                <span key={date} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                  {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              ))}
              {product.blockedDates.length > 20 && (
                <span className="text-xs text-gray-400 py-1">+{product.blockedDates.length - 20} more dates</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Inquiry Modal ── */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInquiryOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setInquiryOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >✕</button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Send Inquiry</h2>
            <p className="text-sm text-gray-500 mb-6">{product.title}</p>

            <form onSubmit={handleSubmit(onInquirySubmit)} className="space-y-4">
              <div>
                <label className="form-label">Event Name (optional)</label>
                <input {...register('eventName')} className="form-input" placeholder="e.g. Auto Expo 2025" />
              </div>

              <div>
                <label className="form-label">Event City</label>
                <input {...register('eventCity')} className="form-input" placeholder="e.g. Mumbai" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Rental Start Date *</label>
                  <input
                    type="date"
                    {...register('rentalStartDate', { required: 'Start date required' })}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  {errors.rentalStartDate && <p className="form-error">{errors.rentalStartDate.message}</p>}
                </div>
                <div>
                  <label className="form-label">Rental End Date *</label>
                  <input
                    type="date"
                    {...register('rentalEndDate', { required: 'End date required' })}
                    className="form-input"
                    min={startDate || new Date().toISOString().slice(0, 10)}
                  />
                  {errors.rentalEndDate && <p className="form-error">{errors.rentalEndDate.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Quantity Needed *</label>
                <input
                  type="number" min="1" max={product.stock_quantity}
                  {...register('quantityNeeded', { required: true, min: 1, max: product.stock_quantity })}
                  className="form-input"
                />
                <p className="text-xs text-gray-400 mt-1">{product.stock_quantity} units available</p>
              </div>

              {/* Estimated total */}
              {estimatedDays > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{product.price_per_day} × {estimatedDays} days × {watch('quantityNeeded')} unit(s)</span>
                  </div>
                  <div className="flex justify-between font-bold text-brand-700 mt-1 text-base">
                    <span>Estimated Total</span>
                    <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Final price confirmed by provider</p>
                </div>
              )}

              <div>
                <label className="form-label">Your Message to Provider *</label>
                <textarea
                  {...register('consultantMessage', {
                    required: 'Message is required',
                    minLength: { value: 20, message: 'Message must be at least 20 characters' },
                  })}
                  className="form-input"
                  rows={4}
                  placeholder="Describe your event, specific requirements, setup details, delivery needs..."
                />
                {errors.consultantMessage && (
                  <p className="form-error">{errors.consultantMessage.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-base"
              >
                {submitting ? 'Sending…' : 'Send Inquiry →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
