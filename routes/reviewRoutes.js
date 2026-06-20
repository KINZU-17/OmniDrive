/**
 * reviewRoutes.js — vehicle reviews & ratings.
 *
 * Public read of a listing's reviews + summary; authenticated write restricted
 * to "verified purchasers" (users with a paid order for that listing). Each
 * (listing, user) has at most one review; posting again updates it. Aggregates
 * fold back into listings.rating / listings.reviewCount so cards/detail pages
 * read a single number.
 */
'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { tx } = require('../config/db');

const MAX_COMMENT = 1000;

module.exports = (db, authenticate) => {
  const router = express.Router();

  const summarize = (listingId) => {
    const agg = db.prepare(
      'SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE listing_id = ?'
    ).get(listingId);
    return {
      count: agg.count || 0,
      average: agg.average ? Math.round(agg.average * 10) / 10 : 0,
    };
  };

  // Recompute the denormalised rating/reviewCount on the listing row.
  const refreshListingAggregate = (listingId) => {
    const { average, count } = summarize(listingId);
    db.prepare('UPDATE listings SET rating = ?, reviewCount = ? WHERE id = ?')
      .run(average || 4.5, count, listingId);
    return { average, count };
  };

  // GET /api/listings/:id/reviews — public.
  router.get('/listings/:id/reviews', asyncHandler(async (req, res) => {
    const listingId = Number(req.params.id);
    const reviews = db.prepare(
      'SELECT id, user_name, rating, comment, created_at FROM reviews WHERE listing_id = ? ORDER BY created_at DESC'
    ).all(listingId);
    return res.json({ success: true, data: { ...summarize(listingId), reviews } });
  }));

  // POST /api/listings/:id/reviews — verified purchasers only.
  router.post('/listings/:id/reviews', authenticate, asyncHandler(async (req, res) => {
    const listingId = Number(req.params.id);
    const userId = req.user.sub;
    const userName = req.user.name || req.user.email || 'Customer';
    const email = req.user.email;

    const listing = db.prepare('SELECT id FROM listings WHERE id = ?').get(listingId);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found.' });

    // Validate input.
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer from 1 to 5.' });
    }
    const comment = String(req.body.comment || '').trim().slice(0, MAX_COMMENT);

    // Eligibility: a completed (paid) order for this vehicle by this user.
    // vehicle_id is stored as TEXT; bind the id as a string so the comparison
    // doesn't break (node:sqlite binds JS numbers as floats → CAST gives "1.0").
    const purchased = db.prepare(
      "SELECT 1 FROM orders WHERE customer_email = ? AND CAST(vehicle_id AS TEXT) = ? AND status = 'paid' LIMIT 1"
    ).get(email, String(listingId));
    if (!purchased) {
      return res.status(403).json({ success: false, error: 'Only verified purchasers can review this vehicle.' });
    }

    const summary = tx(() => {
      const existing = db.prepare('SELECT id FROM reviews WHERE listing_id = ? AND user_id = ?').get(listingId, userId);
      if (existing) {
        db.prepare("UPDATE reviews SET rating = ?, comment = ?, created_at = datetime('now') WHERE id = ?")
          .run(rating, comment, existing.id);
      } else {
        db.prepare('INSERT INTO reviews (listing_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)')
          .run(listingId, userId, userName, rating, comment);
      }
      return refreshListingAggregate(listingId);
    });

    return res.json({ success: true, message: 'Review saved.', data: summary });
  }));

  return router;
};
