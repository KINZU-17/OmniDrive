import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MPESA_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHJ4PSI2IiBmaWxsPSIjMDA5OTQ0Ii8+PHRleHQgeD0iNTAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TSBQRVNBPC90ZXh0Pjwvc3ZnPg==';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const vehicleId = searchParams.get('vehicle');

  const [phone, setPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.match(/^(07|01|2547|2541)\d{7,8}$/)) {
      setError('Enter a valid Safaricom number (e.g. 0712345678)');
      return;
    }
    if (!amount || Number(amount) < 1) {
      setError('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: Number(amount), vehicleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment initiation failed');
      setStatus({ checkoutRequestId: data.CheckoutRequestID, message: data.CustomerMessage || 'STK push sent to your phone' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-white">Sign in to proceed</h2>
        <p className="text-[#6e7681]">You need an account to make a payment</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white">MPesa Payment</h1>
            <p className="text-[#6e7681] text-sm mt-1">Lipa na MPesa — fast, secure, easy</p>
          </div>

          {status ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold">{status.message}</p>
              <p className="text-[#6e7681] text-sm">Check your phone and enter your MPesa PIN to complete payment.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStatus(null)} className="btn-outline flex-1 text-sm">New Payment</button>
                <Link to="/browse" className="btn-primary flex-1 text-sm text-center">Back to Browse</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1.5">Safaricom Number</label>
                <input
                  type="tel"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1.5">Amount (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
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
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Send STK Push</>
                )}
              </button>
              <p className="text-xs text-[#6e7681] text-center">
                You'll receive a prompt on your phone to enter your MPesa PIN
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}