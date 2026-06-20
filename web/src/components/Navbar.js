import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useSavedSearch } from '../context/SavedSearchContext';
import { useCurrency } from '../context/CurrencyContext';
import { FALLBACK_RATES } from '../utils/api';

const CURRENCIES = Object.keys(FALLBACK_RATES);

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { compare } = useCompare();
  const { totalNew } = useSavedSearch();
  const { currency, setCurrency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
    navigate(`/browse?q=${encodeURIComponent(search)}`);
  };

  const isActive = (path) => location.pathname === path;

  const roleColor = {
    admin: 'bg-red-600',
    dealer: 'bg-green-600',
    liaison: 'bg-orange-500',
    client: 'bg-blue-600',
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-black text-accent tracking-tight">Omni</span>
            <span className="text-2xl font-black text-white tracking-tight">Drive</span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="input-field pl-10 pr-4 py-2 text-sm"
                placeholder="Search brand, model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency picker */}
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-dark-surface border border-dark-border text-[#e6edf3] text-xs rounded-lg px-2 py-1.5 outline-none focus:border-accent cursor-pointer"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Nav links */}
            <Link
              to="/browse"
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isActive('/browse') ? 'text-accent bg-accent/10' : 'text-[#8b949e] hover:text-white'}`}
            >
              Browse
            </Link>

            {/* Saved-search alerts */}
            {totalNew > 0 && (
              <Link to="/browse" aria-label={`${totalNew} new matches for saved searches`} className="relative p-2 text-[#8b949e] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {totalNew}
                </span>
              </Link>
            )}

            {/* Compare */}
            {compare.length > 0 && (
              <Link to="/compare" aria-label="Compare vehicles" className="relative p-2 text-[#8b949e] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 5h6m-6 5h6M4 7h.01M4 12h.01M4 17h.01" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {compare.length}
                </span>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 text-[#8b949e] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${roleColor[user.role] || 'bg-accent'}`}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-dark-border">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-[#6e7681] capitalize">{user.role}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#c9d1d9] hover:bg-dark-surface hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#c9d1d9] hover:bg-dark-surface hover:text-white transition-colors">
                      My Orders
                    </Link>
                    <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#c9d1d9] hover:bg-dark-surface hover:text-white transition-colors">
                      Messages
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-dark-surface transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-4 py-2">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#8b949e] hover:text-white"
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Search brand, model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
            <Link to="/browse" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#c9d1d9] hover:text-white">Browse</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#c9d1d9] hover:text-white">
              Wishlist {wishlist.length > 0 && <span className="ml-1 badge bg-accent text-white">{wishlist.length}</span>}
            </Link>
            {compare.length > 0 && (
              <Link to="/compare" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#c9d1d9] hover:text-white">
                Compare <span className="ml-1 badge bg-accent text-white">{compare.length}</span>
              </Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#c9d1d9] hover:text-white">Dashboard</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#c9d1d9] hover:text-white">My Orders</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-400">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-accent font-semibold">Sign in</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
