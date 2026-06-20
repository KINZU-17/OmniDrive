import React from 'react';
import { useSavedSearch } from '../context/SavedSearchContext';
import { hasActiveFilters, describeFilters } from '../utils/filterVehicles';

// "Save this search" control + a chip row of saved searches with new-match
// badges. Lives under the FilterBar on BrowsePage.
export default function SavedSearches({ filters, onApply }) {
  const { searches, save, remove, markSeen } = useSavedSearch();
  const canSave = hasActiveFilters(filters);

  const alreadySaved = searches.some(
    s => JSON.stringify(s.params) === JSON.stringify(filters)
  );

  const handleApply = (s) => {
    onApply(s.params);
    markSeen(s.id);
  };

  if (!canSave && searches.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {canSave && !alreadySaved && (
        <button
          onClick={() => save(filters)}
          className="btn-outline text-xs inline-flex items-center gap-1.5 py-1.5 px-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
          </svg>
          Save this search — {describeFilters(filters)}
        </button>
      )}

      {searches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6e7681] mr-1">Saved:</span>
          {searches.map(s => (
            <span
              key={s.id}
              className="group inline-flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full pl-3 pr-1.5 py-1 text-xs"
            >
              <button
                onClick={() => handleApply(s)}
                className="text-[#c9d1d9] hover:text-white transition-colors"
                title={`${s.matchCount} matching vehicles`}
              >
                {s.label}
              </button>
              {s.newCount > 0 && (
                <span className="bg-accent text-white rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                  +{s.newCount}
                </span>
              )}
              <button
                onClick={() => remove(s.id)}
                aria-label="Remove saved search"
                className="text-[#6e7681] hover:text-red-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
