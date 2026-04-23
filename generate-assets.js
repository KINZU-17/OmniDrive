const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Icon SVG — 1024x1024 dark bg with OmniDrive logo
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#1a2332"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#febd69"/>
      <stop offset="100%" style="stop-color:#f08804"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>
  <rect x="0" y="0" width="1024" height="12" rx="6" fill="url(#gold)"/>
  <text x="512" y="420" font-family="Arial Black, Arial" font-size="200" font-weight="900"
        fill="url(#gold)" text-anchor="middle">OD</text>
  <text x="512" y="600" font-family="Arial, sans-serif" font-size="90" font-weight="700"
        fill="#ffffff" text-anchor="middle" opacity="0.9">OmniDrive</text>
  <text x="512" y="700" font-family="Arial, sans-serif" font-size="48"
        fill="#febd69" text-anchor="middle" opacity="0.7">co.ke</text>
</svg>`;

// Splash SVG — 1284x2778 (iPhone 14 Pro Max)
const splashSvg = `
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#1a2332"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#febd69"/>
      <stop offset="100%" style="stop-color:#f08804"/>
    </linearGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#bg)"/>
  <circle cx="1100" cy="400" r="400" fill="#febd69" opacity="0.04"/>
  <circle cx="200" cy="2400" r="300" fill="#febd69" opacity="0.03"/>
  <rect x="0" y="0" width="1284" height="10" fill="url(#gold)"/>
  <text x="642" y="1200" font-family="Arial Black, Arial" font-size="260" font-weight="900"
        fill="url(#gold)" text-anchor="middle">OD</text>
  <text x="642" y="1420" font-family="Arial Black, Arial" font-size="130" font-weight="900"
        fill="#ffffff" text-anchor="middle">OmniDrive</text>
  <text x="642" y="1560" font-family="Arial, sans-serif" font-size="64"
        fill="#febd69" text-anchor="middle" opacity="0.8">Connecting you to the drive</text>
  <text x="642" y="1650" font-family="Arial, sans-serif" font-size="64"
        fill="#febd69" text-anchor="middle" opacity="0.8">of your choice</text>
  <text x="642" y="2600" font-family="Arial, sans-serif" font-size="48"
        fill="#ffffff" text-anchor="middle" opacity="0.3">omnidrive.co.ke</text>
</svg>`;

async function generate() {
    // 1024x1024 app icon
    await sharp(Buffer.from(iconSvg)).png().toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png');

    // 1024x1024 adaptive icon (Android)
    await sharp(Buffer.from(iconSvg)).png().toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png');

    // 48x48 favicon
    await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png');

    // Splash screen
    await sharp(Buffer.from(splashSvg)).png().toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ splash.png');

    console.log('\n🎉 All assets generated!');
}

generate().catch(console.error);
