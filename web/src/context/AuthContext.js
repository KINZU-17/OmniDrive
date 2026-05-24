import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnidrive_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('omnidrive_user', JSON.stringify(user));
    else { localStorage.removeItem('omnidrive_user'); sessionStorage.removeItem('omnidrive_admin_key'); }
  }, [user]);

  const login = async (email, password, adminKey = '') => {
    const body = { email, password };
    if (adminKey) body.adminKey = adminKey;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Login failed');
    const user = envelope.data?.user;
    if (user?.role === 'admin' && adminKey) {
      sessionStorage.setItem('omnidrive_admin_key', adminKey);
    }
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const envelope = await res.json();
    if (!res.ok) throw new Error(envelope.data?.message || envelope.error || 'Registration failed');
    const user = envelope.data?.user;
    setUser(user);
    return user;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
