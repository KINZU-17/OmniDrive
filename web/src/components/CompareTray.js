import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

// Sticky action bar that appears when vehicles are selected for comparison.
// Hidden on the /compare page itself (you're already there).
export default function CompareTray() {
  const { compare, remove, clear, max } = useCompare();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (compare.length === 0 || pathname === '/compare') return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-dark-card/95 backdrop-blur border-t border-dark-border shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <span className="hidden sm:block text-sm font-semibold text-white whitespace-nowrap">
          Compare <span className="text-accent">{compare.length}</span>/{max}
        </span>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {compare.map(v => (
            <div key={v.id} className="relative flex items-center gap-2 bg-dark-surface border border-dark-border rounded-lg pl-2 pr-7 py-1.5 flex-shrink-0">
              <span className="text-xs text-white whitespace-nowrap max-w-[140px] truncate">{v.brand} {v.model}</span>
              <button
                onClick={() => remove(v.id)}
                aria-label={`Remove ${v.brand} ${v.model} from comparison`}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-red-400"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={clear} className="hidden sm:block text-xs text-[#6e7681] hover:text-white whitespace-nowrap">Clear</button>
        <button
          onClick={() => navigate('/compare')}
          disabled={compare.length < 2}
          className="btn-primary text-sm px-5 py-2 whitespace-nowrap disabled:opacity-50"
        >
          Compare{compare.length < 2 ? ' (pick 2+)' : ''}
        </button>
      </div>
    </div>
  );
}
