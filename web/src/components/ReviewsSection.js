import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

function formatDate(s) {
  try { return new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return s; }
}

export default function ReviewsSection({ listingId }) {
  const { user } = useAuth();
  const [data, setData] = useState({ average: 0, count: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/api/listings/${listingId}/reviews`)
      .then(res => setData(res.data || { average: 0, count: 0, reviews: [] }))
      .catch(() => setData({ average: 0, count: 0, reviews: [] }))
      .finally(() => setLoading(false));
  }, [listingId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1) { setError('Please pick a star rating.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/listings/${listingId}/reviews`, { rating, comment });
      setComment('');
      setRating(0);
      load();
    } catch (err) {
      setError(err.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className="text-3xl font-black text-white">{data.average ? data.average.toFixed(1) : '—'}</div>
        <div>
          <StarRating value={data.average} size="w-4 h-4" />
          <div className="text-xs text-[#6e7681] mt-0.5">
            {data.count} {data.count === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      {/* Review form */}
      {!user ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 text-sm text-[#8b949e]">
          <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link> to leave a review.
        </div>
      ) : (
        <form onSubmit={submit} className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8b949e]">Your rating</span>
            <StarRating value={rating} onChange={setRating} size="w-6 h-6" />
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Share your experience with this vehicle (optional)…"
            className="input-field text-sm resize-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#6e7681]">Only verified purchasers can review.</p>
            <button type="submit" disabled={submitting} className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-dark-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : data.reviews.length === 0 ? (
        <p className="text-sm text-[#6e7681] text-center py-4">No reviews yet — be the first verified buyer to review.</p>
      ) : (
        <ul className="space-y-4">
          {data.reviews.map(r => (
            <li key={r.id} className="border-b border-dark-border/50 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{r.user_name}</span>
                <span className="text-xs text-[#6e7681]">{formatDate(r.created_at)}</span>
              </div>
              <StarRating value={r.rating} size="w-3.5 h-3.5" className="my-1" />
              {r.comment && <p className="text-sm text-[#8b949e] mt-1 leading-relaxed">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
