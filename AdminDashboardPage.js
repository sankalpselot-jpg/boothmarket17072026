/**
 * pages/MarketplacePage.js
 *
 * Public-facing product catalogue.
 * Supports: full-text search, category filter, city filter, price range, sorting.
 * Reads initial filters from URL query params (deep-linkable).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/marketplace/ProductCard';
import toast from 'react-hot-toast';

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
const FilterSidebar = ({ filters, setFilters, categories, onApply }) => (
  <div className="space-y-6">
    <h3 className="font-bold text-gray-900 text-lg">Filters</h3>

    {/* Category */}
    <div>
      <label className="form-label">Category</label>
      <select
        value={filters.categoryId}
        onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
        className="form-input"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>

    {/* City */}
    <div>
      <label className="form-label">City</label>
      <input
        type="text"
        value={filters.city}
        onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
        className="form-input"
        placeholder="e.g. Mumbai"
      />
    </div>

    {/* Price Range */}
    <div>
      <label className="form-label">Price Per Day (₹)</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number" min="0"
          value={filters.minPrice}
          onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          className="form-input"
          placeholder="Min"
        />
        <input
          type="number" min="0"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          className="form-input"
          placeholder="Max"
        />
      </div>
    </div>

    {/* Sort */}
    <div>
      <label className="form-label">Sort By</label>
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
        className="form-input"
      >
        <option value="created_at">Newest First</option>
        <option value="price_per_day_asc">Price: Low to High</option>
        <option value="price_per_day_desc">Price: High to Low</option>
        <option value="view_count">Most Viewed</option>
        <option value="inquiry_count">Most Inquired</option>
      </select>
    </div>

    <button onClick={onApply} className="btn-primary w-full py-2.5">Apply Filters</button>
    <button
      onClick={() => {
        setFilters({ search: '', categoryId: '', city: '', minPrice: '', maxPrice: '', sortBy: 'created_at' });
        onApply();
      }}
      className="btn-secondary w-full py-2.5"
    >
      Clear Filters
    </button>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Load categories once on mount
  useEffect(() => {
    categoryApi.list()
      .then((r) => setCategories(r.data.data.categories))
      .catch(() => {});
  }, []);

  // Build query params from filters state and fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Parse sortBy (price_per_day_asc → sortBy=price_per_day, sortOrder=ASC)
      let sortBy = filters.sortBy;
      let sortOrder = 'DESC';
      if (filters.sortBy === 'price_per_day_asc') { sortBy = 'price_per_day'; sortOrder = 'ASC'; }
      if (filters.sortBy === 'price_per_day_desc') { sortBy = 'price_per_day'; sortOrder = 'DESC'; }

      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.city && { city: filters.city }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      };

      const res = await productApi.list(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
      setCurrentPage(page);

      // Sync URL with current filters (for sharing/bookmarking)
      const urlParams = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) urlParams[k] = v; });
      setSearchParams(urlParams, { replace: true });
    } catch {
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  // Fetch when filters or page change
  useEffect(() => {
    fetchProducts(1);
  }, []); // eslint-disable-line

  const handleApplyFilters = () => {
    fetchProducts(1);
    setShowMobileFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Search Bar ── */}
      <div className="bg-dark-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Browse Rental Products</h1>
          <form
            onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
            className="flex gap-2 max-w-2xl"
          >
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              placeholder="Search LED displays, furniture, lighting..."
            />
            <button type="submit" className="btn-primary px-6 py-3 rounded-xl">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Desktop Filter Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                onApply={handleApplyFilters}
              />
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <main className="flex-1 min-w-0">

            {/* Results count + mobile filter button */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
              </p>
              <button
                className="lg:hidden btn-secondary text-sm py-2 px-4"
                onClick={() => setShowMobileFilters(true)}
              >
                ⚙️ Filters
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card h-72 animate-pulse bg-gray-100" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setFilters({ search: '', categoryId: '', city: '', minPrice: '', maxPrice: '', sortBy: 'created_at' });
                    fetchProducts(1);
                  }}
                  className="btn-primary px-6 py-2.5"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Product cards */}
            {!loading && products.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      onClick={() => fetchProducts(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchProducts(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              onApply={handleApplyFilters}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketplacePage;
