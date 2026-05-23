import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omnidrive_wishlist') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('omnidrive_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = (vehicle) => {
    setWishlist(prev =>
      prev.some(v => v.id === vehicle.id)
        ? prev.filter(v => v.id !== vehicle.id)
        : [...prev, vehicle]
    );
  };

  const isWishlisted = (id) => wishlist.some(v => v.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
