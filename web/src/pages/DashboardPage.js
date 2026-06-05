import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const ROLE_COLOR = { admin: 'text-red-400', dealer: 'text-green-400', liaison: 'text-orange-400', client: 'text-blue-400' };
const STATUS_COLOR = { paid: 'bg-green-500/20 text-green-400', pending: 'bg-yellow-500/20 text-yellow-400', failed: 'bg-red-500/20 text-red-400' };

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <p className="text-[#6e7681] text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value ?? '—'}</p>
      {sub && <p className="text-[#6e7681] text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[status] || 'bg-dark-surface text-[#8b949e]'}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  brand: '', model: '', price: '', nation: 'Kenya', category: 'Car',
  condition: 'Used', body_style: '', fuel_type: 'Petrol', drivetrain: 'FWD',
  color: '', city: 'Nairobi', image: '', specs: '',
};

function AddListingModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      let specs = {};
      if (form.specs.trim()) {
        try { specs = JSON.parse(form.specs); } catch { specs = {}; }
      }
      await api.post('/api/dealer/listings', { ...form, price: Number(form.price), specs });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => set(key, e.target.value)} className="input-field text-sm"
        required={['brand','model','price','nation'].includes(key)} />
    </div>
  );

  const select = (label, key, options) => (
    <div key={key}>
      <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)} className="input-field text-sm">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add New Listing</h2>
          <button onClick={onClose} className="text-[#6e7681] hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {field('Brand *', 'brand', 'text', 'e.g. Toyota')}
          {field('Model *', 'model', 'text', 'e.g. Land Cruiser')}
          {field('Price (USD) *', 'price', 'number', '50000')}
          {field('Nation / Origin *', 'nation', 'text', 'e.g. Japan')}
          {select('Category', 'category', ['Car','Bike','Bus','Truck','Van'])}
          {select('Condition', 'condition', ['New','Used'])}
          {select('Fuel Type', 'fuel_type', ['Petrol','Diesel','Electric','Hybrid','LPG'])}
          {select('Drivetrain', 'drivetrain', ['FWD','RWD','AWD','4WD'])}
          {field('Body Style', 'body_style', 'text', 'e.g. SUV')}
          {field('Color', 'color', 'text', 'e.g. Black')}
          {field('City', 'city', 'text', 'e.g. Nairobi')}
          {field('Image URL', 'image', 'url', 'https://...')}
          <div className="col-span-2">
            <label className="block text-xs text-[#8b949e] mb-1">Specs (JSON, optional)</label>
            <textarea placeholder='{"engine":"3.5L V6","horsepower":280}' value={form.specs}
              onChange={e => set('specs', e.target.value)} className="input-field text-sm font-mono resize-none" rows={2} />
          </div>
          {err && <div className="col-span-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">{err}</div>}
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientDashboard({ data }) {
  const { format } = useCurrency();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Orders" value={data.orderCount} />
        <StatCard label="Total Spent" value={`KES ${(data.totalSpent||0).toLocaleString()}`} />
        <StatCard label="Recommended" value={data.recommendations?.length ?? 0} sub="vehicles for you" />
        <StatCard label="Last Sync" value="Live" sub={new Date(data.currentTime).toLocaleTimeString()} />
      </div>

      {data.recentOrders?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#6e7681] text-xs border-b border-dark-border">
                <th className="pb-2 text-left">ID</th><th className="pb-2 text-left">Vehicle</th>
                <th className="pb-2 text-left">Amount</th><th className="pb-2 text-left">Status</th><th className="pb-2 text-left">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-border/50">
                {data.recentOrders.map(o => (
                  <tr key={o.id} className="text-[#e6edf3]">
                    <td className="py-2.5 text-[#6e7681]">#{o.id}</td>
                    <td className="py-2.5">{o.vehicle_name||'—'}</td>
                    <td className="py-2.5">KES {(o.amount||0).toLocaleString()}</td>
                    <td className="py-2.5"><Badge status={o.status}/></td>
                    <td className="py-2.5 text-[#6e7681]">{o.created_at?.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.recommendations?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recommended for You</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.recommendations.map(v => (
              <Link key={v.id} to={`/vehicle/${v.id}`} className="block bg-dark-surface border border-dark-border rounded-lg overflow-hidden hover:border-accent transition-colors">
                <div className="h-28 bg-dark-bg">
                  {v.image ? <img src={v.image} alt={v.brand} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl"></div>}
                </div>
                <div className="p-2.5">
                  <p className="text-white text-xs font-semibold truncate">{v.brand} {v.model}</p>
                  <p className="text-accent text-xs font-bold mt-0.5">{format(v.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!data.recentOrders?.length && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="text-white font-semibold mb-1">No orders yet</p>
          <p className="text-[#6e7681] text-sm mb-4">Start browsing to find your perfect vehicle</p>
          <Link to="/browse" className="btn-primary text-sm px-6">Browse Vehicles</Link>
        </div>
      )}
    </div>
  );
}

function DealerDashboard({ data, onRefresh }) {
  const { format } = useCurrency();
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-6">
      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} onSaved={onRefresh}/>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Listings" value={data.activeListingsCount} />
        <StatCard label="Pending Approval" value={data.pendingApplicationCount} />
        <StatCard label="Revenue (KES)" value={`KES ${(data.totalRevenue||0).toLocaleString()}`} />
        <StatCard label="Active Orders" value={data.activeOrders?.length??0} />
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">My Listings</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Listing
        </button>
      </div>
      {data.recentListings?.length > 0 ? (
        <div className="card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#6e7681] text-xs border-b border-dark-border">
                <th className="pb-2 text-left">ID</th><th className="pb-2 text-left">Vehicle</th>
                <th className="pb-2 text-left">Price</th><th className="pb-2 text-left">City</th><th className="pb-2 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-border/50">
                {data.recentListings.map(l => (
                  <tr key={l.id} className="text-[#e6edf3]">
                    <td className="py-2.5 text-[#6e7681]">#{l.id}</td>
                    <td className="py-2.5">{l.brand} {l.model}</td>
                    <td className="py-2.5">{format(l.price)}</td>
                    <td className="py-2.5 text-[#6e7681]">{l.city}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.isActive?'bg-green-500/20 text-green-400':'bg-dark-surface text-[#6e7681]'}`}>
                        {l.isActive?'Active':'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="text-white font-semibold mb-1">No listings yet</p>
          <p className="text-[#6e7681] text-sm mb-4">Add your first vehicle to start selling</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-6">Add First Listing</button>
        </div>
      )}
      {data.activeOrders?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Latest Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#6e7681] text-xs border-b border-dark-border">
                <th className="pb-2 text-left">ID</th><th className="pb-2 text-left">Vehicle</th>
                <th className="pb-2 text-left">Amount</th><th className="pb-2 text-left">Status</th><th className="pb-2 text-left">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-border/50">
                {data.activeOrders.map(o => (
                  <tr key={o.id} className="text-[#e6edf3]">
                    <td className="py-2.5 text-[#6e7681]">#{o.id}</td>
                    <td className="py-2.5">{o.vehicle_name||'—'}</td>
                    <td className="py-2.5">KES {(o.amount||0).toLocaleString()}</td>
                    <td className="py-2.5"><Badge status={o.status}/></td>
                    <td className="py-2.5 text-[#6e7681]">{o.created_at?.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LiaisonDashboard({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Leads" value={data.leads?.length??0} />
        <StatCard label="Successful Deals" value={data.successfulDeals} />
        <StatCard label="Commission Est." value={`KES ${Math.round(data.commissionEstimate||0).toLocaleString()}`} sub="2% of closed deals"/>
        <StatCard label="Active Deals" value={data.activeDeals?.length??0} />
      </div>
      {data.leads?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Active Leads</h3>
          <div className="space-y-2">
            {data.leads.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-dark-border/50 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{l.name||l.email}</p>
                  <p className="text-[#6e7681] text-xs">{l.email}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-dark-surface border border-dark-border ${ROLE_COLOR[l.role]||'text-[#8b949e]'}`}>{l.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <Link to="/browse" className="btn-outline text-sm flex-1 text-center">Browse Vehicles</Link>
        <Link to="/messages" className="btn-primary text-sm flex-1 text-center">Messages</Link>
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  const stats = data.stats || {};
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={stats.totalListings} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Revenue (KES)" value={`KES ${Math.round(stats.totalRevenue||0).toLocaleString()}`} />
        <StatCard label="Pending Deals" value={data.pendingDeals} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-[#6e7681] text-xs uppercase tracking-wider mb-1">Dealers</p>
          <p className="text-xl font-black text-white">{stats.totalDealers??'—'}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[#6e7681] text-xs uppercase tracking-wider mb-1">Pending Apps</p>
          <p className="text-xl font-black text-yellow-400">{data.applications??'—'}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[#6e7681] text-xs uppercase tracking-wider mb-1">Active Users</p>
          <p className="text-xl font-black text-white">{stats.totalUsers??'—'}</p>
        </div>
      </div>
      {data.latestOrders?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Latest Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#6e7681] text-xs border-b border-dark-border">
                <th className="pb-2 text-left">ID</th><th className="pb-2 text-left">Vehicle</th>
                <th className="pb-2 text-left">Customer</th><th className="pb-2 text-left">Amount</th>
                <th className="pb-2 text-left">Status</th><th className="pb-2 text-left">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-border/50">
                {data.latestOrders.map(o => (
                  <tr key={o.id} className="text-[#e6edf3]">
                    <td className="py-2.5 text-[#6e7681]">#{o.id}</td>
                    <td className="py-2.5 max-w-[140px] truncate">{o.vehicle_name||'—'}</td>
                    <td className="py-2.5 text-[#6e7681] max-w-[120px] truncate">{o.customer_email}</td>
                    <td className="py-2.5">KES {(o.amount||0).toLocaleString()}</td>
                    <td className="py-2.5"><Badge status={o.status}/></td>
                    <td className="py-2.5 text-[#6e7681]">{o.created_at?.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data.latestListings?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Latest Listings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#6e7681] text-xs border-b border-dark-border">
                <th className="pb-2 text-left">ID</th><th className="pb-2 text-left">Vehicle</th>
                <th className="pb-2 text-left">Price</th><th className="pb-2 text-left">City</th><th className="pb-2 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-border/50">
                {data.latestListings.map(l => (
                  <tr key={l.id} className="text-[#e6edf3]">
                    <td className="py-2.5 text-[#6e7681]">#{l.id}</td>
                    <td className="py-2.5">{l.brand} {l.model}</td>
                    <td className="py-2.5">KES {(l.price||0).toLocaleString()}</td>
                    <td className="py-2.5 text-[#6e7681]">{l.city}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.isActive?'bg-green-500/20 text-green-400':'bg-dark-surface text-[#6e7681]'}`}>
                        {l.isActive?'Active':'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/dashboard/summary');
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
  }, [user]);

  if (!user) return null;

  const roleColor = ROLE_COLOR[user.role] || 'text-white';

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Welcome, <span className={roleColor}>{user.name}</span></h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-surface border border-dark-border capitalize ${roleColor}`}>{user.role}</span>
              <span className="text-[#6e7681] text-sm">{user.email}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/browse" className="btn-outline text-sm px-4 py-2">Browse</Link>
            <Link to="/messages" className="btn-outline text-sm px-4 py-2">Messages</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="text-[#6e7681] hover:text-red-400 text-sm px-3 py-2 transition-colors">Sign out</button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-dark-border border-t-accent rounded-full animate-spin"/>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="text-sm underline ml-4">Retry</button>
          </div>
        )}

        {!loading && data && user.role === 'client'  && <ClientDashboard  data={data}/>}
        {!loading && data && user.role === 'dealer'  && <DealerDashboard  data={data} onRefresh={load}/>}
        {!loading && data && user.role === 'liaison' && <LiaisonDashboard data={data}/>}
        {!loading && data && user.role === 'admin'   && <AdminDashboard   data={data}/>}
      </div>
    </div>
  );
}
