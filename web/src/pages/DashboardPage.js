import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#6e7681] text-sm">{label}</span>
        <span className={`text-xl ${color || 'text-accent'}`}>{icon}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function ClientDashboard({ user }) {
  const { format } = useCurrency();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetch('/api/orders?userId=' + user.id).then(r => r.json()).then(d => setOrders(d.orders || [])).catch(() => {});
  }, [user.id]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Orders" value={orders.length} icon="🛒" />
        <StatCard label="Wishlist" value="—" icon="❤️" color="text-red-400" />
        <StatCard label="Messages" value="—" icon="💬" color="text-blue-400" />
        <StatCard label="Viewed" value="—" icon="👁️" color="text-purple-400" />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Recent Orders</h3>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#6e7681] text-sm">No orders yet</p>
            <Link to="/browse" className="btn-primary mt-3 inline-block text-sm">Browse Vehicles</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-dark-border/50 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">Order #{order.id}</p>
                  <p className="text-[#6e7681] text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent text-sm font-semibold">{format(order.amount || 0)}</p>
                  <span className={`badge text-xs ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DealerDashboard({ user }) {
  const { format } = useCurrency();
  const [listings, setListings] = useState([]);
  useEffect(() => {
    fetch('/api/listings?dealer=' + user.email).then(r => r.json()).then(d => setListings(d.listings || [])).catch(() => {});
  }, [user.email]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Listings" value={listings.filter(l => l.isActive).length} icon="🚗" color="text-green-400" />
        <StatCard label="Total Listings" value={listings.length} icon="📋" />
        <StatCard label="Messages" value="—" icon="💬" color="text-blue-400" />
        <StatCard label="Applications" value="—" icon="📝" color="text-orange-400" />
      </div>
      <div className="flex gap-3">
        <Link to="/listings/new" className="btn-primary text-sm">+ Add Listing</Link>
        <Link to="/messages" className="btn-outline text-sm">View Messages</Link>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">My Listings</h3>
        {listings.length === 0 ? (
          <p className="text-[#6e7681] text-sm text-center py-6">No listings yet. Add your first vehicle.</p>
        ) : (
          <div className="space-y-3">
            {listings.slice(0, 10).map(listing => (
              <div key={listing.id} className="flex items-center justify-between py-2 border-b border-dark-border/50 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{listing.brand} {listing.model}</p>
                  <p className="text-[#6e7681] text-xs">{listing.year} · {listing.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent text-sm font-semibold">{format(listing.price)}</p>
                  <span className={`badge ${listing.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {listing.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={stats?.listings ?? '—'} icon="🚗" color="text-green-400" />
        <StatCard label="Users" value={stats?.users ?? '—'} icon="👥" color="text-blue-400" />
        <StatCard label="Orders" value={stats?.orders ?? '—'} icon="🛒" />
        <StatCard label="Revenue" value={stats?.revenue ? `$${stats.revenue.toLocaleString()}` : '—'} icon="💰" color="text-yellow-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/admin/listings" className="flex items-center justify-between py-2 text-sm text-[#c9d1d9] hover:text-accent transition-colors">
              Manage Listings <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/admin/users" className="flex items-center justify-between py-2 text-sm text-[#c9d1d9] hover:text-accent transition-colors">
              Manage Users <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/admin/dealers" className="flex items-center justify-between py-2 text-sm text-[#c9d1d9] hover:text-accent transition-colors">
              Dealer Applications <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            {[['API', true], ['Database', true], ['Redis', true], ['Queue', true]].map(([name, up]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-[#8b949e]">{name}</span>
                <span className={`flex items-center gap-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${up ? 'bg-green-400' : 'bg-red-400'}`} />
                  {up ? 'Operational' : 'Down'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiaisonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value="—" icon="🎫" color="text-orange-400" />
        <StatCard label="Resolved" value="—" icon="✅" color="text-green-400" />
        <StatCard label="Inspections" value="—" icon="🔍" color="text-blue-400" />
        <StatCard label="Messages" value="—" icon="💬" />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-3">Recent Tickets</h3>
        <p className="text-[#6e7681] text-sm text-center py-6">No open tickets. Check back later.</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const dashboards = { client: ClientDashboard, dealer: DealerDashboard, admin: AdminDashboard, liaison: LiaisonDashboard };
  const RoleDashboard = dashboards[user.role] || ClientDashboard;

  const roleColors = { admin: 'bg-red-500/10 text-red-400 border-red-500/30', dealer: 'bg-green-500/10 text-green-400 border-green-500/30', liaison: 'bg-orange-500/10 text-orange-400 border-orange-500/30', client: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">
                Welcome, {user.name?.split(' ')[0] || 'User'}
              </h1>
              <span className={`badge border capitalize ${roleColors[user.role] || 'bg-dark-surface text-[#8b949e] border-dark-border'}`}>
                {user.role}
              </span>
            </div>
            <p className="text-[#6e7681] text-sm">{user.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-outline text-sm text-red-400 border-red-500/30 hover:border-red-500">
            Sign out
          </button>
        </div>

        {/* Role-specific dashboard */}
        <RoleDashboard user={user} />
      </div>
    </div>
  );
}
