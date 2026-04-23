
# Quick Start - OmniDrive Development

## Run the Application

### Method 1: Automated (Recommended)
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
./start.sh  # If exists, or run commands below
```

### Method 2: Manual (2 Terminals)

**Terminal 1 - Backend (Port 3002):**
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
npm install                    # Install dependencies (if not done)
node server.js                 # Start backend
```
Expected: ✅ OmniDrive backend running on http://localhost:3002

**Terminal 2 - Frontend (Port 8080):**
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
python3 -m http.server 8080    # Serve static files
```
Access: http://localhost:8080

### Method 3: Inline (Single Terminal)
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
node -e "
const Database = require('better-sqlite3');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
const db = new Database('omnidrive.db');
app.get('/api/listings', (req, res) => res.json({success:true,data:db.prepare('SELECT * FROM listings WHERE isActive=1').all()}));
app.post('/api/mpesa/purchase', (req, res) => res.json({success:true,checkoutRequestId:'test',merchantRequestId:'test'}));
app.get('/health', (req, res) => res.json({status:'ok'}));
app.listen(3002, () => {
  const count = db.prepare('SELECT COUNT(*) as c FROM listings').get().c;
  console.log('✅ Backend: http://localhost:3002 | Listings:', count);
  console.log('✅ Frontend: http://localhost:8080');
  console.log('   Run: python3 -m http.server 8080');
});
"
# In another terminal:
python3 -m http.server 8080
```

---

## Verify It Works

```bash
# 1. Health check
curl http://localhost:3002/health
# Expected: {"status":"ok","env":"development"}

# 2. Get all listings
curl http://localhost:3002/api/listings | python3 -m json.tool | head -20
# Expected: JSON with 62 vehicle listings

# 3. Get single vehicle
curl http://localhost:3002/api/listings/1 | python3 -m json.tool
# Expected: BMW M5 Competition details

# 4. Filter by category
curl "http://localhost:3002/api/listings?category=Car" | python3 -m json.tool | grep category
# Expected: 46 cars

# 5. Filter by nation
curl "http://localhost:3002/api/listings?nation=Japan" | python3 -m json.tool | grep nation
# Expected: Japanese vehicles
```

---

## Access the Application

Open browser to: http://localhost:8080

Or directly open: `index.html` (file:// protocol)

Features to try:
1. Search bar - type to find vehicles
2. Filter bar - filter by category, price, brand, etc.
3. Vehicle cards - click to view details
4. Wishlist - click ❤️ on any card
5. Compare - select up to 3 vehicles, click Compare
6. Customization - click "Customize" on any vehicle
7. Admin - Click "Staff Login" in footer (key in .env ADMIN_KEY)

---

## Troubleshooting

### Issue: Port 3002 already in use
```bash
# Find process using port
ss -tlnp | grep :3002

# Kill it
kill <PID>

# Or change port
# Edit .env: PORT=3003
# Edit script.js: change localhost:3002 to localhost:3003
```

### Issue: Database empty
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
rm omnidrive.db
node server.js &
sleep 2
node populate_db.js
```

### Issue: Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:3002/health

# Check script.js has correct URL
grep "localhost:3002" script.js

# If using file:// protocol, ensure CORS is enabled in server.js
# (It is, by default: app.use(cors());)
```

### Issue: Node modules missing
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
npm install
```

---

## File Structure

```
OmniDrive/
├── index.html                 # Main application
├── script.js                  # Frontend logic
├── styles.css                 # Styling
├── server.js                  # Backend (Express)
├── omnidrive.db               # SQLite database (populated)
├── populate_db.js            # Database seeder ✨
├── .env                       # Configuration
├── manifest.json              # PWA
├── sw.js                      # Service Worker
├── assets/
│   └── vehicles/              # Vehicle images
├── SETUP_FIXES.md            # Detailed setup guide ✨
├── FIXES_SUMMARY.md          # This file ✨
└── README_START.md           # Quick start guide ✨
```

---

## Environment Variables

Key settings in `.env`:
```
PORT=3002              # Backend port
NODE_ENV=development   # Development mode (KES 1 for testing)
ADMIN_KEY=...          # Admin dashboard key
MPESA_*                # M-Pesa credentials (sandbox)
SMTP_*                 # Email settings (Gmail)
```

---

## Production Deployment

See `DEPLOYMENT_CHECKLIST.md` for:
- Railway backend deployment
- Vercel frontend deployment
- Custom domain setup
- Safaricom Go-Live
- SSL certificates

---

## API Documentation

All endpoints in `server.js`:
- `GET  /health` - Health check
- `GET  /api/listings` - All vehicles (filterable)
- `GET  /api/listings/:id` - Single vehicle
- `POST /api/listings` - Add vehicle (admin)
- `PUT  /api/listings/:id` - Update (admin)
- `DELETE /api/listings/:id` - Delete (admin)
- `POST /api/mpesa/purchase` - MPesa payment
- `POST /api/mpesa/callback` - MPesa callback
- `GET  /api/mpesa/status/:id` - Payment status
- `POST /api/dealer/register` - Dealer signup
- `GET  /api/admin/*` - Admin endpoints (with key)
- `POST /api/chat/*` - Chat system
- `POST /api/push/*` - Push notifications

---

## Database Schema

```sql
listings:
  id, brand, model, price, nation, category, condition,
  body_style, fuel_type, drivetrain, color, city, image,
  badges, specs, rating, reviewCount, createdAt, isActive

orders:
  id, checkout_id, merchant_id, phone, amount, vehicle_id,
  vehicle_name, status, receipt, customer_email, created_at

dealer_applications:
  id, name, owner, phone, email, city, address, types, plan, about, payment, status

pending_listings:
  (Dealer-submitted listings awaiting approval)

chat_*
  (Chat users, rooms, messages, presence)
```

---

## Support

- Setup issues: See `SETUP_FIXES.md`
- Deployment: See `DEPLOYMENT_CHECKLIST.md`
- Original documentation: See `README.md`
- Vision: See `VISION.md`

---

✨ **Happy Coding!** ✨

