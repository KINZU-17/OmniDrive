import React from 'react';
import { Link } from 'react-router-dom';
import './VehicleCard.css';

export default function VehicleCard({ vehicle }) {
  return (
    <Link to={`/vehicle/${vehicle.id}`} className="vehicle-card-link">
      <div className="vehicle-card">
        <div className="vehicle-image-container">
          <img
            src={vehicle.img}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="vehicle-image"
            onError={(e) => {
              e.target.src = `https://placehold.co/400x220/161b22/febd69?text=${encodeURIComponent(vehicle.brand)}`;
            }}
          />
          <div className="vehicle-availability">{vehicle.availability}</div>
        </div>

        <div className="vehicle-content">
          <h3 className="vehicle-title">{vehicle.brand} {vehicle.model}</h3>
          <p className="vehicle-subtitle">
            {vehicle.year} • {vehicle.fuel} • {vehicle.condition}
          </p>

          <div className="vehicle-details">
            <div className="vehicle-specs">
              <span className="spec-item">{vehicle.bodyStyle}</span>
              <span className="spec-item">{vehicle.drivetrain}</span>
              <span className="spec-item">{vehicle.transmission}</span>
            </div>

            <div className="vehicle-rating">
              <span className="rating-stars">
                {'★'.repeat(Math.floor(vehicle.rating))}
                {'☆'.repeat(5 - Math.floor(vehicle.rating))}
              </span>
              <span className="rating-score">{vehicle.rating}</span>
            </div>
          </div>

          <div className="vehicle-footer">
            <div className="vehicle-price">${vehicle.price.toLocaleString()}</div>
            <div className="vehicle-warranty">{vehicle.warranty}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}