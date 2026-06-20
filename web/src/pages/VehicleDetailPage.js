import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { inventory as fallbackInventory } from '../data/inventory';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { usePageTitle } from '../utils/usePageTitle';
import FinancingCalculator from '../components/FinancingCalculator';
import ReviewsSection from '../components/ReviewsSection';
import RecentlyViewedRail from '../components/RecentlyViewedRail';

function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-dark-border/50 last:border-0">
      <span className="text-[#6e7681] text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { toggle, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const { record } = useRecentlyViewed();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('specs');
  usePageTitle(vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        const v = data.data || data.listing || data;
        setVehicle({ ...v, img: v.image || v.img, bodyStyle: v.body_style || v.bodyStyle, fuel: v.fuel_type || v.fuel });
      })
      .catch(() => {
        const v = fallbackInventory.find(v => v.id === parseInt(id));
        setVehicle(v || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Track this vehicle for the "Recently viewed" rail once it has loaded.
  useEffect(() => {
    if (vehicle && vehicle.id) record(vehicle);
  }, [vehicle?.id, record]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-dark-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-white">Vehicle Not Found</h1>
        <p className="text-[#6e7681]">This listing may have been removed or doesn't exist.</p>
        <Link to="/browse" className="btn-primary">← Back to Browse</Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(vehicle.id);

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6e7681] mb-6">
          <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">{vehicle.brand} {vehicle.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Image */}
          <div>
            <div className="card overflow-hidden aspect-[4/3]">
              <img
                src={vehicle.img || vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://placehold.co/800x600/161b22/e47911?text=${encodeURIComponent(vehicle.brand)}`; }}
              />
            </div>
          </div>

          {/* Right — Info */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl font-black text-white">{vehicle.brand} {vehicle.model}</h1>
                <button
                  onClick={() => toggle(vehicle)}
                  className={`p-2 rounded-full border transition-all flex-shrink-0 ${wishlisted ? 'border-accent bg-accent/10 text-accent' : 'border-dark-border text-[#6e7681] hover:border-accent hover:text-accent'}`}
                >
                  <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {vehicle.year && <span className="text-[#8b949e] text-sm">{vehicle.year}</span>}
                {vehicle.condition && (
                  <span className={`badge ${vehicle.condition === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {vehicle.condition}
                  </span>
                )}
                {vehicle.rating && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {vehicle.rating}/5
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="card p-5">
              <div className="text-3xl font-black text-accent mb-1">{format(vehicle.price)}</div>
              {vehicle.availability && (
                <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                  <span className={`w-2 h-2 rounded-full ${vehicle.availability === 'In Stock' ? 'bg-green-400' : vehicle.availability === 'Low Stock' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                  {vehicle.availability}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 border-b border-dark-border mb-4">
                {['specs', 'overview', 'financing', 'reviews'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${tab === t ? 'border-accent text-accent' : 'border-transparent text-[#8b949e] hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'specs' && (
                <div className="card p-4 space-y-0">
                  <SpecRow label="Engine" value={vehicle.engine} />
                  <SpecRow label="Horsepower" value={vehicle.horsepower ? `${vehicle.horsepower} HP` : null} />
                  <SpecRow label="Fuel Type" value={vehicle.fuel} />
                  <SpecRow label="Drivetrain" value={vehicle.drivetrain} />
                  <SpecRow label="Transmission" value={vehicle.transmission} />
                  <SpecRow label="Body Style" value={vehicle.bodyStyle || vehicle.body_style} />
                  <SpecRow label="Color" value={vehicle.color} />
                  <SpecRow label="Origin" value={vehicle.nation} />
                  {vehicle.mileage != null && vehicle.mileage > 0 && (
                    <SpecRow label="Mileage" value={`${vehicle.mileage.toLocaleString()} km`} />
                  )}
                  <SpecRow label="Warranty" value={vehicle.warranty} />
                </div>
              )}

              {tab === 'overview' && (
                <div className="card p-4">
                  <p className="text-[#8b949e] text-sm leading-relaxed">
                    {vehicle.description || `The ${vehicle.brand} ${vehicle.model} is a ${vehicle.condition?.toLowerCase()} ${vehicle.category?.toLowerCase()} offering ${vehicle.fuel?.toLowerCase()} power, ${vehicle.drivetrain} drive, and ${vehicle.bodyStyle?.toLowerCase()} styling. Contact a dealer for a test drive.`}
                  </p>
                </div>
              )}

              {tab === 'financing' && <FinancingCalculator price={vehicle.price} />}

              {tab === 'reviews' && <ReviewsSection listingId={vehicle.id} />}
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={() => user ? navigate(`/payment?vehicle=${vehicle.id}`) : navigate('/login')}
                className="btn-primary flex-1 py-3 text-base"
              >
                {user ? 'Purchase via MPesa' : 'Sign in to Purchase'}
              </button>
              <Link to="/messages" className="btn-outline px-4 py-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <RecentlyViewedRail excludeId={vehicle.id} className="mt-12" />
      </div>
    </div>
  );
}