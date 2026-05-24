import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'client', label: 'Client', icon: '🛒', desc: 'Browse and purchase vehicles', color: 'text-blue-400 border-blue-500/40' },
  { id: 'dealer', label: 'Dealer', icon: '🏢', desc: 'List and manage inventory', color: 'text-green-400 border-green-500/40' },
  { id: 'liaison', label: 'Liaison', icon: '🔧', desc: 'Technical support & coordination', color: 'text-orange-400 border-orange-500/40' },
  { id: 'admin', label: 'Admin', icon: '⚡', desc: 'Full platform management', color: 'text-red-400 border-red-500/40' },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // role → form
  const [mode, setMode] = useState('login'); // login | register
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', adminKey: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password, role === 'admin' ? form.adminKey : '');
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role, adminKey: form.adminKey });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1">
            <span className="text-3xl font-black text-accent">Omni</span>
            <span className="text-3xl font-black text-white">Drive</span>
          </Link>
          <p className="text-[#6e7681] text-sm mt-2">Kenya's Premier Vehicle Marketplace</p>
        </div>

        <div className="card p-8">
          {/* Step 1: Role selection */}
          {step === 'role' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-[#6e7681] text-sm mb-6">Select your account type to continue</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setStep('form'); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:border-opacity-100 hover:bg-dark-surface ${r.color}`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <span className="text-sm font-semibold text-white">{r.label}</span>
                    <span className="text-xs text-[#6e7681] text-center leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Login / Register form */}
          {step === 'form' && (
            <div>
              <button onClick={() => setStep('role')} className="flex items-center gap-1 text-[#8b949e] hover:text-white text-sm mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              {/* Role badge */}
              {selectedRole && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm mb-4 ${selectedRole.color}`}>
                  <span>{selectedRole.icon}</span>
                  <span>{selectedRole.label}</span>
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex gap-1 bg-dark-surface rounded-lg p-1 mb-6">
                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${mode === m ? 'bg-dark-card text-white shadow' : 'text-[#6e7681] hover:text-white'}`}
                  >
                    {m === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  required
                />
                {mode === 'register' && (
                  <input
                    type="tel"
                    placeholder="Phone (Safaricom)"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                  />
                )}
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field"
                  required
                />
                {role === 'admin' && (
                  <input
                    type="password"
                    placeholder="Admin key"
                    value={form.adminKey}
                    onChange={e => setForm(f => ({ ...f, adminKey: e.target.value }))}
                    className="input-field"
                    required
                  />
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</>
                  ) : (
                    mode === 'login' ? 'Sign in' : 'Create account'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-[#6e7681] text-sm mt-6">
          <Link to="/browse" className="text-accent hover:underline">← Continue browsing without signing in</Link>
        </p>
      </div>
    </div>
  );
}
