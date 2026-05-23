import React from 'react';
import './FilterBar.css';

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  fuel,
  onFuelChange,
  categories,
  fuels
}) {
  return (
    <div className="filter-bar">
      <div className="filter-container">
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search vehicles (e.g., BMW M5, Toyota Prado)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        {/* Filters */}
        <div className="filters">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Fuel Filter */}
          <div className="filter-group">
            <label className="filter-label">Fuel Type</label>
            <select
              value={fuel}
              onChange={(e) => onFuelChange(e.target.value)}
              className="filter-select"
            >
              {fuels.map(fuelType => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}