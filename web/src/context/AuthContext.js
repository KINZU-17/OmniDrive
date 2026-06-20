import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnidrive_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // While we re-validate a stored token against the server we hold `loading`
  // true, so the app can show a splash instead of flashing a logged-out UI (or
  // letting a page act on a stale, expired session).
  const [loading, setLoading] = useState(() => !!localStorage.getItem('omnidrive_token'));

  useEffect(() => {
    if (user) localStorage.setItem('omnidrive_user', JSON.stringify(user));
    else {
      localStorage.removeItem('omnidrive_user');
      localStorage.removeItem('omnidrive_token');
    }
  }, [user]);

  // On first load, if we have a token, confirm it's still valid and refresh the
  // user from the server. A 401 (expired/invalid) clears the stale session so
  // the rest of the app never makes doomed authenticated requests.
  useEffect(() => {
    const token = localStorage.getItem('omnidrive_token');
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const envelope = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && envelope.data?.user) setUser(envelope.data.user);
        else setUser(null); // invalid/expired -> the [user] effect drops the token too
      } catch {
        // Network error (e.g. offline): keep the cached session optimistically.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist the JWT immediately (before any navigation) so authHeaders() in
  // api.js can attach it on the very next request.
  const persist = (envelope) => {
    const data = envelope.data || {};
    const u = data.user;
    const token = data.token;
    if (token) localStorage.setItem('omnidrive_token', token);
    if (u) localStorage.setItem('omnidrive_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Login failed');
    return persist(envelope);
  };

  const register = async (payload) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Registration failed');
    return persist(envelope);
  };

  // Passwordless login: request a one-time code, then verify it for a JWT.
  const requestOtp = async (identifier) => {
    const res = await fetch('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Could not send code');
    // devCode is only present in development when no SMS provider is configured.
    return { message: envelope.data?.message, devCode: envelope.data?.devCode };
  };

  const verifyOtp = async (identifier, code) => {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code }),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Invalid code');
    return persist(envelope);
  };

  const logout = () => {
    localStorage.removeItem('omnidrive_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
