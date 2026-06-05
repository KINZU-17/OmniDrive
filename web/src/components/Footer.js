import React from 'react';
import { Link } from 'react-router-dom';

const LINKS = {
  Marketplace: [
    { label: 'Browse Vehicles', to: '/browse' },
    { label: 'Cars', to: '/browse?category=Car' },
    { label: 'Bikes', to: '/browse?category=Bike' },
    { label: 'Trucks', to: '/browse?category=Truck' },
    { label: 'Buses', to: '/browse?category=Bus' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Wishlist', to: '/wishlist' },
    { label: 'Messages', to: '/messages' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy.html', external: true },
    { label: 'Terms of Service', href: '/terms.html', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-1 mb-4">
              <span className="text-2xl font-black text-accent">Omni</span>
              <span className="text-2xl font-black text-white">Drive</span>
            </Link>
            <p className="text-[#6e7681] text-sm leading-relaxed mb-4">
              Kenya's premier vehicle marketplace. Cars, bikes, trucks and more — from global dealers, paid locally.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6e7681]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Live — Nairobi, Kenya</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    {item.external ? (
                      <a href={item.href} className="text-[#6e7681] text-sm hover:text-white transition-colors">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.to} className="text-[#6e7681] text-sm hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#6e7681] text-xs">
            © {new Date().getFullYear()} OmniDrive. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#6e7681]">
            <span> info@omnidrive.co.ke</span>
            <span> +254 700 000 000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
