const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a2332;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#febd69;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f08804;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />

  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="200" fill="#febd69" opacity="0.05" />
  <circle cx="150" cy="530" r="150" fill="#febd69" opacity="0.04" />

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${width}" height="6" fill="url(#accent)" />

  <!-- Logo text -->
  <text x="80" y="200" font-family="Arial Black, Arial, sans-serif" font-size="96" font-weight="900" fill="url(#accent)">OmniDrive</text>

  <!-- Tagline -->
  <text x="82" y="270" font-family="Arial, sans-serif" font-size="32" fill="#ffffff" opacity="0.85">Connecting you to the drive of your choice</text>

  <!-- Divider -->
  <rect x="80" y="310" width="120" height="4" fill="url(#accent)" rx="2" />

  <!-- Stats row -->
  <text x="80" y="390" font-family="Arial, sans-serif" font-size="22" fill="#febd69" font-weight="bold">170+ Vehicles</text>
  <text x="80" y="425" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" opacity="0.65">Cars • Bikes • Buses • Trucks • Vans</text>

  <text x="80" y="490" font-family="Arial, sans-serif" font-size="22" fill="#febd69" font-weight="bold">MPesa • Card • Bank Transfer</text>
  <text x="80" y="525" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" opacity="0.65">Kenya's Premier Vehicle Marketplace</text>

  <!-- Vehicle emojis -->
  <text x="750" y="380" font-size="110" font-family="Arial">🚗</text>
  <text x="900" y="340" font-size="80" font-family="Arial">🏍️</text>
  <text x="870" y="460" font-size="80" font-family="Arial">🚌</text>

  <!-- Bottom domain -->
  <text x="80" y="600" font-family="Arial, sans-serif" font-size="20" fill="#febd69" opacity="0.7">omnidrive.co.ke</text>
</svg>
`;

const outputDir = path.join(__dirname, 'assets');
const outputPath = path.join(outputDir, 'og-image.jpg');

sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outputPath)
    .then(() => console.log(`✅ OG image generated: ${outputPath}`))
    .catch(err => console.error('❌ Failed:', err.message));
