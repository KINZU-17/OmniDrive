// Shared vehicle filtering/sorting used by BrowsePage and the saved-search matcher,
// so "what matches a set of filters" is defined in exactly one place.

// "Gasoline" (mock data) and "Petrol" (API/Kenya) mean the same thing.
export const normFuel = (f) => (f === 'Gasoline' ? 'Petrol' : f);

export function filterVehicles(vehicles, filters = {}) {
  let result = [...vehicles];
  const q = (filters.search || '').toLowerCase();
  if (q) result = result.filter(v =>
    `${v.brand} ${v.model} ${v.nation || ''} ${v.city || ''}`.toLowerCase().includes(q)
  );
  if (filters.category && filters.category !== 'All') result = result.filter(v => v.category === filters.category);
  if (filters.nation && filters.nation !== 'All') result = result.filter(v => v.nation === filters.nation);
  if (filters.fuel && filters.fuel !== 'All') result = result.filter(v => normFuel(v.fuel) === normFuel(filters.fuel));
  if (filters.condition && filters.condition !== 'All') result = result.filter(v => v.condition === filters.condition);
  if (filters.priceMin) result = result.filter(v => v.price >= Number(filters.priceMin));
  if (filters.priceMax) result = result.filter(v => v.price <= Number(filters.priceMax));
  if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (filters.sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (filters.sort === 'newest') result.sort((a, b) => (b.id || 0) - (a.id || 0));
  return result;
}

// True if a filter object actually narrows results (used to label/guard saving).
export function hasActiveFilters(filters = {}) {
  return Boolean(
    filters.search ||
    (filters.category && filters.category !== 'All') ||
    (filters.nation && filters.nation !== 'All') ||
    (filters.fuel && filters.fuel !== 'All') ||
    (filters.condition && filters.condition !== 'All') ||
    filters.priceMin ||
    filters.priceMax
  );
}

// Human-readable summary of the active filters, e.g. "SUV · Japan · Petrol".
export function describeFilters(filters = {}) {
  const parts = [];
  if (filters.search) parts.push(`"${filters.search}"`);
  if (filters.category && filters.category !== 'All') parts.push(filters.category);
  if (filters.nation && filters.nation !== 'All') parts.push(filters.nation);
  if (filters.fuel && filters.fuel !== 'All') parts.push(filters.fuel);
  if (filters.condition && filters.condition !== 'All') parts.push(filters.condition);
  if (filters.priceMin) parts.push(`≥ ${Number(filters.priceMin).toLocaleString()}`);
  if (filters.priceMax) parts.push(`≤ ${Number(filters.priceMax).toLocaleString()}`);
  return parts.length ? parts.join(' · ') : 'All vehicles';
}
