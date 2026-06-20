import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

// M-Pesa STK Push is used to take a *reservation deposit*, not the full vehicle
// price (Daraja caps a single transaction, and the balance is arranged with the
// dealer). We suggest 10% of the price, capped at a sensible per-transaction max.
const DEPOSIT_CAP = 150000; // KES
const AMOUNT_MAX = 999999;  // matches backend mpesaPurchaseSchema

function suggestedDeposit(priceKes) {
  if (!priceKes) return '';
  return Math.min(Math.round(priceKes * 0.1), DEPOSIT_CAP);
}

export default function PaymentPage() {
  usePageTitle('Checkout');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { format } = useCurrency();
  const vehicleId = searchParams.get('vehicle');

  const [vehicle, setVehicle] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null); // { checkoutRequestId, status, receipt }
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  // Pull the vehicle so we can show what's being paid for and prefill a deposit.
  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;
    api.get(`/api/listings/${vehicleId}`)
      .then(env => {
        if (cancelled) return;
        const v = env.data || env;
        if (v && v.id != null) {
          setVehicle(v);
          setAmount(prev => prev || String(suggestedDeposit(v.price)));
        }
      })
      .catch(() => { /* vehicle is optional context; payment still works */ });
    return () => { cancelled = true; };
  }, [vehicleId]);

  // Poll payment status until it resolves (or we give up after ~60s).
  useEffect(() => {
    if (!payment?.checkoutRequestId || payment.status !== 'pending') return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      try {
        const env = await api.get(`/api/mpesa/status/${payment.checkoutRequestId}`);
        const status = env.data?.status;
        if (status === 'paid' || status === 'failed') {
          setPayment(p => ({ ...p, status, receipt: env.data?.receipt }));
          clearInterval(pollRef.current);
        }
      } catch { /* keep polling; transient */ }
      if (tries >= 20) clearInterval(pollRef.current); // ~60s at 3s intervals
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [payment?.checkoutRequestId, payment?.status]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.match(/^(?:\+?254|0)[17]\d{8}$/)) {
      setError('Enter a valid Safaricom number (e.g. 0712345678)');
      return;
    }
    const amt = Number(amount);
    if (!amt || amt < 1) { setError('Enter a deposit amount of at least KES 1'); return; }
    if (amt > AMOUNT_MAX) { setError(`Maximum M-Pesa amount is KES ${AMOUNT_MAX.toLocaleString()}`); return; }
    setLoading(true);
    try {
      const env = await api.post('/api/mpesa/purchase', {
        phone,
        amount: amt,
        vehicleId: vehicleId || undefined,
        email: user?.email || '',
        vehicleName: vehicleName || 'Vehicle reservation',
      });
      setPayment({ checkoutRequestId: env.data?.checkoutRequestId, status: 'pending', receipt: null });
    } catch (err) {
      setError(err.message || 'Payment could not be started. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { clearInterval(pollRef.current); setPayment(null); setError(''); };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold text-white">Sign in to proceed</h2>
        <p className="text-[#6e7681]">You need an account to make a payment</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white">MPesa Payment</h1>
            <p className="text-[#6e7681] text-sm mt-1">Lipa na MPesa — fast, secure, easy</p>
          </div>

          {/* Vehicle summary */}
          {vehicle && (
            <div className="flex items-center justify-between gap-3 bg-dark-surface/60 border border-dark-border rounded-lg px-4 py-3 mb-6">
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{vehicleName}</p>
                <p className="text-[#6e7681] text-xs">Full price {format(vehicle.price)}</p>
              </div>
              <span className="badge bg-accent/15 text-accent whitespace-nowrap">Deposit</span>
            </div>
          )}

          {payment ? (
            <PaymentStatus payment={payment} onReset={reset} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="pay-phone" className="block text-sm text-[#8b949e] mb-1.5">Safaricom Number</label>
                <input
                  id="pay-phone"
                  type="tel"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field"
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <label htmlFor="pay-amount" className="block text-sm text-[#8b949e] mb-1.5">
                  {vehicle ? 'Deposit amount (KES)' : 'Amount (KES)'}
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input-field"
                  min="1"
                  max={AMOUNT_MAX}
                  required
                />
                {vehicle && (
                  <p className="text-xs text-[#6e7681] mt-1.5">
                    Reserve this vehicle with an M-Pesa deposit. You'll arrange the balance with the dealer.
                  </p>
                )}
              </div>
              {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
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
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Send STK Push</>
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

function PaymentStatus({ payment, onReset }) {
  if (payment.status === 'paid') {
    return (
      <div className="text-center space-y-4">
        <StatusIcon tone="green" path="M5 13l4 4L19 7" />
        <p className="text-white font-semibold">Payment received 🎉</p>
        {payment.receipt && <p className="text-[#8b949e] text-sm">Receipt: <span className="text-white font-mono">{payment.receipt}</span></p>}
        <p className="text-[#6e7681] text-sm">Your reservation is confirmed. A dealer will be in touch shortly.</p>
        <div className="flex gap-3 pt-2">
          <Link to="/orders" className="btn-outline flex-1 text-sm text-center">View Orders</Link>
          <Link to="/browse" className="btn-primary flex-1 text-sm text-center">Keep Browsing</Link>
        </div>
      </div>
    );
  }

  if (payment.status === 'failed') {
    return (
      <div className="text-center space-y-4">
        <StatusIcon tone="red" path="M6 18L18 6M6 6l12 12" />
        <p className="text-white font-semibold">Payment not completed</p>
        <p className="text-[#6e7681] text-sm">The transaction was cancelled or timed out. No money was deducted.</p>
        <button onClick={onReset} className="btn-primary w-full text-sm">Try Again</button>
      </div>
    );
  }

  // pending
  return (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
      <p className="text-white font-semibold">STK push sent to your phone</p>
      <p className="text-[#6e7681] text-sm">Enter your MPesa PIN to complete payment. This page updates automatically.</p>
      <button onClick={onReset} className="btn-outline w-full text-sm">Cancel</button>
    </div>
  );
}

function StatusIcon({ tone, path }) {
  const tones = { green: 'bg-green-500/10 text-green-400', red: 'bg-red-500/10 text-red-400' };
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${tones[tone]}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
    </div>
  );
}
