import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 2026">
      <p>By accessing and using <strong>omnidrive.co.ke</strong>, you agree to be bound by these Terms of Service. Please read them carefully.</p>

      <h2>1. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old to purchase vehicles</li>
        <li>You must provide accurate and complete registration information</li>
        <li>You are responsible for maintaining the security of your account</li>
      </ul>

      <h2>2. Vehicle Listings</h2>
      <ul>
        <li>Prices are displayed in your selected currency and converted in real-time using live exchange rates</li>
        <li>Prices are subject to change without notice</li>
        <li>Availability is confirmed at the time of purchase only</li>
        <li>Vehicle specifications, images, and descriptions are provided for reference and may vary</li>
        <li>Import duties, taxes, and shipping costs are additional and vary by destination country</li>
      </ul>

      <h2>3. Payments</h2>
      <ul>
        <li>We accept MPesa, Visa, Mastercard, AMEX, and Bank Transfer</li>
        <li>Full payment must be received before vehicle delivery or shipping</li>
        <li>Financing options are available through our partner institutions</li>
      </ul>

      <h2>4. Cancellations & Refunds</h2>
      <ul>
        <li>Orders may be cancelled within 24 hours of placement for a full refund</li>
        <li>After 24 hours, a 10% cancellation fee applies</li>
        <li>Vehicles that have been shipped cannot be cancelled</li>
        <li>Refunds are processed within 7–14 business days</li>
      </ul>

      <h2>5. Shipping & Import</h2>
      <ul>
        <li>OmniDrive arranges shipping but is not liable for customs delays</li>
        <li>The buyer is responsible for all import duties and local taxes</li>
        <li>Estimated delivery times are indicative and not guaranteed</li>
      </ul>

      <h2>6. Partner Brokers</h2>
      <ul>
        <li>Broker commissions (5%) are paid within 30 days of successful vehicle delivery</li>
        <li>OmniDrive reserves the right to terminate Technical Liaison agreements for misconduct</li>
      </ul>

      <h2>7. Limitation of Liability</h2>
      <p>OmniDrive is not responsible for third-party dealer actions, currency fluctuation impacts, shipping delays beyond our control, or vehicle condition beyond listed specifications.</p>

      <h2>8. Governing Law</h2>
      <p>These terms are governed by the laws of the Republic of Kenya. Disputes shall be resolved in Nairobi courts.</p>

      <h2>9. Contact</h2>
      <p>
        <a href="mailto:support@omnidrive.co.ke">support@omnidrive.co.ke</a><br />
        +254 700 000 000<br />
        Nairobi, Kenya
      </p>
    </LegalLayout>
  );
}
