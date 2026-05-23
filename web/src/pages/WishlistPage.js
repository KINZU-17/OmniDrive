import React from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">My Wishlist</h1>
            <p className="text-[#8b949e] mt-1">{wishlist.length} saved vehicle{wishlist.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/browse" className="btn-outline text-sm">Browse More</Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="w-16 h-16 text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white">No saved vehicles yet</h3>
            <p className="text-[#6e7681] text-sm">Browse and tap the heart icon to save vehicles here</p>
            <Link to="/browse" className="btn-primary">Start Browsing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}