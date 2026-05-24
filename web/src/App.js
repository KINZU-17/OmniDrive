import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import BrowsePage from './pages/BrowsePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AccountPage from './pages/AccountPage';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MessagingPage from './pages/MessagingPage';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<BrowsePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/messages" element={<MessagingPage />} />
            </Routes>
          </div>
        </WishlistProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;