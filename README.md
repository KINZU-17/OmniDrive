# OmniDrive - Multi-Dealership Vehicle Marketplace

**Connecting you to the drive of your choice.**

> Frontend deploys to **Vercel** (`vercel.json`). The backend (Express +
> node:sqlite + WebSockets + Redis) runs on a persistent host (Railway / Render /
> Fly / a Docker container) — Vercel proxies `/api` to it.

---

## About OmniDrive

OmniDrive is Kenya's premier **multi-dealership** vehicle marketplace. It's a unified platform where multiple independent dealerships (Toyota Kenya, Nissan Premium, AutoWorld, etc.) can list and sell their vehicles while maintaining their own branding and administrative control.

**Key Concept**: Each dealership has its own admin who manages ONLY their inventory, while customers can browse vehicles from ALL dealerships on a single platform.

---

## Quick start

> Requires **Node ≥ 22.5** (uses the built-in `node:sqlite` — no native build step).

```bash
cp .env.example .env        # then set a strong JWT_SECRET (see below)
npm install                 # backend deps
cd web && npm install && npm run build && cd ..   # build the React frontend
npm start                   # http://localhost:3000  (API + SPA on one port)
npm test                    # security smoke test (boots the server, 9 checks)
npm run backup              # snapshot the DB to backups/
```

On first run in development the DB is seeded with demo data. **Demo logins:**

| Role    | Email                     | Password    | Can do                                   |
|---------|---------------------------|-------------|------------------------------------------|
| admin   | `admin@omnidrive.co.ke`   | `Admin@123` | full platform control (all dealers)      |
| dealer  | `dealer@toyota.co.ke`     | `Dealer@123`| manage only Toyota inventory/orders      |
| dealer  | `dealer@nissan.co.ke`     | `Dealer@123`| manage only Nissan inventory/orders      |
| liaison | `liaison@omnidrive.co.ke` | `Liaison@123`| coordinate deals / leads                |
| client  | `customer@example.com`    | `Client@123`| browse + buy                             |

## Security & data model (merged build)

This build merges the strongest ideas from the `fixed 1.0/1.1/1.2` iterations onto
the original feature set:

- **JWT auth (replaces spoofable headers).** Login/registration issue a signed
  JWT; protected routes verify it server-side and enforce **roles** and
  **dealership ownership** (a dealer can only touch their own listings — cross-
  tenant writes return 403/404). The old `x-user-role` / `x-admin-key` header
  trust and the shared `ADMIN_KEY` are **gone**. Admin accounts cannot be
  self-registered. See `middleware/auth.js`.
- **bcrypt** password hashing (replaces pbkdf2+salt).
- **`node:sqlite`** engine with **WAL + transactions + additive migrations**
  (tracked by `PRAGMA user_version`) — no native binary, no full-file rewrites.
  Schema, migrations and seed live in `config/db.js`.
- **Money as integers** (whole KES) — no floating-point drift.
- **Fail-fast secrets**: the app refuses to start in production without a strong
  `JWT_SECRET`. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Helmet, CORS allow-list (`CORS_ORIGIN`), and rate limiting remain enabled.
- **Phone OTP login** (easy admin sign-in): `POST /api/auth/otp/request {identifier}`
  texts a 6-digit code (provider-agnostic — Twilio or Africa's Talking via
  `SMS_PROVIDER`), then `POST /api/auth/otp/verify {identifier, code}` returns a
  JWT. Codes are hashed, expire in 5 min, and are attempt/rate-limited. With no
  provider configured in dev, the code is logged and returned as `devCode`.
  Password login remains as a fallback. See `services/sms.js`.

> **Rotate secrets before production**: the M-Pesa, Gmail and any admin
> credentials used during development must be regenerated. `.env` is gitignored
> and must never be committed.

## Installable PWA & offline

The build is a **single self-contained `index.html`** (`vite-plugin-singlefile`) —
all JS and CSS are inlined, so there are no separate `/assets/*` files to 404,
list, or mis-cache. It must be **served over HTTP** (the backend or Vercel), not
opened as a `file://` (browsers block module scripts and service workers there,
and the app needs the `/api` backend).

The web app is also a full Progressive Web App (`vite-plugin-pwa`):
- **Installable** on Android, iOS and desktop ("Add to Home Screen"), with a
  generated `manifest.webmanifest` and maskable icons.
