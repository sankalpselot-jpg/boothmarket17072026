/**
 * pages/RegisterPage.js
 *
 * Unified registration form for all 3 user roles.
 * Role is pre-selected via ?role=consultant query param (from homepage CTAs)
 * but the user can change it.
 *
 * Dynamic fields appear/disappear based on selected role.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    value: 'consultant',
    label: 'Exhibition Consultant',
    desc: 'I design & produce booths',
    icon: '🏗️',
  },
  {
    value: 'rental_provider',
    label: 'Rental Provider',
    desc: 'I rent out exhibition items',
    icon: '🏭',
  },
  {
    value: 'company',
    label: 'Company',
    desc: 'I need event solutions',
    icon: '🏢',
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
];

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState(
    searchParams.get('role') || 'consultant'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: selectedRole } });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      role: selectedRole,
      // Convert comma-separated specializations string to array
      specializations: data.specializations
        ? data.specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      serviceCities: data.serviceCities
        ? data.serviceCities.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    const result = await registerUser(payload);

    if (result.success) {
      setSuccess(true);
      toast.success('Registration submitted! Check your email.');
    } else {
      toast.error(result.message || 'Registration failed.');
      if (result.errors) {
        result.errors.forEach((e) => toast.error(`${e.field}: ${e.message}`));
      }
    }
    setIsSubmitting(false);
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-10 text-center animate-fade-in">
          <div className="text-5xl mb-5">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Received!</h2>
          <p className="text-gray-500 mb-2">
            Your account is now <strong>under admin review</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            We'll email you within 24–48 hours once it's approved.
            Check your spam folder if you don't see it.
          </p>
          <Link to="/" className="btn-primary w-full py-3 block text-center">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold text-dark-800">BoothMarket</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Your Account</h1>
          <p className="text-gray-500 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Role Selector ── */}
            <div>
              <label className="form-label">I am registering as *</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all
                      ${selectedRole === r.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className={`text-xs font-bold leading-tight
                      ${selectedRole === r.value ? 'text-brand-700' : 'text-gray-700'}`}>
                      {r.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Basic Info ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="form-input"
                  placeholder="Raj"
                />
                {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="form-input"
                  placeholder="Sharma"
                />
                {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
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
              <label className="form-label">
                {selectedRole === 'consultant' ? 'Production House / Firm Name'
                  : selectedRole === 'rental_provider' ? 'Business / Brand Name'
                  : 'Company Name'} *
              </label>
              <input
                {...register('companyName', { required: 'Company/business name is required' })}
                className="form-input"
                placeholder="e.g. Sharma Exhibits Pvt Ltd"
              />
              {errors.companyName && <p className="form-error">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                {...register('phone', {
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                })}
                className="form-input"
                placeholder="9876543210"
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">City *</label>
                <input
                  {...register('city', { required: 'City is required' })}
                  className="form-input"
                  placeholder="Mumbai"
                />
                {errors.city && <p className="form-error">{errors.city.message}</p>}
              </div>
              <div>
                <label className="form-label">State *</label>
                <select
                  {...register('state', { required: 'State is required' })}
                  className="form-input"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="form-error">{errors.state.message}</p>}
              </div>
            </div>

            {/* ── Role-specific fields ── */}

            {/* Consultant extras */}
            {selectedRole === 'consultant' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Consultant Details
                </h3>
                <div>
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0" max="50"
                    {...register('yearsExperience')}
                    className="form-input"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="form-label">Specializations</label>
                  <input
                    {...register('specializations')}
                    className="form-input"
                    placeholder="LED walls, Custom booths, Modular (comma separated)"
                  />
                </div>
                <div>
                  <label className="form-label">Cities You Operate In</label>
                  <input
                    {...register('serviceCities')}
                    className="form-input"
                    placeholder="Mumbai, Delhi, Bengaluru (comma separated)"
                  />
                </div>
              </div>
            )}

            {/* Rental Provider extras */}
            {selectedRole === 'rental_provider' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Provider Details
                </h3>
                <div>
                  <label className="form-label">Warehouse / Storage Address</label>
                  <textarea
                    {...register('warehouseAddress')}
                    className="form-input"
                    rows={2}
                    placeholder="Full address of your warehouse or storage facility"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Delivery Radius (km)</label>
                    <input
                      type="number" min="0" max="500"
                      {...register('deliveryRadiusKm')}
                      className="form-input"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="form-label">GST Number (optional)</label>
                    <input
                      {...register('gstin')}
                      className="form-input"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Company extras */}
            {selectedRole === 'company' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Company Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Industry</label>
                    <input
                      {...register('industry')}
                      className="form-input"
                      placeholder="e.g. Automotive, Tech, FMCG"
                    />
                  </div>
                  <div>
                    <label className="form-label">Events Per Year</label>
                    <input
                      type="number" min="1"
                      {...register('numEventsPerYear')}
                      className="form-input"
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Password ── */}
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)/,
                      message: 'Password must contain at least one letter and one number',
                    },
                  })}
                  className="form-input"
                  placeholder="Min. 8 characters with a number"
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  className="form-input"
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* ── Terms ── */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                {...register('terms', { required: 'You must accept the terms to register' })}
                className="mt-1 accent-brand-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to BoothMarket's{' '}
                <a href="#" className="text-brand-600 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="form-error">{errors.terms.message}</p>}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? 'Submitting…' : 'Create Account'}
            </button>

          </form>
        </div>

        {/* Admin review notice */}
        <p className="text-center text-sm text-gray-500 mt-5">
          🔒 Accounts are manually reviewed before activation. Typically 24–48 hours.
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
