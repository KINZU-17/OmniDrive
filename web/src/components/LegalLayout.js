import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../utils/usePageTitle';

/**
 * Shared layout for legal/content pages (Privacy, Terms), styled with Tailwind
 * to match the app's dark theme. Renders inside the app shell (Navbar/Footer).
 */
export default function LegalLayout({ title, lastUpdated, children }) {
  usePageTitle(title);
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-accent hover:underline text-sm mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to OmniDrive
        </Link>

        <h1 className="text-3xl font-black text-white border-b border-dark-border pb-4 mb-2">{title}</h1>
        {lastUpdated && <p className="text-[#6e7681] text-sm mb-8">Last updated: {lastUpdated}</p>}

        <div className="space-y-6 text-[#c9d1d9] leading-relaxed [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-accent [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_strong]:text-white">
          {children}
        </div>

        <footer className="mt-16 pt-6 border-t border-dark-border text-sm text-[#6e7681]">
          © {new Date().getFullYear()} OmniDrive.co.ke —{' '}
          <Link to="/terms" className="text-accent hover:underline">Terms</Link> ·{' '}
          <Link to="/privacy" className="text-accent hover:underline">Privacy</Link> ·{' '}
          <Link to="/" className="text-accent hover:underline">Home</Link>
        </footer>
      </div>
    </div>
  );
}