- **Offline**: a service worker precaches the app shell and runtime-caches
  listings (`NetworkFirst`) and images (`CacheFirst`), so previously-seen pages
  keep working without a connection. An offline banner appears when the network
  drops. Config lives in `web/vite.config.js`.

> The Express server always serves `index.html` for any non-API route (and a
> safe fallback if the build is missing), so deployments never show a directory
> listing.

---

## User Types & Roles

### **Super Admin** (Platform Owner)
- Controls the entire OmniDrive platform
- Manages all dealerships and can view global statistics
- Handles platform billing and subscriptions

### **Dealership Admin** (Per Dealership)
- **The owner/manager of a specific dealership**
- Can ONLY see and manage their own dealership's vehicles and staff
- Access via: `omnidrive.co.ke/login?dealership=your-dealership-name`
- Features:
  - Add/edit/delete their vehicles
  - Manage their sales team
  - View dealership-specific analytics
  - Customize dealership profile

### **Dealership Staff**
- Work for a specific dealership
- Can only access vehicles belonging to their dealership

### **Technical Liaison**
- Facilitator connecting buyers and sellers
- Can work across multiple dealerships or be assigned to one

### **Client/Buyer**
- Browse vehicles from ALL dealerships
- Filter by dealership, brand, price, etc.
- Contact specific dealerships directly

---

## Core Features

### Shopping Experience
- **Live Currency Conversion**: Real-time pricing in USD, EUR, JPY, KES, GBP via Open Exchange Rates API
- **Intelligent Filtering**: Search by brand, model, category, condition, body style, fuel type, drivetrain, color, price range, and rating
- **Advanced Comparison**: Compare up to 3 vehicles side-by-side with sticky tray
- **AI Recommendations**: Smart suggestions based on wishlist & browsing history
- **Test Drive Booking**: Book with calendar UI + WhatsApp confirmation
- **Animated Stats Counter**: Live vehicle/dealer/country counts
- **Newsletter Signup**: Email subscription with localStorage persistence
- **Wishlist Export**: Download wishlist as a text file
- **WhatsApp Direct Contact**: One-tap dealer contact from any vehicle card
- **Dark Mode Auto-Detect**: Respects system `prefers-color-scheme`
- **Vehicle Badges**: Hot Deal , New Arrival , Top Rated , Luxury , Electric
- **Vehicle Customization (Pimp Your Ride)**:
  - Wheels: Stock to Gold Plated ($120-$8,000)
  - Paint: Metallic, Matte, Chrome, Candy Red, Flip Paint ($800-$4,500)
  - Body Kit: Sport, Wide Body, Carbon Fiber, Aero ($1,200-$8,000)
  - Interior: Leather, Nappa, Alcantara, Custom Stitching ($600-$4,500)
  - Engine: ECU Tune, Turbo, Supercharger ($800-$12,000)
  - Audio: Premium, Focal, Bose systems ($1,200-$4,500)
  - Windows & Accessories

### Payments
- **MPesa**: Instant mobile money payments (Kenya, Tanzania, Mozambique, Ghana, DRC)
- **Credit/Debit Cards**: Visa, Mastercard, AMEX
- **Bank Transfer**: Standard Chartered direct transfer
- **Price Alerts**: Get notified when prices drop

### Account & Orders
- **User Authentication**: Login/register with localStorage persistence
- **Order Tracking**: Real-time timeline from placed → delivered
- **VIN Check**: Vehicle history verification
- **Referral Program**: Earn $500 per successful referral

### Dealer Network
- **Global Dealer Locator**: Find nearest dealer with distance calculation
- **Test Drive Scheduling**: Book test drives with preferred dealer
- **Service Center Booking**: Schedule maintenance

### Logistics
- **Shipping Calculator**: Domestic and international freight
- **Import Duty Calculator**: Automated tax estimates by country
- **Trade-In Calculator**: Estimate your current vehicle's value
- **Insurance Quotes**: Get insurance estimates

### User Experience
- **Dark/Light Theme**: Personalized UI themes
- **Responsive Design**: Works on desktop, tablet, mobile
- **Loading States**: Smooth spinners and animations
- **Chat Widget**: Real-time customer support

