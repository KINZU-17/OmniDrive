import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AccountPage from './pages/AccountPage';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MessagingPage from './pages/MessagingPage';

const NO_FOOTER_PATHS = ['/messages'];

function AppShell() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="text-8xl font-black text-accent/20">404</div>
      <h1 className="text-3xl font-black text-white">Page Not Found</h1>
      <p className="text-[#6e7681] max-w-sm">This page doesn't exist or has been moved.</p>
      <a href="/" className="btn-primary px-8 py-3">Go Home</a>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <AppShell />
        </WishlistProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
