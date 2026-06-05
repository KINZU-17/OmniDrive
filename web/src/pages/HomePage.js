import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const HERO_CATEGORIES = [
  { label: 'Cars', icon: '', query: 'Car' },
  { label: 'Bikes', icon: '', query: 'Bike' },
  { label: 'Trucks', icon: '', query: 'Truck' },
  { label: 'Buses', icon: '', query: 'Bus' },
  { label: 'Vans', icon: '', query: 'Van' },
];

const NATIONS = ['Japan', 'Germany', 'USA', 'UK', 'South Korea', 'China', 'Kenya'];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse & Filter', desc: 'Search 100+ vehicles from global dealers. Filter by category, price, fuel, origin and more.' },
  { step: '02', title: 'Choose Your Vehicle', desc: 'View full specs, photos, and ratings. Save favorites to your wishlist.' },
  { step: '03', title: 'Pay via MPesa', desc: 'Instant STK push to your Safaricom number. Secure, fast, no card needed.' },
  { step: '04', title: 'Get Your Drive', desc: 'Dealer confirms and arranges delivery or pickup. Fully tracked.' },
];

const PAYMENT_METHODS = [
  { name: 'MPesa', color: 'bg-green-500/10 border-green-500/30 text-green-400', icon: '' },
  { name: 'Visa', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '' },
  { name: 'Mastercard', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', icon: '' },
  { name: 'Bank Transfer', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: '' },
];

const FEATURES = [
  { icon: '', title: 'Global Inventory', desc: 'Vehicles from Japan, Germany, USA, UK, Korea, China and more — all in one place.' },
  { icon: '', title: 'Local Payments', desc: 'Pay with MPesa, card or bank transfer. No forex headaches — prices shown in KES.' },
  { icon: '', title: 'Verified Dealers', desc: 'Every dealer is vetted. Vehicle history, condition reports and real photos.' },
  { icon: '', title: 'End-to-End Service', desc: 'Import duty calculator, shipping logistics, VIN checks and order tracking.' },
  { icon: '', title: 'Instant STK Push', desc: 'Complete payment in seconds from your phone. No branches, no queues.' },
  { icon: '', title: 'Works Everywhere', desc: 'Full PWA support — browse and save vehicles even when offline.' },
];

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-accent">{value}</div>
      <div className="text-sm text-[#8b949e] mt-1">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch('/api/listings?limit=6&isActive=1')
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d.data) ? d.data : [];
        setFeatured(items.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-dark-bg to-dark-bg pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-sm font-medium">Kenya's #1 Vehicle Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Find Your Perfect
              <span className="text-accent block">Drive in Kenya</span>
            </h1>

            <p className="text-[#8b949e] text-lg md:text-xl mb-10 leading-relaxed">
              Browse 100+ vehicles from global dealers — cars, bikes, trucks & more.
              Pay via MPesa. Delivered to your door.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search brand, model, e.g. Toyota Land Cruiser..."
                  className="input-field pl-12 py-3.5 text-base"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 text-base whitespace-nowrap">
                Search
              </button>
            </form>

            {/* Category pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {HERO_CATEGORIES.map(cat => (
                <Link
                  key={cat.query}
                  to={`/browse?category=${cat.query}`}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border hover:border-accent rounded-full text-sm text-[#8b949e] hover:text-white transition-all"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="border-y border-dark-border bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatBlock value="100+" label="Vehicles Listed" />
            <StatBlock value="7" label="Source Countries" />
            <StatBlock value="4" label="Vehicle Types" />
            <StatBlock value="MPesa" label="Instant Payment" />
          </div>
        </div>
      </section>

      {/* ── FEATURED VEHICLES ────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Featured Vehicles</h2>
              <p className="text-[#6e7681] text-sm mt-1">Handpicked from our latest inventory</p>
            </div>
            <Link to="/browse" className="btn-outline text-sm px-5 py-2.5">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(v => (
              <FeaturedCard key={v.id} vehicle={v} format={format} />
            ))}
          </div>
        </section>
      )}

      {/* ── SOURCE NATIONS ───────────────────────────────────────────────── */}
      <section className="bg-dark-card/30 border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-xs text-[#6e7681] uppercase tracking-widest mb-6 font-semibold">
            Sourced from leading markets worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {NATIONS.map(n => (
              <Link
                key={n}
                to={`/browse?nation=${encodeURIComponent(n)}`}
                className="px-5 py-2.5 bg-dark-surface border border-dark-border hover:border-accent rounded-lg text-sm text-[#8b949e] hover:text-white transition-all font-medium"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">How It Works</h2>
          <p className="text-[#6e7681]">From search to your driveway in four simple steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-dark-border z-0" />
              )}
              <div className="card p-6 relative z-10">
                <div className="text-4xl font-black text-accent/20 mb-3">{step.step}</div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-[#6e7681] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="bg-dark-card/30 border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Why OmniDrive?</h2>
            <p className="text-[#6e7681]">Everything you need — all in one platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 hover:border-accent/40 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-[#6e7681] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT SECTION ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Pay the Kenyan Way</h2>
            <p className="text-[#6e7681] text-lg mb-6 leading-relaxed">
              We support the payment methods Kenyans actually use. No foreign card required —
              send an STK push from your Safaricom line and you're done.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {PAYMENT_METHODS.map(p => (
                <div key={p.name} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${p.color}`}>
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
            <Link to="/browse" className="btn-primary inline-flex items-center gap-2">
              Browse Vehicles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <div>
                <h3 className="text-white font-bold">MPesa Payment</h3>
                <p className="text-[#6e7681] text-sm">Lipa na MPesa — instant & secure</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="bg-dark-surface rounded-lg px-4 py-3">
                <p className="text-xs text-[#6e7681] mb-1">Vehicle</p>
                <p className="text-white font-semibold">Toyota Land Cruiser 2024</p>
              </div>
              <div className="bg-dark-surface rounded-lg px-4 py-3">
                <p className="text-xs text-[#6e7681] mb-1">Amount</p>
                <p className="text-white font-semibold">KES 8,500,000</p>
              </div>
              <div className="bg-dark-surface rounded-lg px-4 py-3">
                <p className="text-xs text-[#6e7681] mb-1">Phone</p>
                <p className="text-white font-semibold">0712 *** ***</p>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 text-sm font-medium">STK Push sent to your phone</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES SECTION ────────────────────────────────────────────────── */}
      <section className="bg-dark-card/30 border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Built for Everyone</h2>
            <p className="text-[#6e7681]">Whether you're buying, selling, or managing deals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '', role: 'Client', color: 'border-blue-500/30 hover:border-blue-500/60', pill: 'text-blue-400 bg-blue-500/10', desc: 'Browse global inventory, save favourites, pay via MPesa, track orders.' },
              { icon: '', role: 'Dealer', color: 'border-green-500/30 hover:border-green-500/60', pill: 'text-green-400 bg-green-500/10', desc: 'List inventory, manage orders, track revenue, connect with buyers.' },
              { icon: '', role: 'Liaison', color: 'border-orange-500/30 hover:border-orange-500/60', pill: 'text-orange-400 bg-orange-500/10', desc: 'Coordinate deals, manage leads, earn commissions on closed sales.' },
              { icon: '', role: 'Admin', color: 'border-red-500/30 hover:border-red-500/60', pill: 'text-red-400 bg-red-500/10', desc: 'Full platform control — users, listings, orders, analytics, settings.' },
            ].map(r => (
              <div key={r.role} className={`card p-6 border-2 transition-all ${r.color}`}>
                <div className="text-4xl mb-4">{r.icon}</div>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${r.pill}`}>{r.role}</span>
                <p className="text-[#8b949e] text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative card overflow-hidden p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/5 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">
            Your drive starts here.
          </h2>
          <p className="text-[#8b949e] text-lg mb-8 relative z-10">
            Join thousands of Kenyans finding their perfect vehicle on OmniDrive.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link to="/browse" className="btn-primary text-base px-8 py-3">
              Browse Vehicles
            </Link>
            <Link to="/login" className="btn-outline text-base px-8 py-3">
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeaturedCard({ vehicle, format }) {
  const img = vehicle.image || vehicle.img;

  return (
    <Link to={`/vehicle/${vehicle.id}`} className="card group hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden block">
      <div className="relative aspect-[16/10] overflow-hidden bg-dark-surface">
        <img
          src={img}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://placehold.co/400x250/161b22/e47911?text=${encodeURIComponent(vehicle.brand)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/70 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 badge ${vehicle.condition === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {vehicle.condition}
        </span>
        {vehicle.nation && (
          <span className="absolute top-3 right-3 badge bg-dark-card/80 text-[#8b949e]">{vehicle.nation}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white truncate">{vehicle.brand} {vehicle.model}</h3>
          <span className="text-accent font-bold whitespace-nowrap text-sm">
            {format(vehicle.price)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6e7681]">
          {vehicle.fuel_type && <span>{vehicle.fuel_type}</span>}
          {vehicle.drivetrain && <span>{vehicle.drivetrain}</span>}
          {vehicle.category && <span className="ml-auto">{vehicle.category}</span>}
        </div>
      </div>
    </Link>
  );
}
