import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { usePageTitle } from '../utils/usePageTitle';

// Normalize the fields a vehicle might carry (API snake_case vs mock camelCase).
function field(v, key) {
  const map = {
    fuel: v.fuel || v.fuel_type,
    bodyStyle: v.bodyStyle || v.body_style,
    image: v.img || v.image,
  };
  return map[key] !== undefined ? map[key] : v[key];
}

const ROWS = [
  { key: 'price', label: 'Price', money: true },
  { key: 'year', label: 'Year' },
  { key: 'condition', label: 'Condition' },
  { key: 'category', label: 'Category' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'drivetrain', label: 'Drivetrain' },
  { key: 'bodyStyle', label: 'Body Style' },
  { key: 'color', label: 'Color' },
  { key: 'nation', label: 'Origin' },
  { key: 'rating', label: 'Rating' },
  { key: 'availability', label: 'Availability' },
];

export default function ComparePage() {
  usePageTitle('Compare Vehicles');
  const { compare, remove, clear } = useCompare();
  const { format } = useCurrency();

  if (compare.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">Nothing to compare yet</h1>
        <p className="text-[#6e7681] max-w-sm">Add vehicles using the “Compare” button on any vehicle card, then view them side by side here.</p>
        <Link to="/browse" className="btn-primary">Browse Vehicles</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-3xl font-black text-white">Compare <span className="text-accent">Vehicles</span></h1>
          <button onClick={clear} className="text-sm text-[#6e7681] hover:text-white">Clear all</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="w-32 text-left align-bottom p-3" />
                {compare.map(v => (
                  <th key={v.id} className="p-3 align-top text-left">
                    <div className="card overflow-hidden">
                      <div className="aspect-[16/10] bg-dark-surface">
                        <img
                          src={field(v, 'image') || `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(v.brand)}`}
                          alt={`${v.brand} ${v.model}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(v.brand)}`; }}
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-white text-sm leading-tight">{v.brand} {v.model}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Link to={`/vehicle/${v.id}`} className="text-accent text-xs hover:underline">View</Link>
                          <button onClick={() => remove(v.id)} className="text-red-400 text-xs hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.key} className="border-t border-dark-border">
                  <td className="p-3 text-xs font-semibold text-[#6e7681] uppercase tracking-wide align-top">{row.label}</td>
                  {compare.map(v => {
                    const raw = field(v, row.key);
                    const display = raw == null || raw === ''
                      ? '—'
                      : row.money ? format(raw) : String(raw);
                    return (
                      <td key={v.id} className={`p-3 text-sm align-top ${row.money ? 'text-accent font-bold' : 'text-white'}`}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
