import React from 'react';
import { Link } from 'react-router-dom';
import './AccountPage.css';

export default function AccountPage() {
  return (
    <div className="account-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">OmniDrive</Link>
          <div className="nav-links">
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/account" className="nav-link active">Account</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="account-content">
          <h1>My Account</h1>
          <p>Account management features coming soon...</p>
          <Link to="/browse" className="back-link">← Back to Browse</Link>
        </div>
      </div>
    </div>
  );
}