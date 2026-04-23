# ⚡ FINAL DEPLOYMENT PLAN

## Architecture Decision

**Single Service Architecture**: Deploy `OmniDrive-dealership/server.js` as combined backend+frontend

**Why?**
- One server.js file contains full production backend (SQLite, MPesa, Admin, Chat, Listings)
- Already serves static frontend files via `express.static()`
- Fewer moving parts = simpler deployment
- Lower cost (single Railway service)

---

## Deployment Steps

### 1. Prepare the Codebase

All changes are already in place:
- ✅ `server.js` has full production backend with database
- ✅ `script.js` uses `BACKEND_URL` env variable
- ✅ `vercel.json` configured for static hosting
- ✅ Environment variable documentation created

### 2. Backend Deployment (Railway)

```bash
# Login
railway login

# Deploy from OmniDrive-dealership directory
cd OmniDrive-dealership
railway init --name "omnidrive-api"

# Add all environment variables (see .env file in same dir)
# MPESA_* credentials
# SMTP_USER, SMTP_PASS
# ADMIN_KEY

# Deploy
railway up
```

**Result**: `https://omnidrive-api.up.railway.app`

### 3. Frontend Deployment (Vercel) - Optional

If you want separate frontend hosting (better CDN):

```bash
cd OmniDrive-dealership
vercel --build-env BACKEND_URL=https://omnidrive-api.up.railway.app --yes
```

**Result**: `https://omnidrive-dealership.vercel.app`

**Note**: Frontend will work from either Railway or Vercel. Railway serves it at same domain as API (simpler).

### 4. Mobile App

Already points to `https://api.omnidrive.co.ke` (when not in dev). Update after custom domain:

```javascript
// OmniDrive/OmniDrive-mobile/src/services/api.js
const BACKEND_URL = __DEV__
    ? 'http://localhost:3000'
    : 'https://api.omnidrive.co.ke';  // Your custom domain
```

Build:
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 5. Domain Setup

| Subdomain | Points To | Purpose |
|-----------|-----------|---------|
| omnidrive.co.ke | Vercel IP (or Railway if monolith) | Main website |
| api.omnidrive.co.ke | Railway service URL | Backend API |
| www.omnidrive.co.ke | Vercel/Railway | WWW alias |

---

## API Endpoints (Deployed)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /` | GET | Health check |
| `GET /api/listings` | GET | All active vehicles |
| `POST /api/listings` | POST | Add vehicle (admin) |
| `DELETE /api/listings/:id` | DELETE | Remove vehicle (admin) |
| `POST /api/listings/submit` | POST | Dealer submit listing |
| `GET /api/listings/approved` | GET | Get approved listings |
| `POST /api/mpesa/purchase` | POST | Initiate MPesa payment |
| `POST /api/mpesa/listing-fee` | POST | Pay listing fee |
| `POST /api/mpesa/callback` | POST | MPesa webhook |
| `GET /api/mpesa/status/:id` | GET | Check payment status |
| `POST /api/dealer/register` | POST | Dealer application |
| `GET /api/admin/dealers` | GET | List dealers (admin) |
| `PATCH /api/admin/dealers/:id` | PATCH | Approve/reject dealer |
| `GET /api/admin/listings` | GET | Pending listings (admin) |
| `PATCH /api/admin/listings/:id` | PATCH | Approve/reject listing |
| `POST /api/chat/auth` | POST | Login to chat |
| `GET /api/chat/users` | GET | List users |
| `POST /api/chat/rooms/direct` | POST | Create direct room |
| `GET /api/chat/messages/:roomId` | GET | Get messages |
| `POST /api/chat/messages` | POST | Send message |
| `POST /api/push/register` | POST | Register push token |
| `POST /api/push/send` | POST | Admin send push (requires admin key) |

---

## Environment Variables Reference

### Railway (Backend)

Copy from `OmniDrive-dealership/.env` and adjust:

```bash
NODE_ENV=production
PORT=3000
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=174379
MPESA_PASSKEY=xxx
MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
ADMIN_KEY=generate-with-openssl-rand-hex-32
```

Generate ADMIN_KEY:
```bash
openssl rand -hex 32
```

### Vercel (Frontend)

```bash
BACKEND_URL=https://api.omnidrive.co.ke
```

---

## Verification Checklist

After deployment:

- [ ] `BACKEND_URL/` returns JSON status
- [ ] `BACKEND_URL/api/listings` returns vehicle array
- [ ] Frontend loads at `FRONTEND_URL/`
- [ ] Search/filter works
- [ ] Add to wishlist persists (localStorage)
- [ ] MPesa test payment in sandbox mode succeeds
- [ ] Callback updates order status
- [ ] Admin panel accessible at `/admin.html` with admin key
- [ ] Dealer registration form submits
- [ ] Chat login works
- [ ] Mobile app connects and loads vehicles
- [ ] SSL certificate valid (HTTPS lock icon)
- [ ] Service worker registers (PWA installable)

---

## Next Steps After Deployment

1. **Configure Safaricom Go-Live** (Production MPesa)
   - Get production keys
   - Update Railway env vars
   - Update callback URL

2. **Set Up Monitoring**
   - Railway logs: `railway logs --tail`
   - Add error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)

3. **Custom Domain**
   - Point DNS to Vercel/Railway
   - Update env vars to use custom domain
   - Update Safaricom callback URL

4. **Publish Mobile Apps**
   - Build with EAS
   - Submit to Play Store & App Store
   - Update store listing with live URLs

5. **Scale**
   - Add database backups (automated script)
   - Monitor Railway usage (free tier limits)
   - Consider PostgreSQL for >10K orders

---

## File Reference

| File | Purpose |
|------|---------|
| `DEPLOY_ALL.sh` | Full automated deployment script |
| `DEPLOY_BACKEND_RAILWAY.sh` | Backend-only deploy |
| `DEPLOYMENT_GUIDE.md` | Comprehensive guide |
| `DEPLOYMENT_SUMMARY.md` | Technical summary |
| `QUICKSTART.md` | Quick start guide |
| `VISION.md` | Product vision |
| `OmniDrive-backend/railway.toml` | Railway config (for simple backend) |
| `OmniDrive-dealership/vercel.json` | Vercel config |
| `OmniDrive-dealership/.env` | Local backend env (don't commit) |
| `OmniDrive-backend/.env.example` | Env template |

---

**You're ready to launch!** 🚀

Run `./DEPLOY_ALL.sh` or follow manual steps above.
