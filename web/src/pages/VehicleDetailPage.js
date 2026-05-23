import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { inventory } from '../utils/inventory';
import './VehicleDetailPage.css';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const vehicle = inventory.find(v => v.id === parseInt(id));

  if (!vehicle) {
    return (
      <div className="vehicle-detail-page">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">OmniDrive</Link>
            <div className="nav-links">
              <Link to="/browse" className="nav-link">Browse</Link>
              <Link to="/wishlist" className="nav-link">Wishlist</Link>
              <Link to="/account" className="nav-link">Account</Link>
            </div>
          </div>
        </nav>

        <div className="container">
          <div className="not-found">
            <h1>Vehicle Not Found</h1>
            <p>The vehicle you're looking for doesn't exist.</p>
            <Link to="/browse" className="back-link">← Back to Browse</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-detail-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">OmniDrive</Link>
          <div className="nav-links">
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/account" className="nav-link">Account</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="vehicle-detail">
          {/* Back Button */}
          <Link to="/browse" className="back-link">← Back to Browse</Link>

          {/* Vehicle Header */}
          <div className="vehicle-header">
            <h1>{vehicle.brand} {vehicle.model}</h1>
            <div className="vehicle-meta">
              <span className="availability">{vehicle.availability}</span>
              <span className="rating">
                {'★'.repeat(Math.floor(vehicle.rating))}
                {'☆'.repeat(5 - Math.floor(vehicle.rating))}
                {vehicle.rating}
              </span>
            </div>
          </div>

          {/* Vehicle Image */}
          <div className="vehicle-image-section">
            <img
              src={vehicle.img}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="vehicle-detail-image"
              onError={(e) => {
                e.target.src = `https://placehold.co/800x400/161b22/febd69?text=${encodeURIComponent(vehicle.brand)}`;
              }}
            />
          </div>

          {/* Vehicle Details */}
          <div className="vehicle-details-grid">
            {/* Basic Info */}
            <div className="detail-section">
              <h2>Basic Information</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Price:</span>
                  <span className="value price">${vehicle.price.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Year:</span>
                  <span className="value">{vehicle.year}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Condition:</span>
                  <span className="value">{vehicle.condition}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Mileage:</span>
                  <span className="value">{vehicle.mileage.toLocaleString()} miles</span>
                </div>
                <div className="detail-item">
                  <span className="label">Color:</span>
                  <span className="value">{vehicle.color}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Origin:</span>
                  <span className="value">{vehicle.nation}</span>
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="detail-section">
              <h2>Technical Specifications</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Engine:</span>
                  <span className="value">{vehicle.engine}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Horsepower:</span>
                  <span className="value">{vehicle.horsepower} HP</span>
                </div>
                <div className="detail-item">
                  <span className="label">Fuel Type:</span>
                  <span className="value">{vehicle.fuel}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Drivetrain:</span>
                  <span className="value">{vehicle.drivetrain}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Transmission:</span>
                  <span className="value">{vehicle.transmission}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Body Style:</span>
                  <span className="value">{vehicle.bodyStyle}</span>
                </div>
              </div>
            </div>

            {/* Warranty & Support */}
            <div className="detail-section">
              <h2>Warranty & Support</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Warranty:</span>
                  <span className="value">{vehicle.warranty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/payment" className="btn primary">Purchase Now</Link>
            <button className="btn secondary">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
}