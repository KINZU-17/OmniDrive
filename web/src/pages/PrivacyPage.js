import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 2026">
      <p>OmniDrive ("we", "our", "us") operates <strong>omnidrive.co.ke</strong>. This policy describes how we collect, use, and protect your information.</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, phone number when you register</li>
        <li><strong>Payment Information:</strong> Processed securely through MPesa (Safaricom), card processors, and Standard Chartered Bank. We never store full card or PIN details.</li>
        <li><strong>Vehicle Preferences:</strong> Wishlist, search history, recently viewed vehicles (stored locally on your device)</li>
        <li><strong>Usage Data:</strong> Browser type, pages visited, time spent — used to improve our service</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Process vehicle purchases and payments</li>
        <li>Send order confirmations and delivery updates</li>
        <li>Provide customer support</li>
        <li>Improve our platform and user experience</li>
        <li>Comply with Kenyan and international legal obligations</li>
      </ul>

      <h2>3. Data Storage</h2>
      <p>Your preferences (wishlist, recently viewed, theme) are stored in your browser's localStorage and never transmitted to our servers unless you create an account.</p>

      <h2>4. Payment Security</h2>
      <p>All payments are processed through PCI-DSS compliant third-party providers. OmniDrive does not store your MPesa PIN, card numbers, or CVV codes.</p>

      <h2>5. Cookies</h2>
      <p>We use essential cookies to maintain your session and preferences. You can decline non-essential cookies via the banner shown on first visit.</p>

      <h2>6. Third-Party Services</h2>
      <ul>
        <li><strong>Open Exchange Rates</strong> — for live currency conversion</li>
        <li><strong>Safaricom Daraja API</strong> — for MPesa payments</li>
        <li><strong>Google Maps</strong> — for dealer location directions</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:privacy@omnidrive.co.ke">privacy@omnidrive.co.ke</a>.</p>

      <h2>8. Contact</h2>
      <p>
        <a href="mailto:privacy@omnidrive.co.ke">privacy@omnidrive.co.ke</a><br />
        +254 700 000 000<br />
        Nairobi, Kenya
      </p>
    </LegalLayout>
  );
}
