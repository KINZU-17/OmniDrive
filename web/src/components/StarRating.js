import React, { useState } from 'react';

function Star({ filled, className }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
      <path strokeWidth={filled ? 0 : 1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Read-only display by default; pass `onChange` to make it an interactive picker.
export default function StarRating({ value = 0, onChange, size = 'w-5 h-5', className = '' }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const shown = hover || value;

  if (!interactive) {
    return (
      <span className={`inline-flex text-yellow-400 ${className}`} aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map(n => <Star key={n} filled={n <= Math.round(value)} className={size} />)}
      </span>
    );
  }

  return (
    <span className={`inline-flex ${className}`} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-checked={value === n}
          role="radio"
          className={`p-0.5 transition-colors ${n <= shown ? 'text-yellow-400' : 'text-[#6e7681] hover:text-yellow-400'}`}
        >
          <Star filled={n <= shown} className={size} />
        </button>
      ))}
    </span>
  );
}
