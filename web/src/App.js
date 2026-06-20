import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CompareProvider } from './context/CompareContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { SavedSearchProvider } from './context/SavedSearchContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import CompareTray from './components/CompareTray';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AccountPage from './pages/AccountPage';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MessagingPage from './pages/MessagingPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ComparePage from './pages/ComparePage';
import OrdersPage from './pages/OrdersPage';

const NO_FOOTER_PATHS = ['/messages'];

function AppShell() {
  const { pathname } = useLocation();
  const { loading } = useAuth();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  // Hold first paint until a stored session is validated, so we never flash a
  // logged-out navbar (or redirect away from a protected page) before /auth/me.
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1 text-3xl font-black">
          <span className="text-accent">Omni</span><span className="text-white">Drive</span>
        </div>
        <div className="w-8 h-8 border-4 border-dark-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:font-semibold"
      >
        Skip to content
      </a>
      <OfflineBanner />
      <Navbar />
      <main id="main-content" className="flex-1">
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
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CompareTray />
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
          <CompareProvider>
            <RecentlyViewedProvider>
              <SavedSearchProvider>
                <AppShell />
              </SavedSearchProvider>
            </RecentlyViewedProvider>
          </CompareProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
