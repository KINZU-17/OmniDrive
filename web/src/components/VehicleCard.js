import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

const conditionBadge = {
  New: 'bg-green-500/20 text-green-400',
  Used: 'bg-yellow-500/20 text-yellow-400',
  'Pre-Order': 'bg-blue-500/20 text-blue-400',
};

const availabilityDot = {
  'In Stock': 'bg-green-400',
  'Low Stock': 'bg-yellow-400',
  'Pre-Order': 'bg-blue-400',
  'Out of Stock': 'bg-red-400',
};

export default function VehicleCard({ vehicle }) {
  const { format } = useCurrency();
  const { toggle, isWishlisted } = useWishlist();
  const { toggle: toggleCompare, isCompared, isFull } = useCompare();
  const wishlisted = isWishlisted(vehicle.id);
  const compared = isCompared(vehicle.id);

  return (
    <div className="card group hover:border-accent/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-dark-surface">
        <img
          src={vehicle.img || vehicle.image || 'https://placehold.co/400x250/161b22/e47911?text=No+Image'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(vehicle.brand)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/60 via-transparent to-transparent" />

        {/* Action buttons — wishlist + compare */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => toggle(vehicle)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${wishlisted ? 'bg-accent text-white' : 'bg-dark-card/70 text-[#8b949e] hover:text-accent'}`}
          >
            <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            onClick={() => toggleCompare(vehicle)}
            disabled={!compared && isFull}
            aria-label={compared ? 'Remove from comparison' : 'Add to comparison'}
            aria-pressed={compared}
            title={!compared && isFull ? 'Comparison is full (max 3)' : 'Compare'}
            className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed ${compared ? 'bg-accent text-white' : 'bg-dark-card/70 text-[#8b949e] hover:text-accent'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 5h6m-6 5h6M4 7h.01M4 12h.01M4 17h.01" />
            </svg>
          </button>
        </div>

        {/* Condition badge */}
        <span className={`absolute top-3 left-3 badge ${conditionBadge[vehicle.condition] || 'bg-dark-surface text-[#8b949e]'}`}>
          {vehicle.condition}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.year && <p className="text-xs text-[#6e7681] mt-0.5">{vehicle.year}</p>}
          </div>
          <span className="text-accent font-bold text-base whitespace-nowrap flex-shrink-0">
            {format(vehicle.price)}
          </span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-[#8b949e] mb-3 flex-wrap">
          {vehicle.fuel && <span>{vehicle.fuel}</span>}
          {vehicle.drivetrain && <span>{vehicle.drivetrain}</span>}
          {vehicle.bodyStyle && <span>{vehicle.bodyStyle}</span>}
          {vehicle.nation && <span className="ml-auto">{vehicle.nation}</span>}
        </div>

        {/* Availability + Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-xs text-[#8b949e]">
            <span className={`w-2 h-2 rounded-full ${availabilityDot[vehicle.availability] || 'bg-gray-500'}`} />
            {vehicle.availability || 'Available'}
          </span>
          {vehicle.rating && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {vehicle.rating}
              {vehicle.reviewCount > 0 && (
                <span className="text-[#6e7681]">({vehicle.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <Link
          to={`/vehicle/${vehicle.id}`}
          className="btn-primary flex items-center justify-center gap-2 text-sm"
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}