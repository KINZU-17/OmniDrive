
# OmniDrive - Setup Fixes Applied

## Issues Found & Fixed

### 1. Database Was Empty
**Problem**: The SQLite database file existed but had no listings data, so `/api/listings` returned empty arrays.

**Fix**: Created `populate_db.js` script to seed the database with 50 vehicle listings across all categories (Cars, Bikes, Buses, Trucks, Vans).

**Command**: `node populate_db.js`

---

### 2. Port Conflicts with VS Code Live Preview
**Problem**: VS Code Live Preview was hijacking port 3000/3001, returning "426 Upgrade Required" for all requests.

**Fix**: Changed server to use port 3002 (free port) and updated all references:
- `.env`: `PORT=3002`
- `script.js`: Backend URL → `http://localhost:3002`

---

### 3. Broken process.env Check in Browser JS
**Problem**: `script.js` checked `process.env.BACKEND_URL` which doesn't exist in browser JavaScript (only in Node.js).

**Fix**: Removed the `process.env` check from the BACKEND_URL detection logic.

---

### 4. MPesa API Crash on Startup (Development)
**Problem**: In production mode, the server tried to fetch MPesa access token immediately, which could fail and crash the server during development.

**Fix**: Wrapped MPesa connectivity check in async IIFE with error handling so server starts even if MPesa is unavailable.

---

### 5. NODE_ENV=production Causing Issues
**Problem**: With `NODE_ENV=production`, the server used `Math.ceil()` on amounts (making KES 1 payments) and attempted real MPesa connections.

**Fix**: Changed to `NODE_ENV=development` in `.env` for local testing. Server now uses `stkAmount = 1` for sandbox testing.

---

## Current Working State

### Backend (Port 3002)
✅ Server running: `node server.js`  
✅ Database: 50 listings populated  
✅ API Endpoints: All working  
- `GET /api/listings` - Returns all active vehicles
- `GET /api/listings/:id` - Get single vehicle
- `POST /api/listings` - Admin add vehicle
- `POST /api/mpesa/purchase` - Initiate payment
- `POST /api/mpesa/callback` - MPesa callback
- `GET /api/admin/orders` - All orders
- `GET /api/admin/stats` - Stats summary
- `POST /api/dealer/register` - Dealer registration
- `POST /api/chat/auth` - Chat login
- More endpoints working...

### Frontend (Static Files)
✅ `index.html` - Main page with all features  
✅ `script.js` - All JavaScript logic  
✅ `styles.css` - Complete styling  
✅ PWA Support - `manifest.json`, `sw.js`  
✅ Responsive - Desktop, tablet, mobile  

### Key Features Working
✅ Vehicle browsing with filters  
✅ Search with autocomplete  
✅ Vehicle comparison (up to 3)  
✅ Wishlist with localStorage  
✅ Financing calculator  
✅ Dealer locator  
✅ Chat/messaging system  
✅ Order tracking  
✅ Admin dashboard  
✅ MPesa payment integration (sandbox)  
✅ Push notifications  

---

## How to Run

### Start Backend:
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
node server.js
```
Server runs on: http://localhost:3002

### Access Frontend:
Open `index.html` in a browser (file://) or serve via HTTP:
```bash
# Option 1: Python HTTP server
python3 -m http.server 8080 --directory .
# Then visit: http://localhost:8080

# Option 2: Node static server
npx serve . -p 8080
```

### Populate Database (if needed):
```bash
node populate_db.js
```

---

## Testing the API

```bash
# Get all listings
curl http://localhost:3002/api/listings

# Get single listing
curl http://localhost:3002/api/listings/1

# Health check
curl http://localhost:3002/health

# Test MPesa payment (sandbox - KES 1 charge)
curl -X POST http://localhost:3002/api/mpesa/purchase \
  -H "Content-Type: application/json" \
  -d '{"phone":"254700000000","amount":50000,"vehicleName":"BMW M5","vehicleId":5}'
```

---

## Environment Variables (.env)

```
# MPesa Daraja
MPESA_CONSUMER_KEY=<your-key>
MPESA_CONSUMER_SECRET=<your-secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your-passkey>
MPESA_CALLBACK_URL=http://localhost:3002/api/mpesa/callback

# Server
PORT=3002
NODE_ENV=development

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin
ADMIN_KEY=<your-admin-key>
```

---

## For Production Deployment

See `DEPLOYMENT_CHECKLIST.md` for complete deployment guide including:
- Railway deployment for backend
- Vercel deployment for frontend  
- Custom domain setup
- Safaricom Go-Live process
- SSL certificates
- Monitoring setup

---

## Notes

- All 50 listings are currently in the database with realistic data
- MPesa is in sandbox mode (KES 1 transactions) - switch to production for real payments
- Admin key is in `.env` - change before production
- Database file: `omnidrive.db` (SQLite)
- Images are local or from Wikimedia/Creative Commons sources

