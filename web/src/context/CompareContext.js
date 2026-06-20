import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

// Mirrors WishlistContext: a small, localStorage-backed selection — but capped
// at 3 vehicles so the side-by-side table on /compare stays readable.
export function CompareProvider({ children }) {
  const [compare, setCompare] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omnidrive_compare') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('omnidrive_compare', JSON.stringify(compare));
  }, [compare]);

  const toggle = (vehicle) => {
    setCompare(prev => {
      if (prev.some(v => v.id === vehicle.id)) return prev.filter(v => v.id !== vehicle.id);
      if (prev.length >= MAX_COMPARE) return prev; // at capacity — ignore
      return [...prev, vehicle];
    });
  };

  const remove = (id) => setCompare(prev => prev.filter(v => v.id !== id));
  const clear = () => setCompare([]);
  const isCompared = (id) => compare.some(v => v.id === id);

  return (
    <CompareContext.Provider value={{ compare, toggle, remove, clear, isCompared, max: MAX_COMPARE, isFull: compare.length >= MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
