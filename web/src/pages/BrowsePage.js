import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { inventory } from '../utils/inventory';
import VehicleCard from '../components/VehicleCard';
import FilterBar from '../components/FilterBar';
import './BrowsePage.css';

const CATEGORIES = ['All', 'Car', 'Bike', 'Bus'];
const FUELS = ['All', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [fuel, setFuel] = useState('All');
  const [loading, setLoading] = useState(false);

  const filteredVehicles = useMemo(() => {
    setLoading(true);
    // Simulate network delay for better UX
    return new Promise(resolve => {
      setTimeout(() => {
        const result = inventory.filter(vehicle => {
          const matchSearch = `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase());
          const matchCategory = category === 'All' || vehicle.category === category;
          const matchFuel = fuel === 'All' || vehicle.fuel === fuel;
          return matchSearch && matchCategory && matchFuel;
        });
        resolve(result);
      }, 300);
    });
  }, [search, category, fuel]);

  const handleVehiclesLoaded = (vehicles) => {
    setLoading(false);
  };

  return (
    <div className="browse-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">OmniDrive</Link>
          <div className="nav-links">
            <Link to="/browse" className="nav-link active">Browse</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/account" className="nav-link">Account</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="browse-header">
          <h1>Vehicle Marketplace</h1>
          <p>Find your perfect vehicle from our premium collection</p>
        </div>

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          fuel={fuel}
          onFuelChange={setFuel}
          categories={CATEGORIES}
          fuels={FUELS}
        />

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching vehicles...</p>
          </div>
        )}

        {/* Vehicle Grid */}
        <div className="vehicle-grid">
          {filteredVehicles.then ? (
            filteredVehicles.then(vehicles => {
              handleVehiclesLoaded(vehicles);
              return vehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ));
            })
          ) : (
            filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          )}
        </div>

        {/* No Results */}
        {!loading && filteredVehicles.length === 0 && (
          <div className="no-results">
            <h3>No vehicles found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}