### Admin Panel (Per Dealership)
- **Inventory Management**: Add, edit, delete vehicles (scoped to dealership)
- **Staff Management**: Add/remove sales staff
- **Analytics Dashboard**: Dealership-specific statistics
- **Export Data**: Download inventory as JSON
- **Password Visibility**: Toggle password visibility during login for verification

---

## Product Categories

| Category | Count | Examples |
|----------|-------|----------|
| **Cars** | 125+ | Economy to Luxury, SUV, Sedan, Coupe, Convertible |
| **Bikes** | 50+ | Sports, Touring, Scooters, Adventure, Electric |
| **Buses** | 10+ | City Coaches, Electric, Double Decker |
| **Trucks** | 20+ | Pickups, Heavy Duty, Commercial |
| **Vans** | 10+ | Passenger, Cargo, Mini-vans |

---

## Nationalities Available

Japan | USA | Germany | UK | Italy | France | Sweden | South Korea | China | India | Taiwan | Austria | Spain | Czech Republic | Indonesia | Malaysia

---

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js/Express
- **Database**: SQLite (production: PostgreSQL)
- **Storage**: localStorage for persistence
- **APIs**: Open Exchange Rates, Geolocation
- **PWA**: manifest.json for installability
- **SEO**: sitemap.xml, robots.txt, meta tags

---

## Project Structure

```
./
├── index.html          # Main application
├── admin.html          # Admin dashboard (scoped by dealership)
├── script.js           # Application logic and API client
├── styles.css          # UI styling
├── server.js           # Node.js/Express backend
├── dashboard.js        # Dashboard rendering for all user types
├── login.html          # Login page with role selection
├── login.js            # Authentication logic
├── package.json        # Node dependencies and scripts
├── vercel.json         # Vercel deployment config (frontend + /api proxy)
├── Dockerfile          # Backend container (deploy to Railway/Render/Fly)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Crawler rules
├── privacy.html        # Privacy policy
├── terms.html          # Terms of service
├── dealer-register.html # Dealer onboarding page
├── DEALERSHIPS.md      # Multi-dealership architecture documentation
├── config/             # Server configuration
├── routes/             # Express route handlers
├── middleware/         # Request and error middleware
├── assets/             # Images and media
└── __tests__/          # Automated tests
```

---

## Getting Started

### For Platform Owner (Super Admin)
1. Deploy the backend to a persistent host (Railway/Render/Fly or Docker) and set
   its production env (`JWT_SECRET`, `CORS_ORIGIN`, M-Pesa, SMS provider, etc.).
2. Point `vercel.json` `rewrites` `/api/*` `destination` at that backend URL, then
   deploy the frontend: `vercel --prod`.
3. On first prod boot the backend creates one admin (from `ADMIN_EMAIL`/
   `ADMIN_PASSWORD`, or a generated password printed once to the logs).

### For Dealership Admin
1. Go to `omnidrive.co.ke/login`
2. Select "Dealer Login"
3. Enter your dealership credentials
4. Access your dealership dashboard

### For Clients (Buyers)
1. Open `index.html` in a web browser
2. Browse vehicles by category or use filters
3. Filter by dealership if desired
4. Contact specific dealerships for vehicles

---

## Recent Improvements (May 2026)

- **Multi-Dealership Support**: Added DEALERSHIPS.md with complete architecture documentation
- **Styling**: Restored the original `styles.css` and integrated feedback system styling
- **Admin Dashboard**: Enhanced with cinematic design, animations, and improved accessibility
- **Mobile Screens**: Improved BrowseScreen.js and VehicleDetailScreen.js
- **Feedback System**: Added comprehensive feedback system with star ratings
- **User Role Handling**: Enhanced routing for admin, dealer, liaison, and client users
- **Accessibility**: Implemented skip navigation link and improved ARIA labels
- **SEO**: Added XML sitemap and Vercel deployment support

---

## Domain

**OmniDrive.co.ke** — Connecting you to the drive of your choice.

---

## Support

- **Email**: info@omnidrive.co.ke
- **Phone**: +254 700 000 000
- **Dealer Registration**: [dealer-register.html](dealer-register.html)

---

*Your drive starts here.*

---

*Last updated: 2026-05-18*
*Multi-Dealership Architecture: See DEALERSHIPS.md for details*