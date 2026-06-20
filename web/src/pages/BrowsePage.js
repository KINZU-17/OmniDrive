import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import FilterBar from '../components/FilterBar';
import RecentlyViewedRail from '../components/RecentlyViewedRail';
import SavedSearches from '../components/SavedSearches';
import { inventory as fallbackInventory } from '../data/inventory';
import { usePageTitle } from '../utils/usePageTitle';
import { filterVehicles } from '../utils/filterVehicles';

const PAGE_SIZE = 12;

export default function BrowsePage() {
  usePageTitle('Browse Vehicles', 'Browse cars, bikes, trucks and buses on OmniDrive — filter by category, fuel, price and more.');
  const [searchParams, setSearchParams] = useSearchParams();
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // The URL query string is the single source of truth for filters, so footer
  // links (/browse?category=Car), shared URLs and the FilterBar all stay in sync.
  const filters = useMemo(() => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    nation: searchParams.get('nation') || 'All',
    fuel: searchParams.get('fuel') || 'All',
    condition: searchParams.get('condition') || 'All',
    sort: searchParams.get('sort') || 'default',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
  }), [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/listings?limit=100&isActive=1')
      .then(r => r.json())
      .then(data => {
        const raw = Array.isArray(data.data) ? data.data : (data.listings || []);
        const items = raw.map(v => ({
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

  // Reset pagination whenever the filters (URL) change.
  useEffect(() => { setPage(1); }, [searchParams]);

  const handleFiltersChange = useCallback((f) => {
    const next = {};
    if (f.search) next.q = f.search;
    if (f.category && f.category !== 'All') next.category = f.category;
    if (f.nation && f.nation !== 'All') next.nation = f.nation;
    if (f.fuel && f.fuel !== 'All') next.fuel = f.fuel;
    if (f.condition && f.condition !== 'All') next.condition = f.condition;
    if (f.sort && f.sort !== 'default') next.sort = f.sort;
    if (f.priceMin) next.priceMin = f.priceMin;
    if (f.priceMax) next.priceMax = f.priceMax;
    setSearchParams(next, { replace: true });
  }, [setSearchParams]);

  const filtered = useMemo(() => filterVehicles(allVehicles, filters), [allVehicles, filters]);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const clearFilters = () => setSearchParams({}, { replace: true });

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-gradient-to-r from-dark-card to-dark-bg border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
            Browse <span className="text-accent">Vehicles</span>
          </h1>
          <p className="text-[#8b949e] text-sm">
            {loading ? 'Loading...' : `${allVehicles.length} vehicles available — cars, bikes, trucks & more`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar filters={filters} onChange={handleFiltersChange} count={filtered.length} />

        <SavedSearches filters={filters} onApply={handleFiltersChange} />

        <RecentlyViewedRail className="mt-6" />

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-dark-border border-t-accent rounded-full animate-spin" />
              <p className="text-[#8b949e] text-sm">Loading vehicles...</p>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-6xl"></div>
            <h3 className="text-xl font-semibold text-white">No vehicles found</h3>
            <p className="text-[#6e7681] text-sm">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-outline text-sm">Clear all filters</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={() => setPage(p => p + 1)} className="btn-outline px-8 py-3 text-sm">
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
