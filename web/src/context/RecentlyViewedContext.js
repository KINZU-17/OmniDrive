import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecentlyViewedContext = createContext(null);

const STORAGE_KEY = 'omnidrive_recently_viewed';
const MAX = 8;

export function RecentlyViewedProvider({ children }) {
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  }, [recent]);

  // Store a small projection, most-recent-first, deduped by id, capped at MAX.
  const record = useCallback((vehicle) => {
    if (!vehicle || vehicle.id == null) return;
    const entry = {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      price: vehicle.price,
      image: vehicle.image || vehicle.img,
      condition: vehicle.condition,
    };
    setRecent(prev => {
      const next = [entry, ...prev.filter(v => v.id !== entry.id)].slice(0, MAX);
      // Avoid a redundant state update (and storage write) if nothing changed.
      if (prev[0]?.id === entry.id && prev.length === next.length) return prev;
      return next;
    });
  }, []);

  const clear = useCallback(() => setRecent([]), []);

  return (
    <RecentlyViewedContext.Provider value={{ recent, record, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
