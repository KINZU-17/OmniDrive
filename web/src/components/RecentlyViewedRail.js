import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useCurrency } from '../context/CurrencyContext';

// Horizontal rail of compact cards for vehicles the user has recently opened.
// Renders nothing when there's nothing to show.
export default function RecentlyViewedRail({ excludeId, className = '' }) {
  const { recent } = useRecentlyViewed();
  const { format } = useCurrency();

  const items = recent.filter(v => v.id !== excludeId);
  if (items.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-lg font-bold text-white mb-3">Recently viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {items.map(v => (
          <Link
            key={v.id}
            to={`/vehicle/${v.id}`}
            className="card group flex-shrink-0 w-44 snap-start hover:border-accent/50 transition-all"
          >
            <div className="aspect-[16/10] bg-dark-surface overflow-hidden">
              <img
                src={v.image || `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(v.brand || 'Car')}`}
                alt={`${v.brand} ${v.model}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.src = `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(v.brand || 'Car')}`; }}
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate">{v.brand} {v.model}</h3>
              <p className="text-accent font-bold text-sm mt-0.5">{format(v.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
