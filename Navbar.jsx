/**
 * components/marketplace/ProductCard.js
 * Reusable card for displaying a rental product in the marketplace grid.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const {
    id, title, price_per_day, minimum_rental_days,
    delivery_time_days, city, state,
    primary_image, category_name,
    provider_first_name, provider_last_name, provider_company,
    stock_quantity,
  } = product;

  return (
    <Link to={`/products/${id}`} className="card block group overflow-hidden">

      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {primary_image ? (
          <img
            src={primary_image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl opacity-30">📦</span>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 badge bg-white/90 text-gray-700 shadow-sm text-xs">
          {category_name}
        </span>
        {/* Stock warning */}
        {stock_quantity <= 2 && (
          <span className="absolute top-3 right-3 badge bg-orange-100 text-orange-700">
            Only {stock_quantity} left
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2
          group-hover:text-brand-600 transition-colors">
          {title}
        </h3>

        {/* Provider */}
        <p className="text-xs text-gray-400 mb-3 truncate">
          by {provider_company || `${provider_first_name} ${provider_last_name}`}
        </p>

        {/* Price */}
        <div className="flex items-end gap-1 mb-3">
          <span className="text-xl font-extrabold text-brand-600">
            ₹{parseFloat(price_per_day).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-gray-400 mb-0.5">/day</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span>📍 {city}{state ? `, ${state}` : ''}</span>
          <span>🚚 {delivery_time_days}d delivery</span>
        </div>

        {minimum_rental_days > 1 && (
          <p className="text-xs text-gray-400 mt-1.5">
            Min. {minimum_rental_days} days rental
          </p>
        )}
      </div>

    </Link>
  );
};

export default ProductCard;
