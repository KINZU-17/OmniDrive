import React from 'react';

const CATEGORIES = ['All', 'Car', 'Bike', 'Bus', 'Truck'];
const FUELS = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const CONDITIONS = ['All', 'New', 'Used'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function FilterBar({ filters, onChange, count }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  const TabGroup = ({ value, options, filterKey }) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => update(filterKey, opt)}
          className={`px-3 py-1 text-xs rounded-full border font-medium transition-all duration-150 ${
            value === opt
              ? 'bg-accent border-accent text-white'
              : 'border-dark-border text-[#8b949e] hover:border-accent hover:text-white bg-transparent'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-6 space-y-4">
      {/* Search row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search brand, model, keyword..."
            value={filters.search || ''}
            onChange={e => update('search', e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>
        <select
          value={filters.sort || 'default'}
          onChange={e => update('sort', e.target.value)}
          className="bg-dark-surface border border-dark-border text-[#e6edf3] text-sm rounded-lg px-3 py-2 outline-none focus:border-accent cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter rows */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#6e7681] w-16 flex-shrink-0">Category</span>
          <TabGroup value={filters.category || 'All'} options={CATEGORIES} filterKey="category" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#6e7681] w-16 flex-shrink-0">Fuel</span>
          <TabGroup value={filters.fuel || 'All'} options={FUELS} filterKey="fuel" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#6e7681] w-16 flex-shrink-0">Condition</span>
          <TabGroup value={filters.condition || 'All'} options={CONDITIONS} filterKey="condition" />
        </div>
      </div>

      {/* Price range */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-[#6e7681] w-16 flex-shrink-0">Price</span>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={e => update('priceMin', e.target.value)}
            className="input-field text-xs py-1.5 w-24"
          />
          <span className="text-[#6e7681] text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={e => update('priceMax', e.target.value)}
            className="input-field text-xs py-1.5 w-24"
          />
          <span className="ml-auto text-xs text-[#6e7681]">{count} vehicles</span>
        </div>
      </div>
    </div>
  );
}