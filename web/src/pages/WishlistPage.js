import React from 'react';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#e6edf3' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#febd69', textDecoration: 'none' }}>OmniDrive</Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/browse" style={{ color: '#e6edf3', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px' }}>Browse</Link>
            <Link to="/wishlist" style={{ color: '#e6edf3', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#febd69', color: '#0d1117' }}>Wishlist</Link>
            <Link to="/account" style={{ color: '#e6edf3', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px' }}>Account</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
        <h1 style={{ color: '#febd69', fontSize: '2.5rem', marginBottom: '16px' }}>My Wishlist</h1>
        <p style={{ color: '#8b949e', fontSize: '1.1rem', marginBottom: '24px' }}>Wishlist features coming soon...</p>
        <Link to="/browse" style={{ color: '#febd69', textDecoration: 'none', fontSize: '1rem' }}>← Back to Browse</Link>
      </div>
    </div>
  );
}