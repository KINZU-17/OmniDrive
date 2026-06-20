import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { filterVehicles, describeFilters } from '../utils/filterVehicles';

const SavedSearchContext = createContext(null);

const STORAGE_KEY = 'omnidrive_saved_searches';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function SavedSearchProvider({ children }) {
  // Each search: { id, label, params, baselineId }. baselineId = the highest
  // listing id known when the search was saved / last marked seen; matching
  // listings with a higher id count as "new since you last looked".
  const [searches, setSearches] = useState(load);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }, [searches]);

  // Only fetch the catalogue if there's at least one saved search to evaluate.
  useEffect(() => {
    if (searches.length === 0) return;
    let cancelled = false;
    fetch('/api/listings?limit=100&isActive=1')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const raw = Array.isArray(d.data) ? d.data : (d.listings || []);
        setListings(raw.map(v => ({ ...v, fuel: v.fuel_type || v.fuel })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // Re-fetch when going from zero → some saved searches.
  }, [searches.length]);

  const maxListingId = useMemo(
    () => listings.reduce((m, v) => Math.max(m, v.id || 0), 0),
    [listings]
  );

  // Annotate each saved search with how many matching listings are newer than
  // its baseline.
  const annotated = useMemo(() => searches.map(s => {
    const matches = filterVehicles(listings, s.params);
    const newCount = matches.filter(v => (v.id || 0) > (s.baselineId || 0)).length;
    return { ...s, matchCount: matches.length, newCount };
  }), [searches, listings]);

  const totalNew = useMemo(
    () => annotated.reduce((sum, s) => sum + s.newCount, 0),
    [annotated]
  );

  const save = useCallback((params, label) => {
    setSearches(prev => [
      {
        id: Date.now(),
        label: label || describeFilters(params),
        params,
        // Anything currently in the catalogue is "already seen".
        baselineId: maxListingId,
      },
      ...prev,
    ]);
  }, [maxListingId]);

  const remove = useCallback((id) => {
    setSearches(prev => prev.filter(s => s.id !== id));
  }, []);

  const markSeen = useCallback((id) => {
    setSearches(prev => prev.map(s => s.id === id ? { ...s, baselineId: maxListingId } : s));
  }, [maxListingId]);

  return (
    <SavedSearchContext.Provider value={{ searches: annotated, totalNew, save, remove, markSeen }}>
      {children}
    </SavedSearchContext.Provider>
  );
}

export const useSavedSearch = () => useContext(SavedSearchContext);
