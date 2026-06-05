/**
 * auth.js — JWT authentication, role guard, and dealership scoping.
 *
 * Replaces the old spoofable header-trust scheme (x-user-role / x-admin-key) with
 * signed JWTs verified server-side. Ported from the 1.2 security rewrite and
 * adapted to OmniDrive's role vocabulary (admin / dealer / liaison / client).
 */
'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

const IS_PROD = process.env.NODE_ENV === 'production';

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (IS_PROD) {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start in production. Generate one with: ' +
      'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  JWT_SECRET = 'dev_only_secret_change_me';
  console.warn('[auth] JWT_SECRET not set — using an INSECURE dev secret. Never use in production.');
} else if (IS_PROD && JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET too short for production (use >= 32 random chars).');
}

const TOKEN_TTL = process.env.JWT_EXPIRY || process.env.JWT_TTL || '8h';

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      dealership_id: user.dealership_id ?? null,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function extractToken(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Hard auth: 401 if no/invalid token. Populates req.user with the JWT payload. */
function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Access token missing.' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ success: false, error: 'Token invalid or expired.' });
    req.user = payload;
    next();
  });
}

/** Soft auth: attaches req.user if a valid token is present, else continues. */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, payload) => { if (!err) req.user = payload; next(); });
}

/** Require the authenticated user to hold one of the given roles. */
function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Requires role: ${allowed.join(' or ')}.` });
    }
    next();
  };
}

/** admin may act on any dealership; a dealer only on resources they own. */
function canActOnDealership(user, ownerEmail) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!ownerEmail && user.email && user.email.toLowerCase() === String(ownerEmail).toLowerCase();
}

/**
 * Guard a write: the resolver returns the owning dealer email of the target
 * resource. Non-admins may only proceed if they own it (else 403/404).
 */
function requireDealershipScope(getOwnerEmail) {
  return (req, res, next) => {
    let owner;
    try { owner = getOwnerEmail(req); } catch (e) { return next(e); }
    if (owner == null) return res.status(404).json({ success: false, error: 'Resource not found.' });
    if (!canActOnDealership(req.user, owner)) {
      return res.status(403).json({ success: false, error: 'You may only manage your own listings.' });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  signToken,
  authenticate,
  optionalAuth,
  requireRole,
  canActOnDealership,
  requireDealershipScope,
};
