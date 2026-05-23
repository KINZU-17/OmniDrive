import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AccountPage from './pages/AccountPage';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Routes>
    </div>
  );
}

export default App;