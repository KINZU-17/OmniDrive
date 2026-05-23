import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import FilterBar from '../components/FilterBar';
import { inventory as fallbackInventory } from '../data/inventory';

const PAGE_SIZE = 12;

function applyFilters(vehicles, filters) {
  let result = [...vehicles];
  const q = (filters.search || '').toLowerCase();
  if (q) result = result.filter(v => `${v.brand} ${v.model} ${v.nation || ''}`.toLowerCase().includes(q));
  if (filters.category && filters.category !== 'All') result = result.filter(v => v.category === filters.category);
  if (filters.fuel && filters.fuel !== 'All') result = result.filter(v => v.fuel === filters.fuel);
  if (filters.condition && filters.condition !== 'All') result = result.filter(v => v.condition === filters.condition);
  if (filters.priceMin) result = result.filter(v => v.price >= Number(filters.priceMin));
  if (filters.priceMax) result = result.filter(v => v.price <= Number(filters.priceMax));
  if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (filters.sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return result;
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: 'All',
    fuel: 'All',
    condition: 'All',
    sort: 'default',
    priceMin: '',
    priceMax: '',
  });

  // Fetch from API, fall back to local inventory
  useEffect(() => {
    setLoading(true);
    fetch('/api/listings?limit=200&isActive=1')
      .then(r => r.json())
      .then(data => {
        const items = (data.listings || data.data || []).map(v => ({
          ...v,
          img: v.image || v.img,
          bodyStyle: v.body_style || v.bodyStyle,
          fuel: v.fuel_type || v.fuel,
        }));
        setAllVehicles(items.length ? items : fallbackInventory);
      })
      .catch(() => setAllVehicles(fallbackInventory))
      .finally(() => setLoading(false));
  }, []);

  const handleFiltersChange = useCallback((f) => {
    setFilters(f);
    setPage(1);
  }, []);

  const filtered = useMemo(() => applyFilters(allVehicles, filters), [allVehicles, filters]);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-dark-card to-dark-bg border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Kenya's Premier <span className="text-accent">Vehicle</span> Marketplace
          </h1>
          <p className="text-[#8b949e] text-base">
            Browse {allVehicles.length.toLocaleString()}+ vehicles — cars, bikes, buses & more
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <FilterBar filters={filters} onChange={handleFiltersChange} count={filtered.length} />

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-dark-border border-t-accent rounded-full animate-spin" />
              <p className="text-[#8b949e] text-sm">Loading vehicles...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="w-16 h-16 text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white">No vehicles found</h3>
            <p className="text-[#6e7681] text-sm">Try adjusting your filters or search terms</p>
            <button
              onClick={() => handleFiltersChange({ search: '', category: 'All', fuel: 'All', condition: 'All', sort: 'default', priceMin: '', priceMax: '' })}
              className="btn-outline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Vehicle grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="btn-outline px-8 py-3 text-sm"
                >
                  Load more ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}