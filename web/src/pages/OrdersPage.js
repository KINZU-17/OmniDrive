import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

const STATUS = {
  paid: { label: 'Paid', dot: 'bg-green-400', text: 'text-green-400', step: 2 },
  pending: { label: 'Awaiting payment', dot: 'bg-yellow-400', text: 'text-yellow-400', step: 1 },
  failed: { label: 'Failed', dot: 'bg-red-400', text: 'text-red-400', step: 1 },
};

const STEPS = ['Placed', 'Paid', 'Delivered'];

function Timeline({ status }) {
  const reached = STATUS[status]?.step ?? 0;
  const failed = status === 'failed';
  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((label, i) => {
        const active = i <= reached && !(failed && i >= 1);
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-accent' : 'bg-dark-border'}`} />
              <span className={`text-[10px] ${active ? 'text-white' : 'text-[#6e7681]'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`flex-1 h-px ${i < reached && !failed ? 'bg-accent' : 'bg-dark-border'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  usePageTitle('My Orders');
  const { user } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    api.get('/api/client/orders')
      .then(env => { if (!cancelled) setOrders(Array.isArray(env.data) ? env.data : []); })
      .catch(err => { if (!cancelled) setError(err.message || 'Could not load orders'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">Sign in to view your orders</h1>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-white mb-6">My <span className="text-accent">Orders</span></h1>

        {loading && (
          <div className="space-y-4">
            {[0, 1].map(i => <div key={i} className="card p-5 h-28 animate-pulse bg-dark-card" />)}
          </div>
        )}

        {!loading && error && (
          <div className="card p-6 text-center">
            <p className="text-[#8b949e] text-sm">{error}</p>
            <p className="text-[#6e7681] text-xs mt-2">Orders are available for buyer accounts.</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <h3 className="text-xl font-semibold text-white">No orders yet</h3>
            <p className="text-[#6e7681] text-sm max-w-sm">When you reserve a vehicle with an M-Pesa deposit, it'll show up here with live status.</p>
            <Link to="/browse" className="btn-primary">Browse Vehicles</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(o => {
              const s = STATUS[o.status] || STATUS.pending;
              return (
                <div key={o.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{o.vehicle_name || 'Vehicle reservation'}</p>
                      <p className="text-xs text-[#6e7681] mt-0.5">
                        Order #{o.id} · {o.created_at ? new Date(o.created_at.replace(' ', 'T') + 'Z').toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-accent font-bold">{format(o.amount)}</p>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${s.text}`}>
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}
                      </span>
                    </div>
                  </div>
                  <Timeline status={o.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
